// Shared color palette — keep every page's domain/section accents in sync.
// The same four hex values are reused for two different purposes:
//   DOMAIN_COLOR    — which course/domain a page belongs to (rema, cloud, crypto, webdev)
//   CONTENT_COLORS  — what *kind* of content a section is (tutorial, reference, resource, assessment),
//                      independent of domain. Used to color sub-sections within a single page
//                      (e.g. a video lesson's Lab Notes / References / Exercises / Self-Assessment).

export const DOMAIN_COLOR: Record<string, string> = {
  rema: '#8B5E1A',
  'cloud-security': '#1B5FA8',
  cloud: '#1B5FA8',
  crypto: '#6B3AD4',
  webdev: '#1B7C3E',
}

export const CONTENT_COLORS = {
  amber: '#8B5E1A',
  blue: '#1B5FA8',
  green: '#1B7C3E',
  purple: '#6B3AD4',
} as const

// Video lesson page sub-sections (app/videos/[slug]/page.tsx)
export const SECTION_COLORS = {
  lab: CONTENT_COLORS.amber,
  refs: CONTENT_COLORS.blue,
  exercises: CONTENT_COLORS.green,
  test: CONTENT_COLORS.purple,
} as const

// Topic page quadrants (app/learn/[course]/[unit]/[topic]/page.tsx) — same
// four-color cycle as SECTION_COLORS, so the visual language stays uniform
// between a topic's overview and an individual video lesson.
export const QUADRANT_COLORS = {
  tutorial: CONTENT_COLORS.amber,
  content: CONTENT_COLORS.blue,
  resources: CONTENT_COLORS.green,
  assessment: CONTENT_COLORS.purple,
} as const
