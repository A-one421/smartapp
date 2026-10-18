import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { FULL_ACCESS } from '../config'

// Price and payout subaccount are set by the admin (Settings page) and stored in the database.
// If they cannot be read, we fall back to FULL_ACCESS.amount from config.js and no subaccount.
export async function fetchPayConfig() {
  const fallback = { price: FULL_ACCESS.amount, subaccount: '' }
  try {
    const { data } = await supabase.from('app_settings').select('key,value').in('key', ['full_access_price_kobo', 'paystack_subaccount'])
    const m = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
    const n = Number(m.full_access_price_kobo)
    return { price: n > 0 ? n : fallback.price, subaccount: typeof m.paystack_subaccount === 'string' ? m.paystack_subaccount : '' }
  } catch { return fallback }
}

export const fetchPrice = async () => (await fetchPayConfig()).price

let cached = null
export function usePrice() {
  const [price, setPrice] = useState(cached ?? FULL_ACCESS.amount)
  useEffect(() => {
    fetchPrice().then((n) => { cached = n; setPrice(n) })
  }, [])
  return price
}
