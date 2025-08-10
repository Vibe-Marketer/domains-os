# Domains OS

A unified domain management platform that aggregates multiple domain registrar APIs, providing comprehensive domain search, monitoring, and management capabilities across GoDaddy, Namecheap, and Dynadot.

![Domains OS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

- **Multi-Registrar Support**: GoDaddy, Namecheap, and Dynadot API integration
- **Real-time Domain Search**: Check domain availability across all registrars
- **Unified Dashboard**: Manage all your domains from a single interface
- **Nameserver Management**: Update DNS settings across registrars
- **Expiration Tracking**: Monitor domain expiration dates
- **Bulk Operations**: Manage multiple domains efficiently
- **Secure API Management**: Encrypted credential storage

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Railway (static IP), Docker support
- **APIs**: RESTful API with comprehensive error handling

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/domains-os.git
cd domains-os
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
DATABASE_URL=your_postgres_database_url
GODADDY_API_KEY=your_godaddy_api_key
GODADDY_API_SECRET=your_godaddy_api_secret
NAMECHEAP_API_KEY=your_namecheap_api_key
NAMECHEAP_USERNAME=your_namecheap_username
DYNADOT_API_TOKEN=your_dynadot_api_token
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Development
```bash
npm run dev
```

## 📦 Deployment

### Railway (Recommended)
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy automatically

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Docker
```bash
docker build -t domains-os .
docker run -p 5000:5000 domains-os
```

## 🔧 API Registrar Setup

### GoDaddy
- No IP whitelisting required
- Get API keys from GoDaddy Developer Portal

### Namecheap
- Requires IP whitelisting
- Profile → Tools → Namecheap API Access

### Dynadot
- Requires IP whitelisting
- Account → API Settings → IP Whitelist

## 🛡️ Security

- Environment variable protection
- Secure API credential storage
- Input validation with Zod
- SQL injection prevention with Drizzle ORM

## 📊 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL, Drizzle ORM
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [Issues](https://github.com/YOUR_USERNAME/domains-os/issues) page
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Contact: your-email@domain.com