---
PROJECT PLAN
---

#### Legend: [ ] Not Started | [~] In Progress | [x] Completed

### 1. Project Setup & Scaffolding

- [x] **1.1** Scaffold a Next.js (App Router) project in the `packages` directory using Bun.
- [x] **1.2** Set up monorepo structure with Bun workspaces.
- [x] **1.3** Initialize a shared internal library package for common types and utilities.

---

### 2. Install and Configure Core Libraries

- [x] **2.1** Install and configure the following libraries in the appropriate packages:
  - Next.js
  - Drizzle ORM (with Postgres driver)
  - Clerk (authentication)
  - Zustand (frontend state management)
  - Zod (schema validation)
  - AI SDK (for chat assistant)
  - Shadcn UI (UI components)
  - Playwright (for E2E testing)
  - TypeScript (if not already present)
- [x] **2.2** Set up basic TypeScript config and linting for all packages.

---

### 3. Database & Auth Foundation

- [x] **3.1** Set up Drizzle ORM with Postgres connection in the backend.
- [x] **3.2** Create initial database schema: users, chatrooms, messages, files, roles.
- [x] **3.3** Integrate Clerk for authentication (sign up, sign in, user profile).
- [x] **3.4** E2E test: User can sign up, sign in, and is persisted in the database.
  - Implemented via a dedicated `/api/sync-user` endpoint and a dashboard client effect that upserts the current Clerk user into the local DB on login. This ensures user persistence without relying on webhooks.
- [x] **3.5** Dashboard header displays current user's name, email, and avatar using Clerk data.
- [x] **3.6** Profile navigation is available in the dashboard dropdown and routes to the profile page.
- [x] **3.7** Clerk's UserProfile page is centered and styled for a better user experience.

---

### 3A. Dashboard Functionality (Data-Driven)

// In this app, 'sessions' are called 'chatrooms'.

- [x] **3A.1** Data Models (Drizzle ORM + Postgres)
  - [x] Define/update models for:
    - User (review for completeness)
    - Chatroom (collaborative chatroom)
    - Message (for chatroom chat)
  - [x] Add relationships:
    - Users ↔ Chatrooms (many-to-many: participants)
    - Chatrooms ↔ Messages (one-to-many)
  - [x] Run and validate DB migrations.
  - [x] Add unique constraint to prevent duplicate chatroom memberships (userId, chatroomId).

- [x] **3A.2** Backend APIs (Next.js API routes)
  - [x] Chatrooms
    - [x] Create chatroom (`POST /api/chatrooms`)
    - [x] List chatrooms (`GET /api/chatrooms`)
    - [x] Join chatroom (`POST /api/chatrooms/:id/join`)
    - [x] Get chatroom details (`GET /api/chatrooms/:id`)
  - [x] Team Members
    - [x] List team members in a chatroom (`GET /api/chatrooms/:id/members`)
  - [x] Messages (for future chat features)
    - [x] List messages in chatroom (`GET /api/chatrooms/:id/messages`)
    - [x] Send message (`POST /api/chatrooms/:id/messages`)

- [x] **3A.3** Frontend Integration
  - [x] Replace all dashboard mock data with real API calls
  - [x] Implement loading, error, and empty states for each dashboard section
  - [ ] Use Zustand for dashboard state management
  - [x] Add optimistic UI updates for chatroom creation/joining
  - [x] Implement navigation to chatroom details page after creation.
  - [x] Simplify Dashboard UI (remove stats, filter, specific navigation links, update button text).

- [ ] **3A.4** E2E & Integration Testing
-   - [ ] Playwright tests for dashboard flows: chatroom creation, joining, team listing, etc.

---

### 4. Chatroom Core (MVP)

- [x] **4.1** Backend: API routes for chatroom creation, joining, and listing.
- [x] **4.2** Frontend: UI to create/join/list chatrooms.
- [x] **4.3** Frontend: Fetch and display chatroom details (name, started ago, active participants).
- [x] **4.4** Frontend: Display participants list in the chatroom sidebar.
- [ ] **4.5** Presence: Show online users in a room (basic implementation).
- [ ] **4.6** E2E test: User can create a room, join it, and see themselves listed.

---

### 5. Real-Time Messaging

- [x] **5.1** Backend: API for sending/receiving messages (with basic persistence).
- [x] **5.2** Frontend: Display existing messages in the chatroom UI.
- [x] **5.3** Frontend: Implement message input and sending functionality.
- [x] **5.4** Frontend: Real-time chat UI (send/receive messages, show sender info) [PartyKit wired up, tested with live updates].
- [x] **5.4a** Frontend: Fix message duplication issues between API and PartyKit sources.
- [x] **5.4b** Frontend: Fix sender identity issues for real-time messages.
- [x] **5.4c** Frontend: Implement smart auto-scroll (only for message sender, not recipients).
- [ ] **5.5** Presence: Show who is typing.
- [ ] **5.7** E2E test: Two users can chat in real time in the same room.
- [ ] **5.6** Frontend: Implement UI for file and image attachments (paperclip, image buttons).

#### 5A. PartyKit Integration for Real-Time Messaging

- [x] **5A.1** Backend: Scaffold PartyKit server in `packages/realtime` for chatroom messaging.
- [x] **5A.2** Backend: Integrate Clerk auth into PartyKit server for user validation (no persistence; auth only).
- [x] **5A.3** Backend: Implement PartyKit message broadcast to all connected clients in a chatroom (excluding sender to prevent duplicates).
- [x] **5A.4** Frontend: Connect chatroom UI to PartyKit using `partysocket` for real-time message updates.
- [x] **5A.5** Frontend: Update chatroom message list in real time as new messages arrive via PartyKit.
- [x] **5A.6** Frontend: Send new messages through PartyKit (persistence via REST API for now; PartyKit server persistence/auth is next).
- [x] **5A.6a** Frontend: Fix PartyKit message accumulation and deduplication with API messages.
- [x] **5A.6b** Frontend: Use current user's Clerk identity for PartyKit connections (not first participant).
- [ ] **5A.7** Frontend: Show real-time presence (online users) using PartyKit connection state.
- [ ] **5A.8** Frontend: Show 'user is typing' indicator using PartyKit events.
- [ ] **5A.9** E2E: Test real-time chat between two users in the same room using Playwright MCP.

[note] Clerk authentication is now enforced for all PartyKit connections and messages. Frontend sends the Clerk session token with every connection and message.

---

### 6. AI Assistant Integration

- [x] **6.1** Integrate AI SDK in backend for chatroom assistant.
  - [x] AI API route for generating responses with conversation context
  - [x] Settings API route for managing AI mode (reactive/summoned)
  - [x] Database schema updated to support AI messages and settings
  - [x] OpenAI provider installed and configured
- [x] **6.2** Frontend: UI for AI messages, allow users to address AI.
  - [x] AI messages display with distinctive styling (purple gradient)
  - [x] AI mode toggle in chatroom header (reactive vs summoned)
  - [x] @AI mention detection and triggering
  - [x] Dynamic message input placeholder based on AI mode
  - [x] AI status indicator showing current mode
- [ ] **6.3** Threaded replies support (basic).
- [ ] **6.4** E2E test: User can ask AI a question in a room and get a response.

#### 6A. AI Assistant Features Implemented

- [x] **6A.1** Reactive Mode: AI responds to every user message automatically
- [x] **6A.2** Summoned Mode: AI only responds when @AI is mentioned
- [x] **6A.3** AI message persistence and real-time updates via PartyKit
- [x] **6A.4** Conversation context awareness (last 10 messages)
- [x] **6A.5** AI settings management per chatroom
- [x] **6A.6** Distinctive UI for AI messages with emoji avatar and styling
- [x] **6A.7** **Robust Backend Broadcasting**: AI messages broadcasted directly from backend to PartyKit
  - Backend-to-PartyKit direct integration for reliability
  - AI API route broadcasts to PartyKit after generating response
  - Eliminates frontend dependency for real-time AI message delivery
  - Handles PartyKit failures gracefully without breaking AI responses
- [x] **6A.8** **Secure AI Broadcasting**: Protected AI endpoint with comprehensive security
  - API key authentication between backend and PartyKit server
  - Rate limiting (10 AI messages per minute per room)
  - Request validation and payload size limits
  - Chatroom ID verification to prevent cross-room message injection
  - Proper error handling and logging for security events

**Environment Variables Required:**
- `OPENAI_API_KEY`: OpenAI API key for AI responses
- `SHARED_PARTYKIT_BACKEND_API_KEY`: Shared secret for backend-to-PartyKit authentication

**Setup Instructions:**
1. Generate a secure API key: `bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` or `bun packages/common/generate-api-key.js`
2. Add the generated key as `SHARED_PARTYKIT_BACKEND_API_KEY` in both webapp and realtime `.env.local` files
3. Ensure the same key is used in both environments for authentication to work

---

### 7. File & Image Uploads

- [ ] **7.1** Backend: API and storage for file/image uploads (PDF, DOCX, PNG, JPG, etc.).
- [ ] **7.2** Frontend: UI for uploading files/images, show inline in chat.
- [ ] **7.3** AI: Enable AI to process and answer questions about uploaded files/images.
- [ ] **7.4** E2E test: User uploads a file/image, sees it in chat, and AI can reference it.

---

### 8. Tools & API Actions

- [ ] **8.1** Integrate web search and third-party API actions for AI.
- [ ] **8.2** Admin UI: Toggle which tools/APIs are enabled per room.
- [ ] **8.3** E2E test: User requests a web search, AI responds with cited sources.

---

### 9. User Experience & Collaboration

- [ ] **9.1** Emoji reactions, mark messages as important.
- [ ] **9.2** Export conversation/files (download session).
- [ ] **9.3** In-app/email notifications for mentions, responses, important events.
- [ ] **9.4** E2E test: User reacts to a message, marks as important, exports chat.

---

### 10. Security & Admin

- [ ] **10.1** Role-based permissions (admin, guest, etc.).
- [ ] **10.2** Room privacy: public/private, secure invites.
- [ ] **10.3** Admin logs: uploads, joins/leaves, etc.
- [ ] **10.4** E2E test: Admin restricts access, reviews logs.

---

### 11. Polish & Out-of-Scope

- [ ] **11.1** UI/UX polish, accessibility, mobile responsiveness.
- [ ] **11.2** Review out-of-scope items for future planning.

---

### 12. E2E & Integration Testing

  - [ ] Playwright tests for dashboard flows: chatroom creation, joining, team listing, etc.

// Each task above is designed to deliver a testable, end-to-end user flow.

[note] Next.js 15 dynamic API route param handling (`params` as Promise) was updated and tested in all relevant API routes.
