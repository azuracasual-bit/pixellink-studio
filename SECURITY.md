# Security Policy

## Supported versions

PixelLink Studio is an early-stage project. Security fixes are generally made against the latest version on the default branch; there is no formal version support schedule.

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues or discussions. Use GitHub's **Report a vulnerability** option on the repository's Security tab to contact the maintainers privately. Include the affected version or commit, impact, and steps to reproduce. Avoid sharing real credentials, pixel IDs, or personal data.

Please allow maintainers reasonable time to investigate and prepare a fix before publicly disclosing a vulnerability. This project is maintained on a best-effort basis, so a response time cannot be guaranteed.

## Important deployment warning

The current application has no authentication or access control for link-management endpoints and renders user-provided values into HTML. It is not safe to expose publicly as an administrative service. Do not use it for sensitive or production campaigns until these issues have been addressed and independently reviewed.
