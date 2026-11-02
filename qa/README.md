# QA artifacts

Read REPORT.md first. These files document the 1 November 2026 audit; they do not fix application code.

## Safety and reproducibility

Never point these scripts at production. The core suite refuses an API URL outside `http://localhost:4100/`. Use an empty disposable database and no external notification configuration. The server source and database used for this run are under `/tmp/travel-buddy-qa/server`, independent of the repository server's database and the Docker volumes.

The original isolated server was prepared by copying `server/src` and `server/package.json` into the temporary server directory and symlinking the installed server node_modules. It was run from that directory with PORT=4100, CLIENT_ORIGIN=http://localhost:3200,http://localhost:5273, a QA-only JWT secret, ADMIN_EMAIL=admin@qa.invalid, ADMIN_PASSWORD=QaOnlyPassword123, SITE_URL=http://localhost:3200 and PUBLIC_API_URL=http://localhost:4100. Credentials are synthetic fixtures, not deployment credentials. Do not copy any real .env file or notification secrets into that environment.

Start the Next.js app on 3200 with NEXT_PUBLIC_API_URL and INTERNAL_API_URL pointing to http://localhost:4100/api and NEXT_PUBLIC_SITE_URL=http://localhost:3200. Start Vite on 5273 with VITE_API_URL=http://localhost:4100/api. Disable auto-opening via configuration rather than `--open false`, which Vite treats as a path.

Run from the repository root:

```sh
node qa/api-audit.mjs
# Perform browser author/admin fixture steps documented in browser-results.json.
node qa/extended-audit.mjs
node qa/legacy-audit.mjs
node qa/page-audit.mjs
```

The extended suite depends on the first suite and browser-created fixture IDs. The page suite reads the production `.next/prerender-manifest.json`, so build `web/` first. These are stateful audit scripts; running again against the same database is not a clean rerun. A production CI suite should create its own independent fixtures and clean isolated database for each run.

No network notification delivery was tested. HTTP page success alone does not establish hydration or interaction success. See the report's explicit coverage and limitations.
