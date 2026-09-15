# Thembelani Nofumba — Portfolio

A dark, responsive portfolio for my data analytics, dashboards, and systems work.

**Website:** https://thembelaninofumba.github.io/

## Preview locally

The site uses HTML, CSS, and JavaScript. Node.js 22 or newer is needed for the development commands.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Stop the preview with Ctrl+C.

## Update the site

- `index.html`: introduction, project cards, experience, skills, and contact information.
- `projects/`: individual case studies.
- `assets/css/styles.css`: colours, typography, and responsive layouts.
- `assets/js/main.js`: mobile navigation, project filters, and active section tracking.
- `assets/img/`: profile portrait and original SVG project illustrations.
- `assets/docs/Thembelani-Nofumba-CV.pdf`: downloadable CV.

Project images are illustrative previews using fictional sample data. They are not screenshots of departmental records. Case studies distinguish collaborative contributions, public projects, local review builds, and applications awaiting production deployment.

## Check changes

```sh
npm ci
npm test
npm run build
```

Browser checks use Playwright with an installed Google Chrome. They cover project filtering, mobile navigation and Escape handling, local links and the PDF download, responsive layouts, accessibility, and the no-JavaScript experience.

## Publish

The `Publish portfolio` GitHub Actions workflow runs when changes are pushed to `main`. Set the repository's **Settings → Pages → Source** to **GitHub Actions** for the initial deployment.

`npm run build` creates `_site` using a whitelist of public pages and assets. Research, development dependencies, and test output are excluded from the deployment artifact. The site has no backend or runtime API keys.

To add a project, create its page in `projects`, add an image and a project card in `index.html`, then update `sitemap.xml`. Use `data-category="analytics"` or `data-category="systems"` on the card to include it in the filters.

## Credits

Design and interface illustrations were created for this portfolio. The profile image comes from my GitHub profile. DM Sans is distributed under the SIL Open Font License; its license is included with the local font files. The MyResume template supplied during design was used as a layout reference; its source code and stock images are not included.
