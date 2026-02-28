# Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# The default port, but can be overridden by environment variable
EXPOSE 8000

CMD ["npm", "start"]
