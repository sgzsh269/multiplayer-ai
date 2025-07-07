# Multiplayer AI

This app is a multiplayer chat app that allows users to form groups and collaboratively interact with AI assistants in real-time. The app's goal is to facilitate collaborative learning, brainstorming, research, and decision-making through a conversational interface. 

## Tech Stack

* [Next.js](https://nextjs.org/) - Frontend and Backend framework
* [PartyKit](https://partykit.io/) - Real-time collaboration framework
* [Clerk](https://clerk.com/) - Authentication and user management
* [AI SDK](https://ai-sdk.dev/) - AI toolkit 
* [Shadcn UI](https://ui.shadcn.com/) - UI Component library
* [Drizzle](https://orm.drizzle.team/) - Database ORM

## Project Structure

Project is a monorepo with the following key directories:

* `/packages/webapp/` - Frontend and Backend
* `/packages/party/` - PartyKit multiplayer server
* `/docker/` - Docker compose files for postgres db and other services
* `/ai-ref/` - Project reference files for AI coding assistants
* `/.cursor/` - Cursor rules

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) Package manager
- PostgreSQL database
- [Clerk](https://clerk.com/) account for authentication
- [OpenAI](https://platform.openai.com/playground) API key for AI features

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd multiplayer-ai
   ```

2. **Install dependencies**
   ```sh
   bun install
   ```

3. **Set up environment variables**
- In `/packages/webapp`, copy `.env.example` to `.env` and fill in the values.
- In `/packages/party`, copy `.env.example` to `.env` and fill in the values.

4. **Set up the database**
   ```sh
   bun run db:migrate
   ```

5. **Start development servers**
   ```sh
   bun run dev
   ```

6. **Access the application**
   - Main app: http://localhost:3000
   - PartyKit server: http://localhost:1999


## Roadmap

- File and image queries
- Tool calling and MCP
- Multiple AI assistants in a chatroom

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE)

## Credits

Vibe-coded with Cursor, Claude, Gemini and O3