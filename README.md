# Zenvora starter

A responsive React + Vite + TypeScript starter for Zenvora, an all-in-one online tools platform. The image compressor works locally in the browser using Canvas; files are not sent to a backend.

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Current state
- Responsive homepage and tool directory
- Search/filter tool cards
- Working client-side image compression for JPG, PNG and WebP input, with WebP/JPG/PNG output options
- Quality slider, preview, output size comparison and download
- Files up to 25 MB accepted by the UI
- Placeholder cards for future tools (not yet implemented)
- Django/PostgreSQL backend intentionally not included in this first milestone

## Notes before public launch
- The brand name and domain have not been cleared for trademark/domain conflicts.
- Update the placeholder `hello@zenvora.example` contact address before deployment.
- Browser Canvas output size can vary by browser and image; PNG output is lossless and ignores the quality slider.
- Add automated tests, accessibility review, security/privacy pages and production deployment configuration before public launch.
