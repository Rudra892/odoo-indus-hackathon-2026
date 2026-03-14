# 📦 CoreInventory — Inventory Management System

A modular, real-time Inventory Management System built for the 
**Odoo Indus Hackathon 2026** to replace manual registers and 
Excel sheets with a centralized, easy-to-use web app.

---

## 👥 Target Users

- **Inventory Managers** — manage incoming & outgoing stock
- **Warehouse Staff** — transfers, picking, shelving, counting

---

## ✨ Features

- 🔐 JWT Authentication (Login, Signup, OTP Password Reset)
- 📊 Real-time Dashboard with KPI cards
- 📦 Product Management (Create, Edit, Delete, Search)
- 📥 Receipts — Incoming stock with auto stock increase
- 📤 Deliveries — Outgoing stock with auto stock decrease
- 🔄 Internal Transfers — Move stock between warehouses
- 📋 Stock Adjustments — Fix physical vs recorded mismatches
- 📜 Move History — Complete inventory movement ledger
- 🏭 Multi-warehouse support
- ⚠️ Low stock alerts

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React.js + Tailwind CSS |
| Backend    | Node.js + Express.js    |
| Database   | MongoDB + Mongoose      |
| Auth       | JWT + bcryptjs          |
| Icons      | Lucide React            |
| Deployment | Vercel + Render         |

---

## 📁 Project Structure
```
/coreinventory
  /backend
    /models        → MongoDB schemas
    /controllers   → Business logic
    /routes        → API endpoints
    /middleware    → JWT auth middleware
    server.js
  /frontend
    /src
      /pages       → All page components
      /components  → Reusable UI components
      /context     → Auth & Toast context
      /api         → Axios API calls
    App.jsx
```

---

## ⚙️ Run Locally

### Backend
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/coreinventory
# JWT_SECRET=your_secret
# PORT=5000
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000
npm start
```

---

## 🔄 Inventory Flow
```
Vendor → Receipt (stock +) 
       → Transfer (location change)
       → Delivery (stock -)
       → Adjustment (fix mismatch)
       → All logged in Move History
```

---

## 👨‍💻 Built By

**Rudra Patel** , **Shivam Patel** , **Harsh Dudhrejiya** , **Nilesh Gami**

---

## 📄 License

MIT License
