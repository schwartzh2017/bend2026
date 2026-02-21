'use client'

import { useSyncExternalStore } from 'react'

const PERSON_ID_KEY = 'bend_person_id'
const PERSON_NAME_KEY = 'bend_person_name'

function getIdentitySnapshot() {
  if (typeof window === 'undefined') {
    return { personId: null, personName: null }
  }
  return {
    personId: localStorage.getItem(PERSON_ID_KEY),
    personName: localStorage.getItem(PERSON_NAME_KEY),
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function useIdentity() {
  const identity = useSyncExternalStore(subscribe, getIdentitySnapshot, getIdentitySnapshot)

  const setIdentity = (id: string, name: string) => {
    localStorage.setItem(PERSON_ID_KEY, id)
    localStorage.setItem(PERSON_NAME_KEY, name)
    window.dispatchEvent(new Event('storage'))
  }

  const clearIdentity = () => {
    localStorage.removeItem(PERSON_ID_KEY)
    localStorage.removeItem(PERSON_NAME_KEY)
    window.dispatchEvent(new Event('storage'))
  }

  return {
    personId: identity.personId,
    personName: identity.personName,
    isIdentified: identity.personId !== null && identity.personName !== null,
    setIdentity,
    clearIdentity,
  }
}
