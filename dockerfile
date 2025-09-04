FROM node:20

# Install system dependencies required by TensorFlow.js
RUN apt-get update && \
    apt-get install -y \
    python3 \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# This allows caching of dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install
 
# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD [ "npm", "start" ]