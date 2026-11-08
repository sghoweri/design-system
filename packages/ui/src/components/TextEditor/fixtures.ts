// Story-only sample files for the editor lab. Made up: no real people, companies or settings.
import type { TextEditorLanguage } from './codemirror';

export interface Fixture {
  label: string;
  description: string;
  language: TextEditorLanguage;
  base: string;
  /** Where the story starts. The base when omitted. */
  start?: string;
}

const searchSettings = `# Search settings
enabled: true
role_focus: frontend
seniority_floor: senior
remote: required
locations:
  - Remote (US)
  - Chicago, IL
  - Milwaukee, WI
titles_include:
  - Staff Frontend Engineer
  - Design Systems Lead
  - UI Platform Engineer
  - Principal Engineer, Web
titles_exclude:
  - Manager
  - Director
keywords_boost:
  - design tokens
  - web components
  - accessibility
  - storybook
keywords_penalize:
  - crypto
  - on-call 24/7
exclude_companies: []
salary_floor_usd: 185000
company_size:
  min: 50
  max: 2000
schedule:
  scan: daily
  digest: "08:00"
  quiet_days: [sat, sun]
notes: >
  Prefer small product teams that ship one design
  system to more than one app. Skip agencies.
`;

const resumeSection = `## Experience

### Staff Frontend Engineer, Northwind Health
*2022 – present · Remote*

- Led the move from a jQuery front end to React with zero downtime.
- Built a token-driven design system that four product teams use.
- Cut the median page load from 3.1s to 1.4s by splitting the app shell.

### Senior UI Engineer, Contoso Logistics
*2018 – 2022 · Chicago*

- Rebuilt the shipment tracker as accessible web components.
- Mentored five engineers through their first design-system releases.
`;

const careerBase = `{
  "name": "Avery Example",
  "headline": "Frontend engineer focused on design systems",
  "location": "Chicago, IL",
  "years_experience": 11,
  "skills": ["TypeScript", "React", "CSS architecture", "Accessibility"],
  "open_to": {
    "remote": true,
    "relocation": false,
    "contract": false
  },
  "links": {
    "portfolio": "https://avery.example",
    "code": "https://code.example/avery"
  }
}
`;

// A few edits against the base: a reworded headline, a changed number, an added skill, a removed line and a changed
// link, so the diff shows on load.
const careerEdited = careerBase
  .replace('Frontend engineer focused on design systems', 'Staff frontend engineer leading design systems')
  .replace('"years_experience": 11', '"years_experience": 12')
  .replace('"Accessibility"]', '"Accessibility", "Web Components"]')
  .replace('    "relocation": false,\n', '')
  .replace('https://avery.example"', 'https://avery.example/work"');

export const fixtures = {
  yaml: {
    label: 'search.yaml',
    description: 'Search settings. Long enough to scroll with the keyboard open.',
    language: 'yaml',
    base: searchSettings,
  },
  markdown: {
    label: 'resume.md: Experience',
    description: 'A resume section. Prose: autocorrect and predictive text are on here.',
    language: 'markdown',
    base: resumeSection,
  },
  json: {
    label: 'career.json',
    description: 'A career file with five edits already made against the saved version.',
    language: 'json',
    base: careerBase,
    start: careerEdited,
  },
} satisfies Record<string, Fixture>;
