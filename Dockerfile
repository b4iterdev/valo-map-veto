FROM node:22-alpine3.19 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --configuration=production


FROM nginx:1.27.2-alpine AS static

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/valo-map-veto/browser /usr/share/nginx/html

FROM node:22-alpine3.19 AS server

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/server ./src/server

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:server"]