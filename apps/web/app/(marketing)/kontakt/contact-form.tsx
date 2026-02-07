'use client';

import { useState } from 'react';

/**
 * Form field state
 */
interface ContactFormState {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

/**
 * Initial empty form state
 */
const INITIAL_FORM_STATE: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

/**
 * Subject options for the dropdown
 */
const SUBJECT_OPTIONS: ReadonlyArray<{ readonly value: string; readonly label: string }> = [
  { value: '', label: 'Bitte wählen...' },
  { value: 'booking', label: 'Buchungsanfrage' },
  { value: 'group', label: 'Gruppenanfrage' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Kooperationsanfrage' },
  { value: 'other', label: 'Sonstiges' },
];

/**
 * Contact form component with local state management
 * Displays a success message on submission without actually sending data
 */
export function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleFieldChange(
    field: keyof ContactFormState,
    value: string
  ): void {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="card-hover text-center space-y-4 py-12">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-brass-500/10 border-2 border-brass-500 flex items-center justify-center text-3xl">
            <svg
              className="h-8 w-8 text-brass-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="font-display text-2xl font-bold text-brass-400">
          Nachricht gesendet!
        </h3>
        <p className="text-sand-300 max-w-md mx-auto">
          Vielen Dank für eure Nachricht. Wir melden uns innerhalb von 24 Stunden
          bei euch.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormState(INITIAL_FORM_STATE);
            setIsSubmitted(false);
          }}
          className="btn btn-secondary mt-4"
        >
          Neue Nachricht senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-hover space-y-6">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-sand-200 mb-2"
        >
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={formState.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Euer Name"
          className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-sand-200 placeholder:text-sand-500 focus:outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500/50"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-sand-200 mb-2"
        >
          E-Mail
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={formState.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="eure@email.de"
          className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-sand-200 placeholder:text-sand-500 focus:outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500/50"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-sand-200 mb-2"
        >
          Betreff
        </label>
        <select
          id="contact-subject"
          required
          value={formState.subject}
          onChange={(e) => handleFieldChange('subject', e.target.value)}
          className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-sand-200 focus:outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500/50"
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-sand-200 mb-2"
        >
          Nachricht
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={formState.message}
          onChange={(e) => handleFieldChange('message', e.target.value)}
          placeholder="Eure Nachricht an uns..."
          className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-sand-200 placeholder:text-sand-500 focus:outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500/50 resize-none"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Nachricht senden
      </button>
    </form>
  );
}
