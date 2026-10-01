# Deployment

The whole system deploys as one Docker service. This guide covers Railway,
which is what the repo is configured for, and running the same image locally.

## Deploy to Railway

1. Push the repo to GitHub.
2. In Railway, create a new project and choose **Deploy from GitHub repo**,
   then select this repo.
3. Railway reads [railway.json](../railway.json): it builds with the
   Dockerfile and health-checks `/api/products` for up to 60 seconds. The
   service restarts on failure, up to 5 times.
4. Open **Settings > Networking** and click **Generate Domain** to get a public
   URL.
5. Open the URL. The storefront should load, and `<url>/api/products` should
   return the catalogue.

No environment variables are needed. Railway provides `PORT`, and the
database is created and seeded on the first request.

Later pushes to the connected branch redeploy automatically.

## Run the image locally

```bash
docker build -t acme-widget .
docker run --rm -p 8080:8080 acme-widget
```

Then open <http://localhost:8080>. To keep the database between runs, add
`-v acme-var:/app/var`.

For day-to-day development use `scripts/dev.sh` instead (see the
[README](../README.md#getting-started)).

## Changing prices, offers or delivery

The catalogue and charge rules are seeded from `apps/api/src/Databases/Seed.php`
on every request, matched by code. To change them, edit the seed and redeploy.
Rules or products added to the database by other means and not in the seed are
left alone.
