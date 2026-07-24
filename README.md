<p align="center">
  <img src="docs/readme/aboutinterface.png" alt="Sportivia — sports trivia built for speed" width="920" />
</p>

<h1 align="center">Sportivia</h1>

<p align="center">
  <strong>Sports trivia built for speed.</strong><br />
  Match stars to categories on a live 3×3 board across soccer, basketball, baseball, football, and hockey.
</p>

<p align="center">
  <a href="https://sportivia.up.railway.app/"><strong>Play live → sportivia.up.railway.app</strong></a>
</p>

<p align="center">
  <a href="#play">Play</a> ·
  <a href="#gameplay">Gameplay</a> ·
  <a href="#modes">Modes</a> ·
  <a href="#systems">Systems</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#local-development">Dev</a> ·
  <a href="#credits">Credits</a>
</p>

<p align="center">
  <a href="https://sportivia.up.railway.app/"><img alt="Live" src="https://img.shields.io/badge/live-sportivia.up.railway.app-23a559?style=for-the-badge" /></a>
  <img alt="Sports" src="https://img.shields.io/badge/sports-5-23a559?style=for-the-badge" />
  <img alt="Athletes" src="https://img.shields.io/badge/athletes-1000%2B-f0b232?style=for-the-badge" />
  <img alt="Faces" src="https://img.shields.io/badge/portraits-600%2B-38bdf8?style=for-the-badge" />
  <img alt="Stack" src="https://img.shields.io/badge/React_19%20%7C%20Three.js%20%7C%20WS-0a0a0b?style=for-the-badge" />
</p>

---

## The hub

Your home stage — sport-reactive backgrounds, equipped skin + pet, daily spin, cards, store, career, and a gold **Play** CTA.

<p align="center">
  <img src="docs/readme/home.png" alt="Sportivia home hub" width="920" />
</p>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/readme/basketballhomepage.png" alt="Basketball home" /><br />
      <sub>Basketball</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/readme/baseballhomepage.png" alt="Baseball home" /><br />
      <sub>Baseball</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/readme/footballhomepage.png" alt="Football home" /><br />
      <sub>Football</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/readme/hockeyhomepage.png" alt="Hockey home" /><br />
      <sub>Hockey</sub>
    </td>
  </tr>
</table>

---

## Gameplay

Tap fast. Place the current star into the right category cell. Boards reset after clean cycles. Clock’s ticking.

<p align="center">
  <video src="docs/readme/gameplay.mp4" controls playsinline width="920" poster="docs/readme/gamemodes.png">
    <a href="docs/readme/gameplay.mp4">Watch gameplay</a>
  </video>
</p>

<p align="center">
  <sub>Live board run · <a href="docs/readme/gameplay.mp4">MP4</a> · <a href="docs/readme/gameplay.mov">MOV</a></sub>
</p>

### How a round works

1. A player (or legend) appears with portrait + identity.
2. The **3×3 category grid** shows intersections — clubs, nations, trophies, eras, leagues, and more.
3. You place them before the round timer dies. Correct fills the cell; wrong burns streak and time.
4. Fill the board, ride streaks, beat the clock — or the opponent.

Same rules in every sport. Only the rosters and category language change.

---

<a id="modes"></a>

## Game modes

<p align="center">
  <img src="docs/readme/gamemodes.png" alt="Game modes" width="720" />
</p>

| Mode | Feel | Payoff |
| --- | --- | --- |
| **Daily Challenge** | Shared board · first finish energy | Daily payday + streak |
| **Training** | 1:00 practice sprint | No rewards — pure reps |
| **Ranked** | Competitive solo clock | Ranked bonus + XP |
| **VS AI** | Race Beginner / Pro / Expert bots | Optional coin stakes |
| **1v1 Duel** | Live lobby · optional stakes | Winner takes the pot |

### Live duels

Create or join a lobby code, set an optional stake, ready up, then slam into a **matchup preview** with full portrait cards and PvP records before the board drops.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/readme/duelmenu.png" alt="Duel lobby" /><br />
      <sub>Lobby · codes · stakes · ready</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/readme/duelmenupreview.png" alt="Duel matchup" /><br />
      <sub>Matchup · cards · tap to continue</sub>
    </td>
  </tr>
</table>

Realtime sync runs over **WebSockets** (`ws`) — shared board state, scores, finish flags, and stake settlement.

---

<a id="systems"></a>

## Systems

### Store · skins

Unlock once. Customize forever. Browse 3D skins on pedestals, equip your look, jump into kit customize.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/readme/store.png" alt="Skins store" /><br />
      <sub>Store · skins carousel</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/readme/storecustom.png" alt="Customize kit" /><br />
      <sub>Customize kit entry</sub>
    </td>
  </tr>
</table>

### Pets

Sidekicks for the hub stage — sharks, snakes, dogs, and more. Equip from the store Pets tab.

<p align="center">
  <img src="docs/readme/pets.png" alt="Pets store" width="820" />
</p>

### Skin cards

FIFA-style cards with PAC / SHO / PAS / DRI / DEF / PHY, rarity tiers, search + filters, queued upgrades, and free-upgrade credits from **Daily Spin**.

<p align="center">
  <img src="docs/readme/cardmenu.png" alt="Skin cards collection" width="920" />
</p>

### Career · settings · economy

Track per-sport records, streaks, and XP. Tune audio, motion, and tips. Spend coins on skins, pets, upgrades, and high-risk bot stakes. Spin once every 24h for coins or free upgrades.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/readme/career.png" alt="Career" /><br />
      <sub>Career · per-sport record</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/readme/settings.png" alt="Settings" /><br />
      <sub>Settings · audio & display</sub>
    </td>
  </tr>
</table>

---

## What’s inside

A dense sports knowledge + presentation layer, not a thin trivia wrapper.

| Layer | Scale (approx.) |
| --- | ---: |
| Sports | **5** — soccer · basketball · baseball · football · hockey |
| Athletes in data | **1,000+** rostered players |
| Local portraits | **600+** faces under `public/faces/` |
| 3D skins | **20** characters / variants |
| Pets | **13** companions |
| GLB / FBX models | **45+** files under `public/models/` |
| Card art | **20** card renders |
| Categories | **250+** category definitions & intersections |
| React screens / components | **30+** UI modules |
| Domain libs | **20+** modules (`src/lib`) |
| Game hooks | **6** (board, duel, audio, profile flows…) |
| Duel server | **~850** lines realtime lobby/match protocol |
| TypeScript app source | **~20k** lines across `src/` |
| Tooling scripts | **14** data / face / build utilities |

### Athlete data by sport

| Sport | Roster size (incl. extras) |
| --- | ---: |
| Soccer | ~390 |
| Basketball | ~196 |
| Baseball | ~144 |
| Football | ~95 |
| Hockey | ~195 |

Rosters carry clubs, leagues, nations, trophies, decades, and sport-specific fields so category boards stay fair and deep.

---

<a id="architecture"></a>

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│  React 19 + Vite 8 + Tailwind 4                          │
│  Home · Modes · Board · Store · Cards · Career · Settings│
│  Framer Motion UI · Lucide icons                         │
├────────────────────────────┬─────────────────────────────┤
│  @react-three/fiber        │  Profile (localStorage)     │
│  drei · Three.js           │  coins · XP · unlocks       │
│  skins · pets · pedestals  │  card levels · PvP W-L-T    │
├────────────────────────────┴─────────────────────────────┤
│  Game engine (hooks)                                     │
│  board gen · timers · scoring · bot AI · stakes          │
├──────────────────────────────────────────────────────────┤
│  Duel WebSocket server (Node + ws + tsx)                 │
│  lobbies · ready · shared board · results · stakes       │
└──────────────────────────────────────────────────────────┘
```

### Tech stack

| Area | Choices |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide |
| 3D | Three.js, React Three Fiber, Drei |
| Build | Vite 8, `tsc -b`, oxlint |
| Realtime | Node.js, `ws`, concurrent Vite + duel process |
| Persistence | Client profile storage (coins, unlocks, stats, spin cooldown) |
| Assets | Local faces, GLB/FBX models, card PNGs, SFX, sport chrome |

### Notable product systems

- **Sport theme engine** — backgrounds, accents, balls, and hub chrome swap with the selected sport.
- **Board generation** — category intersections validated against athlete metadata.
- **Portrait pipeline** — localized faces + override scripts (`scripts/localizeSoccerFaces.mts`, etc.).
- **Economy** — coins, bot stakes, duel pots, card upgrades, daily spin weights.
- **Cosmetic loop** — store skins/pets, kit customize, hub showcase, unlock fanfare.
- **Cards** — overall ratings, rarity, free-upgrade bank, Icon/99 presentation.
- **Duels** — lobby codes, host/ready, stake presets, matchup cards, live score HUD.

---

<a id="play"></a>

## Play / deploy

**Live:** [https://sportivia.up.railway.app/](https://sportivia.up.railway.app/)

**GitHub Pages cannot host the duel server** (static only — no WebSockets). The production build runs on Railway with the static client and duel WebSocket together. You can also ship the full app to Render or similar.

### One-click Render

[Deploy on Render](https://render.com/deploy?repo=https://github.com/delvinsalman/Sportivia)

### From this machine

```bash
npm install
npm run build
npm start          # serves dist/ + WebSocket on /duel
```

---

## Local development

```bash
npm install
npm run dev:all    # Vite + duel WebSocket server
```

Open `http://localhost:5173`. Duels proxy through Vite to `/duel`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Frontend only |
| `npm run duel` | WebSocket server only |
| `npm run dev:all` | Both |
| `npm run build` | Production client build |
| `npm run build:itch` | Relative-base itch.io build |
| `npm run audit:data` | Roster / category audits |
| `npm run lint` | oxlint |

**Node:** `>= 22.12.0`

---

## Repo map

```text
src/
  components/     screens + HUD (home, board, store, cards, duel…)
  hooks/          game board, duel client, audio, profile helpers
  lib/            themes, bots, stakes, faces, cards, spin, storage
  data/           athletes + categories per sport
  types/          profile, characters, pets, game types
server/           duel WebSocket lobbies + match protocol
public/
  faces/          localized athlete portraits
  models/         GLB / FBX skins & pets
  cards/          card art
  icons/          modes, spin, chrome
docs/readme/      README screenshots + gameplay capture
scripts/          face localize, audits, transforms
```

---

## Gallery

<p align="center">
  <img src="docs/readme/aboutinterface.png" alt="About" width="48%" />
  <img src="docs/readme/home.png" alt="Home" width="48%" />
</p>
<p align="center">
  <img src="docs/readme/gamemodes.png" alt="Modes" width="48%" />
  <img src="docs/readme/cardmenu.png" alt="Cards" width="48%" />
</p>
<p align="center">
  <img src="docs/readme/duelmenu.png" alt="Duel" width="48%" />
  <img src="docs/readme/duelmenupreview.png" alt="Matchup" width="48%" />
</p>

---

<a id="credits"></a>

## Credits

I’ve put a lot of work into Sportivia myself — the idea, the systems, the polish, and the long haul of building it out. [Cursor](https://cursor.com) helped as a support tool along the way, especially on a project this data-heavy: rosters, faces, wiring, refactors, and the kind of repo grunt work that keeps everything crisp. Using AI that way let me move faster without handing over the creative or product direction.

---

<p align="center">
  <strong>Sportivia</strong> — five sports · one board · built for speed.<br />
  <a href="https://sportivia.up.railway.app/">Play live</a>
  ·
  <a href="https://github.com/delvinsalman/Sportivia">GitHub</a>
</p>
