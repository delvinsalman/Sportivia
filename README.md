# Sportivia

Sports trivia (soccer, NBA, MLB) with solo modes and live 1v1 duels.

## Local development

```bash
npm install
npm run dev:all   # Vite + duel WebSocket server
```

Open `http://localhost:5173`. Duels connect through the Vite proxy to `/duel`.

## Production (live site + working duels)

**GitHub Pages cannot host the duel server** (static files only, no WebSockets).  
Deploy the whole app (website + duel server) to Render or Railway instead.

### One-click Render deploy

1. Open: https://render.com/deploy?repo=https://github.com/delvinsalman/Sportivia  
2. Sign in with GitHub → Create  
3. Wait for build → open the public URL  

Anyone with that link can create a lobby and share a code. Duels work globally.

### Or from this machine

```bash
npm run build
npm start   # serves dist/ + WebSocket on /duel
```

## Repo

https://github.com/delvinsalman/Sportivia
