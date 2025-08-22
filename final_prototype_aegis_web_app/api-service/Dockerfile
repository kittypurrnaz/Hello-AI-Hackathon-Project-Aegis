# FROM node:20-slim
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --only=production
# COPY . .
# EXPOSE 8080
# CMD [ "npm", "start" ]


# Stage 1: Install dependencies
FROM node:18-slim AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Stage 2: Build the production image
FROM node:18-slim AS runner
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the app using the start script from package.json
CMD [ "npm", "start" ]