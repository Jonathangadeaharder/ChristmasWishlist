# Architecture Decision Records (ADR)

## ADR-001: Technology Stack Selection

### Context

We need to build a responsive web application with authentication, real-time data capabilities, and secure data visibility rules.

### Decision

We will use the following stack:

- **Frontend**: React (v18+) with TypeScript.
  - _Reasoning_: Strong typing for data models, component-based architecture for UI reuse.
  - _Build Tool_: Vite (for speed).
- **Backend-as-a-Service**: Firebase.
  - **Authentication**: Firebase Auth (handles user sessions securely).
  - **Database**: Cloud Firestore (NoSQL).
    - _Reasoning_: Flexible schema, real-time listeners for updates (e.g., seeing when someone else claims a gift immediately), and granular Security Rules.
  - **Hosting**: Firebase Hosting.

### Consequences

- Rapid prototyping and deployment.
- Vendor lock-in to Google Firebase.
- No need to manage a separate backend server (Node/Express) unless complex logic requires Cloud Functions.

---

## ADR-002: Data Model for "Surprise" Privacy

### Context

A critical requirement is that the Wisher must not know if a gift is bought ("Taken"). If we store `isTaken` on the main item document, the Wisher reads that document to see the title/description, and could technically inspect the network response to see `isTaken: true`.

### Decision

We will separate public item data from "secret" status data using Firestore Subcollections.

**Structure:**

1. `users/{userId}/wishlist/{itemId}`
   - **Read**: Owner, Friends
   - **Write**: Owner
   - **Fields**: `title`, `description`, `url`, `price`
2. `users/{userId}/wishlist/{itemId}/gift_status/status` (Subcollection Document)
   - **Read**: Friends ONLY (Owner Read Denied via Security Rules)
   - **Write**: Friends
   - **Fields**: `isTaken` (bool), `takenBy` (userId), `takenByName` (string)
3. `users/{userId}/suggestions/{suggestionId}`
   - **Read**: Friends ONLY
   - **Write**: Friends
   - **Fields**: `title`, `suggestedBy`, `description`

### Consequences

- **Pros**: True security. Even if the Wisher is a developer, they cannot query the database for the "taken" status of their own items because Firestore Security Rules will reject the request.
- **Cons**: The frontend requires two separate queries/listeners when viewing a friend's list (one for items, one for statuses) and merging them client-side.

---

## ADR-003: State Management

### Context

The app needs to manage user session state and cached data for wishlists.

### Decision

- Use **React Context API** for Authentication State (`AuthContext`).
- Use **TanStack Query (React Query)** for data fetching and caching.
  - _Reasoning_: Handles loading states, caching, and re-fetching efficiently, which is crucial when switching between friend lists.
