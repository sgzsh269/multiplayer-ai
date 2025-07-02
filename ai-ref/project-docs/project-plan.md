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

- [~] **3A.3** Frontend Integration
  - [x] Replace all dashboard mock data with real API calls
  - [x] Implement loading, error, and empty states for each dashboard section
  - [ ] Use Zustand for dashboard state management
  - [x] Add optimistic UI updates for chatroom creation/joining
  - [x] Implement navigation to chatroom details page after creation.
  - [x] Simplify Dashboard UI (remove stats, filter, specific navigation links, update button text).

- [~] **3A.4** E2E & Integration Testing
-   - [ ] Playwright tests for dashboard flows: chatroom creation, joining, team listing, etc.

---

### 4. Chatroom Core (MVP)

- [x] **4.1** Backend: API routes for chatroom creation, joining, and listing.
- [x] **4.2** Frontend: UI to create/join/list chatrooms.
- [ ] **4.3** Presence: Show online users in a room (basic implementation).
- [ ] **4.4** E2E test: User can create a room, join it, and see themselves listed.

---

### 5. Real-Time Messaging

- [ ] **5.1** Backend: API for sending/receiving messages (with basic persistence).
- [ ] **5.2** Frontend: Real-time chat UI (send/receive messages, show sender info).
- [ ] **5.3** Presence: Show who is typing.
- [ ] **5.4** E2E test: Two users can chat in real time in the same room.

---

### 6. AI Assistant Integration

- [ ] **6.1** Integrate AI SDK in backend for chatroom assistant.
- [ ] **6.2** Frontend: UI for AI messages, allow users to address AI.
- [ ] **6.3** Threaded replies support (basic).
- [ ] **6.4** E2E test: User can ask AI a question in a room and get a response.

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
