import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { FULL_ACCESS } from '../config'

// The price is set by the admin (Settings page) and stored in the database, in kobo.
// If it cannot be read, we fall back to FULL_ACCESS.amount from config.js.
export async function fetchPrice() {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'full_access_price_kobo').maybeSingle()
    const n = Number(data?.value)
    return n > 0 ? n : FULL_ACCESS.amount
  } catch { return FULL_ACCESS.amount }
}

let cached = null
export function usePrice() {
  const [price, setPrice] = useState(cached ?? FULL_ACCESS.amount)
  useEffect(() => {
    fetchPrice().then((n) => { cached = n; setPrice(n) })
  }, [])
  return price
}
