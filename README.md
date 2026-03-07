# GameLevelUp - Job Matching Service

A niche freelance marketplace connecting **buyers** (gamers wanting progress/coaching) with **sellers** (skilled gamers offering coaching, duo-queue play, and strategy sessions).

## 🚀 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, DaisyUI, Redux Toolkit, Socket.io-client, Chart.js, react-hot-toast
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Multer
- **Payments**: Polar (Subscriptions & Mock checkouts)

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- Redis (Optional, for future caching)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/matchingService # Or your Atlas URI
JWT_SECRET=your_super_secret_jwt_key
POLAR_API_KEY=your_polar_api_key
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_SELLER_PRO_PRICE_ID=your_seller_pro_price_id
POLAR_BUYER_PREMIUM_PRICE_ID=your_buyer_premium_price_id
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🧪 Comprehensive Testing Guide (For New Devs)

This section maps out every core user flow. When reviewing PRs or testing locally, follow these steps to ensure system integrity.

### Flow 1: Authentication & Onboarding
1. **Register User 1 (Buyer)**: Go to `/register`, fill out form, select "Buyer" role. You should be redirected to the Buyer Dashboard.
2. **Register User 2 (Seller)**: Open an incognito window, go to `/register`, select "Seller" role.
3. **Seller Onboarding**: You should be redirected to `/onboarding`. Fill out bio, select games, and set an hourly rate.
4. **Login/Logout**: Test logging out and logging back in with both accounts.
5. **Session Persistence**: Refresh the page; ensure you stay logged in (JWT in localStorage).

### Flow 2: Posting & Finding Jobs
1. **Post a Job**: Log in as User 1 (Buyer). Click "Post a Job". Fill in Title, Description, Game, Timeline, and Budget.
2. **Job Limit (Free Tier)**: Try posting 3 jobs as a free buyer. The 3rd attempt should be blocked with an upgrade prompt.
3. **Verify Listings**: Switch to User 2 (Seller). Go to "Find Jobs" (`/jobs`). Ensure the newly posted job appears in the feed.
4. **Search & Filters**: Test the sidebar filters (Game, Budget, Open status) and search bar on the `/jobs` page.

### Flow 3: Bidding Pipeline
1. **View Job Details**: As User 2 (Seller), click on the job posted by User 1.
2. **Submit Bid**: Enter a bid amount and proposed delivery time. Submit the bid.
3. **Bid Limit Check (Free Tier)**: Try to bid on 6 different jobs in a month. The 6th bid should be blocked with an upgrade prompt.
4. **Seller "My Bids"**: Go to the Seller Dashboard -> "My Bids". Verify the bid shows as `pending`.
5. **Withdraw Bid**: Test withdrawing a pending bid from the "My Bids" page. Resubmit it for the next steps.

### Flow 4: Accepting Bids & Escrow (Mocked)
1. **Review Bids**: Switch back to User 1 (Buyer). Go to the Job Details page. The seller's bid should appear in the list.
2. **Accept Bid**: Click "Accept".
   - The job status should change to `matched`.
   - The accepted bid status changes to `accepted`.
   - If there were other bids, they should automatically change to `rejected`.
3. **Platform Fee calculation**: Note the total amount requested (Job Budget + Platform Fee based on the seller's subscription tier: 15% free, 8% pro, 5% elite).
4. **Mock Payment**: Clicking "Pay Now" generates a mock transaction ID and simulates an escrow hold.

### Flow 5: Real-time Chat & Notifications
1. **Socket Connection**: Both User 1 and User 2 should be online.
2. **Access Chat**: Go to the `/chat/:jobId` page for the matched job.
3. **Real-time Messaging**: Send a message from the Buyer. It should instantly appear on the Seller's screen.
4. **Typing Indicators**: Test the "User is typing..." indicator.
5. **Notifications (Bell Icon)**: When the bid was accepted, the seller should have received a notification (red dot on the bell icon). Verify notifications persist on page refresh.

### Flow 6: Job Execution & Completion
1. **Start Job**: As User 2 (Seller), click "Start Job" on the Job Details page. Status changes from `matched` to `in_progress`.
2. **Mark Completed**: Once work is done, the Seller clicks "Request Completion".
3. **Buyer Approves**: The Buyer clicks "Approve Completion". Status changes to `completed`.
4. **Leave Review**: The Buyer leaves a 5-star rating and comment.
5. **Check Profile**: Verify the Seller's public profile now reflects the new completed job count and updated average rating.

### Flow 7: Pricing & Polar Webhooks
1. **Pricing Page**: Go to `/pricing`. Toggle between Monthly and Annual billing to see the 20% discount UI update.
2. **Checkout Redirect**: Click "Subscribe" on a Pro plan. Ensure it redirects to the Polar checkout URL.
3. **Simulate Webhook**: Use `curl` or Postman to send a POST request to `http://localhost:5000/api/payments/webhook` matching the expected Polar payload to test subscription tier upgrades (Requires valid `polar-signature` header).

### Flow 8: Admin Actions
1. **Admin Login**: Log in with an account that has `role: 'admin'`.
2. **Admin Dashboard**: Go to `/admin`.
3. **Ban User**: Test banning a user. Attempt to log in as that banned user; it should be blocked. Unban them.
4. **Resolve Dispute**: Mark a job as `disputed` (via API or UI if hooked up), then test resolving it to `refund_buyer` or `pay_seller`.

## 📁 Comprehensive File & Folder Structure

### Backend (`/backend`)
Core server logic, API endpoints, and database interactions driving the matching platform.

- `server.js`: The main entry point for the backend. Configures Express, initializes middleware (security headers, rate limiting, cors), establishes the MongoDB connection, assigns all route endpoints, and sets up Socket.io for real-time features.
- `.env`: Environment variables configuration file storing secrets like MongoDB URI, JWT keys, and API tokens.
- `package.json` / `package-lock.json`: Manages backend dependencies (Express, Mongoose, Socket.io, etc.) and run scripts.
- **`controllers/`**: Contains the business logic mapped to specific routes.
  - `adminController.js`: Operations for platform administrators, such as fetching all users/jobs, banning users, and settling disputes by refunding buyers or paying sellers.
  - `authController.js`: Handles user registration, login, JWT token generation, password resets, and onboarding logic.
  - `bidController.js`: Manages the lifecycle of a bid, including submission, acceptance (via atomic transactions), withdrawals, and retrieving bids for jobs.
  - `chatController.js`: Manages messaging history fetching between matched parties.
  - `jobController.js`: Handles creating, updating, retrieving, matching, and completing freelance game jobs.
  - `notificationController.js`: Central locus for fetching unread notifications and marking them as read.
  - `paymentController.js` / `polarController.js`: Integrates with the Polar SDK for handling subscription checkouts, maintaining webhook security, and synchronizing user subscription tiers.
  - `reviewController.js`: Handles creating reviews and ratings for sellers after a job is completed.
  - `userController.js`: Logic for fetching and updating user profiles, bios, and specific individual settings.
- **`jobs/`**: Background worker scripts and cron jobs.
  - `autoCompleteJobs.js`: An hourly cron job that automatically releases escrow payments to the seller if a buyer forgets to approve a "review_pending" job after 3 days.
  - `expireJobs.js`: Automatically marks old, inactive open jobs as expired to keep the marketplace feed clear.
  - `syncSubscriptions.js`: A fallback cron job that periodically asks the Polar API for subscription status to protect against missed webhooks.
- **`middleware/`**: Functions that run before a request reaches the controller.
  - `auth.js`: Verifies the presence and validity of JWT tokens to secure private routes.
  - `checkTier.js`: Enforces subscription limits (e.g., maximum jobs a free buyer can post, max bids a free seller can make) and calculates platform fees dynamically.
  - `validate.js`: Returns 400 Bad Request errors if the `express-validator` chains on a route catch any invalid inputs.
- **`models/`**: Mongoose Schema definitions for MongoDB.
  - `Bid.js`: Schema tracking the bid amount, delivery time, and status of a proposal submitted by a seller.
  - `Chat.js`: Schema for persisting real-time message history between buyers and sellers.
  - `Job.js`: Schema defining game requirements, budget, timeline, and dynamic lifecycle statuses (`open`, `pending_payment`, `matched`, `review_pending`, `completed`).
  - `Ledger.js`: Financial schema tracking a seller's total earnings and withdrawable available balance.
  - `Notification.js`: Schema for in-app alert banners directed at specific users.
  - `Review.js`: Schema for post-job text feedback and 1-5 star ratings.
  - `Transaction.js`: Immutable ledger of mock/real payments processed for escrow funding or payouts.
  - `User.js`: Global user schema containing authentication credentials, role typing (`buyer`, `seller`, `admin`), KYC verification, ban statuses, and subscription data.
- **`routes/`**: Express routers that map HTTP verb endpoints (GET, POST, PUT, DELETE) to their respective controller functions and apply middleware. Contains `admin.js`, `auth.js`, `bids.js`, `chats.js`, `jobs.js`, `notifications.js`, `payments.js`, `polar.js`, `reviews.js`, and `users.js`.
- **`utils/`**: Helper files.
  - `email.js`: Configures the Nodemailer transport for sending transactional emails like password resets.
- **`tests/`**: Contains testing suites like `auth.test.js` using Jest/Supertest.

### Frontend (`/frontend`)
The React application handling User Experience, powered by Vite, Tailwind CSS, and Redux.

- `index.html`: The root HTML template that mounts the React app.
- `package.json` / `package-lock.json`: Manages frontend dependencies like React Router, Redux Toolkit, Axios, and Tailwind CSS.
- `vite.config.js`: Configuration for the Vite bundler, local dev server, and proxy aliases.
- `tailwind.config.js` / `postcss.config.js`: Specifies Tailwind CSS themes, Neo-brutalist styling rules, and color palettes.
- `eslint.config.js`: Linting rules to enforce code quality.
- **`src/`**: The main source code directory.
  - `main.jsx`: Bootstraps the React DOM tree, injects the Redux Provider, and links `App.jsx`.
  - `App.jsx`: Houses the React Router `<Routes>` tree, differentiating between public routes and `<PrivateRoute>` wrappers mapping to page components.
  - `index.css` / `App.css`: Global baseline CSS, injecting Tailwind directives and custom animation keyframes.
  - `store.js`: The central Redux Toolkit configuration combining all individual state slices.
  - `theme.js`: Centralized constants for platform theme colors.
  - **`components/`**: Reusable modular UI pieces used across multiple pages.
    - `Navbar.jsx`: The top navigation bar handling mobile responsiveness, user identity display, dynamic linking by role, and the Socket-powered notification dropdown.
    - `ConfirmModal.jsx`: Reusable global "Are you sure?" modal guarding critical actions like logout, bidding, and ending jobs.
    - `EmptyState.jsx` / `Skeleton.jsx`: UX placeholders for loading states and empty data views.
  - **`features/`**: Redux logic broken into specific domains (Auth, Jobs, Notifications) containing state reducers and Thunks (asynchronous API calls).
  - **`hooks/`**: Custom React Hooks.
    - `useSocket.js`: A core global hook that initiates the Socket.io connection, dynamically listens for `notification` or `newMessage` events, and dispatches them straight into Redux state on-the-fly.
  - **`pages/`**: Full route-level React views.
    - `Home.jsx`: The public landing page explaining the platform proposition.
    - `Register.jsx` / `Login.jsx`: Account creation and authentication flows.
    - `ForgotPassword.jsx` / `ResetPassword.jsx` / `ChangePassword.jsx`: Account recovery and security forms.
    - `Dashboard.jsx`: Role-specific central hub summarizing activities, showing buyer's posted jobs or seller's assigned tasks.
    - `AuthCallback.jsx`: Universal OAuth receiver intercepting standardized JWT tokens correctly from providers like Discord.
    - `AdminDashboard.jsx`: A master control panel built with Chart.js generating revenue trajectory graphs and financial ledgers, allowing admins to arbitrate job disputes.
    - `JobListing.jsx` / `JobDetails.jsx`: The public search feed of jobs, and the specific detailed view of one job (which houses the localized inline job-edit fields, the automated Visual Escrow Progress Tracker, bid placing UI, and action buttons).
    - `JobPost.jsx`: Form for generating a new job with specific taxonomies (e.g. `serviceType`).
    - `SellerOnboarding.jsx`: Secondary registration step exclusively for sellers featuring mocked API synchronization links and gamified profile Badges.
    - `SellerProfile.jsx`: Public portfolio of a seller displaying their reviews and performance metrics.
    - `MyBids.jsx`: A centralized view for sellers to monitor all their open, accepted, and rejected bids in one place, allowing voluntary withdrawals.
    - `Checkout.jsx`: The mock redirect page simulating an escrow deposit lock-in after a buyer picks a bid.
    - `Chat.jsx`: The persistent real-time conversation window enriched with image upload features via Multer and active read receipts for visibility.
    - `Pricing.jsx`: Informational grid comparing subscription tiers, wired up to redirect to Polar Checkouts.
    - `TermsOfService.jsx`: Legal boilerplate.
  - **`utils/`**: Shared static functions.
    - `ui-helpers.js`: Functions like `formatTimeAgo` or currency formatter used globally in JSX.

---

## ✨ Feature Explanations

1. **Authentication & Identity System**
   - Implements encrypted user credentials via `bcrypt` and stateless, short-lived JWTs (JSON Web Tokens). It distinguishes between `buyer`, `seller`, and `admin` roles, dynamically modifying the frontend routing and dashboard capabilities based on who is logged in. 
2. **Atomic Marketplace Bidding**
   - Sellers browse open jobs and submit competitive bids (price and timeline). When a buyer accepts a bid, the backend executes a **Mongoose Database Transaction**. This ensures that updating the job status, rejecting all alternative bids, and locking in the accepted bid all succeed together or gracefully fail simultaneously without data corruption.
3. **Escrow & Escrow-Fallback Pipeline**
   - Acceptance moves a job to `pending_payment` rather than instantly starting it. The buyer must first simulate an escrow deposit (`Checkout.jsx`). Once "paid", the status becomes `matched`. Upon job completion, sellers execute a `requestCompletion` network call, triggering a `review_pending` state. A background hourly Node cron job (`autoCompleteJobs.js`) acts as a safeguard—if a buyer vanishes for 3 days without approving, it auto-releases the escrow payout directly to the seller's `Ledger`.
4. **Seller Ledgers**
   - To abstract immediate payouts, seller earnings get natively deposited into an internal platform `Ledger.js` balance minus the platform fee (fee percentages scale down if the seller has a premium subscription).
5. **Real-time Engine (Socket.io)**
   - The platform isn't just static HTTP calls. Through `useSocket.js`, users maintain an active WebSocket connection. Bids placed, jobs started, or chat messages sent emit instantaneous events across the cluster so users see their UI update instantly without refreshing the page.
6. **Robust Administrative Controls**
   - The `AdminDashboard` serves as the ultimate moderation tool. Admins bypass normal workflows to instantly ban user accounts via an API toggle, manually flag Sellers as KYC "verified", or forcefully dissolve deadlocked Jobs ("Disputed" status) by choosing to refund the buyer's escrow or pay the seller forcefully.
7. **Monetization & Webhooks (Polar)**
   - Pricing tiers enforce hard caps on actions (e.g., Free buyers can only post 3 jobs). When upgrading via the Polar checkout, the platform receives a highly secured, signature-verified webhook. An idempotency check (using the `paymentId`) confirms that the backend doesn't double-charge or upgrade someone twice if Polar retries the network request.
8. **Automated Maintenance Jobs**
   - The server maintains itself via Node-Cron. Jobs that remain open with zero activity for long periods are automatically rotated to an `expired` status to ensure the marketplace feed remains relevant and clean.
9. **Advanced UX & Communication Engine**
   - Interfacing with third-parties is supported seamlessly through `AuthCallback.jsx` capturing tokens securely (e.g., Discord). Live chats support read receipts and native image uploads powered by `multer`. Real-time socket events now fire global `react-hot-toast` popups, guaranteeing no missed alerts regardless of what page the user is on. Overall dashboard analytics integrate heavily with `chart.js` to build transparent Ledger systems bridging Buyers with platform administrators.

---

*Note: This architecture transitioned from MUI to Tailwind CSS/DaisyUI in early 2026. Avoid using legacy MUI components.*

---

## 🔧 Recent Improvements Changelog

This section tracks incremental improvements made to the codebase, from simplest to most complex.

### Batch 1 — Security & Bug Fixes (March 2026)

| # | Area | Change |
|---|------|--------|
| 1 | **Auth** | Re-enabled email verification gate at login. Unverified users now get a `403` with a clear message. |
| 2 | **Dispute** | `raiseDispute` now accepts both `matched` and `in_progress` job statuses (previously only `matched`). |
| 3 | **API Errors** | Standardized all `500` responses across all controllers to return `JSON` (`{ message: 'Server error' }`) instead of plain text. |
| 4 | **Frontend** | Removed broken "Learn More" button in `JobListing.jsx` that linked to a non-existent `/about` route. |
| 5 | **Auth** | JWT token expiry is now **uniformly `7d`** across register, login, Discord OAuth, and Google OAuth. |
| 7 | **Model** | Removed the unused `rate` field from `User.js` (was never written or read). |
| 8 | **DevEx** | Added `.env.example` documenting all required and optional environment variables for the backend. |
| 9 | **UI** | Footer copyright year is now dynamic (`new Date().getFullYear()`). |
| 12 | **Frontend** | Added `NotFound.jsx` (404 page) and a `*` catch-all route in `App.jsx`. Unknown URLs no longer show blank screens. |
| 22 | **API** | Rating input is now validated strictly as a number between `1` and `5` in `reviewController.js`. |
| 23 | **Security** | Added `escapeRegex()` helper in `jobController.js` to sanitize user input before MongoDB `$regex` queries — prevents ReDoS attacks. |
| 24 | **Security** | Password strength is now enforced on registration: min 8 chars, 1 number, 1 special character. |
| 42 | **Frontend** | Added global Axios `401` interceptor in `main.jsx` — expired/invalid tokens automatically log the user out and redirect to `/login`. |

### Batch 2 — Input Validation & Security (March 2026)

| # | Area | Change |
|---|------|--------|
| 17 | **API** | `getJobs` now validates budget range — `budgetMax` must exceed `budgetMin`; negative values rejected. |
| 18 | **API** | `getUserReviews` now supports `?page=` and `?limit=` query params. Prevents memory bloat for power users with hundreds of reviews. |
| 19 | **Security** | Multer file upload now validates both MIME type **and** file extension (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`). Prevents spoofed uploads. |
| 21 | **API** | Sellers are now explicitly blocked from bidding on their own jobs via a `buyerId` comparison check. |
| 28 | **Real-time** | Socket `sendMessage` now requires job status to be `matched` or later — prevents premature chat before payment. Emits `chatError` event if violated. |

### Batch 3 — Real-time, Logging & UX (March 2026)

| # | Area | Change |
|---|------|--------|
| 29 | **Real-time** | Added server-side `typing` socket broadcast — the typing event from `Chat.jsx` now actually propagates to the other user in the room via `socket.to(jobId).emit()`. |
| 36 | **Frontend** | Replaced `date-fns` with `dayjs` in `ui-helpers.js`. Added `formatDate()` for full timestamps ("Mar 7 at 2:30 PM") alongside the existing `formatTimeAgo()`. Smaller bundle, chainable API. |
| 42 (extended) | **Frontend** | `MyBids.jsx` now shows `toast.success` / `toast.error` on bid withdrawal. Replaced bare `alert()`. Dates now use `formatDate()` from dayjs. |
| 45 | **Backend** | Created `utils/logger.js` using **Winston**. All `console.log` / `console.error` calls in `server.js` replaced. Logs to console (colored) + `logs/error.log` + `logs/combined.log`. Level is `debug` in dev and `warn` in production. |

### Batch 4 — Presence, UI Polish & Webhook Hardening (March 2026)

| # | Area | Change |
|---|------|--------|
| 30 | **Real-time** | Added server-side online user tracking (`Set`). `userOnline` / `userOffline` events broadcast to all clients on connect/disconnect. `Chat.jsx` header shows a green ● / grey ○ presence dot next to the chat partner's avatar. |
| 31 | **Frontend** | `Skeleton.jsx` upgraded with 4 new types: `'bid-card'`, `'dashboard-row'`, `'profile'`, and multi-line `'line'`. The `count` prop controls number of line skeletons. |
| 33 | **Frontend** | `EmptyState.jsx` now renders inline SVG illustrations (`jobs`, `bids`, `notifications`, `default`) instead of just an emoji. No external image dependencies. |
| 46 | **Backend** | Polar webhook now dedups **subscription** events using a `sub_{eventId}` paymentId marker stored in the Transaction collection — preventing double-upgrades on Polar retries. Console calls replaced with Winston logger. |

### Batch 5 — Reliability, Automation & Performance (March 2026)

| # | Area | Change |
|---|------|--------|
| 47 | **Backend** | `acceptBid` now uses a `withRetry()` helper wrapping MongoDB sessions with up to 3 retries on `TransientTransactionError` / `UnknownTransactionCommitResult`. Prevents silent fund loss on network hiccups. |
| 48 | **Backend** | Dispute resolution (`resolveDispute`) now sends in-app notifications to both the buyer (on `refund_buyer`) and the seller (on `pay_seller`) when an admin resolves a dispute. |
| 65 | **Automation** | New `autoCancelAbandonedJobs.js` cron (every 30 min): if a job stays in `matched` for 24+ hours without being started, it's reset to `open`, the accepted bid is rejected, and both parties are notified. |
| 66 | **Automation** | New `autoEscalateDisputes.js` cron (every 6 hours): if any job sits in `disputed` for 72+ hours unresolved, all admin accounts receive an urgent in-app notification with buyer/seller details. |
| 77 | **Performance** | Added 4 compound MongoDB indexes to the `Job` model: `(status, game)`, `(buyerId, status)`, `(sellerId, status)`, `(status, updatedAt)` — targeting the most common query patterns. |

### Batch 6 — Withdrawals, Job Tags & Feature Completeness (March 2026)

| # | Area | Change |
|---|------|--------|
| 49 | **Backend** | New `Withdrawal` system: sellers request payouts via `POST /api/withdrawals`. Amount is moved from `availableBalance → pendingBalance` on request. Admin approves/rejects/marks-paid via `PUT /api/withdrawals/:id/process`. In-app notifications at each step. Minimum payout enforced via `MIN_PAYOUT_AMOUNT` env var (default ◈10). |
| 51 | **Frontend** | The bid confirm modal in `JobDetails.jsx` already shows fee breakdown (Service Fee + Max Total in the sidebar). This was audited and confirmed intact. |
| 55 | **Frontend** | Save-job via `localStorage` already implemented in `JobDetails.jsx` sidebar. Confirmed working. |
| 57 | **Backend** | `tags` field added to `Job` schema (array of lowercase strings). Indexed at DB level. `getJobs` now accepts `?tags=coaching,ranked` to filter by any matching tag. |

### Batch 7 — Seamless Flow & Security (March 2026)

| # | Area | Change |
|---|------|--------|
| 52 | **Frontend** | Bid acceptance now seamlessly refetches data in `JobDetails.jsx` instead of doing a full `window.location.reload()`, leading to a smoother user experience. |
| 56/58 | **Platform** | Full Job Reporting/Flagging system. New `Report` model and `POST /api/reports` endpoint. Added a "Report this listing" button inside `JobDetails.jsx`'s sidebar. |
| 59 | **Sellers** | Portfolio UI added to `SellerProfile.jsx` along with `POST/DELETE /api/users/portfolio` backend endpoints, letting sellers showcase past jobs, images, and proof links to drastically improve profile conversion rates. |
| 89 | **Security** | Overhauled Authentication to use **JWT Refresh Tokens**: Auth endpoints now issue an HTTP-only 7-day `refreshToken` cookie and a 15-minute `accessToken`. Configured a global Axios interceptor (`main.jsx`) to silently catch `401` errors, rotate the tokens via `POST /api/auth/refresh`, and seamlessly retry failed requests without logging the user out unjustly. |