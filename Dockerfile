# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application using npx to ensure proper PATH
RUN npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

# Start the application
CMD ["npm", "start"]