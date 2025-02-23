# Invoica

A professional invoicing platform designed to help businesses create, manage, and track invoices efficiently.

## Features

- Create and manage professional invoices
- Track customers and their information
- Customize invoice templates with your branding
- Support for multiple payment methods
- Secure data storage and backup
- Comprehensive customer support

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
   - Copy `.env.exmaple` to `.env`
   - Update the following variables in `.env`:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key 
     ```
4. Start the development server:
```bash
npm run dev
```

### Docker Deployment

You can also run Invoica using Docker:

1. Build the Docker image:
```bash
docker build -t invoica \
  --build-arg VITE_SUPABASE_URL=your_supabase_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -f docker/Dockerfile .
```

2. Run the container:
```bash
docker run -p 8080:80 invoica
```

The application will be available at `http://localhost:8080`

#### Docker Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Why Nginx?

We chose Nginx as our web server for several reasons:

1. **Performance**: 
   - Highly efficient at serving static content
   - Excellent caching capabilities
   - Low memory footprint
   - Event-driven architecture for handling concurrent connections

2. **Security**:
   - Built-in security features
   - Easy configuration of security headers
   - Protection against common web vulnerabilities
   - Rate limiting capabilities

3. **Features**:
   - Gzip compression for faster content delivery
   - Client-side routing support for SPA
   - Efficient SSL/TLS termination
   - Load balancing capabilities for scaling

4. **Production-Ready**:
   - Industry standard for serving web applications
   - Proven reliability at scale
   - Extensive documentation and community support
   - Small container size when using alpine-based images

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- shadcn/ui
- Docker
- Nginx

## License

All rights reserved. © Invoica
