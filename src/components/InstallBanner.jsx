import { useState } from 'react'
import { X, Share } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { APP_NAME } from '../config'

// Shows "Install app" when the browser allows it. iOS Safari has no install event,
// so we show the manual "Add to Home Screen" hint there instead.
export default function InstallBanner() {
  const { canInstall, installed, isIOS, install } = useInstallPrompt()
  const [hidden, setHidden] = useState(() => localStorage.getItem('install-dismissed') === '1')
  if (installed || hidden || (!canInstall && !isIOS)) return null

  const dismiss = () => { localStorage.setItem('install-dismissed', '1'); setHidden(true) }
  return (
    <div className="install" role="region" aria-label="Install app">
      <img src="/pwa-192.png" alt="" />
      <div className="t">
        <b>Install {APP_NAME}</b>
        {canInstall ? 'Open it like an app, even on slow networks.' : (<>Tap <Share size={14} style={{ verticalAlign: '-2px' }} /> then “Add to Home Screen”.</>)}
      </div>
      {canInstall && <button className="btn small" style={{ boxShadow: 'none' }} onClick={install}>Install</button>}
      <button className="icon-btn" onClick={dismiss} aria-label="Dismiss"><X size={20} /></button>
    </div>
  )
}
