# Stage 1: Build the app
FROM node:18.18.2-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files, then install dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Stage 2: Run the app
FROM node:18.18.2-alpine AS production

# Set working directory inside the container
WORKDIR /app

# Copy only necessary files from the build stage (i.e., node_modules and source code)
COPY --from=build /app /app

# Expose the production port
EXPOSE 5001

# Command to run the application
CMD [ "node", "app.js" ]