import React, { useMemo } from 'react'
import { truncate, hashString } from '../lib/utils'

const SVG_WIDTH = 1200
const SVG_HEIGHT = 760
const CENTER_X = SVG_WIDTH / 2
const CENTER_Y = SVG_HEIGHT / 2
const BASE_RADIUS = 260
const RADIUS_VARIANCE = 120
const NODE_RADIUS = 10
const MAX_EDGES = 260

function normalizeText(value) {
  return (value || '').toLowerCase().trim()
}

function getSourceKey(source) {
  const normalized = normalizeText(source)
  if (!normalized) return ''
  return normalized.split(/\s[-—]\s/)[0]?.trim() || normalized
}

function buildNodePosition(entry, index, total) {
  const seed = hashString(entry.id || `${entry.content}-${index}`)
  const angle = (index / Math.max(total, 1)) * Math.PI * 2
  const radialOffset = seed % RADIUS_VARIANCE
  const radius = BASE_RADIUS + radialOffset
  const x = CENTER_X + Math.cos(angle) * radius
  const y = CENTER_Y + Math.sin(angle) * radius
  return { x, y }
}

function scoreConnection(a, b) {
  const aTags = new Set((a.tags || []).map(normalizeText))
  const bTags = new Set((b.tags || []).map(normalizeText))

  let sharedTagCount = 0
  for (const tag of aTags) {
    if (tag && bTags.has(tag)) {
      sharedTagCount += 1
    }
  }

  const aSource = getSourceKey(a.source)
  const bSource = getSourceKey(b.source)
  const sourceMatch = aSource && bSource && aSource === bSource

  return {
    sharedTagCount,
    sourceMatch,
    score: (sharedTagCount * 2) + (sourceMatch ? 3 : 0),
  }
}

/**
 * Obsidian-style connections graph view.
 * Nodes are entries, edges represent shared tags/source.
 */
function GraphView({ entries, onSelect, onOpen, selectedEntry }) {
  const graph = useMemo(() => {
    const nodes = entries.map((entry, index) => ({
      entry,
      position: buildNodePosition(entry, index, entries.length),
      degree: 0,
    }))

    const edges = []

    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const connection = scoreConnection(entries[i], entries[j])
        if (connection.score > 0) {
          edges.push({
            sourceId: entries[i].id,
            targetId: entries[j].id,
            score: connection.score,
            sharedTagCount: connection.sharedTagCount,
            sourceMatch: connection.sourceMatch,
          })
        }
      }
    }

    edges.sort((a, b) => b.score - a.score)
    const limitedEdges = edges.slice(0, MAX_EDGES)

    const degreeMap = {}
    for (const edge of limitedEdges) {
      degreeMap[edge.sourceId] = (degreeMap[edge.sourceId] || 0) + 1
      degreeMap[edge.targetId] = (degreeMap[edge.targetId] || 0) + 1
    }

    const rankedNodes = nodes
      .map(node => ({
        ...node,
        degree: degreeMap[node.entry.id] || 0,
      }))
      .sort((a, b) => b.degree - a.degree)

    const averageDegree = nodes.length > 0
      ? (limitedEdges.length * 2) / nodes.length
      : 0

    return {
      nodes,
      limitedEdges,
      degreeMap,
      rankedNodes,
      averageDegree,
    }
  }, [entries])

  const nodeById = useMemo(() => {
    const map = {}
    for (const node of graph.nodes) {
      map[node.entry.id] = node
    }
    return map
  }, [graph.nodes])

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dim font-mono">
        no entries yet — graph appears once notes exist
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 font-mono">
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-dim">
        <span>nodes:{graph.nodes.length}</span>
        <span>edges:{graph.limitedEdges.length}</span>
        <span>avg-degree:{graph.averageDegree.toFixed(1)}</span>
        <span className="text-accent">click node to preview • double-click to open</span>
      </div>

      <div className="rounded border border-border bg-bg/40 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-[28rem] lg:h-[34rem]"
          role="img"
          aria-label="Entry connections graph"
        >
          {graph.limitedEdges.map((edge, idx) => {
            const source = nodeById[edge.sourceId]
            const target = nodeById[edge.targetId]
            if (!source || !target) return null

            const opacity = Math.min(0.65, 0.2 + (edge.score * 0.08))
            return (
              <line
                key={`${edge.sourceId}-${edge.targetId}-${idx}`}
                x1={source.position.x}
                y1={source.position.y}
                x2={target.position.x}
                y2={target.position.y}
                stroke={edge.sourceMatch ? '#7dd3fc' : '#71717a'}
                strokeOpacity={opacity}
                strokeWidth={edge.sourceMatch ? 1.8 : 1.2}
              />
            )
          })}

          {graph.nodes.map((node) => {
            const isSelected = selectedEntry?.id === node.entry.id
            const degree = graph.degreeMap[node.entry.id] || 0
            const radius = NODE_RADIUS + Math.min(7, degree)
            return (
              <g key={node.entry.id}>
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={isSelected ? radius + 3 : radius}
                  fill={isSelected ? '#a78bfa' : '#27272a'}
                  stroke={isSelected ? '#c4b5fd' : '#52525b'}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className="cursor-pointer transition-all"
                  onClick={() => onSelect(node.entry)}
                  onDoubleClick={() => {
                    onSelect(node.entry)
                    onOpen(node.entry)
                  }}
                />
                <text
                  x={node.position.x + radius + 4}
                  y={node.position.y + 3}
                  fill={isSelected ? '#f5f5f5' : '#a1a1aa'}
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {truncate(node.entry.content, 28)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-6">
        <div className="text-dim text-xs mb-3">most connected notes</div>
        <div className="space-y-2">
          {graph.rankedNodes.slice(0, 8).map((node) => (
            <button
              key={node.entry.id}
              type="button"
              onClick={() => onSelect(node.entry)}
              onDoubleClick={() => onOpen(node.entry)}
              className={`
                w-full text-left px-3 py-2 rounded border text-sm transition-colors
                ${selectedEntry?.id === node.entry.id
                  ? 'border-accent/50 bg-selection'
                  : 'border-border hover:border-dim/50'
                }
              `}
            >
              <span className="text-accent mr-2">[{node.degree}]</span>
              <span className="text-fg">{truncate(node.entry.content, 110)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GraphView
