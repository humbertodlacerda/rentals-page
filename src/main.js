import Alpine from 'alpinejs'

const APP_URL = import.meta.env.VITE_APP_URL
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL
const API_URL = import.meta.env.VITE_API_URL

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const splitAt = digits.length <= 10 ? 4 : 5
  const p1 = rest.slice(0, splitAt)
  const p2 = rest.slice(splitAt)
  return p2 ? `(${ddd}) ${p1}-${p2}` : `(${ddd}) ${p1}`
}

const USAGE_FOOTNOTE = 'Você só paga pelos veículos ativos. Cancele quando quiser, sem multa.'

const PLAN_DATA = {
  starter: {
    label: 'Starter',
    badge: 'até 10 veículos',
    price: '59,90',
    unit: 'por veículo / mês',
    billing: 'Cobrado mensalmente',
    features: [
      'Clientes e locações ilimitadas',
      'Dashboard de indicadores em tempo real',
      'Contratos digitais e exportações em PDF',
      'Suporte por e-mail em horário comercial',
      'Dispositivos IoT (rastreio em tempo real)',
    ],
    footnote: USAGE_FOOTNOTE,
  },
  business: {
    label: 'Business',
    badge: 'até 20 veículos',
    price: '49,90',
    unit: 'por veículo / mês',
    billing: 'Cobrado mensalmente',
    features: [
      'Tudo do Starter, e mais:',
      'Dispositivos IoT integrados (rastreio + comandos remotos)',
      'Mapa da frota em tempo real',
      'Automações de status e cobrança',
      'Suporte prioritário por chat e telefone',
    ],
    footnote: USAGE_FOOTNOTE,
  },
  enterprise: {
    label: 'Enterprise',
    badge: '50+ veículos',
    priceCustom: 'Sob medida',
    billing: 'Vamos desenhar o melhor formato para sua operação.',
    features: [
      'Tudo do Business, e mais:',
      'Multi-locadora (tenancy) e múltiplas filiais',
      'API e integrações com ERP / banco / seguradoras',
      'Onboarding guiado + treinamento da equipe',
      'SLA dedicado e gerente de conta',
    ],
    footnote: 'Nosso time entra em contato para desenhar a proposta ideal para sua operação.',
  },
  essential: {
    label: 'Essential',
    price: '39,90',
    unit: 'por veículo / mês',
    billing: 'Cobrado mensalmente',
    features: [
      'Rastreio em tempo real no app',
      'Alerta de ignição',
      'Bloqueio e desbloqueio remoto pelo app',
      'Alertas de velocidade',
      'Suporte por e-mail e WhatsApp',
    ],
    footnote: USAGE_FOOTNOTE,
  },
}

Alpine.data('planModal', () => ({
  open: false,
  plan: '',
  loading: false,
  success: false,
  error: '',
  form: { name: '', email: '', phone: '', company: '' },

  get planData() {
    return PLAN_DATA[this.plan] ?? { label: this.plan, features: [] }
  },
  get priceWhole() {
    return (this.planData.price ?? '').split(',')[0]
  },
  get priceCents() {
    return (this.planData.price ?? '').split(',')[1]
  },

  maskPhone(e) {
    this.form.phone = formatPhone(e.target.value)
    e.target.value = this.form.phone
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
  if (loginLink) loginLink.href = `${APP_URL}/auth/login`

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
