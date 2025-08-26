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

## 🔮 Future Enhancements

- **Invoice Export**: Allow invoices to be downloaded/exported as PDF or Excel.  
- **Email Notifications**: Notify employees when invoices are approved or rejected.  
- **Advanced Reporting**: Add statistics and visual charts for managers (monthly spending, pending approvals, etc.).  
- **Search & Filters**: Implement search and filter options for invoices (by date, status, employee).  
- **Role-Based Access Control (RBAC)**: Add an Admin role for higher-level control (managing managers and system settings).  
- **File Attachments**: Allow employees to attach receipts or supporting documents to invoices.  
- **Mobile-Friendly UI**: Improve responsiveness for mobile and tablet users.  
- **Audit Logs**: Maintain history of invoice actions (created, approved, rejected, modified).  
- **Multi-Language Support**: Provide localization for global usage.  
- **Third-Party Integration**: Integrate with accounting tools (e.g., QuickBooks, Zoho Books).

  

        


