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
- [x] **4.5** Frontend: Clean and simplified chatroom interface (removed file upload buttons, time duration, participant count).
- [ ] **4.6** Presence: Show online users in a room (basic implementation).
- [ ] **4.7** E2E test: User can create a room, join it, and see themselves listed.

---

### 5. Real-Time Messaging

- [x] **5.1** Backend: API for sending/receiving messages (with basic persistence).
- [x] **5.2** Frontend: Display existing messages in the chatroom UI.
- [x] **5.3** Frontend: Implement message input and sending functionality.
- [x] **5.4** Frontend: Real-time chat UI (send/receive messages, show sender info) [PartyKit wired up, tested with live updates].
- [x] **5.4a** Frontend: Fix message duplication issues between API and PartyKit sources.
- [x] **5.4b** Frontend: Fix sender identity issues for real-time messages.
- [x] **5.4c** Frontend: Implement smart auto-scroll (only for message sender, not recipients).
- [x] **5.4d** Frontend: Improved message input with multiline textarea, Shift+Enter support, and better UX.
- [x] **5.5** Presence: Show who is typing.
- [ ] **5.6** E2E test: Two users can chat in real time in the same room.
- [ ] **5.7** Frontend: Implement UI for file and image attachments (paperclip, image buttons).

#### 5A. PartyKit Integration for Real-Time Messaging

- [x] **5A.1** Backend: Scaffold PartyKit server in `packages/realtime` for chatroom messaging.
- [x] **5A.2** Backend: Integrate Clerk auth into PartyKit server for user validation (no persistence; auth only).
- [x] **5A.3** Backend: Implement PartyKit message broadcast to all connected clients in a chatroom (excluding sender to prevent duplicates).
- [x] **5A.4** Frontend: Connect chatroom UI to PartyKit using `partysocket` for real-time message updates.
- [x] **5A.5** Frontend: Update chatroom message list in real time as new messages arrive via PartyKit.
- [x] **5A.6** Frontend: Send new messages through PartyKit (persistence via REST API for now; PartyKit server persistence/auth is next).
- [x] **5A.6a** Frontend: Fix PartyKit message accumulation and deduplication with API messages.
- [x] **5A.6b** Frontend: Use current user's Clerk identity for PartyKit connections (not first participant).
- [x] **5A.10** Backend: Extend PartyKit server for settings broadcasting (real-time AI mode synchronization).
- [x] **5A.11** Backend: Extend PartyKit server for member event broadcasting (join/remove notifications).
- [ ] **5A.7** Frontend: Show real-time presence (online users) using PartyKit connection state.
- [x] **5A.8** Frontend: Show 'user is typing' indicator using PartyKit events.
- [ ] **5A.9** E2E: Test real-time chat between two users in the same room using Playwright MCP.



---

### 6. AI Assistant Integration

- [x] **6.1** Integrate AI SDK in backend for chatroom assistant.
  - [x] AI API route for generating responses with conversation context
  - [x] Settings API route for managing AI mode (auto-respond/summoned)
  - [x] Database schema updated to support AI messages and settings
  - [x] OpenAI provider installed and configured
- [x] **6.2** Frontend: UI for AI messages, allow users to address AI.
  - [x] AI messages display with distinctive styling (purple gradient)
  - [x] AI mode toggle in chatroom header (auto-respond vs summoned)
  - [x] @AI mention detection and triggering
  - [x] Dynamic message input placeholder based on AI mode
  - [x] AI status indicator showing current mode
  - [x] Share link functionality for chatroom invitations
  - [x] Fixed undefined function errors (hasAiMentions, renderInputOverlay)
- [ ] **6.3** Threaded replies support (basic).
- [x] **6.4** E2E test: User can ask AI a question in a room and get a response.

#### 6A. AI Assistant Features Implemented ✅ COMPLETE

- [x] **6A.1** Auto-respond Mode: AI responds to every user message automatically
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
- [x] **6A.9** **User Experience Enhancements**: Complete UX implementation
  - Share link functionality for easy chatroom invitation (copy shareable URLs)
  - Join functionality handles both chatroom IDs and full URLs with auto-extraction
  - Auto-navigation to joined chatrooms for seamless user flow
  - Internal naming consistency: "reactive" mode renamed to "auto-respond" throughout
  - Database migration applied to update default AI mode to auto-respond
  - Bug fixes: Resolved undefined function errors (hasAiMentions, renderInputOverlay)
  - Clean input field implementation without complex badge overlays
- [x] **6A.10** **Real-Time Settings Synchronization**: Live settings updates across all users
  - Backend: Settings API broadcasts changes to PartyKit when AI mode or enable/disable status changes
  - PartyKit: New settings-update endpoint handles secure broadcasting of setting changes
  - Frontend: Real-time settings updates applied automatically to all connected users
  - UI notifications: Visual indicators when other users change settings (with user attribution)
  - Prevents settings conflicts and keeps all participants in sync with current AI configuration
  - Framework extensible for future chatroom settings (privacy, permissions, tools, etc.)

- [x] **6A.11** **Real-Time AI Streaming**: Token-by-token streaming for all users ✅ COMPLETE
  - **Backend Streaming**: AI responses stream token-by-token using AI SDK `streamText`
    - Server-Sent Events (SSE) implementation for real-time token delivery
    - Each token broadcasted to PartyKit for multi-user streaming
    - Unique stream IDs prevent conflicts between concurrent streams
    - Complete response saved to database only after streaming finishes
  - **PartyKit Real-Time Broadcasting**: New `/ai-stream` endpoint for streaming events
    - Handles `start`, `token`, and `complete` streaming events
    - Secure API key authentication and request validation
    - Broadcasts streaming tokens to all connected chatroom participants
    - Graceful error handling for network failures
  - **Frontend Multi-User Streaming**: Sophisticated client-side streaming management
    - Local streaming for message initiator (direct SSE connection)
    - Remote streaming for other users (via PartyKit broadcasts)
    - Prevents duplicate streams for the same user
    - Visual "AI typing..." indicators with pulse animation
    - Auto-scroll follows streaming content for all participants
  - **Enhanced User Experience**: Premium chat experience with real-time AI
    - All users see AI responses appearing progressively in real-time
    - Immediate feedback with typing indicators during AI processing
    - Smooth auto-scroll keeps conversation in view
    - Seamless integration with existing message history
    - Fallback to non-streaming mode if PartyKit fails
  - **Model Upgrade**: Switched from GPT-3.5-turbo to GPT-4o-mini for better performance
    - Improved response quality and reasoning capabilities
    - Better cost-performance ratio
    - Enhanced context understanding for collaborative discussions

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

[completed] AI Assistant Integration (Section 6 & 6A) - Fully implemented with auto-respond and summoned modes, real-time messaging, secure backend broadcasting, real-time settings synchronization, share link functionality, and all bug fixes applied. Ready for production use with complete multi-user collaboration support.

---

### 7. Database Schema Improvements ✅ COMPLETE

- [x] **7.1** **User Schema Refactor**: Improved user data structure for better UX
  - Removed `displayName` field from users table
  - Added separate `firstName` and `lastName` fields
  - Created and applied database migration (0008_flaky_lockheed.sql)
  - Updated all API endpoints to use firstName/lastName instead of displayName
  - Modified sync-user, chatroom routes, messages routes, AI routes, settings routes, and members routes
  - Updated frontend to construct display names from firstName + lastName
  - Fixed avatar initials generation to use proper first/last name logic (shows both initials)

---

### 8. Admin Management Features ✅ COMPLETE

- [x] **8.1** **Admin Message Management**: Complete message moderation capabilities
  - Created DELETE endpoint at `/api/chatrooms/[id]/messages` with admin-only authorization
  - Added UI button in "Admin Actions" section (only visible to admins)
  - Implemented confirmation dialog with warning about irreversible action
  - Added proper error handling and loading states
  - Real-time message clearing across all connected users

- [x] **8.2** **Admin Member Management**: Comprehensive participant control
  - Created DELETE endpoint at `/api/chatrooms/[id]/members` with admin authorization
  - Added business rules: can't remove last admin, can't remove self
  - Added small red remove buttons next to each participant (admin-only)
  - Implemented confirmation dialog for member removal
  - Added proper error handling and auto-refresh of participant list
  - Real-time member removal updates across all users

---

### 9. Real-Time Member Notifications ✅ COMPLETE

- [x] **9.1** **Member Event Broadcasting**: Live notifications for member changes
  - Added broadcasting to PartyKit when members join (via invite link) or are removed
  - Created `/member-event` endpoint in PartyKit server with proper authentication
  - Member events broadcasted from backend APIs to PartyKit for real-time updates
  - Request validation and security checks for member event broadcasting

- [x] **9.2** **Frontend Member Notifications**: Real-time UI notifications
  - Updated usePartySocket hook to handle member events
  - Added member notification state and UI with color-coded notifications
  - Green notifications for member joins, orange for member removals
  - Notifications auto-dismiss after 4 seconds but can be manually closed
  - Shows member name and action type in notification message

---

### 10. UI/UX Refinements ✅ COMPLETE

- [x] **10.1** **Chatroom Interface Cleanup**: Simplified and focused UI
  - Removed file and image upload buttons (Paperclip and Image icons)
  - Removed AI auto-respond indicator from the top navigation
  - Removed online status indicators (green dots) from user avatars
  - Removed time duration and participant count from header navigation
  - Updated share button text from "Share Link" to "Share Invite Link"
  - Simplified placeholder text in message input to just "Type your message"

- [x] **10.2** **Message Input Improvements**: Better chat experience
  - Changed from single-line Input to multiline Textarea component
  - Added support for Shift+Enter for new lines
  - Implemented proper styling and auto-expansion
  - Improved keyboard navigation and submit behavior

- [x] **10.3** **Avatar Display Enhancements**: Better user identification
  - Updated avatar initials to show both first and last name initials
  - Consistent avatar display across all UI components
  - Proper fallback handling for users without complete name data

---

### 11. File & Image Uploads

- [ ] **11.1** Backend: API and storage for file/image uploads (PDF, DOCX, PNG, JPG, etc.).
- [ ] **11.2** Frontend: UI for uploading files/images, show inline in chat.
- [ ] **11.3** AI: Enable AI to process and answer questions about uploaded files/images.
- [ ] **11.4** E2E test: User uploads a file/image, sees it in chat, and AI can reference it.

---

### 12. Tools & API Actions

- [ ] **12.1** Integrate web search and third-party API actions for AI.
- [ ] **12.2** Admin UI: Toggle which tools/APIs are enabled per room.
- [ ] **12.3** E2E test: User requests a web search, AI responds with cited sources.

---

### 13. User Experience & Collaboration

- [ ] **13.1** Emoji reactions, mark messages as important.
- [ ] **13.2** Export conversation/files (download session).
- [ ] **13.3** In-app/email notifications for mentions, responses, important events.
- [ ] **13.4** E2E test: User reacts to a message, marks as important, exports chat.

---

### 14. Security & Advanced Admin

- [ ] **14.1** Role-based permissions (admin, guest, etc.).
- [ ] **14.2** Room privacy: public/private, secure invites.
- [ ] **14.3** Admin logs: uploads, joins/leaves, etc.
- [ ] **14.4** E2E test: Admin restricts access, reviews logs.

---

### 15. Polish & Out-of-Scope

- [ ] **15.1** UI/UX polish, accessibility, mobile responsiveness.
- [ ] **15.2** Review out-of-scope items for future planning.

---

### 16. E2E & Integration Testing

- [ ] **16.1** Playwright tests for dashboard flows: chatroom creation, joining, team listing, etc.
- [ ] **16.2** E2E test: Two users can chat in real time in the same room.
- [ ] **16.3** E2E test: User can create a room, join it, and see themselves listed.
- [ ] **16.4** E2E test: Admin can delete messages and remove members.
- [ ] **16.5** E2E test: Member notifications work in real-time across users.