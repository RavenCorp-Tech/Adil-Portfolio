# Raven Corp.Tech — Portfolio

Personal portfolio for Adil Hasan (Raven Corp.Tech). Dark mode by default with a theme toggle, project data from JSON, and a contact form placeholder.

## Live site

https://ravencorp-tech.github.io/Adil-Portfolio/

## Quick start

- Save your logo from the chat as `assets/logo-ravencorp-tech.png` (PNG/WebP recommended).
- Open `index.html` in your browser to preview locally.
- Update `data/projects.json` as you add more projects.
- Optional: add `resume.pdf` in the project root; the button appears automatically when the file is present.

## Contact form

The form is present but disabled until you add a provider endpoint:
- Formspree: Set `action=\"https://formspree.io/f/<your-id>\"`.
- EmailJS: Add the EmailJS script and configuration, then handle `sendForm` in `script.js`.

## Deploy to GitHub Pages

1. Push these files to the `main` branch of this repo.
2. Add `CNAME` with `ravencorp.tech` (already included here).
3. In GitHub: Settings → Pages → Deploy from branch → `main` → `/root`.
4. DNS:
   - For apex `ravencorp.tech`: add A records to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - For `www.ravencorp.tech`: CNAME → `<username>.github.io`
5. After DNS propagates, set/verify the custom domain in Pages and enable “Enforce HTTPS”.

## Customize

- SEO: Edit `<title>`, meta `description`, and Open Graph tags in `index.html`.
- Colors/Theme: Adjust CSS variables in `styles.css` (`--primary`, `--accent`, etc.).
- Fonts: Headings use Oxanium; body uses Space Grotesk.

## Project note

- \"Arabic Romanizer\" is AI‑powered and will use ChatGPT 5 API for improved transliteration accuracy.

## License

Use freely for your personal site.
