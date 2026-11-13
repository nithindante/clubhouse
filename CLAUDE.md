# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ClubHouse: an early-stage Express 5 + EJS + PostgreSQL app (The Odin Project "members only" style: users post messages, membership status gates visibility). Not a git repository yet. `controllers/` is currently empty. `views/index.ejs` is a styled landing page (styles in `public/css/style.css`); its Sign up / Log in buttons link to `/sign-up` and `/login`, and below them it lists the `messages` passed by `loadData` (title, text, timestamp; anonymous) as `.message-card` cards, with an empty-state line when there are none. `GET /sign-up` renders `views/sign-up.ejs` (and `POST /sign-up` creates the user); `GET /login` renders `views/login.ejs` (UI only: the form posts to `/login`, but there is no `POST` handler or passport authentication wired up yet). The login view reuses the `.signup-*` card classes from `style.css`. Both `login.ejs` and `sign-up.ejs` render an `errors` array (strings on login, `{path, msg}` objects on sign-up) in a `.error-card` alert box inside the form card, only when errors exist; it's styled with the `--error` colour token (`#e5484d`). `views/login-success.ejs` is a UI-only "Welcome in" page (also reusing `.signup-*` plus `.success-*` classes); no route renders it yet, and its "Log out" button is a `POST /logout` form button. `views/dashboard.ejs` (served by `routes/dashboardRouter.js` at `GET /dashboard`, which redirects to `/login` unless `req.isAuthenticated()`) reuses the home page's `.door`/`.placard`/`.notice` layout with a top `.navbar` (Dashboard, My message, Create a message, Become a member, Log out; styles in the "Navbar" section of `style.css`); it greets `user.full_name` and lists all messages (via `db.loadMessages()`) in the same `.message-card` layout as the home page; members (`checkMember`) see the real title and timestamp, non-members see them masked with `*****`. The author is never shown. Admins also see a Delete button per card (a `POST /delete-message/:id` form with class `.message-actions`, button `.btn .btn-danger .btn-sm`: outlined in `--error`, fills on hover). Log out is a `<form method="POST" action="/logout"><button class="btn btn-secondary">` (handled by `routes/logOutRouter.js`, mounted at `/logout`, which destroys the session and redirects to `/`); the same form button is used on the dashboard, my-messages, create-message, new-member and login-success views. `views/create-message.ejs` is a UI-only form (navbar + `.signup-card`, `title` input and `text` textarea, posts to `/create-message`, renders optional `errors` strings); no route or handler exists yet.

## Commands

- Install: `npm install`
- Run: `node app.js` (no `start`/`dev` script defined; `npm test` is a placeholder that exits 1; no linter or test framework configured)
- Create tables: `node db/populated.js` (connects via `DATABASE_URL` from `env/.env` with SSL; must run from the repo root because dotenv paths are relative: `./env/.env`)

## Architecture

- `app.js` loads `./env/.env` via dotenv, sets EJS as the view engine (`views/`), serves static files from `public/` (currently holds `css/style.css`), parses urlencoded bodies, and mounts `routes/homeRouter.js` at `/`, plus the sign-up, login and dashboard routers at `/sign-up`, `/login`, `/dashboard`. `PORT` defaults to 4000.
- `routes/homeRouter.js`: currently a stub whose `GET /` redirects to `/` (infinite redirect loop); replace with real handlers in `controllers/`.
- `db/pool.js`: exports a `pg` Pool, using `DATABASE_URL` (SSL) if set, else hardcoded local Postgres settings (`clubhouse` db on localhost:5432).
- `db/populated.js`: schema script with `user` and `messages` tables (users 1→N messages via `messages.user_id`; also a circular `user.message_id` FK).

## Known issues to be aware of

- `dotenv` is required in `app.js` and `db/populated.js` but is not listed in `package.json` dependencies (only works if installed transitively).
- The SQL in `db/populated.js` is invalid as written: `user` is a reserved word in Postgres (needs quoting or renaming), `hash VARCHAR (255)` is missing a trailing comma, FK columns lack a type (`message_id REFERENCES ...`), and `user` references `messages` before it's created.
- `env/dev.env` is a JS-style module-exports object, not dotenv format; only `env/.env` (`DATABASE_URL`, `PORT`) is actually loaded.
- Local DB credentials are hardcoded in `db/pool.js` and `env/dev.env`; `.gitignore` is empty, so `env/` and `node_modules/` would be committed if git is initialized.
- The startup log message says "Pokedex loading up!" (copy-paste leftover).

## New member flow

`GET /new-member` (`routes/newMemberRouter.js`, view `views/new-member.ejs`) shows a secret-code form to logged-in non-members (redirects to `/login` if unauthenticated, `/dashboard` if already a member). `POST /new-member` compares `secret_code` to `process.env.MEMBER_SECRET` (set in `env/.env`; if unset every attempt is rejected) using a constant-time hash comparison, then runs `UPDATE users SET member_status = 'member'` directly via `db/pool.js` in the router (no controller/queries function yet) and redirects to `/dashboard`.

## Admin page

`GET /admin` (`routes/adminRouter.js`, mounted in `app.js`, view `views/admin.ejs`) renders a secret-code form (copy of the new-member layout, with navbar) for logged-in users and redirects to `/login` otherwise. The form posts to `/admin`, but there is no `POST` handler yet, so submitting it does nothing useful (no admin promotion, no env secret). An "Admin" link was added to the navbar of the dashboard, my-messages, create-message and new-member views.
