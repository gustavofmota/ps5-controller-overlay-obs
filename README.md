# PS5 Controller Overlay for OBS

A browser-based PS5 / DualSense controller overlay designed for OBS Browser Source.

## Features

- Real-time input visualization using the Gamepad API
- OBS-friendly static site
- Multiple skins, including Initial D inspired variants
- URL parameters for skin, scale, glow, deadzone, and control panel visibility

## Quick start

Open `index.html` locally for testing, or deploy the repo with GitHub Pages / Netlify / Vercel.

### OBS Browser Source example

```text
https://YOUR-DEPLOYED-URL/?skin=initiald-ae86&panel=off&scale=100&glow=72&deadzone=12
```

## URL parameters

- `skin`: `clean-white`, `initiald-ae86`, `initiald-redsuns`, `midnight-touge`
- `panel`: `on` or `off`
- `scale`: percentage, e.g. `100`
- `glow`: percentage, e.g. `72`
- `deadzone`: percentage, e.g. `12`

## Notes

- Best results usually come from Chromium-based environments.
- If OBS Browser Source does not expose controller state reliably on your machine, open the page in Chrome/Edge and window-capture it in OBS.

## Files

- `index.html` — app shell
- `styles.css` — layout and skin system
- `app.js` — controller input logic and rendering

