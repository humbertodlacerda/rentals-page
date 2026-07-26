import Alpine from 'alpinejs'

const APP_URL = import.meta.env.VITE_APP_URL
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL
const API_URL = import.meta.env.VITE_API_URL

const PLAN_LABELS = {
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
}

Alpine.data('planModal', () => ({
  open: false,
  plan: '',
  loading: false,
  success: false,
  error: '',
  form: { name: '', email: '', phone: '', company: '' },

  get planLabel() {
    return PLAN_LABELS[this.plan] ?? this.plan
  },

  init() {
    window.addEventListener('open-plan-modal', e => {
      this.plan = e.detail.plan
      this.open = true
      this.success = false
      this.error = ''
      this.form = { name: '', email: '', phone: '', company: '' }
    })
  },

  close() {
    this.open = false
  },

  async submit() {
    this.loading = true
    this.error = ''
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: this.plan, ...this.form }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      this.success = true
    } catch (err) {
      this.error = 'Erro ao enviar. Verifique sua conexão e tente novamente.'
    } finally {
      this.loading = false
    }
  },
}))

window.Alpine = Alpine
Alpine.start()

document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById('nav-login')
  if (loginLink) loginLink.href = `${APP_URL}/login`

  document.querySelectorAll('[data-contact-email]').forEach(el => {
    el.href = `mailto:${CONTACT_EMAIL}`
  })

  const footerEmail = document.getElementById('footer-email')
  if (footerEmail) footerEmail.textContent = CONTACT_EMAIL

  document.querySelectorAll('[data-plan]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('open-plan-modal', { detail: { plan: el.dataset.plan } }))
    })
  })
})
