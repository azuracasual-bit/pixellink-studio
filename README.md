# PixelLink Studio

**Self-hosted short links, QR codes, and marketing-pixel redirect pages.**

PixelLink Studio is a lightweight Node.js application for creating campaign links, generating QR codes, and adding Meta Pixel, TikTok Pixel, or Google Tag Manager IDs to redirect pages. Link records are stored in a local JSON file.

> **Status: early-stage project.** This release is intended for local evaluation and development. It does not include authentication or access control, and its management API is publicly reachable wherever the app is exposed. Do not deploy it to the public internet or use it for sensitive or production campaigns until the security limitations are addressed.

## Features

- Create short links with generated or custom aliases.
- Attach Meta Pixel, TikTok Pixel, and Google Tag Manager IDs to redirect pages.
- Generate and download QR codes for short links.
- View aggregate click counts per link.
- Run as a small Node.js application without an external database.

## Preview

<img width="1919" height="1074" alt="PixelLink Studio dashboard" src="https://github.com/user-attachments/assets/70226db4-4f01-40e3-80b9-1f44b15791e9" />

## Requirements

- Node.js 18 or newer, or Docker.
- A writable persistent data directory for `links-db.json` when retaining data between restarts.

## Quick start

### Node.js

```bash
git clone https://github.com/azuracasual-bit/pixellink-studio.git
cd pixellink-studio
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Set `PORT` to choose another listening port.

### Docker

```bash
git clone https://github.com/azuracasual-bit/pixellink-studio.git
cd pixellink-studio
docker build -t pixellink-studio .
mkdir -p data
docker run --rm -p 3000:3000 -v "$(pwd)/data:/app/data" -e DATA_DIR=/app/data pixellink-studio
```

> **Persistence note:** The current application writes `links-db.json` beside `server.js`; it does not read `DATA_DIR`. The Docker command above therefore does not persist the database yet. Persisting data requires an application change or a deployment-specific mount of the file at `/app/links-db.json`. Back up link data before upgrading or redeploying.

## Security and privacy

This version has no admin login, user roles, or access control. Anyone who can reach the app can list, create, and delete links. User-provided content is also rendered into HTML, so the current implementation needs input/output hardening before public exposure. The app does not provide privacy notices, consent management, or controls for third-party pixel behavior; operators are responsible for complying with applicable laws and platform policies.

See [SECURITY.md](SECURITY.md) for the project's security reporting guidance. Please do not include sensitive data in public issue reports.

## Data and limitations

- Data is stored in `links-db.json` as a local JSON file; there is no database migration or multi-instance coordination.
- Click counts are aggregate totals only. The app does not currently provide per-visitor analytics or campaign attribution.
- Redirect pages load third-party tracking scripts when pixel IDs are configured. Browser settings and network conditions can affect tracking.
- There is no automated test suite or production deployment guarantee in this release.

## Contributing

Bug reports, documentation improvements, and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. For security concerns, use the private reporting guidance in [SECURITY.md](SECURITY.md).

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
