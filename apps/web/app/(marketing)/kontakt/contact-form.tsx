'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Send } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContactFormState {
 readonly name: string
 readonly email: string
 readonly subject: string
 readonly message: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const INITIAL_FORM_STATE: ContactFormState = {
 name: '',
 email: '',
 subject: '',
 message: '',
}

const SUBJECT_OPTIONS: ReadonlyArray<{ readonly value: string; readonly label: string }> = [
 { value: '', label: 'Bitte wählen...' },
 { value: 'booking', label: 'Buchungsanfrage' },
 { value: 'group', label: 'Gruppenanfrage' },
 { value: 'feedback', label: 'Feedback' },
 { value: 'partnership', label: 'Kooperationsanfrage' },
 { value: 'other', label: 'Sonstiges' },
]

// ---------------------------------------------------------------------------
// ContactForm
// ---------------------------------------------------------------------------

export function ContactForm() {
 const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE)
 const [status, setStatus] = useState<FormStatus>('idle')
 const [errorMessage, setErrorMessage] = useState('')

 const handleFieldChange = useCallback(
  (field: keyof ContactFormState, value: string) => {
   setForm((prev) => ({ ...prev, [field]: value }))
  },
  [],
 )

 const handleSubmit = useCallback(
  async (event: React.FormEvent<HTMLFormElement>) => {
   event.preventDefault()
   setStatus('submitting')
   setErrorMessage('')

   try {
    const response = await fetch('/api/contact', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(form),
    })

    const result = await response.json()

    if (!result.success) {
     setErrorMessage(result.error ?? 'Nachricht konnte nicht gesendet werden')
     setStatus('error')
     return
    }

    setStatus('success')
   } catch {
    setErrorMessage('Netzwerkfehler. Bitte prüft eure Verbindung.')
    setStatus('error')
   }
  },
  [form],
 )

 if (status === 'success') {
  return (
   <div className="card text-center space-y-4 py-12">
    <div className="flex justify-center">
     <div
      className="h-16 w-16 rounded-full flex items-center justify-center"
      style={{
       background: 'rgba(34, 197, 94, 0.1)',
       border: '1px solid rgba(34, 197, 94, 0.15)',
      }}
     >
      <CheckCircle2 className="h-8 w-8 text-green-400" strokeWidth={1.5} />
     </div>
    </div>
    <h3 className="text-2xl font-bold text-white">
     Nachricht gesendet!
    </h3>
    <p className="text-white/60 font-semibold text-sm max-w-md mx-auto">
     Vielen Dank für eure Nachricht. Wir melden uns innerhalb von 24 Stunden bei euch.
    </p>
    <button
     type="button"
     onClick={() => {
      setForm(INITIAL_FORM_STATE)
      setStatus('idle')
     }}
     className="btn btn-secondary mt-4"
    >
     Neue Nachricht senden
    </button>
   </div>
  )
 }

 const inputClasses =
  'w-full rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-dark-600 focus:outline-none transition-colors'
 const inputStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
 }
 const inputFocusClass = 'focus:border-white/20 focus:ring-1 focus:ring-white/20'

 return (
  <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
   {status === 'error' && errorMessage && (
    <div
     className="rounded-xl p-4 flex items-center gap-3"
     style={{
      background: 'rgba(239, 68, 68, 0.06)',
      border: '1px solid rgba(239, 68, 68, 0.12)',
     }}
    >
     <AlertCircle className="h-4 w-4 text-red-400/80 flex-shrink-0" strokeWidth={1.5} />
     <p className="text-xs text-red-300">{errorMessage}</p>
    </div>
   )}

   <div>
    <label htmlFor="contact-name" className="block text-xs font-semibold text-white/60 mb-2">
     Name
    </label>
    <input
     id="contact-name"
     type="text"
     required
     value={form.name}
     onChange={(e) => handleFieldChange('name', e.target.value)}
     placeholder="Euer Name"
     className={`${inputClasses} ${inputFocusClass}`}
     style={inputStyle}
    />
   </div>

   <div>
    <label htmlFor="contact-email" className="block text-xs font-semibold text-white/60 mb-2">
     E-Mail
    </label>
    <input
     id="contact-email"
     type="email"
     required
     value={form.email}
     onChange={(e) => handleFieldChange('email', e.target.value)}
     placeholder="eure@email.de"
     className={`${inputClasses} ${inputFocusClass}`}
     style={inputStyle}
    />
   </div>

   <div>
    <label htmlFor="contact-subject" className="block text-xs font-semibold text-white/60 mb-2">
     Betreff
    </label>
    <select
     id="contact-subject"
     required
     value={form.subject}
     onChange={(e) => handleFieldChange('subject', e.target.value)}
     className={`${inputClasses} ${inputFocusClass}`}
     style={inputStyle}
    >
     {SUBJECT_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
       {option.label}
      </option>
     ))}
    </select>
   </div>

   <div>
    <label htmlFor="contact-message" className="block text-xs font-semibold text-white/60 mb-2">
     Nachricht
    </label>
    <textarea
     id="contact-message"
     required
     rows={5}
     maxLength={5000}
     value={form.message}
     onChange={(e) => handleFieldChange('message', e.target.value)}
     placeholder="Eure Nachricht an uns..."
     className={`${inputClasses} ${inputFocusClass} resize-none`}
     style={inputStyle}
    />
   </div>

   <button
    type="submit"
    disabled={status === 'submitting'}
    className="btn btn-primary w-full"
   >
    {status === 'submitting' ? (
     <>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark-950 border-t-transparent" />
      Wird gesendet...
     </>
    ) : (
     <>
      Nachricht senden
      <Send className="h-4 w-4" strokeWidth={1.5} />
     </>
    )}
   </button>
  </form>
 )
}
