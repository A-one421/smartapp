import { APP_NAME, APP_TAGLINE, APP_YEAR } from '../config'

export default function Preloader() {
  return (
    <div className="pl" role="status" aria-live="polite">
      <div className="pl-glow" />
      <div className="pl-body">
        <div className="pl-tile"><img src="/logo.png" alt="" /></div>
        <h1 className="pl-name">{APP_NAME}</h1>
        <p className="pl-tag">{APP_TAGLINE}</p>
        <div className="pl-bar" aria-hidden="true"><i /></div>
        <small className="pl-msg">Loading your questions…</small>
      </div>
      <div className="pl-foot">JAMB · UTME · {APP_YEAR}</div>
    </div>
  )
}
