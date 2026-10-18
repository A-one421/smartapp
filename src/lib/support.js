import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Support numbers are set by the admin (Settings page). Digits with country code, e.g. 2348012345678.
export async function fetchSupport() {
  try {
    const { data } = await supabase.from('app_settings').select('key,value').in('key', ['support_whatsapp', 'support_phone'])
    const m = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
    const clean = (v) => (typeof v === 'string' ? v.replace(/\D/g, '') : '')
    return { whatsapp: clean(m.support_whatsapp), phone: clean(m.support_phone) }
  } catch { return { whatsapp: '', phone: '' } }
}

let cached = null
export function useSupport() {
  const [s, setS] = useState(cached || { whatsapp: '', phone: '' })
  useEffect(() => { fetchSupport().then((v) => { cached = v; setS(v) }) }, [])
  return s
}
