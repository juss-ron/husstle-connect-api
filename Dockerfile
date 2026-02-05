# Use specific version for consistency
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy dependancy files only (to leverage caching)
COPY package*.json ./

# Install Dependancies
RUN npm install

# Copy source code
COPY . .

# Use a non root user (for security)
USER node

# Run the app
CMD ["node", "app.js"]