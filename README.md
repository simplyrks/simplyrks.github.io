# ravikumarsingh.co.in

Two sites on one domain. Plain HTML, CSS and JavaScript: no framework, no build step, no server.

| Address | What it is |
| --- | --- |
| `/` | **Take it Online**: landing page for local businesses (English + Hindi) |
| `/portfolio/` | Ravi Kumar Singh's career portfolio (product and forward deployed engineering roles) |

## Structure

```
index.html                    Take it Online landing page
assets/css/landing.css        landing styles
assets/js/landing.js          language toggle, phone demo, change log, enquiry form
assets/tio-favicon.svg        landing favicon
assets/og-takeitonline.png    landing social preview
images/landing/               Face Stories by Bushra screenshots

portfolio/index.html          career portfolio home
portfolio/work/*.html         one page per case study
portfolio/notes/              product notes (coming soon)
portfolio/photography/        gallery (coming soon)
assets/css/site.css           portfolio styles, light and dark themes
assets/js/site.js             portfolio interaction: ⌘K menu, theme, animations, contact form
assets/og.png                 portfolio social preview

404.html                      not-found page, points to both sites
resume/  images/              PDFs and images, shared by both (URLs kept stable)
robots.txt  sitemap.xml
```

All internal links are absolute (`/portfolio/...`, `/assets/...`), so pages work whether a visitor
lands on `/portfolio` or `/portfolio/`. Open the site through a local server, not by double-clicking files.

## Landing page languages

Every piece of copy is written twice, side by side:

```html
<span class="en">English text</span><span class="hi" lang="hi">हिंदी टेक्स्ट</span>
```

CSS hides whichever language isn't active. The toggle remembers the choice, and `?lang=hi` or `?lang=en`
forces one. Placeholders and the WhatsApp pre-filled message switch through `landing.js`.

## Run locally

```
python3 -m http.server 8080
```

Then open http://localhost:8080 (landing) and http://localhost:8080/portfolio/ (portfolio).
`?theme=light` / `?theme=dark` forces a theme on portfolio pages.

## Deploy

Pushing to `master` publishes to both Netlify (ravikumarsingh.co.in) and GitHub Pages (simplyrks.github.io).
Both forms (`take-it-online` on the landing page, `contact` on the portfolio) use Netlify Forms on the
custom domain. Anywhere else, the landing form opens WhatsApp and the portfolio form opens email.
