# ⚡ PixelLink Studio

**Self-hosted link shortener and QR-code studio for marketers, agencies, and e-commerce teams.**

Create short links, generate QR codes, and add Meta Pixel, TikTok Pixel, or Google Tag Manager IDs to a redirect page. PixelLink Studio is a lightweight Node.js application that stores links in a local JSON file.

[![Deploy to Hostinger](https://img.shields.io/badge/Deploy_to_Hostinger-673DE6?style=for-the-badge&logo=hostinger&logoColor=white)](https://www.hostinger.com/eg?REFERRALCODE=8GUAZURACTML)

---

## 🖥️ Studio Interface

<img width="1919" height="1074" alt="PixelLink Studio interface" src="https://github.com/user-attachments/assets/70226db4-4f01-40e3-80b9-1f44b15791e9" />

---

## ✨ Features

- **Short links:** Create random or custom aliases for destination URLs.
- **Retargeting pixels:** Add Meta Pixel, TikTok Pixel, and Google Tag Manager IDs to redirect pages.
- **QR codes:** Generate and download PNG QR codes for your short links.
- **Basic click counts:** See the total clicks recorded for each link.
- **Lightweight storage:** Stores link data in `links-db.json`; no external database is required.

## ⚠️ Before deploying publicly

This version does **not** include admin authentication or access control. Its link-management API is available to visitors who can reach the app, so do not expose it to the public internet with real campaigns or sensitive links until authentication and authorization have been added. The JSON file is also intended for small, single-instance deployments; make sure its data is persisted and backed up when using Docker.

---

## 🚀 Run with Docker

```bash
git clone https://github.com/azuracasual-bit/pixellink-studio.git
cd pixellink-studio
docker build -t pixellink-studio .
docker run --rm -p 3000:3000 pixellink-studio
```

Open [http://localhost:3000](http://localhost:3000).

> Link data is written to `links-db.json` inside the container. The command above does not persist that file after the container is removed. Configure persistent storage and backups before relying on Docker deployments.

## 🟢 Run with Node.js

Requires Node.js 18 or newer.

```bash
git clone https://github.com/azuracasual-bit/pixellink-studio.git
cd pixellink-studio
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000). Set the `PORT` environment variable to use a port other than `3000`.

## 🗺️ Roadmap

Planned ideas for a future version include:

- Admin authentication and access control
- Custom domains
- Expanded analytics, including country, device, and browser breakdowns
- UTM campaign builder
- Password-protected and expiring links
- SQLite or PostgreSQL storage
- Rate limiting
- Team workspaces and campaign management
- More QR-code customization
