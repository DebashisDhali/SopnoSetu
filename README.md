# SopnoSetu (Dream Bridge) 🌉

SopnoSetu is a Bangladesh-focused online admission mentorship platform connecting university admission candidates with verified university seniors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a cloud URI)

### Phase 1: Backend Setup

1. Open a terminal and navigate to the server:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Seed the Database** (Important for first run!):
   ```bash
   node seeder.js
   ```
   *This will create Admin, Mentor, and Student accounts.*
4. Start the server:
   ```bash
   npm run dev
   ```
   *Backend running on http://localhost:5000*

### Phase 2: Frontend Setup

1. Open a **new** terminal and navigate to the client:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
   *Frontend running on http://localhost:3000*

### 📋 Test Credentials (Created by Seeder)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `123456` |
| **Mentor (Verified)** | `arafat@du.ac.bd` | `123456` |
| **Student** | `karim@gmail.com` | `123456` |

### 🛠 Troubleshooting
- **MongoDB Error**: Ensure MongoDB is running (`mongod`). The app connects to `mongodb://localhost:27017/sopnosetu`.
- **Login Failed**: Make sure the Backend is running on port 5000.
