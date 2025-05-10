'use client'

import { useEffect, useState } from 'react'

export function useBusinessName() {
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    fetch('../data/settings.json')
      .then(res => res.json())
      .then(data => setBusinessName(data.businessName || ''))
      .catch(() => setBusinessName(''))
  }, [])

  return businessName
}
