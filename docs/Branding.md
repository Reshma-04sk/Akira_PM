# Branding & Design Tokens Guide

This document defines the branding parameters, color palettes, typography guidelines, and design tokens of Akira-PM.

---

## 1. Brand Logo & Favicon

Akira-PM uses a custom SVG logo consisting of a geometric letter **"A"** inside an indigo-to-cyan gradient background container.

### SVG Logo Source Code
[logo.svg](file:///c:/saas%20project/apps/frontend/public/logo.svg)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="akiraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <rect x="15" y="15" width="70" height="70" rx="16" fill="url(#akiraGrad)" />
  <path d="M50 30 L68 68 L58 68 L50 50 L42 68 L32 68 Z" fill="#FFFFFF" />
  <circle cx="50" cy="40" r="4" fill="#06B6D4" />
</svg>
```

---

## 2. Color Palette & Theme Tokens

Akira-PM implements a unified Tailwind design token system mapping light and dark themes:

### Core Colors
* **Primary (Indigo/Cyan Accent)**: `url(#akiraGrad)` / `#4F46E5` -> `#06B6D4`
* **Background (Dark Theme)**: `#0B0F19` (Deep Obsidian Black)
* **Card Backing (Glassmorphism)**: `rgba(255, 255, 255, 0.03)` with backdrop blur filter.
* **Border Color (Glow Line)**: `rgba(255, 255, 255, 0.08)`

### CSS Variables Mappings
```css
:root {
  --background: 220 33% 98%;
  --foreground: 224 71.4% 4.1%;
  --card: 0 0% 100%;
  --border: 220 13% 91%;
  --primary: 243.4 75.4% 58.6%; /* Indigo-600 */
}

.dark {
  --background: 224 71% 4%; /* Obsidian Dark */
  --foreground: 210 20% 98%;
  --card: 224 71% 4%;
  --border: 217.2 32.6% 12%;
  --primary: 243.4 75.4% 58.6%;
}
```

---

## 3. Typography Guide

We use clean, legible, modern typography designed for data-heavy dashboard user interfaces:

* **Primary Font**: **Inter** (sans-serif)
  - *Weights*: `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold)
  - *Usage*: Main copy, inputs, forms, and grid contents.
* **Heading Font**: **Outfit** / **Inter**
  - *Weights*: `700` (Bold)
  - *Usage*: Large titles, project headings, and statistics numbers.

---

## 4. Layout & Spacing Tokens

To ensure consistency in UI alignments, spacing utilizes 4px base increments:
- **Small Padding**: `0.5rem` (8px) - buttons, inputs
- **Medium Padding**: `1rem` (16px) - dashboard widgets, navigation lists
- **Large Padding**: `1.5rem` (24px) - page layout containers, boards columns
- **Rounded Corners**: `0.75rem` (12px) - card corners, modals, action sheets.
