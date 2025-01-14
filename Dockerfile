FROM node:22-alpine3.19 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --configuration=production

FROM nginx:1.27.2-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/valo-map-veto/browser /usr/share/nginx/html
