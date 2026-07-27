FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json packages/shared/
COPY packages/backend/package*.json packages/backend/

RUN npm install

COPY packages/shared packages/shared
COPY packages/backend packages/backend

RUN npm run build --workspace=@asta-rental/shared
RUN npm run build --workspace=backend

EXPOSE 4000

CMD ["npm", "run", "start", "--workspace=backend"]
