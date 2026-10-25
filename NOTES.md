# 📝 StackPulse - Engineering Approach & Technical Notes

## 1. Architecture & Tech Stack Choice
* **Backend**: Built using Node.js and Express.js, exposing a clean REST API consumed directly by the React frontend.
* **Database**: PostgreSQL managed using raw SQL queries with a connection pool (`pg`). 
  * *Trade-off / Decision*: Avoiding a heavy ORM (like Prisma or Sequelize) gave me explicit control over complex multi-table relational joins—such as aggregating usernames for comparison groups—while keeping the backend lightweight and transparent.
* **Frontend**: React (Vite) styled with Tailwind CSS and Lucide React icons.

## 2. Handling GitHub API Constraints & Performance
* **The Challenge**: Unauthenticated GitHub REST requests are capped at 60/hour per IP, whereas authenticated requests allow 5,000/hour. Pulling multiple active repositories and commit stats can get expensive quickly.
* **The Approach**: 
  * Implemented optional backend support for an authenticated Personal Access Token (PAT) via environment variables (`GITHUB_TOKEN`) to easily scale past the limit during testing.
  * Structured backend data caching (`developers` and `repos` tables) so profile information is efficiently mapped and stored.

## 3. Database Schema & Relational Integrity
The PostgreSQL schema is structured around normalized relational tables:
* **`users`**: Manages credentials with secure hashing.
* **`developers` & `repos`**: Caches GitHub profile data and repository metrics.
* **`comparisons` & `comparison_devs`**: A many-to-many relationship using a junction table to map saved comparison groups to multiple developers.
* **`pins`**: Stores authenticated user-curated repository bookmarks, tags, and custom notes.
* *Trade-off / Decision*: Handled foreign key constraints explicitly in backend controllers (deleting child rows before parent rows) to protect database integrity and prevent unhandled server crashes.

## 4. Multi-Developer Side-by-Side Comparison & Visualizations
* Built a dynamic comparison view supporting 2 to 4 GitHub handles simultaneously with identical input sizing and clean desktop alignment.
* Instead of importing heavy external charting libraries (like Chart.js or Recharts), I built **custom percentage-scaled comparative bar charts using Tailwind CSS**. This keeps the frontend bundle size tiny, avoids third-party styling conflicts, and gives total freedom over dark mode support.

## 5. Session Persistence & User Experience (UX)
* **The Fix**: Solved the standard Single Page Application (SPA) refresh bug where page reloads wipe out React state and force logouts. By synchronizing React's `AuthContext` state with browser `localStorage`, user sessions and tokens persist seamlessly across reloads.
* **Mobile Responsiveness**: Designed with a mobile-first approach featuring a slide-out hamburger navigation drawer, stacking search inputs, and fluid responsive grid layouts for profiles and comparisons.


# 💡 Developer Notes & Journey: Building StackPulse

| Layer / Topic | Chosen Approach | Rationale & Justification |
| :--- | :--- | :--- |
| **Backend Architecture** | Node.js + Express (Raw SQL / `pg`) | Avoiding heavy ORMs (like Prisma or Sequelize) gave me absolute control over complex multi-table relational joins—such as aggregating arrays of developer usernames for saved comparisons—while keeping the backend lean, fast, and transparent. |
| **Frontend Visualizations** | Custom Tailwind CSS Bar Charts | Bypassed heavy charting libraries (like Chart.js or Recharts) by building percentage-scaled comparative bar charts using Tailwind CSS flexbox. This keeps the bundle size tiny, avoids third-party styling conflicts, and ensures flawless dark mode support. |
| **Session Persistence** | `AuthContext` + `LocalStorage` | Solved the standard SPA refresh bug where a page reload resets React state. Synchronizing the auth state with browser `localStorage` ensures user sessions and tokens persist seamlessly across reloads. |
| **Database Integrity** | Explicit Foreign Key Cascading | Handled relational constraints cleanly in backend controllers by explicitly deleting child rows in `comparison_devs` before removing parent comparison records, preventing unhandled server crashes and database errors. |
| **GitHub API Rate Limits** | Optional Personal Access Token (PAT) | Mitigated the public GitHub API's restrictive 60 requests/hour unauthenticated IP limit by adding backend support for an authenticated `GITHUB_TOKEN`, allowing users to scale up to 5,000 requests/hour instantly. |