# E-Summit Stock Exchange Platform

A full-stack stock trading simulation platform built for E-Summit 2025.

## 🚀 Features

- Real-time stock trading simulation
- Portfolio management
- Leaderboard system
- Market news feed
- Admin panel for stock & user management
- JWT authentication

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Chakra UI
- Axios
- Context API for state management

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Vercel Cron Jobs for stock updates

## 📁 Project Structure

```bash
.
├── client                  # Frontend application
│   ├── public              # Publicly accessible files
│   └── src                 # Source files for the React app
│       ├── components      # Reusable React components
│       ├── context         # React Context for state management
│       ├── hooks           # Custom React hooks
│       ├── pages           # Page components for routing
│       ├── styles          # Global styles and theme
│       └── utils           # Utility functions
│
├── server                  # Backend application
│   ├── src                 # Source files for the Node.js app
│   │   ├── config          # Configuration files
│   │   ├── controllers     # Request handlers
│   │   ├── middleware      # Custom middleware
│   │   ├── models          # Database models
│   │   ├── routes          # API routes
│   │   ├── services        # Business logic
│   │   └── utils           # Utility functions
│   │
│   ├── .env                # Environment variables
│   ├── package.json         # NPM dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration
│
├── prisma                  # Prisma database schema and migrations
│   ├── schema.prisma       # Prisma schema file
│   └── migrations          # Database migrations
│
├── .gitignore              # Ignored files and directories in Git
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # Project documentation
```

## Setup

1. Clone repository
2. Copy `.env.example` to `.env` and fill values
3. Run `npm run install:all`
4. Run `npm run prisma:migrate`
5. Start dev: `npm run dev:backend` and `npm run dev:frontend`

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Admin Credentials

Username: admin
Password: (set in .env)

## How Manual Updates Work

Admins change stock prices in the database via the Admin Panel. These updates are reflected instantly when users refresh or navigate. No external APIs—all market activity is simulated through manual price changes.