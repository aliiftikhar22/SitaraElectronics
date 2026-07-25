SITARA ELECTRONICS — WEBSITE EXPORT
=====================================

FILES
  index.html   — page structure/content
  styles.css   — all styling (theme, layout, animations)
  script.js    — shop logic: product rendering, cart, checkout, order tracking

HOW TO USE
  1. Keep all three files in the same folder — index.html links to the other two by filename.
  2. Open index.html in any browser to preview it locally, or upload the whole folder to any
     web host (Netlify, Vercel, GitHub Pages, cPanel, etc.) to go live.
  3. No build step, no npm install, no dependencies — it's plain HTML/CSS/JS plus Google Fonts
     loaded from a CDN link in the <head>.

ORDER DATA
  Cart and order data are saved using the browser's storage on whichever site/device the visitor
  is using — there is no shared database or admin panel yet. If you want orders visible to you
  in one place (with an admin dashboard to update delivery status), that needs real backend
  hosting with a database, which is a separate build.

CUSTOMIZING
  - Contact number / WhatsApp link: search for "923001234567" in index.html.
  - Prices & products: edit the PRODUCTS array near the top of script.js.
  - Colors: CSS variables are defined at the top of styles.css under :root.
