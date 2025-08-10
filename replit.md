# Domain OS

## Overview

Domain OS is a full-stack unified domain management platform built with React and Express.js that enables users to manage their domain portfolios across multiple registrars. The application provides a centralized dashboard for tracking domain statuses, expiration dates, nameserver configurations, and registrar connections. Users can connect to various domain registrars (GoDaddy, Namecheap, Dynadot) through API integrations and perform bulk operations on their domain collections. The platform is specifically designed for managing high-volume cold email domains with essential features like domain information display, nameserver management, and expiration tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 using TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with TypeScript, using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Component Structure**: Organized with reusable UI components in `/components/ui/` and feature-specific components for dashboard, domain tables, and modals

### Backend Architecture
The server uses Express.js with TypeScript in a RESTful API design:

- **Framework**: Express.js with TypeScript support
- **Architecture Pattern**: RESTful API with modular route organization
- **Request Handling**: JSON middleware with comprehensive error handling and request logging
- **Development Setup**: Hot reload with tsx, separate development and production builds

### Data Storage Solutions
The application uses PostgreSQL with Drizzle ORM:

- **Database**: PostgreSQL configured through environment variables
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Design**: Three main entities - users, registrar connections, and domains
- **Migration Strategy**: Drizzle Kit for database migrations with schema in `/shared/schema.ts`
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
Currently implements a mock authentication system:

- **Development Auth**: Mock user ID system for development purposes
- **Session Management**: Prepared for session-based authentication with connect-pg-simple
- **User Model**: Basic user schema with username/password fields ready for implementation

### External Service Integrations
The application integrates with domain registrar APIs:

- **Registrar Support**: GoDaddy, Namecheap, and Dynadot APIs
- **API Abstraction**: Unified RegistrarAPI interface for consistent integration patterns
- **Connection Management**: Secure API key storage with connection testing capabilities
- **Sync Operations**: Automated domain synchronization from registrar APIs
- **Error Handling**: Comprehensive error handling for external API failures

#### Dynadot API Integration (v1.0.0)
- **RESTful API**: Implemented using Dynadot's v1 RESTful API with Bearer token authentication
- **Search Functionality**: Domain availability search with pricing information
- **Bulk Search**: Multiple domain availability checking in single requests
- **Rate Limiting**: Supports different thread counts based on account level (1-25 threads)
- **Demo Mode**: Graceful fallback to demo responses when using demo credentials

#### GoDaddy API Integration (v1/v2)
- **REST API**: Uses GoDaddy's comprehensive Domains API with SSO-Key authentication
- **Domain Management**: Full domain lifecycle operations including registration, renewal, and transfer
- **DNS Management**: Complete DNS record and nameserver management capabilities
- **Search Features**: Single and bulk domain availability checking with pricing
- **Environment Support**: Both OTE (testing) and Production environments
- **v2 Enhancements**: Customer-specific operations and advanced features

#### Namecheap API Integration (XML-based)
- **XML API**: Implements Namecheap's XML-based API with proper authentication
- **Domain Operations**: Domain listing, information retrieval, and availability checking
- **DNS Management**: Full nameserver and DNS record management
- **Proper Parsing**: Robust XML response parsing with error handling
- **Authentication**: UserName, ApiKey, and ClientIp-based authentication system

## External Dependencies

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS

### UI and Component Libraries
- **Component System**: Radix UI primitives with shadcn/ui
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Development and Build Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Full TypeScript support across frontend and backend
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Code Quality**: ESM modules, strict TypeScript configuration

### External APIs and Services
- **Domain Registrars**: GoDaddy API, Namecheap API, Dynadot API
- **Database Hosting**: Neon Database (serverless PostgreSQL)
- **Development Platform**: Replit with specialized plugins for development environment