# ravikumarsingh.co.in

Ravi Kumar Singh's career portfolio (product and forward deployed engineering roles).
Plain HTML, CSS and JavaScript: no framework, no build step, no server.

## Structure

```
index.html                    portfolio home
work/*.html                   one page per case study
notes/                        product notes (coming soon)
photography/                  gallery (coming soon)
assets/css/site.css           styles, light and dark themes
assets/js/site.js             ⌘K menu, theme, animations, contact form
assets/og.png                 social preview
404.html                      not-found page; also forwards old /portfolio/... links on GitHub Pages
_redirects                    Netlify 301s from old /portfolio/... links
resume/  images/              PDFs and images (URLs kept stable)
robots.txt  sitemap.xml
```

All internal links are absolute (`/work/...`, `/assets/...`). Open the site through a local server,
not by double-clicking files.

## Run locally

```
python3 -m http.server 8080
```

Then open http://localhost:8080. `?theme=light` / `?theme=dark` forces a theme.

## Deploy

Pushing to `master` publishes to both Netlify (ravikumarsingh.co.in) and GitHub Pages (simplyrks.github.io).
The `contact` form uses Netlify Forms on the custom domain. Anywhere else it opens email.
