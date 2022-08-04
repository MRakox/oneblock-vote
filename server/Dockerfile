FROM node:latest

# Create app directory
WORKDIR /usr/src/app
# Bundle app source
COPY . /usr/src/app

# Install dependencies with pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

CMD ["node", "index.js"]
