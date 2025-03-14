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
└── ...              # Root configuration files
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

## Getting Started

There are two ways to run the application: using Docker (recommended) or manual setup.

### 🐳 Docker Setup (Recommended)

#### Prerequisites
- Docker
- Docker Compose

#### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/invoica.git
cd invoica
```

2. Create a `.env` file in the root directory:
```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=invoica

# JWT Configuration
JWT_SECRET=local_development_secret

# Frontend Configuration
VITE_API_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:8080

# Clover Integration Configuration
CLOVER_CLIENT_ID=your_clover_client_id
CLOVER_CLIENT_SECRET=your_clover_client_secret
CLOVER_REDIRECT_URI=http://localhost:8080/clover/callback
CLOVER_API_URL=https://sandbox.dev.clover.com

# Email Configuration
EMAIL_PROVIDER=mailgun # Options: sendgrid, mailgun

# SendGrid Configuration (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=Invoica <noreply@yourdomain.com>

# Mailgun Configuration (if using Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=Invoica <noreply@mg.yourdomain.com>

# SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

3. Start all services:
```bash
docker-compose up --build
```

#### Available Services

1. **Frontend**: http://localhost:8080
   - React application served by Nginx

2. **Backend API**: http://localhost:3000
   - NestJS API server
   - API Documentation: http://localhost:3000/api

3. **PostgreSQL**: localhost:5432
   - Username: postgres
   - Password: postgres
   - Database: invoica

4. **pgAdmin**: http://localhost:5050
   - Email: admin@admin.com
   - Password: admin

### Manual Setup

#### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database

#### Steps

1. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm install -w frontend

# Install backend dependencies
npm install -w server
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and server directories
   - Update the environment variables as needed

3. Run database migrations:
```bash
cd server
npx prisma migrate deploy
npx prisma generate
cd ..
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend only
npm run dev:server    # Backend only
```

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

## Email Provider Configuration

The application supports two email providers: SendGrid and Mailgun. You can choose which provider to use by setting the `EMAIL_PROVIDER` environment variable.

### SendGrid Setup
1. Create a SendGrid account at https://sendgrid.com
2. Create an API key with email sending permissions
3. Verify your sender email address or domain
4. Update your .env file with:
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your_api_key
   SENDGRID_FROM_EMAIL=Invoica <noreply@yourdomain.com>
   ```

### Mailgun Setup
1. Create a Mailgun account at https://mailgun.com
2. Get your API key and domain from the dashboard
3. Verify your domain with Mailgun
4. Update your .env file with:
   ```env
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=your_api_key
   MAILGUN_DOMAIN=mg.yourdomain.com
   MAILGUN_FROM_EMAIL=Invoica <noreply@mg.yourdomain.com>
   ```
