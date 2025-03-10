# Invoica - Professional Invoicing Platform

A modern, full-stack invoicing application built with React, NestJS, and PostgreSQL.

## Project Structure

This is a monorepo using Turborepo with the following packages:

- `apps/frontend`: React application built with Vite
- `apps/server`: NestJS backend service

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/invoica.git
cd invoica
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the frontend and backend servers in development mode.

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run lint` - Run linting for all packages
- `npm run type-check` - Run type checking for all packages
- `npm run clean` - Clean build outputs
- `npm run format` - Format code using Prettier

## Development

The project uses Turborepo for task running and workspace management. Key features:

- Parallel execution of tasks
- Caching of task outputs
- Remote caching support
- Workspace dependencies management

## Building for Production

1. Build all packages:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start:prod -w apps/server
```

## Features

- User authentication and authorization
- Customer management
- Invoice creation and management
- PDF invoice generation
- Payment processing integration with Clover
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
- Clover API integration for payments

## Database Management

### Using pgAdmin

1. Access pgAdmin at http://localhost:5050
2. Login with:
   - Email: admin@admin.com
   - Password: admin
3. Right-click on "Servers" and select "Create" -> "Server"
4. Give it a name (e.g., "Local")
5. In the "Connection" tab, enter:
   - Host: postgres
   - Port: 5432
   - Database: invoica
   - Username: postgres
   - Password: postgres

## Useful Commands

### Docker Commands
```bash
# Start services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
docker-compose logs pgadmin
```

### Development Commands
```bash
# Run frontend development server
npm run dev:frontend

# Run backend development server
npm run dev:server

# Run database migrations
npm run migrate

# Generate Prisma client
npm run generate
```

## Troubleshooting

### Docker Setup Issues
1. Make sure all required ports (8080, 3000, 5432, 5050) are available
2. Check service logs using `docker-compose logs`
3. Ensure Docker has enough resources allocated
4. Try rebuilding from scratch:
```bash
docker-compose down -v
docker-compose up --build
```

### Development Setup Issues
1. Ensure Node.js version is 18+ or 20+
2. Check if PostgreSQL is running and accessible
3. Verify environment variables are set correctly
4. Clear node_modules and reinstall dependencies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# backend/.env

# Twilio Credentials
TWILIO_ACCOUNT_SID=AC********************************  # Your Account SID from Twilio Console
TWILIO_AUTH_TOKEN=********************************    # Your Auth Token from Twilio Console

# SendGrid Credentials
SENDGRID_API_KEY=SG.***************************      # Your SendGrid API Key
SENDGRID_FROM_EMAIL=your-verified@email.com         # Your verified sender email

# Application URLs
FRONTEND_URL=http://localhost:3000                   # Your frontend URL

## Clover Integration

The application includes integration with Clover for processing credit card payments. To set up the Clover integration:

1. Create a Clover Developer account at https://developer.clover.com
2. Create a new application in the Clover Developer Dashboard
3. Configure the following environment variables:
   - `CLOVER_CLIENT_ID`: Your Clover application's client ID
   - `CLOVER_CLIENT_SECRET`: Your Clover application's client secret
   - `CLOVER_REDIRECT_URI`: The callback URL for OAuth (default: http://localhost:8080/api/clover/callback)
   - `CLOVER_API_URL`: The Clover API URL (use sandbox URL for testing)

4. In the Clover Developer Dashboard:
   - Add the redirect URI to your application's allowed redirects
   - Enable the required OAuth scopes (e.g., `com.clover.pos:read`, `com.clover.pos:write`)
   - Set up webhook endpoints for payment status updates

5. The integration will be available in the Profile page under "Payment Integration"

### Testing the Integration

1. Use the Clover sandbox environment for testing
2. Create a test merchant account in the Clover sandbox
3. Use test card numbers provided by Clover for payment testing
4. Monitor the application logs for any integration issues
