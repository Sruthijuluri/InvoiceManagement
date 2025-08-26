// ========== MANAGER DASHBOARD JS ========== 

let allManagerInvoices = [];

async function showInvoices() {
  const res = await fetch("/manager/invoices");
  allManagerInvoices = await res.json();

  const container = document.getElementById("managerContent");
  container.innerHTML = `
    <h3>All Invoices</h3>
    <input type="text" id="searchInput" placeholder="Search invoices..." style="width: 100%; padding: 10px; margin: 10px 0;" oninput="filterManagerInvoices()" />
    <div id="invoiceList"></div>
  `;

  renderManagerInvoices(allManagerInvoices);
}

function filterManagerInvoices() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allManagerInvoices.filter(inv =>
    inv.title.toLowerCase().includes(query)
  );
  renderManagerInvoices(filtered);
}

function renderManagerInvoices(invoices) {
  const invoiceList = document.getElementById("invoiceList");
  invoiceList.innerHTML = "";

  if (invoices.length === 0) {
    invoiceList.innerHTML = "<p>No invoices found.</p>";
    return;
  }

  invoices.forEach(invoice => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>${invoice.title}</strong> - ₹${invoice.totalAmount}</p>
      <p>Status: <span class="badge ${invoice.status === 'paid' ? 'paid' : 'pending'}">${invoice.status}</span></p>
      <hr/>
    `;
    invoiceList.appendChild(div);
  });
}


// Fetch all employees
async function showEmployees() {
  const res = await fetch("/manager/employees");
  const employees = await res.json();

  const container = document.getElementById("managerContent");
  container.innerHTML = "<h3>Employees</h3>";
  employees.forEach(emp => {
    const div = document.createElement("div");
    div.innerHTML = `<p>${emp.username} (${emp.email})</p>`;
    container.appendChild(div);
  });
}

// Fetch pending requests and show buttons to approve/reject
async function showRequests() {
  const res = await fetch("/manager/requests");
  const requests = await res.json();

  const container = document.getElementById("managerContent");
  container.innerHTML = "<h3>Pending Edit Requests</h3>";

  for (const req of requests) {
    const invoiceRes = await fetch(`/manager/invoice/${req.invoiceId}`);
    const invoice = await invoiceRes.json();

    const employeeRes = await fetch(`/manager/employee/${req.employeeId}`);
    const employee = await employeeRes.json();

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>Invoice:</strong> ${invoice.title}</p>
      <p><strong>Requested by:</strong> ${employee.username} (${employee.email})</p>
      <button onclick="approveRequest('${req._id}')">Approve</button>
      <button onclick="rejectRequest('${req._id}')">Reject</button>
      <hr/>
    `;
    container.appendChild(div);
  }
}

// Approve request and notify employee, then auto-remove it from list
async function approveRequest(id) {
  const res = await fetch(`/manager/requests/${id}/approve`, { method: "POST" });
  if (res.ok) {
    alert("Request approved and employee notified");
  } else {
    alert("Failed to approve request");
  }
  showRequests();
}

// Reject request and notify employee, then auto-remove it from list
async function rejectRequest(id) {
  const res = await fetch(`/manager/requests/${id}/reject`, { method: "POST" });
  if (res.ok) {
    alert("Request rejected and employee notified");
  } else {
    alert("Failed to reject request");
  }
  showRequests();
}

// Show current manager info
function showSettings() {
  const container = document.getElementById("managerContent");
  container.innerHTML = `
    <h3>Settings</h3>
    <p><strong>Name:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <button onclick="window.location.href='/logout'">Logout</button>
  `;
}
