# GitHub Packages

ServEase uses the internal GitHub Packages npm package `@implementsprint/sdk` for APICenter integration contracts. The package is owned by the `ImplementSprint` organization and is published as an internal npm package.

## Current Package

| Field | Value |
| --- | --- |
| Package | `@implementsprint/sdk` |
| GitHub package | `ImplementSprint/packages/npm/sdk` |
| Registry | `https://npm.pkg.github.com` |
| Visibility | Internal |
| Latest verified version | `1.2.0` |
| Used by | `backend/package.json` |

Verified versions on 2026-05-19:

- `1.2.0`
- `1.1.2`
- `1.1.0`
- `1.0.3`

SDK 1.2.0 keeps the existing shared-service helpers used by ServEase and adds optional `APICENTER_SERVICE_ID` / `sourceServiceId` support for backend service attribution.

## Required GitHub Access

The active GitHub account must have access to the `ImplementSprint` organization/package and a token with `read:packages`.

Check the active account and scopes:

```sh
gh auth status
```

Refresh the GitHub CLI token if `read:packages` is missing:

```sh
gh auth refresh -h github.com -s read:packages
```

## npm Configuration

`backend/.npmrc` points the `@implementsprint` scope at GitHub Packages and reads the token from `GITHUB_TOKEN`:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

For local installs:

```sh
export GITHUB_TOKEN="$(gh auth token)"
cd backend
npm install
```

Do not commit a real token into `.npmrc`, `.env`, shell history snippets, or documentation.

## GitHub Actions

Backend CI jobs install `@implementsprint/sdk` with the repository secret
`GH_PACKAGES_TOKEN`. The token must have `read:packages` and access to the
`ImplementSprint` organization/package. The default repository `GITHUB_TOKEN`
is not enough when the package is owned outside this repository.

Set the secret in GitHub:

```sh
gh secret set GH_PACKAGES_TOKEN --body "<token-with-read:packages>"
```

## Troubleshooting

`403 You need at least read:packages scope` means the GitHub token does not include `read:packages`.

`401 Unauthorized - authentication token not provided` means npm did not receive `GITHUB_TOKEN` or the shell running `npm install` does not have it exported.

`404 Not Found` can mean the package name or scope is wrong, or the account does not have access to the organization package.
