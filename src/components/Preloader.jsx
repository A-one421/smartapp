import { APP_NAME, APP_TAGLINE, APP_YEAR } from '../config'

export default function Preloader() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="blob b1" /><div className="blob b2" />
      <div className="inner">
        <div className="disc"><img src="/logo.png" alt={APP_NAME} /></div>
        <h1>{APP_NAME}</h1>
        <p>{APP_TAGLINE}</p>
        <span className="year">{APP_YEAR}</span>
        <div className="spinner" />
        <small>Preparing your learning experience</small>
      </div>
    </div>
  )
}
