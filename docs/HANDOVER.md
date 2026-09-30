# Gujarati Community IITG Website Handover

This repository is designed to be passed between student teams without exposing private community data.

## Routine updates

1. Add public event and gallery records through MongoDB after confirming image ownership and consent.
2. Keep public member profiles limited to name, programme, role, category and city.
3. Add only approved coordinator details to the contact page.
4. Use `npm run build` before each pull request or release.
5. Write one focused commit per change, for example `feat: add Garba Raas 2026 album`.

## Private configuration

Copy `.env.example` to `.env.local`. Never commit this file. The next team needs access to the community-owned MongoDB project and email provider account, not a personal account.

## Content ownership

Use photographs from the community archive only with consent from the people who supplied them. Record the year, event, photographer or source, and approval status before public publishing.

## Admin work to add next

The current public API intentionally has no writing route for member records. Before giving more people editing access, add IITG authentication and an admin dashboard with role-based permissions.
