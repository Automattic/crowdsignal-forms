# Release Process

## Version Bump

Update the version in ALL THREE places:

1. **`package.json`** — `"version": "X.Y.Z"`
2. **`crowdsignal-forms.php`** — header comment: `Version: X.Y.Z`
3. **`crowdsignal-forms.php`** — constant: `define( 'CROWDSIGNAL_FORMS_VERSION', 'X.Y.Z' )`

Also update `includes/admin/class-crowdsignal-forms-setup.php` if the admin CSS version is hardcoded (check the `admin_enqueue_scripts` method).

## Build and Package

```bash
# Full verification first
make verify

# Generate translation file
make pot

# Build and package for release
make release
```

This runs:
1. `make clean-release` — removes old build + release dirs
2. `make client` — rebuilds all JS + CSS
3. `make pot` — generates `.pot` translation file via `scripts/makepot.sh`
4. `scripts/package-for-release.sh` — creates the release ZIP

The output ZIP is in the `release/` directory.

## GitHub Nightly Build

The repo has a manual GitHub Actions workflow (`.github/workflows/nightly-build.yml`) that:
1. Accepts `buildBranch` and `releaseName` inputs
2. Sets up PHP 8.1, Node 18.13.0, pnpm 9
3. Runs `make client`
4. Packages with `scripts/package-for-release.sh`
5. Creates a GitHub pre-release with the ZIP

Trigger it from GitHub Actions -> "Nightly Build" -> "Run workflow".

## Checklist

- [ ] Version bumped in all 3 places
- [ ] `make verify` passes (build + tests + lint)
- [ ] `make pot` generated fresh translation file
- [ ] `make release` produces clean ZIP
- [ ] Changelog updated (if applicable)
