# LoanLink Backend API

A comprehensive RESTful API for LoanLink - a microloan management platform built with Node.js, Express, MongoDB, and Stripe integration.

## 🚀 Live Demo

**Backend API**: [https://b12-a11-ph-assignment-server.vercel.app/](https://b12-a11-ph-assignment-server.vercel.app/)

**Frontend**: [https://loan-link-obyda.netlify.app/](https://loan-link-obyda.netlify.app/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## ✨ Features

- **User Authentication**: Firebase integration with JWT tokens
- **Role-Based Authorization**: Admin, Manager, and Borrower roles
- **Loan Management**: CRUD operations for loan products
- **Application Processing**: Loan application submission and approval workflow
- **Payment Integration**: Stripe payment processing for application fees
- **Search & Filter**: Advanced search and pagination for loans
- **CORS Enabled**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling middleware

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 5.x
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 9.x
- **Authentication**: JWT + Firebase Admin SDK
- **Payment**: Stripe API
- **Security**: bcryptjs, cookie-parser
- **Validation**: express-validator
- **Deployment**: Vercel (Serverless)

---

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Firebase project
- Stripe account

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/loanlink-backend.git
cd loanlink-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5001`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loanlink?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK (optional - for additional verification)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### Production Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secure JWT secret |
| `JWT_EXPIRE` | `7d` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `CLIENT_URL` | `https://loan-link-obyda.netlify.app` |

---

## 🌐 API Endpoints

### Base URL
```
https://b12-a11-ph-assignment-server.vercel.app/api
```

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "photoURL": "https://example.com/photo.jpg",
  "firebaseUid": "firebase_uid_here",
  "role": "borrower"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "borrower",
    "status": "active"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
```

---

### Loan Routes

#### Get All Loans (Public)
```http
GET /api/loans?page=1&limit=10&search=business
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title or category

**Response:**
```json
{
  "success": true,
  "loans": [...],
  "totalPages": 5,
  "currentPage": 1
}
```

#### Get Featured Loans
```http
GET /api/loans/featured
```

#### Get Single Loan
```http
GET /api/loans/:id
```

#### Create Loan (Manager/Admin only)
```http
POST /api/loans
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Small Business Loan",
  "description": "Perfect for entrepreneurs...",
  "category": "Business",
  "interest": 8.5,
  "maxLimit": 50000,
  "requiredDocuments": ["ID Card", "Bank Statement"],
  "emiPlans": ["6 months", "12 months"],
  "images": ["https://example.com/image.jpg"],
  "showOnHome": true
}
```

#### Update Loan (Manager/Admin only)
```http
PUT /api/loans/:id
Authorization: Bearer <token>
```

#### Delete Loan (Manager/Admin only)
```http
DELETE /api/loans/:id
Authorization: Bearer <token>
```

#### Toggle Home Display (Admin only)
```http
PATCH /api/loans/:id/toggle-home
Authorization: Bearer <token>
```

---

### Application Routes

#### Submit Application (Borrower only)
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "loanId": "loan_id_here",
  "firstName": "John",
  "lastName": "Doe",
  "contactNumber": "+1-555-123-4567",
  "nationalId": "A12345678",
  "incomeSource": "Full-time Employment",
  "monthlyIncome": 5000,
  "loanAmount": 15000,
  "reason": "Business expansion",
  "address": "123 Main St, City",
  "notes": "Additional information"
}
```

#### Get All Applications (Admin/Manager)
```http
GET /api/applications?status=Pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Get My Applications (Borrower)
```http
GET /api/applications/my-applications
Authorization: Bearer <token>
```

#### Get Single Application
```http
GET /api/applications/:id
Authorization: Bearer <token>
```

#### Approve Application (Manager/Admin)
```http
PATCH /api/applications/:id/approve
Authorization: Bearer <token>
```

#### Reject Application (Manager/Admin)
```http
PATCH /api/applications/:id/reject
Authorization: Bearer <token>
```

#### Update Payment Status
```http
PATCH /api/applications/:id/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_stripe_payment_id"
}
```

#### Cancel Application (Borrower)
```http
DELETE /api/applications/:id
Authorization: Bearer <token>
```

---

### User Routes (Admin only)

#### Get All Users
```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User Role
```http
PATCH /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### Suspend User
```http
PATCH /api/users/:id/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violation of terms"
}
```

#### Activate User
```http
PATCH /api/users/:id/activate
Authorization: Bearer <token>
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register or login to receive a JWT token
2. Token is also stored in httpOnly cookie
3. Token expires in 7 days (configurable)

---

## 👥 Role-Based Access Control

### Roles

- **Admin**: Full system access
- **Manager**: Can create/manage loans and approve applications
- **Borrower**: Can view loans and submit applications

### Permissions Matrix

| Action | Admin | Manager | Borrower |
|--------|-------|---------|----------|
| View Loans | ✅ | ✅ | ✅ |
| Create Loan | ✅ | ✅ | ❌ |
| Update Loan | ✅ | ✅ (own) | ❌ |
| Delete Loan | ✅ | ✅ (own) | ❌ |
| Submit Application | ❌ | ❌ | ✅ |
| View Applications | ✅ (all) | ✅ (all) | ✅ (own) |
| Approve/Reject | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Suspend Users | ✅ | ❌ | ❌ |

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  photoURL: String,
  role: Enum['admin', 'manager', 'borrower'],
  status: Enum['active', 'suspended'],
  suspendReason: String,
  firebaseUid: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Loan Model
```javascript
{
  title: String,
  description: String,
  category: String,
  interest: Number,
  maxLimit: Number,
  requiredDocuments: [String],
  emiPlans: [String],
  images: [String],
  showOnHome: Boolean,
  createdBy: ObjectId (ref: User),
  createdByEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```javascript
{
  userId: ObjectId (ref: User),
  userEmail: String,
  loanId: ObjectId (ref: Loan),
  loanTitle: String,
  interestRate: Number,
  firstName: String,
  lastName: String,
  contactNumber: String,
  nationalId: String,
  incomeSource: String,
  monthlyIncome: Number,
  loanAmount: Number,
  reason: String,
  address: String,
  notes: String,
  status: Enum['Pending', 'Approved', 'Rejected'],
  applicationFeeStatus: Enum['Paid', 'Unpaid'],
  paymentIntentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
- Go to Vercel Dashboard
- Settings → Environment Variables
- Add all required variables

### Automatic Deployment

Connected to GitHub for automatic deployments:
- Push to `main` branch triggers deployment
- Preview deployments on pull requests

---

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── roleCheck.js         # Role-based authorization
├── models/
│   ├── User.js              # User schema
│   ├── Loan.js              # Loan schema
│   └── LoanApplication.js   # Application schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── loans.js             # Loan CRUD routes
│   └── applications.js      # Application routes
├── .env                     # Environment variables
├── .gitignore              
├── server.js               # Main application file
├── package.json
├── vercel.json             # Vercel configuration
└── README.md
```

---

## 🧪 Testing

### Test API Health
```bash
curl https://b12-a11-ph-assignment-server.vercel.app/
```

### Test Loans Endpoint
```bash
curl https://b12-a11-ph-assignment-server.vercel.app/api/loans
```

### Test with Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://b12-a11-ph-assignment-server.vercel.app/api/applications
```

---

## 🔧 Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 🐛 Common Issues & Solutions

### CORS Errors
**Problem**: Frontend can't access API  
**Solution**: Ensure `CLIENT_URL` environment variable is set correctly in Vercel

### MongoDB Connection Fails
**Problem**: Can't connect to database  
**Solution**: 
1. Check MongoDB Atlas network access (allow 0.0.0.0/0)
2. Verify connection string in environment variables

### Authentication Fails
**Problem**: 401 Unauthorized errors  
**Solution**: 
1. Check JWT_SECRET is set
2. Verify token is being sent in Authorization header
3. Check token hasn't expired

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Tasnimul Hasan Obyda**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the database
- Stripe for payment processing
- Vercel for hosting

---

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.

---

**Backend Live**: [https://b12-a11-ph-assignment-server.vercel.app/](https://b12-a11-ph-assignment-server.vercel.app/)

**Frontend Live**: [https://loan-link-obyda.netlify.app/](https://loan-link-obyda.netlify.app/)
