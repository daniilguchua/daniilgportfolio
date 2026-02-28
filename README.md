# daniilguchua.com

Personal portfolio built with [Astro](https://astro.build), React, and GSAP.

## Stack

- **Astro 5** — static site generation, content collections (MDX), island architecture
- **React 19** — interactive components (skill graph, etc.)
- **GSAP + ScrollTrigger** — scroll animations, parallax, reveals
- **Tailwind CSS v4** — utility layer on top of a custom design system
- **react-force-graph-2d** — force-directed skill visualization
- **TypeScript** throughout

## Running locally

```sh
npm install
npm run dev
```

Opens at `localhost:4321`.

## Building

```sh
npm run build
npm run preview
```

Production output goes to `dist/`.

## Structure

```
src/
  components/   # Astro + React components
  content/      # MDX project case studies
  data/         # skill tree data
  layouts/      # base layout
  pages/        # routes
  styles/       # global CSS / design system
public/         # static assets (images, favicon, resume)
```
