# Frontend Scripts

- `src/scripts/*.js` are small vanilla-JS modules (no UI framework) each imported via a `<script>` tag in the one component that owns that behavior: mobile nav, header scroll state, program mega-menu, hero countdown, stats count-up, donation calculator, FAQ accordion (shared by `Faq` and `FaqHome`), fade-in-on-scroll, jejak gallery lightbox, share buttons, legal-page TOC scrollspy. The `/jejak/` feed script is the one exception, inline in the page because it is coupled to that page's markup contract.
