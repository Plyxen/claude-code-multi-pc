# Deploy the hub to Cloudflare

A Cloudflare Worker with a D1 database gives your crew an always-on hub at a fixed `https://` address. The free plan is plenty: a crew of five, all running all day, makes about 40,000 requests a day, well under the free 100,000.

You need a Cloudflare account and a clone of this repository:

```bash
git clone https://github.com/Plyxen/claude-coop
cd claude-coop
npm install
```

## 1. Sign in and create the database

```bash
npx wrangler@4 login
npx wrangler@4 d1 create claude-coop
```

The second command prints a `database_id`.

## 2. Configure

```bash
cp wrangler.example.toml wrangler.toml
```

In `wrangler.toml`, paste the `database_id` and set your names:

```toml
[vars]
COOP_LEAD_NAME = "yourname"     # your crew name as the lead
COOP_HUB_NAME = "my-crew"       # the crew's name, shown on the board
```

`wrangler.toml` is in `.gitignore`, so your IDs stay out of the repository.

## 3. Set the lead token

```bash
coop token                                   # prints a new random token; copy it
npx wrangler@4 secret put COOP_LEAD_TOKEN    # paste it when asked
```

Keep the token somewhere safe, like a password manager: it's the key to your crew.

## 4. Deploy and join

```bash
npx wrangler@4 deploy
```

Wrangler prints the URL, such as `https://claude-coop-hub.<your-subdomain>.workers.dev`. The database tables are created on the first request.

```bash
coop join --hub https://claude-coop-hub.<your-subdomain>.workers.dev --token <the lead token>
coop invite <friend>
```

## Updating

`git pull`, then `npx wrangler@4 deploy` again. Your data stays in D1.

## Changing the lead token

Run `npx wrangler@4 secret put COOP_LEAD_TOKEN` with a new token, then `coop join` again with it. Workers' tokens don't change.
