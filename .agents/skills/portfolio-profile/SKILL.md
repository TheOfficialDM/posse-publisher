# Portfolio Profile

Create polished portfolio project profiles from repository and session context.

## When to use

Use this skill when the user asks for:
- Portfolio project entries
- Case-study profile fields
- Resume-style project summaries
- Structured profile outputs for CMS import

Common triggers:
- "add this project to my portfolio"
- "create a project profile"
- "write a case study entry"
- "generate portfolio fields"

Aliases and short triggers:
- "make portfolio profile"
- "portfolio profile"
- "project profile"
- "portfolio entry"
- "portfolio card"
- "make a case study"
- "write project summary"
- "portfolio fields"
- "profile this project"
- "add to portfolio"

## Output contract

Always return these fields in this order:
- Title
- Slug
- Summary
- Body
- Year
- Client
- Role
- Tags
- External URL
- Pitch deck URL
- Cover image
- Cover image alt

## Writing rules

- Base claims on available repository and session evidence.
- Keep the Summary to 1-2 sentences.
- Keep the Body to one concise paragraph unless the user asks for long-form.
- Prefer outcomes and capabilities over hype.
- If a field is unknown, use "N/A".
- Keep tone professional and portfolio-ready.

## Field guidance

- Title: Product or project name.
- Slug: Lowercase kebab-case version of title.
- Summary: Value proposition and platform in one compact statement.
- Body: Problem, approach, technical scope, and current support/roadmap.
- Year: Most defensible release year from changelog/license/manifest context.
- Client: "Personal Product", "Client Work", or actual client name.
- Role: Concrete role coverage (for example, product, engineering, QA).
- Tags: 6-10 high-signal tags.
- External URL: Primary public repository or live site.
- Pitch deck URL: Public deck URL or N/A.
- Cover image: Stable URL to a repo social preview or hosted image.
- Cover image alt: Precise descriptive alt text.

## Session-backed example for this repo

Title: POSSE Publisher

Slug: posse-publisher

Summary: An Obsidian plugin that applies the IndieWeb POSSE model by publishing to a canonical personal site first, then syndicating to channels like Dev.to, Mastodon, and Bluesky with canonical attribution.

Body: POSSE Publisher is a TypeScript Obsidian plugin focused on creator-owned distribution. The workflow centers on writing in-vault, publishing to a canonical domain, and then syndicating outward to platform destinations while preserving backlink integrity to the source post. The implementation includes destination-based publishing, frontmatter-driven metadata, canonical URL override handling, Obsidian syntax preprocessing, and write-back syndication tracking. The architecture is intentionally extensible, with active support for custom API, Dev.to, Mastodon, and Bluesky, and additional destination scaffolding prepared for future releases.

Year: 2026

Client: Personal Product (Open Source)

Role: Solo Developer (Product, Architecture, Implementation, Testing, Release)

Tags: Obsidian Plugin, TypeScript, IndieWeb, POSSE, API Integrations, Content Publishing, Developer Tools, Open Source

External URL: https://github.com/TheOfficialDM/posse-publisher

Pitch deck URL: N/A

Cover image: https://opengraph.githubassets.com/1/TheOfficialDM/posse-publisher

Cover image alt: Social preview image of the POSSE Publisher GitHub repository for an Obsidian publishing and syndication plugin.

## Reusable response template

Title: 

Slug: 

Summary: 

Body: 

Year: 

Client: 

Role: 

Tags: 

External URL: 

Pitch deck URL: 

Cover image: 

Cover image alt: 