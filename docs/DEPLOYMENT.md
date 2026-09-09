# Hetzner deployment

Production is https://myescapetour.com (also www), behind Nginx and PM2 on
188.245.121.230. Docker Compose is a historical alternative, not the live service.
SSH uses `~/.ssh/hetzner_escape_tour_new` and the `root` account.

## Release layout

- Git checkout and PM2 configuration: `/var/www/escape-tour/app`
- Immutable, built releases: `/var/www/escape-tour/releases/<git-commit>`
- PM2 app: `escape-tour`; `ecosystem.config.cjs` in the checkout identifies its active `cwd`.
- Environment source: `app/apps/web/.env.local`, copied privately into each release before building.
- Previous PM2 configurations: `/var/www/escape-tour/backups/`.

Build a detached Git worktree under `releases` using the intended commit. Run
`pnpm install --frozen-lockfile` and `pnpm exec turbo build --filter=@escape-tour/web`
there. Use the actual server environment: public environment variables are embedded
at build time. Never deploy the local preview build (it uses dummy payment/mail keys).

Only after a successful build, back up `ecosystem.config.cjs`, update the app's `cwd`
to `<release>/apps/web`, and run `pm2 reload ecosystem.config.cjs --update-env`.
Check the public homepage, booking selection, static assets and process health;
then run `pm2 save`. Keep the previous release and configuration available.

Rollback: restore the previous `ecosystem.config.cjs` and run
`pm2 reload ecosystem.config.cjs --update-env && pm2 save` from the checkout.
No database migration is part of the maritime redesign.

## Payment configuration observed on 2026-09-09

`STRIPE_WEBHOOK_SECRET` was absent from the server environment. Stripe checkout
credentials and the mail API key were present. The redesign preserves the existing
checkout endpoint and its price/discount calculation; it does not establish that
post-payment fulfillment is working. Configure and verify the webhook separately
before relying on completed payments. No real payment was made during design QA.
