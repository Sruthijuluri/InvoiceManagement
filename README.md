# Invoice Management Application

## 📌 Overview
The **Invoice Management Application** is a role-based web platform built with **Node.js, Express, MongoDB, and EJS**.  
It helps organizations streamline invoice handling with separate dashboards for **Managers** and **Employees**, supporting invoice creation, approvals, and employee management.

---

## ✨ Features

### 👨‍💼 Employee Dashboard
- Secure **signup/login** functionality.
- Create and submit new invoices.
- View a list of personal invoices.
- Update personal profile information.

### 🧑‍💻 Manager Dashboard
- View all submitted invoices.
- Approve or reject invoices.
- Manage employees (add, edit, delete).
- Add new employees who can log in directly without signing up again.


---


## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Frontend:** EJS (server-side rendering), HTML, CSS, JavaScript  
- **Database:** MongoDB (Mongoose ORM)  
- **Authentication:** Express sessions / bcrypt for password hashing

---
## 🚀 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Sruthijuluri/InvoiceManagement.git
   cd invoice-management-app

2.Install Dependencies:
  npm install

3.Setup environment variables in a .env file:
  MONGO_URI=your_mongodb_connection_string
  SESSION_SECRET=your_secret_key
  PORT=3000

4.Start the server:
  npm start

5.Open the app in your browser:
  http://localhost:3000

---

###✅ Future Enhancements
-Email notifications for invoice approval/rejection.
-Advanced reporting and analytics.
-Export invoices as PDF.
-Role-based access for admins.
  

        


