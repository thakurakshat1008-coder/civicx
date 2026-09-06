# CivicX

CivicX is a simple civic reporting website for the NCR region. It helps people report problems like broken roads, garbage, street lights, water leaks, and other local issues.

Live website: https://civicx-public-akshat-thakur.vercel.app/

A person can create an account, add details about a problem, attach a photo, select a location, and follow the report later. Other people can support the same report. Reports are shown on a Google Map and their status can be updated over time.

The project is made to keep civic information clear and honest. It does not add fake complaints, fake users, or fake statistics. The map only shows real reports saved in the database.

## Main parts

- Report a local issue
- Add a photo and location
- View NCR reports on Google Maps
- Support reports from other people
- Track report progress
- Create a personal account
- View simple community analytics

## Run it locally

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm check
pnpm test
pnpm build
```

## Built with

React, TypeScript, Tailwind CSS, Node.js, Express, tRPC, Drizzle ORM, and MySQL/TiDB.

CivicX is a civic technology project and is not an official government website.
