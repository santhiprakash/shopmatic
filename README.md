
# eComJunction - Product Showcase Platform

A powerful SAAS platform for influencers and affiliate marketers to showcase and organize their product recommendations with AI-powered Quick Add functionality.

![eComJunction Platform](https://via.placeholder.com/800x400/0066CC/FFFFFF?text=eComJunction+Platform)

## 🚀 Features

- **AI-Powered Quick Add**: Automatically extract product information from any e-commerce URL using OpenAI
- **Product Showcase**: Beautiful grid and list views with advanced filtering
- **Smart Organization**: Categories, tags, and intelligent product management
- **Theme Customization**: Light/dark modes with custom color schemes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Affiliate Compliance**: Built-in FTC disclosure compliance
- **Real-time Search**: Instant product search and filtering
- **Export/Import**: Bulk operations for efficient product management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: React Context, TanStack Query
- **Routing**: React Router v6
- **Database**: Neon DB (Serverless PostgreSQL)
- **Authentication**: Custom JWT-based authentication
- **AI Integration**: OpenAI GPT-4o-mini
- **Icons**: Lucide React
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+ and npm
- Neon DB account and database (for production)
- OpenAI API key (for Quick Add functionality)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecomjunction-platform.git
cd ecomjunction-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Add your configuration:

```env
# Neon Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
DATABASE_POOLED_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true

# JWT Secret (generate with: openssl rand -base64 32)
VITE_JWT_SECRET=your-secret-key-here

# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

See [Neon DB Setup Guide](./docs/neon-setup.md) for detailed database configuration.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Header, Footer, Navigation
│   ├── products/       # Product-related components
│   ├── theme/          # Theme customization
│   └── ui/             # shadcn/ui components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and external services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Tailwind CSS** for styling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

- 📧 Email: info@ecomjunction.net
- 🌐 Website: [ecomjunction.net](https://ecomjunction.net)
- 📖 Documentation: [View Documentation](src/pages/Documentation.tsx)

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ecomjunction-platform)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ecomjunction-platform)

### Docker

```bash
# Build the image
docker build -t ecomjunction .

# Run the container
docker run -p 3000:3000 ecomjunction
```

### Manual Deployment

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 📈 Roadmap

- [ ] User authentication and profiles
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Affiliate link tracking and analytics
- [ ] Team collaboration features

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for AI-powered product extraction
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [React](https://reactjs.org/) for the amazing frontend framework

---

## 🔧 AI Dev Container

This project includes a `.devcontainer/` setup for isolated AI-powered development using DevPod.

```bash
# First time: copy .env and add your API keys
cp .devcontainer/.env.example .devcontainer/.env

# Launch container (local Docker)
devpod up . --ide none

# Launch container (remote SSH server)
devpod up . --provider ssh --ide none

# Connect and start coding
devpod ssh ecomjunction
opencode    # or: kilo
```

Inside the container you get:
- **Opencode CLI + Kilo Code CLI** with Claude Opus 4.6, Kimi K2.5, DeepSeek models
- **BMAD-METHOD** — type `/bmad-help` for agile workflow guidance
- **MCP servers** — chrome-devtools, context7, sequential-thinking, playwright
- All project dependencies auto-installed

See the [devcontainer-template README](https://github.com/user/devcontainer-template-public) for full setup instructions including Docker and DevPod installation.

---

Made with ❤️ by the eComJunction team
