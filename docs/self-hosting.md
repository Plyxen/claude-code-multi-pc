# Self-host the hub

`coop hub` runs the same hub on your own PC, with Node's built-in SQLite for storage:

```bash
coop hub --lead-name yourname --crew my-crew
```

| Option | Default |
| --- | --- |
| `--port` | `8765` (or `$PORT`) |
| `--host` | `127.0.0.1`: only this PC can connect |
| `--data` | `~/.claude-coop/hub` (the database, the lead token and the lead name) |
| `--lead-name` | `lead`, remembered after the first run |
| `--crew` | `claude-coop` |

The first run creates a lead token, saves it in the data folder and prints it once. You can also set `COOP_LEAD_TOKEN` yourself. `COOP_MAX_WORKERS` (default 8) limits the crew size.

The hub only runs while that terminal is open, so your friends can only get new tasks while your PC is on. For an always-on hub, use [Cloudflare](deploy-cloudflare.md).

## Letting friends reach it

By default the hub only listens on your own PC. Pick one way to open it up:

### Tailscale (private, recommended)

Everyone installs [Tailscale](https://tailscale.com) and joins your tailnet (or you share the machine with them). Then:

```bash
coop hub --host 0.0.0.0
```

Friends use `http://<your-tailscale-name>:8765` as the hub URL. Tailscale encrypts the traffic, so plain http is fine here.

### Cloudflare Tunnel (public https URL)

```bash
cloudflared tunnel --url http://localhost:8765
```

This prints a `https://….trycloudflare.com` URL to use as the hub. A quick tunnel gets a new URL every time it starts, and everyone would have to `coop join` again, so for anything lasting set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) or deploy the Worker.

### Port forwarding

Not recommended. Tokens would cross the internet unencrypted unless you put an https reverse proxy in front.
