# tilveno.com

Static website for Tilveno, hosted on GitHub Pages.

## Deploy

1. Create a repository (e.g. `tilveno-site` or `<username>.github.io`).
2. Copy the contents of this folder to the repository root and push.
3. In repo **Settings → Pages**: Source = "Deploy from a branch", branch `main`, folder `/ (root)`.
4. In **Settings → Pages → Custom domain** enter `tilveno.com` (the `CNAME` file is already included). Enable **Enforce HTTPS** once the certificate is issued.
5. DNS at your registrar:
   - `A` records for `tilveno.com`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` record for `www` → `<username>.github.io`

## Structure

Each page is a folder with `index.html`, so URLs have no `.html` extension: `tilveno.com/about`, `/apps`, `/support`, `/contact`, `/privacy`, `/terms`, `/legal`.
