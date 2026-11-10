# Salman · Portfolio

A static, responsive portfolio for Salman, a CSE undergraduate majoring in Data Science at United International University. Includes a short animated SalmanOS intro, project case studies, a downloadable résumé, dark/light themes, and an optional SalmanOS desktop.

## Run locally

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. No package installation is needed. Serve over HTTP rather than opening the HTML directly because the optional desktop uses JavaScript modules.

## Update content

- `index.html`: introduction, about, education, leadership, skills, and contact.
- `data/projects.json`: featured project summaries, tags, and links.
- `projects/*.html`: detailed project case studies.
- `assets/images/Salman_CV.pdf`: current résumé.
- `assets/images/ProfessionalHeadshot.png`: source portrait; the page loads the optimized `salman-portrait.webp`.

After editing project data, regenerate the static homepage cards:

```sh
python3 scripts/build-projects.py
python3 scripts/build-projects.py --check
```

The committed HTML includes the complete portfolio and works without JavaScript. The generation step also runs during deployment.

## Structure

- `assets/css/style.css`: shared design system and homepage layout.
- `assets/css/case-study.css`: project page layouts.
- `assets/js/theme.js`: tiny theme preference initialization before paint.
- `assets/js/main.js`: navigation, theme controls, one-time reveals, local time, and clipboard.
- `assets/js/os.js` / `assets/css/os.css`: loaded only when SalmanOS opens.
- `assets/fonts/`: locally hosted Manrope variable font and its OFL license.

All animation respects reduced motion. The intro can be skipped and starts fading out within 2.4 seconds of JavaScript starting. There are no background videos, continuous canvas/WebGL loops, third-party scripts, or runtime API requests. The local clock pauses while the tab is hidden. SalmanOS reuses its DOM and terminal state; it does not attach handlers each time it opens.

## Deploy

Push `main` to publish through `.github/workflows/deploy.yml`. GitHub Pages serves `https://deepsalman.github.io/Portfolio/`. The deployment regenerates project cards and publishes only the site files in a staging folder.

## Content accuracy

Project descriptions and current profile details are based on the supplied résumé. The project visuals are conceptual illustrations, not product screenshots or measured model results. Repository links point to the public project repositories. The source résumé is publicly downloadable; maintain it accordingly.
