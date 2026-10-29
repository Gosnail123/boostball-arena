# Boostball Arena

A browser-based 3D car-soccer prototype made with HTML, CSS, JavaScript, and Three.js. Designed to publish on GitHub Pages.

## Play

1. Create a public GitHub repository named `boostball-arena` (or any name you like).
2. Upload `index.html`, `style.css`, and `game.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait for the Pages deployment to finish. Your URL will be `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

This project loads Three.js from jsDelivr, so the player needs an internet connection. GitHub Pages is static hosting and cannot host authoritative real-time multiplayer by itself.

## Controls

- **W / S** or **↑ / ↓** — accelerate / reverse
- **A / D** or **← / →** — steer
- **Space** — jump
- **Left / Right Shift** — boost
- **Q / E** — air roll
- **Esc** — pause
- Touch controls appear on small screens.

## Current prototype features

- Three.js 3D arena, field markings, lighting, goals, ball, car models
- Keyboard and touch controls
- Boost meter, jump, air steering, basic ball collision and bounce physics
- AI opponent, scoreboard, five-minute match clock, kickoff reset
- Responsive HUD and pause/restart controls

## Online multiplayer

The included version is a **single-player demo against a local AI bot**, not online multiplayer. GitHub Pages cannot run a WebSocket server. To add real online matches, deploy a separate server (for example, a Node.js WebSocket server on a host that supports persistent processes) and connect the browser client to it. That server should authoritatively simulate players, ball physics, goals, and match state. Do not put private API keys or server secrets in the GitHub repository.

## Notes

- This is an original, Rocket League-inspired prototype, not an official Rocket League product.
- For production-quality physics, replace the simplified custom physics with a physics engine such as Rapier, add network interpolation/prediction, and optimize models/textures.
