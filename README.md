# Invoica - Professional Invoicing Platform

A modern, full-stack invoicing application built with React, NestJS, and PostgreSQL.

## Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── ...           # Frontend configuration files
├── server/            # NestJS backend application
│   ├── src/          # Source files
│   ├── prisma/       # Database schema and migrations
│   └── ...          # Backend configuration files
├── docker/           # Docker configuration files
├── supabase/         # Supabase migrations and configuration
└── ...              # Root configuration files
```

## Prerequisites

- Node.js 18+ or 20+
- Docker and Docker Compose
- PostgreSQL (via Docker)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/invoica.git
cd invoica
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm install -w frontend

# Install backend dependencies
npm install -w server
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and server directories
   - Update the environment variables as needed

4. Start the PostgreSQL database:
```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# The following services will be available:
# - PostgreSQL: localhost:5432
# - pgAdmin: http://localhost:5050
```

5. Run database migrations:
```bash
cd server
npx prisma migrate deploy
npx prisma generate
cd ..
```

6. Start the development servers:
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend only
npm run dev:server    # Backend only
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- API Documentation: http://localhost:3000/api

## Features

- User authentication and authorization
- Customer management
- Invoice creation and management
- PDF invoice generation
- Payment processing integration
- Profile and company settings
- Multi-currency support
- Email notifications

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Query for data fetching
- React Hook Form for forms
- Zod for validation
- Radix UI for components

### Backend
- NestJS with TypeScript
- Prisma as ORM
- PostgreSQL for database
- JWT for authentication
- Swagger for API documentation
- Class Validator for validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
