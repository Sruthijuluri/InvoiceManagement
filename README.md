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

## 📂 Project Structure
invoice-management-app/
│── server.js # Main entry point
│── package.json
│── config/ # DB and auth configs
│── models/ # Mongoose schemas
│── routes/ # Express routes
│── controllers/ # Business logic
│── views/ # EJS templates
│ ├── employee/ # Employee dashboard pages
│ ├── manager/ # Manager dashboard pages
│ └── auth/ # Login / signup pages
│── public/ # CSS, JS, static assets
