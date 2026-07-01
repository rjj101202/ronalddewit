# Ronald de Wit Consulting

A static recreation of [ronalddewit.com](https://ronalddewit.com/) — a professional
consulting website for Ronald de Wit, internist and medical oncologist.

Built as plain HTML/CSS/JS with **no build step**, ready to deploy to Vercel or any
static host.

## Structure

```
.
├── index.html          # Home
├── about.html          # About me
├── services.html       # Services
├── insights.html       # Insights / articles
├── contact.html        # Contact + form
├── css/style.css       # All styling (black & white minimalist theme)
├── js/main.js          # Mobile menu toggle
├── assets/             # Logo & favicon (SVG)
├── vercel.json         # Clean URLs config (/about instead of /about.html)
└── README.md
```

## Run locally

Any static server works. For example:

```bash
# Python
python -m http.server 3000

# or Node
npx serve
```

Then open http://localhost:3000.

## Deploy to Vercel via GitHub

1. Create a new GitHub repository and push this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ronald de Wit Consulting site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com), click **Add New → Project**, and import
   the GitHub repository.

3. Vercel auto-detects a static site — leave the framework as **Other**, no build
   command, output directory is the root. Click **Deploy**.

`vercel.json` enables clean URLs so links like `/about` resolve to `about.html`.

## Edit mode — adding photos & changing links yourself

The site has a built-in, no-code **edit mode** for the photo spots (hero, the three
expertise cards, the About portrait, and the blog thumbnails) and for the
"Links to my work" links (Wikipedia, Google Scholar, LinkedIn, Academy of Europe).

**How to use it:**

1. Open any page with `?edit=1` in the URL, e.g. `https://your-site.vercel.app/?edit=1`
   (locally: `http://localhost:3000/?edit=1`). A black toolbar appears at the bottom.
2. **Add a photo** — click any highlighted photo spot, choose an image, and it appears
   instantly. Photos are automatically downscaled so the file stays small.
3. **Change a link** — click a "Links to my work" link and enter the new URL.
4. Your changes are saved in your browser so you can preview them across pages.
5. Click **content.json downloaden** in the toolbar to download the updated content.
6. Replace `data/content.json` in the repository with the downloaded file, then commit
   and push. Vercel redeploys automatically and the photos/links go live for everyone.
7. **Wijzigingen wissen** resets local changes; **Sluiten** exits edit mode.

Empty photo spots are hidden from normal visitors — they only show up once a photo has
been added (or while you are in edit mode).

> The content lives in `data/content.json`. Uploaded photos are stored inline (as
> base64 data URLs), so the single file is all you need to commit.

## Things you may want to update

- **Links to my work** — the Wikipedia, Google Scholar, LinkedIn and Academy of
  Europe URLs in `index.html` / `about.html` are placeholders; point them at the
  real profiles.
- **Contact form** — the form in `contact.html` posts to a placeholder
  [Formspree](https://formspree.io/) endpoint (`your-form-id`). Replace it with your
  own form endpoint, or wire up another handler.
- **Email / location** — update the contact details in `contact.html`.
- **Insights articles** — the article list in `insights.html` uses placeholder
  titles and lorem-ipsum text; replace with real content.
- **Logo** — `assets/logo.svg` is a simple wordmark placeholder; swap in the real
  logo if you have it.
