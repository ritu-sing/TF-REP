# Agent Notes

This file documents agent-facing conventions for working in this Shopify theme repository (Horizon-based).

## Scope

- This is a brownfield Shopify theme (Horizon). Prefer modifying existing sections/blocks/snippets over creating new ones.
- Section groups (`header-group.json`, `footer-group.json`) must keep `{% sections 'header-group' %}` / `{% sections 'footer-group' %}` wiring intact in `layout/theme.liquid`.
- Static blocks referenced via `content_for 'block'` (e.g. `header-logo`, `header-menu`) are structural and underscore-prefixed in `blocks/` (`_header-logo.liquid`, `_header-menu.liquid`).

## Conventions

- CSS: vanilla CSS with custom properties, scoped per file in `{% stylesheet %}` / `{% style %}` tags. No SCSS/Tailwind.
- JS: vanilla, zero dependencies, custom elements hydrated via importmap modules.
- Schema: snake_case setting IDs; plain English labels for new settings; existing `t:` keys left as-is unless explicitly migrated.
