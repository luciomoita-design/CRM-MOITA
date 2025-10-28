FROM node:18-bullseye

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install --legacy-peer-deps || true

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
