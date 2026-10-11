import { useEffect, useState } from 'react'

// Captures the browser's "install app" event so we can show our own prompt.
let deferred = null
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(Boolean(deferred))
  const [installed, setInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); deferred = e; setCanInstall(true) }
    const onInstalled = () => { deferred = null; setCanInstall(false); setInstalled(true) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return false
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    setCanInstall(false)
    return outcome === 'accepted'
  }
  return { canInstall, installed, isIOS, install }
}
