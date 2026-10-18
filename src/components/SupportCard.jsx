import { LifeBuoy, MessageCircle, Phone } from 'lucide-react'
import { useSupport } from '../lib/support'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config'

// "Need help?" card with WhatsApp and call buttons. Hidden until the admin sets a number.
export default function SupportCard() {
  const { whatsapp, phone } = useSupport()
  const { user, profile } = useAuth()
  if (!whatsapp && !phone) return null

  const text = `Hello ${APP_NAME} support, I need help.\nName: ${profile?.name || ''}\nEmail: ${user?.email || ''}`
  return (
    <section className="help-card" aria-label="Contact support">
      <div className="help-top">
        <span className="help-ic"><LifeBuoy size={24} /></span>
        <div>
          <b>Need help or have a question?</b>
          <span>Reach us for enquiries, login problems or payment issues.</span>
        </div>
      </div>
      <div className="help-actions">
        {whatsapp && (
          <a className="wa" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} /> Chat on WhatsApp
          </a>
        )}
        {phone && (
          <a className="call" href={`tel:+${phone}`}>
            <Phone size={20} /> Call us
          </a>
        )}
      </div>
    </section>
  )
}
