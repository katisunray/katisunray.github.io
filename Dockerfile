FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 8080

# Default to the concurrent dev server
CMD ["npm", "run", "dev"]
