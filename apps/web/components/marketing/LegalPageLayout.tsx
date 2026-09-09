/**
 * LegalPageLayout component
 * Shared layout for legal pages (Impressum, Datenschutz, AGB)
 * Provides consistent styling for legal content sections
 */

interface LegalPageLayoutProps {
  readonly title: string
  readonly lastUpdated: string
  readonly children: React.ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <section className="container-custom max-w-3xl py-20">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      <p className="text-coast-muted text-sm mb-8">Stand: {lastUpdated}</p>

      <div className="legal-prose space-y-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-coast-ink [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-coast-ink [&_h3]:mb-2 [&_p]:text-coast-muted [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-coast-muted [&_a]:text-coast-ink [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-coast-muted [&_a]:transition-colors">
        {children}
      </div>
    </section>
  )
}
