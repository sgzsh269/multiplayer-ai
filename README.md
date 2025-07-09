# AI Collaborative Chatrooms

A real-time collaborative platform that combines human conversation with AI assistance. Built with modern web technologies for seamless team communication and AI-powered productivity.

## 🚀 Features

### ✅ Core Platform (95% Complete)

**🔐 Authentication & User Management**
- Secure authentication with Clerk integration
- User profiles with first/last name support
- Automatic user synchronization between Clerk and local database
- Profile management with centered, styled interface

**💬 Real-Time Messaging**
- Instant messaging with PartyKit real-time infrastructure
- Multi-line message input with Shift+Enter support
- Smart auto-scroll for message senders
- Live typing indicators
- Message deduplication and proper sender identification

**🤖 AI Assistant Integration**
- **Two AI Modes:**
  - **Auto-Respond**: AI responds to every message automatically
  - **Summoned**: AI only responds when mentioned with @AI
- **Real-Time AI Streaming**: Token-by-token AI responses visible to all users
- Conversation context awareness (last 10 messages)
- Distinctive AI message styling with purple gradient
- GPT-4o-mini integration for enhanced performance
- Per-chatroom AI settings management

**👥 Chatroom Management**
- Create and join collaborative chatrooms
- Real-time participant lists
- Chatroom details with active member tracking
- Share functionality with secure invite links

**🔗 Secure Invite System**
- Short-lived invite links (10 minutes expiry)
- URL-safe random codes for security
- Usage tracking and member limits
- Real-time member join notifications
- Support for multiple invite formats

**⚡ Real-Time Features**
- Live message updates across all participants
- Real-time settings synchronization
- Member event notifications (joins/removals)
- Typing indicators and presence awareness
- AI streaming visible to all connected users

**🛡️ Admin Management**
- Admin-only message clearing with confirmation dialogs
- Member removal capabilities (with business rules protection)
- Real-time admin action broadcasting
- Secure API endpoints with proper authorization

**🎨 Polished UI/UX**
- Clean, modern interface built with Shadcn UI
- Responsive design with Tailwind CSS
- Avatar displays with proper initials
- Color-coded notifications for member events
- Simplified chatroom interface focused on conversation

## 🛠️ Tech Stack

**Frontend & Backend**
- **Next.js 14** - App Router for modern React development
- **TypeScript** - Type-safe development across the stack
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - High-quality component library

**Real-Time & Communication**
- **PartyKit** - Real-time collaboration infrastructure
- **AI SDK** - OpenAI integration with streaming support
- **Clerk** - Authentication and user management

**Database & State**
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Schema validation
- **Zustand** - Frontend state management

**Development & Tooling**
- **Bun** - Fast package manager and runtime
- **Playwright** - End-to-end testing framework
- **Biome** - Code formatting and linting
- **Docker** - Containerized development environment

## 📁 Project Structure

```
proj-bun/
├── packages/
│   ├── webapp/           # Next.js application
│   │   ├── src/
│   │   │   ├── app/      # App Router pages and API routes
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── db/       # Database schema and client
│   │   │   └── lib/      # Utilities and hooks
│   │   └── drizzle/      # Database migrations
│   ├── realtime/         # PartyKit server for real-time features
│   └── common/           # Shared types and utilities
├── docker/               # Development environment
└── ai-ref/              # Documentation and specifications
```

## 🚀 Quick Start

### Prerequisites

- **Bun** (latest version)
- **PostgreSQL** database
- **Clerk** account for authentication
- **OpenAI** API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd proj-bun
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in `packages/webapp/`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/chatrooms"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   
   # OpenAI
   OPENAI_API_KEY="sk-..."
   
   # PartyKit
   NEXT_PUBLIC_PARTYKIT_HOST="localhost:1999"
   PARTYKIT_API_KEY="your-secure-api-key"
   ```

4. **Set up the database**
   ```bash
   cd packages/webapp
   bun run db:push
   ```

5. **Start development servers**
   
   Terminal 1 - Main application:
   ```bash
   cd packages/webapp
   bun run dev
   ```
   
   Terminal 2 - Real-time server:
   ```bash
   cd packages/realtime
   bun run dev
   ```

6. **Access the application**
   - Main app: http://localhost:3000
   - PartyKit server: http://localhost:1999

## 🎯 Usage Guide

### Getting Started

1. **Sign Up/Sign In** - Create an account or sign in with Clerk
2. **Create a Chatroom** - Start a new collaborative session
3. **Invite Team Members** - Share secure invite links with colleagues
4. **Configure AI Assistant** - Choose between auto-respond or summoned mode
5. **Start Collaborating** - Chat in real-time with AI assistance

### AI Assistant Modes

**Auto-Respond Mode**
- AI responds to every message automatically
- Great for brainstorming and continuous assistance
- Real-time streaming responses visible to all participants

**Summoned Mode**
- AI only responds when mentioned with @AI
- Perfect for focused discussions with occasional AI input
- Mention @AI in any message to get assistance

### Admin Features

**Message Management**
- Clear all messages in a chatroom (admin only)
- Confirmation dialogs prevent accidental deletions
- Real-time updates across all participants

**Member Management**
- Remove participants from chatrooms
- Business rules prevent removing the last admin
- Real-time member notifications

## 🔧 Development

### Available Scripts

```bash
# Main application
cd packages/webapp
bun run dev          # Start development server
bun run build        # Build for production
bun run db:push      # Push database schema changes
bun run db:studio    # Open Drizzle Studio

# Real-time server
cd packages/realtime
bun run dev          # Start PartyKit development server
bun run build        # Build PartyKit server

# Root workspace
bun run test         # Run all tests
bun run lint         # Lint all packages
```

### Database Management

The project uses Drizzle ORM with PostgreSQL. Database schema is defined in `packages/webapp/src/db/schema.ts`.

**Key Tables:**
- `users` - User profiles synced from Clerk
- `chatrooms` - Collaborative chat sessions
- `messages` - Chat messages with AI support
- `chatroom_members` - Many-to-many user-chatroom relationships
- `chatroom_invites` - Secure invite system with expiry

## 🧪 Testing

The project includes comprehensive testing infrastructure:

```bash
# Run E2E tests
bun run test:e2e

# Run specific test suites
bun run test:auth      # Authentication flows
bun run test:chatrooms # Chatroom functionality
bun run test:ai        # AI assistant features
```

## 🚀 Deployment

### Production Environment

1. **Database Setup**
   - Deploy PostgreSQL instance
   - Run migrations: `bun run db:push`

2. **Environment Configuration**
   - Set production environment variables
   - Configure Clerk for production domain
   - Set up OpenAI API access

3. **Application Deployment**
   - Deploy Next.js app to Vercel/similar platform
   - Deploy PartyKit server to PartyKit platform
   - Configure domain and SSL certificates

### Docker Development

```bash
# Start development environment
docker-compose -f docker/docker-compose.dev.yml up
```

## 📈 Roadmap

### 🎯 Next Priorities

1. **E2E Testing Infrastructure** - Comprehensive Playwright test suite
2. **File & Image Uploads** - Support for file sharing and AI file processing
3. **Advanced AI Tools** - Web search integration and API actions
4. **Enhanced Collaboration** - Emoji reactions, message importance, export features
5. **Production Polish** - Accessibility, mobile responsiveness, performance optimization

### 🔮 Future Features

- Role-based permissions system
- In-app notifications and mentions
- Conversation export functionality
- Mobile application
- Advanced AI tool integrations
- Analytics and usage insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk** for seamless authentication
- **PartyKit** for real-time infrastructure
- **OpenAI** for AI capabilities
- **Vercel** for Next.js framework
- **Shadcn** for beautiful UI components

---

**Built with ❤️ using modern web technologies for the future of collaborative AI.** 