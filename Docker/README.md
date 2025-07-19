````
#  Angular Multi-App Deployment (Admin, Provider, Patient) via Nginx

This project deploys **three Angular Single Page Applications (SPAs)** — `admin`, `provider`, and `patient` — as static sites served by **Nginx** in a single Docker container.

---

##  Project Overview

- **Admin App** – Served at `/`
- **Provider App** – Served at `/provider/`
- **Patient App** – Served at `/patient/`

Each app is built using Angular CLI with a corresponding base href and deployed as a static app under Nginx.

---

## Build & Serve Process

### Stage 1: Build Angular Apps

In the first Docker stage, all three apps are built with their appropriate `--base-href`:

```bash
npm run build -- --project=admin --configuration=production --base-href /
npm run build -- --project=provider --configuration=production --base-href /provider/
npm run build -- --project=patient --configuration=production --base-href /patient/
````

### Stage 2: Serve via Nginx

- `admin` → copied to `/usr/share/nginx/html/`
- `provider` → copied to `/usr/share/nginx/html/provider/`
- `patient` → copied to `/usr/share/nginx/html/patient/`

Each app is mapped to its route via a custom Nginx configuration.

---

## Nginx Configuration (default.conf)

```nginx
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  # Admin app served at /
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Provider app served at /provider/
  location /provider/ {
    alias /usr/share/nginx/html/provider/;
    index index.html;
    try_files $uri $uri/ /provider/index.html;
  }

  # Patient app served at /patient/
  location /patient/ {
    alias /usr/share/nginx/html/patient/;
    index index.html;
    try_files $uri $uri/ /patient/index.html;
  }

  error_page 404 /index.html;
}
```

This ensures Angular's client-side routing works correctly for all apps.

---

## How to Build & Run Locally

### Build Docker Image

```bash
docker build -t hih-frontend-apps:latest .
```

### Run Docker Container

```bash
docker run -p 6000:80 hih-frontend-apps:latest
```

### Access the Apps

- Admin → [http://localhost:6000/](http://localhost:6000/)
- Provider → [http://localhost:6000/provider/](http://localhost:6000/provider/)
- Patient → [http://localhost:6000/patient/](http://localhost:6000/patient/)

---

## Deployment Notes

- This setup does **not use Angular Universal** or SSR – it serves purely static builds.
- Minimal runtime overhead – ideal for production use with CDN or load balancer in front.
- Static files are served by Nginx for maximum performance and simplicity.

---

## For DevOps

- All 3 apps are packaged in **one container**.
- Ensure the Angular build uses correct base paths.
- Works out-of-the-box with ECS Fargate, EKS, EC2, or any container orchestration platform.
- No PM2, Node.js runtime, or SSR server needed.

---

## Contacts

```

```
