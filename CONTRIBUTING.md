# Contributing

Thanks for your interest in improving PixelLink Studio. Contributions are welcome, especially fixes that improve security, reliability, accessibility, and setup documentation.

## Before you start

- For bugs and feature ideas, open a GitHub issue with steps to reproduce or a clear use case.
- For security vulnerabilities, do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).
- For larger changes, open an issue first to discuss the approach and avoid duplicated work.

## Development setup

Requirements: Node.js 18 or newer.

```bash
git clone https://github.com/azuracasual-bit/pixellink-studio.git
cd pixellink-studio
npm install
npm start
```

The app listens on port `3000` by default; set `PORT` to use another port. Link data is written to `links-db.json` in the project directory. Avoid committing this runtime data.

## Pull requests

- Keep changes focused and explain the user-facing impact.
- Include clear reproduction or verification steps in the pull request description.
- Update documentation when behavior or setup instructions change.
- Do not include real pixel IDs, credentials, personal data, or production link data.
- Be explicit about known limitations; the project does not yet include automated tests.

## Code of conduct

Be respectful and constructive in issues, reviews, and discussions. Harassment or abusive behavior is not acceptable.
