async function loadAddInvoice() {
  const container = document.getElementById("employeeContent");
  container.innerHTML = `
    <h3>Add Invoice</h3>
    <input type="text" id="title" placeholder="Invoice Title" required />
    <input type="date" id="date" required />
    <label>Status:</label>
    <select id="status">
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
    </select>
    <h4>Invoice Items</h4>
    <table id="itemsTable">
      <thead>
        <tr><th>Item Name</th><th>Quantity</th><th>Price</th><th>Action</th></tr>
      </thead>
      <tbody id="itemsBody">
        <tr>
          <td><input type="text" class="item-name" /></td>
          <td><input type="number" class="item-qty" /></td>
          <td><input type="number" class="item-price" /></td>
          <td><button onclick="removeRow(this)">Remove</button></td>
        </tr>
      </tbody>
    </table>
    <div class="actions">
      <button onclick="addRow()">Add Item</button>
      <button onclick="submitInvoice()">Submit Invoice</button>
    </div>
  `;
}

function addRow() {
  const tbody = document.getElementById("itemsBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="item-name" /></td>
    <td><input type="number" class="item-qty" /></td>
    <td><input type="number" class="item-price" /></td>
    <td><button onclick="removeRow(this)">Remove</button></td>
  `;
  tbody.appendChild(row);
}

function removeRow(btn) {
  btn.closest("tr").remove();
}

async function submitInvoice() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  const items = [];
  document.querySelectorAll("#itemsBody tr").forEach(row => {
    const name = row.querySelector(".item-name").value.trim();
    const qty = parseFloat(row.querySelector(".item-qty").value);
    const price = parseFloat(row.querySelector(".item-price").value);
    if (name && qty > 0 && price > 0) {
      items.push({ name, quantity: qty, price });
    }
  });

  if (!title || !date || items.length === 0) {
    return alert("Please fill all fields and add at least one item.");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  try {
    const res = await fetch('/employee/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, status, items, totalAmount })
    });
    if (!res.ok) throw new Error("Failed to submit");
    alert("Invoice submitted successfully!");
    loadMyInvoices();
  } catch (err) {
    alert("Error submitting invoice: " + err.message);
  }
}

let allInvoices = [];

async function loadMyInvoices() {
  const container = document.getElementById("employeeContent");

  try {
    const res = await fetch(`/employee/invoices`); // Server returns only logged-in employee's invoices
    if (!res.ok) throw new Error("Failed to fetch invoices");

    allInvoices = await res.json();

    container.innerHTML = `
      <h3>My Invoices</h3>
      <input type="text" id="searchInput" placeholder="Search invoices..." style="width: 100%; padding: 10px; margin: 10px 0;" oninput="filterInvoices()" />
      <div id="invoiceList"></div>
    `;

    displayInvoices(allInvoices);
  } catch (err) {
    container.innerHTML = `<p>Error loading invoices: ${err.message}</p>`;
  }
}

function filterInvoices() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allInvoices.filter(inv => inv.title.toLowerCase().includes(query));
  displayInvoices(filtered);
}

function displayInvoices(invoices) {
  const invoiceList = document.getElementById("invoiceList");
  invoiceList.innerHTML = "";

  if (invoices.length === 0) {
    invoiceList.innerHTML = "<p>No invoices found.</p>";
    return;
  }

  invoices.forEach(inv => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>${inv.title}</strong> - ₹${inv.totalAmount}</p>
      <p>Status: <span class="badge ${inv.status === 'paid' ? 'paid' : 'pending'}">${inv.status}</span></p>
      <p>Date: ${new Date(inv.date).toLocaleDateString()}</p>
      <div class="actions">
        <button onclick="sendEditRequest('${inv._id}')">Request Edit</button>
      </div>
      <hr />
    `;
    invoiceList.appendChild(div);
  });
}


function loadSettings() {
  const container = document.getElementById("employeeContent");
  container.innerHTML = `
    <h3>Settings</h3>
    <p><strong>Name:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <button onclick="location.href='/logout'">Logout</button>
  `;
}

async function sendEditRequest(invoiceId) {
  try {
    const res = await fetch('/employee/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    });
    if (!res.ok) throw new Error("Failed to send request");
    alert("Edit request sent successfully!");
    loadMyInvoices();
  } catch (err) {
    alert("Error sending edit request: " + err.message);
  }
}

async function editInvoice(invoiceId) {
  try {
    const res = await fetch(`/employee/invoice/${invoiceId}`);
    if (!res.ok) throw new Error("Invoice not found");
    const invoice = await res.json();

    const container = document.getElementById("employeeContent");
    container.innerHTML = `
      <h3>Edit Invoice</h3>
      <input type="text" id="title" value="${invoice.title}" />
      <input type="date" id="date" value="${invoice.date.slice(0,10)}" />
      <label>Status:</label>
      <select id="status">
        <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
      </select>
      <h4>Invoice Items</h4>
      <table id="itemsTable">
        <thead>
          <tr><th>Item Name</th><th>Quantity</th><th>Price</th><th>Action</th></tr>
        </thead>
        <tbody id="itemsBody">
          ${invoice.items.map(item => `
            <tr>
              <td><input type="text" class="item-name" value="${item.name}" /></td>
              <td><input type="number" class="item-qty" value="${item.quantity}" /></td>
              <td><input type="number" class="item-price" value="${item.price}" /></td>
              <td><button onclick="removeRow(this)">Remove</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="actions">
        <button onclick="addRow()">Add Item</button>
        <button onclick="saveEditedInvoice('${invoice._id}')">Save Changes</button>
      </div>
    `;
  } catch (err) {
    alert("Failed to load invoice for editing: " + err.message);
  }
}

async function saveEditedInvoice(invoiceId) {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  const items = [];
  document.querySelectorAll("#itemsBody tr").forEach(row => {
    const name = row.querySelector(".item-name").value.trim();
    const qty = parseFloat(row.querySelector(".item-qty").value);
    const price = parseFloat(row.querySelector(".item-price").value);
    if (name && qty > 0 && price > 0) {
      items.push({ name, quantity: qty, price });
    }
  });

  if (!title || !date || items.length === 0) {
    return alert("Please fill all fields and add at least one item.");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  try {
    const res = await fetch(`/employee/invoice/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, status, items, totalAmount })
    });
    if (!res.ok) throw new Error("Failed to save changes");
    alert("Invoice updated successfully!");
    loadMyInvoices();
  } catch (err) {
    alert("Error updating invoice: " + err.message);
  }
}
