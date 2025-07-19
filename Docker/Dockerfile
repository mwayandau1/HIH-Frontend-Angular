# Stage 1: Build Angular and Storybook
FROM node:22.16-alpine AS web-build
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build all Angular apps 
RUN npm run build

# (Optional) Build Storybook
RUN npm run build-storybook --outputPath=storybook-static || echo "No Storybook available"

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine3.21-slim

# Clean default nginx directory
RUN rm -rf /usr/share/nginx/html/*

# Copy each app build
COPY --from=web-build /usr/src/app/dist/health-interoperability-hub/browser/ /usr/share/nginx/html/

# Copy Storybook (optional)
COPY --from=web-build /usr/src/app/storybook-static/ /usr/share/nginx/html/storybook/

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
