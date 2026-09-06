<p align="center">
  <img src="docs/civicx-logo.svg" alt="CivicX logo" width="110" />
</p>

# CivicX

CivicX is a website where people can report problems in their local area. For example, people can report broken roads, street lights, garbage, water problems, or other public issues.

The main idea is simple:

> See a problem. Report it. Help your community.

## What CivicX can do

- People can create an account.
- People can report a real local problem.
- A report can include a title, description, category, severity, location, and photo.
- People can see reports on a map.
- Other people can support a report.
- Reports can show their current status.
- Users can see their own reports and activity.
- The website has an analytics page.
- The website uses empty states instead of making fake numbers.

## Important rule

CivicX does not add fake complaints, fake users, fake map points, or fake statistics. The database starts empty. Information appears only when a real user creates it.

## Screenshots

### Home page

![CivicX home page](docs/screenshots/landing.png)

### Report form

![CivicX report form](docs/screenshots/report-form.png)

### Map page

![CivicX map page](docs/screenshots/map.png)

### Analytics page

![CivicX analytics page](docs/screenshots/analytics.png)

## Technology used

- React and TypeScript for the website
- Tailwind CSS for the design
- Node.js and Express for the server
- tRPC for communication between the website and server
- MySQL or TiDB for the database
- Drizzle ORM for database queries
- OAuth for sign-in
- Google Maps for location features

## Run the project

Install the packages:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Check the code:

```bash
pnpm check
```

Run the tests:

```bash
pnpm test
```

## Project folders

```text
client/   Website code
server/   Backend code
shared/   Shared types and constants
drizzle/  Database schema and migrations
docs/     Logo and screenshots
```

## Note

CivicX is a civic technology project. It is not an official government website unless an official organisation decides to use it.

## License

The license will be added later.
