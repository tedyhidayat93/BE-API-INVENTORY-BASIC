# Inventory Management System Backend

A robust inventory management system built with Node.js, Express, TypeScript, and Drizzle ORM.

## Prerequisites

- **Runtime**: Node.js (>= 18)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Auth**: JWT (JSON Web Token)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values according to your local setup
   ```bash
   cp .env.example .env
   ```

4. **Database Configuration**
   - Create a new PostgreSQL database
   - Update the database connection string in `.env`:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
     ```

## Database Migrations with Drizzle

### 1. Generate Migrations

After making changes to your schema:

```bash
npx drizzle-kit generate:pg
```

This will generate migration files in the `drizzle` directory based on your schema changes.

### 2. Run Migrations

To apply all pending migrations:

```bash
npm run db:generate
npm run db:migrate
# or
yarn db:generate
yarn db:migrate
```

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Production Build**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## PRD
Content :
- Flowchart
- ERD
- Schema Model
`https://docs.google.com/document/d/1iSiy8gN7ZpvbApnP2HTCnf9pYTCL6UaZ9A9YU_99GLw/edit?usp=sharing`

## API Documentation

After starting the server, you can access:
- API Documentation: `https://api.postman.com/collections/39637502-9666220b-6eb7-4cf2-912a-dae0b1ba8457?access_key=PMAT-01KCJ3BMVHQNCX2356P2VG7RN9`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation

## Project Structure

```
src/
├── db/
│   ├── schema/       # Database schema definitions
│   └── index.ts      # Database connection
├── modules/          # Feature modules
│   ├── auth/         # Authentication login register
│   └── product/    # Product List
│   └── warehouse/    # Warehouse List
│   └── inventory/    # Inventory management
├── middlewares/      # Express middlewares
├── interfaces/       # TypeScript interfaces
└── utils/            # Utility functions
```