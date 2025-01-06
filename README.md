# OUTLOOK-ENGINE

# Outlook Sync App

Outlook Sync App is a powerful and efficient tool designed to seamlessly synchronize your Outlook data across multiple devices and platforms. This application ensures that your emails are always up-to-date, regardless of where you access them.

## Table of Contents

- [Installation](#installation)
- [Implementation](#Implementation)
- [Usage](#Usage)

## Installation


```bash
# Clone the repository
git clone https://github.com/devaaa008/outlook-engine.git

# Navigate to the project directory
cd outlook-engine

# Install dependencies
npm install
```

## Implementation
Add Auth0 credentials in .env\
Create and add certificate for elasticsearch configuration inside ./certs/http_ca.crt
```bash
# Run local app
npm run dev

# Run using docker
docker build -t outlook-engine:latest .
docker run --env-file ./.env  outlook-engine
```

## Usage
- Register your outlook email using auth0 2.0 using the below link localhost url: http://localhost:3000/auth/register
- Upon registering all the emails will be synced to elasticsearch database
