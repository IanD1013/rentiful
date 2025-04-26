# Rentiful

Rentiful is an enterprise-level rental property management platform that connects property managers with potential tenants. The application features a modern UI built with shadcn/ui components, responsive design, and a robust backend API powered by Express.js and PostgreSQL.

## Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/18e8d9c7-5478-432a-9e13-aa682b718603" alt="Landing Page" width="60%">
  <br><br>
  <img src="https://github.com/user-attachments/assets/11c9731a-a8e0-447e-9820-5349d346fcba" alt="Search Page" width="100%">
</div>

## Features

### For Tenants
- **Property Search**: Browse and search for rental properties with advanced filtering
- **Property Favorites**: Save favorite properties for later review
- **Rental Applications**: Submit and track rental applications
- **Residence Management**: View and manage current residences
- **User Settings**: Manage personal information and preferences

### For Property Managers
- **Property Management**: Create, update, and delete property listings
- **Application Review**: Review and manage tenant applications
- **Property Analytics**: Track property performance and occupancy rates
- **User Settings**: Manage account information and preferences

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Maps**: Property location visualization using Mapbox
- **File Uploads**: Support for property images using AWS S3
- **Database Integration**: PostgreSQL database with Prisma ORM and PostGIS for geospatial queries
- **Authentication**: Secure login and registration using AWS Cognito

## Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **State Management**: Redux Toolkit
- **Maps**: Mapbox GL
- **File Upload**: FilePond
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: AWS Amplify with Cognito

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM and PostGIS
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Getting Started

### Prerequisites
- Node.js (latest version)
- npm or yarn
- PostgreSQL database with PostGIS extension
- AWS account (for S3 storage and Cognito)
- Mapbox API key

### Installation

1. **Clone the repository**
   ```
   git clone [your-github-link]
   cd rentiful
   ```

2. **Install dependencies**
   ```
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**
   - Create `.env` files in both client and server directories
   - Add necessary environment variables (see `.env.example` files)

4. **Set up the database**
   ```
   cd server
   npm run prisma:generate
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Start the development servers**
   ```
   # Start the client (in the client directory)
   npm run dev

   # Start the server (in the server directory)
   npm run dev
   ```

## Project Structure

### Frontend
- **app/**: Next.js app router structure
  - **(auth)/**: Authentication-related components and logic
  - **(dashboard)/**: Dashboard views for tenants and managers
  - **(nondashboard)/**: Public-facing pages like landing and search
- **components/**: Reusable UI components
  - **ui/**: shadcn/ui components
- **lib/**: Utility functions and constants
- **state/**: Redux store and slices
- **types/**: TypeScript type definitions
- **hooks/**: Custom React hooks

### Backend
- **src/**: Server source code
  - **controllers/**: Request handlers
  - **middleware/**: Express middleware
  - **routes/**: API route definitions
- **prisma/**: Database schema and migrations
  - **seedData/**: Data for seeding the database
  - **seed.ts**: Script to populate the database with initial data

## Deployment

The application can be deployed to AWS EC2. See [EC2 Setup Instructions](server/aws-ec2-instructions.md) for detailed deployment steps.
