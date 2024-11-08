# Use the official Node.js image as base
FROM node:18.18.2

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from current directory to /app directory in the container
COPY . .

# Expose port 3000 (assuming your app will run on this port)
EXPOSE 5001

# Command to run the application
CMD [ "node", "app.js" ]