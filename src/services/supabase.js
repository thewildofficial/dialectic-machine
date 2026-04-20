import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/constants'

// Initialize Supabase client with placeholder credentials
// User must replace these with their actual Supabase project credentials
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * Fetch all entries for the current user
 */
export async function fetchEntries() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
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
  // Get current user to associate entry with
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create entries')
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: user.id,
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
    throw new Error(`Failed to save entry: ${error.message}`)
  }

  return data
}

/**
 * Update an existing entry
 */
export async function updateEntry(id, updates) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to update entries')
  }

  const { data, error } = await supabase
    .from('entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating entry:', error)
    throw new Error(`Failed to update entry: ${error.message}`)
  }

  return data
}

/**
 * Delete an entry
 */
export async function deleteEntry(id) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to delete entries')
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting entry:', error)
    throw new Error(`Failed to delete entry: ${error.message}`)
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
 * Sign in with Google via OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    return { user: null, error }
  }

  return { user: data.user, url: data.url, error: null }
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
