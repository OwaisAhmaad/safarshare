# SafarShare - Backend API

SafarShare is a robust, backend-only carpooling platform built with NestJS, offering a seamless experience for both drivers (vehicle owners) and passengers.

## 🚀 Features

### 🔐 Authentication & Security
- **OTP-based Registration & Login**: Sign in securely using your phone number and OTP.
- **JWT Authentication**: Secure user authentication and authorization using JSON Web Tokens.
- **Role-Based Access (RBAC)**: Distinct permissions for `USER` and `ADMIN`.

### 🚗 Core Functionality
- **User Profiles**: Manage profiles and perform CNIC verification.
- **Vehicle Management**: Add and manage vehicles for carpooling.
- **Trip Lifecycle**:
    - Post trips with source, destination, price, and available seats.
    - Search for active trips based on route and date.
    - Cancel trips when plans change.
- **Booking System**: Request seats on trips and manage pending requests (Accept/Reject).
- **Ratings & Reviews**: Share feedback and rate your travel experience.

### 📍 Real-time Tracking & Notifications
- **Live Location Tracking**: Real-time vehicle tracking during active trips using **Socket.io** and **Redis**.
- **Instant Notifications**: Stay updated with booking alerts and trip status changes.

### 🛠️ Admin Dashboard
- **Admin Management**: Dedicated endpoints for overseeing users, vehicles, and trips.
- **Analytics**: Key performance metrics for the platform.

### 💳 Payments
- **Transaction Tracking**: Secure tracking for bookings and payment statuses.

---

## 🛠️ Tech Stack
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (TypeORM)
- **Caching/Real-time**: Redis
- **Comms**: Socket.io (WebSockets)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL**
- **Redis**

### 1. Clone the repository
```bash
git clone https://github.com/OwaisAhmaad/safarshare.git
cd safarshare
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your local configuration. Use the following as a template:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=safarshare

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=3600s

# App Configuration
APP_URL=http://localhost:3000
```

### 4. Database Setup
Create a database named `safarshare` in your PostgreSQL instance.

### 5. Running the Application
```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 6. API Documentation
Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:3000/api/docs`

---

## 📡 WebSocket Events (Location Tracking)
- **Join Trip**: `owner:join_trip` / `passenger:join_trip` (payload: `{ "bookingId": number }`)
- **Update Location**: `location:update` (payload: `{ "bookingId": number, "lat": number, "lng": number }`)
- **Location Broadcast**: `location:updated` (emitted to room)

---

## 🤝 Contributing
Feel free to open issues or submit pull requests for any improvements!
