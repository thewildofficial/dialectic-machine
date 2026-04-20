import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/constants'

// Initialize Supabase client with placeholder credentials
// User must replace these with their actual Supabase project credentials
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Fetch all entries for the current user
 */
export async function fetchEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching entries:', error)
    return []
  }

  return data || []
}

/**
 * Create a new entry
 */
export async function createEntry(entry) {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      content: entry.content,
      source: entry.source || null,
      url: entry.url || null,
      type: entry.type || 'idea',
      tags: entry.tags || [],
      commentary: entry.commentary || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating entry:', error)
    return null
  }

  return data
}

/**
 * Update an existing entry
 */
export async function updateEntry(id, updates) {
  const { data, error } = await supabase
    .from('entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating entry:', error)
    return null
  }

  return data
}

/**
 * Delete an entry
 */
export async function deleteEntry(id) {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting entry:', error)
    return false
  }

  return true
}

/**
 * Sign up with email and password
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error signing up:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  }
  return !error
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}
