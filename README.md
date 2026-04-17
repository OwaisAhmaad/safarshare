# SafarShare - Ride-Sharing Platform

SafarShare is a robust, full-stack ride-sharing platform built with NestJS, offering a seamless experience for both drivers (vehicle owners) and passengers.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure user authentication and authorization.
- **Role-Based Access (RBAC)**: Distinct roles for Users and Administrators.
- **Admin Security**: Automatic session invalidation for blocked users and restricted access to administrative endpoints.

### 🚗 Core Functionality
- **User Profiles**: Manage profiles with CNIC verification.
- **Vehicle Management**: Drivers can add vehicles for review and verification by the admin.
- **Trip Lifecycle**:
    - Create, Search, and Book trips.
    - Start and Complete trips with real-time status updates.
- **Ratings & Reviews**: Users can rate their experience, influencing driver/passenger reputations.

### 📍 Real-time Tracking & Notifications
- **Live Location Tracking**: Real-time vehicle tracking during active trips using **Socket.io** and **Redis** for efficient, high-frequency updates.
- **Instant Notifications**: WebSocket-based notifications for booking requests, status changes, and messages.

### 🛠️ Admin Dashboard
- **User Management**: View, filter, and block/unblock users.
- **Verification System**: Workflow for manual CNIC and vehicle verification.
- **Dispute Resolution**: Automated flagging of problematic trips (low ratings) for admin intervention.
- **Analytics**: Key performance metrics (Users, Trips, Revenue, Commissions).

### 💳 Payments
- **Stripe Integration**: Secure payment processing for bookings.
- **Wallet System**: Track earnings and platform commissions.

## 🛠️ Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (TypeORM)
- **Caching/Real-time**: Redis
- **Comms**: Socket.io (WebSockets)
- **Payments**: Stripe
- **Validation**: class-validator, class-transformer

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` (use `.env.example` as a template).

### Running the App
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

## 📡 WebSocket Events (Location Tracking)
- **Join Trip**: `owner:join_trip` / `passenger:join_trip` (params: `{ "bookingId": "..." }`)
- **Update Location**: `location:update` (params: `{ "bookingId": "...", "lat": 0, "lng": 0 }`)
- **Location Broadcast**: `location:updated` (emitted to subscribers)

## 🤝 Contributing
Feel free to open issues or submit pull requests for improvements.
