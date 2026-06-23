# Docker Development Environment

## Prerequisites

- Docker Desktop installed and running
- Node 18.13.0 (`nvm use`)
- pnpm 9+ (`npm install -g pnpm` if needed)
- Composer (`brew install composer` on macOS)

## First-Time Setup

Run the all-in-one setup command:

```bash
make setup
```

This runs: `make install` -> `make docker_env` -> `make docker_build` -> `make docker_up` -> `make docker_install` -> `make client`

If you prefer to run steps individually:

```bash
# 1. Install dependencies
make install

# 2. Create Docker env file
make docker_env

# 3. Build and start containers
make docker_build
make docker_up

# 4. Install WordPress
make docker_install

# 5. Build the plugin
make client
```

## Accessing the Environment

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress | http://localhost:8000 | wordpress / wordpress |
| WordPress Admin | http://localhost:8000/wp-admin | wordpress / wordpress |
| PHPMyAdmin | http://localhost:5050 | root / somewordpress |

## Crowdsignal API Credentials

The plugin requires a Crowdsignal API key for full functionality (creating polls, fetching results). Without it, blocks load in the editor but can't communicate with the API.

To configure:

1. Get an API key from https://app.crowdsignal.com/account/api
2. Edit `docker/.env` and set:
   ```
   CROWDSIGNAL_FORMS_API_PARTNER_GUID='your-partner-guid'
   CROWDSIGNAL_FORMS_API_USER_CODE='your-user-code'
   ```
3. Restart containers: `make docker_down && make docker_up`

Alternatively, configure via the WordPress admin: go to http://localhost:8000/wp-admin/admin.php?page=crowdsignal-forms-setup and follow the setup wizard.

## Connecting to Crowdsignal Sandbox

To point the Docker WordPress at a Crowdsignal sandbox instead of production:

```bash
# In docker/.env, set:
CS_SANDBOX_IP='<sandbox-ip-address>'
```

This overrides DNS for `api.crowdsignal.com`, `app.crowdsignal.com`, and `api.polldaddy.com` via Docker's `extra_hosts`.

## Xdebug

Xdebug is pre-configured in the Docker image. To use it:

1. Set your IDE's Xdebug server name to `Test` (matches `PHP_IDE_CONFIG=serverName=Test` in env)
2. Configure path mappings:
   - `/var/www/html/wp-content/plugins/crowdsignal-forms` -> project root
3. Start listening for Xdebug connections in your IDE

## Container Management

```bash
make docker_up       # Start containers (detached)
make docker_stop     # Stop containers (preserve data)
make docker_down     # Stop and remove containers (preserve volumes)
make docker_sh       # Shell into WordPress container
make docker_sh_db    # Shell into MySQL container
```

## Troubleshooting

### Containers won't start
- Check Docker Desktop is running: `docker info`
- Check port conflicts: `lsof -i :8000` and `lsof -i :5050`
- Recreate env: `rm docker/.env && make docker_env`

### Plugin not appearing in WordPress
- Check volume mount: `make docker_sh` then `ls /var/www/html/wp-content/plugins/crowdsignal-forms/`
- Activate manually: `make docker_sh` then `wp --allow-root plugin activate crowdsignal-forms`

### Database connection issues
- Check MySQL is running: `docker-compose -f docker/docker-compose.yml ps`
- Wait for MySQL startup (can take 30s on first run)
- Check logs: `docker-compose -f docker/docker-compose.yml logs db`

### Test database not set up
- PHPUnit tests need the WordPress test framework. It's auto-mounted at `/tmp/wordpress-develop`.
- If tests fail with "WordPress not found", try: `make docker_down && make docker_build && make docker_up`

### Full reset
```bash
make docker_down
rm -rf docker/data docker/wordpress docker/.env
make docker_env && make docker_build && make docker_up && make docker_install
```
