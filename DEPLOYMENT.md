# Deployment Notes

## Required environment variables

Backend:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- `NODE_ENV=production`

Cloudinary's common variable names are also supported:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

You can also use Cloudinary's single URL format:

- `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

Use the `CLOUD_*` set, the `CLOUDINARY_*` set, or `CLOUDINARY_URL`. In production, uploads are blocked unless Cloudinary is configured so files are not saved to temporary server storage.

Frontend:

- `VITE_API_BASE_URL`
- `VITE_API_TIMEOUT_MS`

If the frontend is served by the same Express server, `VITE_API_BASE_URL` can be left empty so the app uses the same origin in production.

## Recommended deployment commands

Install:

```bash
npm install
```

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

## Smoke test after deploy

1. Open `/api/health` and confirm it returns `status: ok`.
2. Login with one account from each role you plan to use.
3. Open the files page and test `View` and `Download`.
4. Upload one file and confirm it appears in the correct list.
5. Confirm one protected API returns `401` when called without a token.
