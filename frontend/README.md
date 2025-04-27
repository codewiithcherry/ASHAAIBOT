# Asha AI Frontend

## Local Development

```bash
npm install
npm run dev
```

## Static Export & GitHub Pages Deployment

1. **Set your repo name in `next.config.js`:**
   - Replace `/ASHAAIBOT/` in `assetPrefix` and `/ASHAAIBOT` in `basePath` with your actual GitHub repo name.

2. **Build and Export:**
   ```bash
   npm run build
   npm run export
   ```
   This will generate a static site in the `out` directory.

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```
   This uses the `gh-pages` package to push the `out` directory to the `gh-pages` branch.

4. **GitHub Pages Settings:**
   - In your repo settings, set GitHub Pages to deploy from the `gh-pages` branch (root).

## Notes
- If you use a custom domain, update `assetPrefix` and `basePath` accordingly in `next.config.js`.
- For more info, see the [Next.js static export docs](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports). 