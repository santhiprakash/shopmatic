# Security Policy

## Supported versions

Shopmatic is under active development. Security fixes are accepted on the `main` branch only; there is no separate LTS branch at this stage.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Email **santhi@santhiprakash.com** with:

- A short description of the issue
- Steps to reproduce (or a proof-of-concept)
- Impact assessment if known

You should receive an acknowledgement within a few business days (IST).

## Scope notes

- Do not commit API keys, `.env` files, or customer/product data to the repository.
- The AI-powered Quick Add feature calls the OpenAI API server-side — report any client-side key exposure immediately.
- Auth is custom JWT-based; report token handling, session, or authorization issues with priority.
- Dependency vulnerabilities flagged by GitHub Dependabot are tracked and patched on a best-effort basis — see the repo's Security tab for current status.
