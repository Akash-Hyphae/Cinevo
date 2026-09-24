# Cinevo — Cinema Show & Seat Booking Platform

> A production-grade movie and cinema show booking web application built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with **JavaScript only**, featuring atomic seat locking, race condition prevention, 5-minute reservation countdowns, Razorpay payment verification, and digital QR admission passes.

---

## 1. Brand Identity & Visual Design

**Cinevo** introduces an original visual identity designed from the ground up:
* **Logo Concept:** Ticket silhouette with play geometry and dual-notch perforation, rendered in an electric violet and magenta palette.
* **Palette:** Deep charcoal/navy background (`#090b10`), electric violet accent (`#8b5cf6`), subtle glassmorphism (`backdrop-blur-md`), and typography set in **Plus Jakarta Sans**, **Syne**, and **JetBrains Mono**.
* **Anti-AI Slop & Zero-Pill Discipline:** Formats, genres, certificates, and runtime metadata are presented cleanly as unboxed editorial text and structured badges.

---

## 2. Preventing Race Conditions & The 5-Minute Seat Lock System

The most critical requirement of Cinevo is guaranteeing that **two users can NEVER successfully reserve or book the same seat for the same show**, even if both users click at the exact same millisecond.

### Implementation Architecture:
1. **Backend-Level Atomic Lock Engine (`/server/db/dataStore.js`):**
   - Every lock acquisition runs through a per-show asynchronous synchronization mutex.
   - When a user selects seats, the server verifies both permanent bookings and active locks:
     ```javascript
     if (existingLock.status === 'CONVERTED_TO_BOOKING') {
       throw { status: 409, message: `Seat ${seatId} has already been booked.` };
     }
     if (existingLock.status === 'LOCKED' && new Date(existingLock.lockExpiresAt) > now && existingLock.userId !== userId) {
       throw { status: 409, message: `Seat ${seatId} is currently reserved by another customer.` };
     }
     ```
   - If any requested seat is contested, the entire batch lock is atomically rejected with **HTTP 409 Conflict**.
   - If all seats are available, the server sets `status: 'LOCKED'`, `lockedAt: new Date()`, and `lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000)`.

2. **5-Minute TTL & Automatic Expiration:**
   - Client and server compute expiration strictly against the UTC timestamp `lockExpiresAt`.
   - Any lock where `lockExpiresAt <= now` is treated as immediately available, both in live queries and in the background sweeping process.

3. **Double-Click Idempotency:**
   - Booking creation and payment verification accept an `idempotencyKey`. If network retries or double-clicks occur, the existing record is safely returned without duplicate charges or seat allocations.

---

## 3. Technology Stack (JavaScript Only)

* **Backend:** Node.js, Express.js (`server/app.js`, `server/server.js`)
* **Database Layer:** MongoDB / Mongoose models (`server/models/`) + In-Memory Transactional Datastore with atomic operations
* **Authentication:** JWT (`jsonwebtoken`) with role-based access control (`USER`, `ADMIN`)
* **Password Hashing:** `bcryptjs` (salt rounds: 10)
* **Frontend:** React 19 + Vite (pure `.jsx` and `.js`)
* **Routing:** React Router (`react-router-dom`)
* **Styling:** Tailwind CSS
* **QR Codes & Confetti:** `qrcode`, `canvas-confetti`

---

## 4. Default Test Accounts

| Role | Email | Password |
|---|---|---|
| **Demo User** | `user@cinevo.com` | `Password123!` |
| **Demo Admin** | `admin@cinevo.com` | `AdminSecret123!` |

*Quick login buttons are built directly into the Sign-In modal for instant one-click testing.*

---

## 5. REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create account and receive verification token
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET /api/auth/verify-email/:token` — Verify user email address
* `POST /api/auth/resend-verification` — Re-issue verification link
* `GET /api/auth/me` — Get authenticated user details (Protected)
* `GET /api/auth/mailbox` — Inspect verification emails in development

### Movies & Shows (`/api/movies`, `/api/shows`, `/api/cinemas`)
* `GET /api/movies` — List movies (filters: `genre`, `language`, `format`, `status`, `search`)
* `GET /api/movies/:id` — Get movie details with format tags
* `GET /api/cinemas` — List cinemas (filter: `city`)
* `GET /api/cinemas/cities` — List supported cinema hubs (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai)
* `GET /api/shows` — List shows with filters (`movieId`, `cinemaId`, `city`, `date`)
* `GET /api/shows/:id` — Detailed show breakdown

### Seat Management (`/api/shows/:showId`)
* `GET /api/shows/:showId/seats` — Real-time seat matrix with states (`AVAILABLE`, `LOCKED`, `BOOKED`, `SELECTED_BY_ME`)
* `POST /api/shows/:showId/lock-seats` — Atomically lock seats for 5 minutes (Protected, returns 409 on conflict)
* `POST /api/shows/:showId/release-seats` — Release locked seats

### Bookings & Payments (`/api/bookings`, `/api/payments`)
* `POST /api/bookings` — Create booking summary with authoritative pricing
* `GET /api/bookings/:id` — Get ticket pass and entry QR code
* `GET /api/bookings/my-bookings` — List user's booking history
* `POST /api/bookings/:id/cancel` — Cancel booking and release seats
* `GET /api/payments/config` — Get active Razorpay public key and configuration
* `POST /api/payments/create-order` — Create Razorpay order (via official Razorpay API)
* `POST /api/payments/verify` — Cryptographically verify HMAC-SHA256 signature and confirm booking

---

## 6. Razorpay Integration & Full Verification

Cinevo integrates the official **Razorpay Checkout modal** (`https://checkout.razorpay.com/v1/checkout.js`) with complete backend cryptographic verification:

1. **Client-Side Trigger:**
   - On the Booking Summary page, clicking **"Pay ₹... via Razorpay"** initiates order creation via `/api/payments/create-order`.
   - The official Razorpay modal opens displaying cinema branding, movie title, seat details, and user info.
   - Upon successful payment in the modal, Razorpay delivers `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.

2. **Cryptographic Server Verification:**
   - The frontend forwards the response to `/api/payments/verify`.
   - The server computes the expected HMAC-SHA256 signature:
     ```javascript
     const generatedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(`${orderId}|${paymentId}`)
       .digest('hex');
     ```
   - Only when signatures match (and double-checked against timing-safe buffer comparisons) does the server atomically confirm the booking, mark seats as `BOOKED`, and issue the QR pass.
   - Any signature tampering or mismatch is rejected with **HTTP 400**.

3. **Configured Environment Variables:**
   - `RAZORPAY_KEY_ID`: Your Razorpay Test Key ID (e.g. `rzp_test_...`)
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret Key

---

## 7. Running the Integration Tests

To run the backend test suite verifying atomic concurrency, 5-minute TTL expiration, idempotency, and payment conversion:

```bash
node server/tests/concurrencyAndBooking.test.js
```
