import React from 'react'
import LandingPage from '../components/LandingPage'
import { useNavigate } from 'react-router-dom'

/**
 * Landing page route
 * Shows the braille yin-yang splash screen
 */
function Landing() {
  const navigate = useNavigate()

  const handleEnter = () => {
    navigate('/app')
  }

  return <LandingPage onEnter={handleEnter} />
}

export default Landing
