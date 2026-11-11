# Mayura Datar — Portfolio

A static portfolio website built with HTML, CSS and vanilla JavaScript. The design and original content are preserved from the supplied portfolio HTML, with assets separated into folders for easier maintenance.

## Preview locally

Open `index.html` in a browser, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publish with GitHub Pages

1. Create a GitHub repository named `mayura-datar-portfolio`.
2. Upload the contents of this folder to the repository root (so `index.html` is at the root).
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After the site is live, add `mayuradatar.com` in the Pages custom-domain setting and configure the DNS records at your domain registrar as GitHub instructs.
5. Enable **Enforce HTTPS** once the certificate is ready.

## Project structure

- `index.html` — page content and navigation
- `css/styles.css` — original styles and responsive layouts
- `js/main.js` — page routing, slideshows, lightbox and print-to-PDF behaviour
- `assets/images/` — extracted image and animation files
- `assets/fonts/` — embedded typeface extracted as a local font file

## Before publishing

Review all project details, client names, screenshots and metrics for NDA/confidentiality. GitHub Pages sites from public repositories are publicly accessible.
