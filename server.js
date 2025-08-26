const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const Invoice = require('./models/Invoice');
const User = require('./models/User');
const Request = require('./models/Request');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'invoice-secret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.render('login', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.redirect('/');
});

app.get('/signup', (req, res) => {
  res.render('signup', { user: req.session.user });
});

app.post('/signup', async (req, res) => {
  const { username, email, password, role, dob, mobile } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role, dob, mobile });
    await newUser.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Signup failed');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send('Incorrect password');

  req.session.user = {
    _id: user._id,
    role: user.role,
    username: user.username,
    email: user.email
  };

  if (user.role === 'manager') {
    res.redirect('/manager/dashboard');
  } else {
    res.redirect('/employee/dashboard');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/employee/dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');
  res.render('employee/dashboard', { user: req.session.user });
});

app.get('/employee/add-invoice', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');
  res.render('employee/add-invoice', { user: req.session.user });
});

app.post('/employee/invoices', async (req, res) => {
  const { title, date, status, items } = req.body;
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  await new Invoice({
    title,
    date,
    status,
    items,
    totalAmount,
    employeeId: req.session.user._id
  }).save();

  res.redirect('/employee/view-invoices');
});

app.get('/employee/view-invoices', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');

  try {
    const employeeId = req.session.user._id;
    const invoices = await Invoice.find({ employeeId });
    const requests = await Request.find({ employeeId });

    const requestMap = {};
    requests.forEach(req => {
      requestMap[req.invoiceId] = req.status;
    });

    res.render('employee/view-invoices', {
      user: req.session.user,
      invoices,
      requestMap
    });
  } catch (err) {
    console.error('Error loading invoices:', err);
    res.status(500).send('Internal server error');
  }
});

app.get('/employee/profile', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');
  res.render('employee/profile', { user: req.session.user });
});

app.get('/employee/edit-invoice/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');

  try {
    const invoice = await Invoice.findById(req.params.id);
    const employeeId = req.session.user._id;

    if (!invoice || invoice.employeeId.toString() !== employeeId) {
      return res.status(403).send('Access denied');
    }

    const approvedRequest = await Request.findOne({
      invoiceId: req.params.id,
      employeeId,
      status: 'approved'
    });

    if (!approvedRequest) {
      return res.send('Edit access not granted. Please request access again.');
    }

    res.render('employee/edit-invoice', { user: req.session.user, invoice });
  } catch (err) {
    console.error("Error loading invoice:", err);
    res.status(500).send('Error loading invoice');
  }
});

app.post('/employee/edit-invoice/:id', async (req, res) => {
  try {
    const { title, date, status } = req.body;
    let { items } = req.body;

    if (!Array.isArray(items)) {
      items = Object.values(items);
    }

    if (!items || !items.every(i => i.name && i.quantity && i.price)) {
      return res.status(400).send("Invalid form data");
    }

    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price));
    }, 0);

    await Invoice.findByIdAndUpdate(req.params.id, {
      title,
      date,
      status,
      items,
      totalAmount
    });

    await Request.findOneAndDelete({
      invoiceId: req.params.id,
      employeeId: new mongoose.Types.ObjectId(req.session.user._id),
      status: 'approved'
    });

    res.redirect('/employee/view-invoices');
  } catch (err) {
    console.error("Error editing invoice:", err);
    res.status(500).send("Something went wrong");
  }
});

app.post('/employee/update-profile', async (req, res) => {
  const { mobile, dob } = req.body;
  const userId = req.session.user._id;

  try {
    await User.findByIdAndUpdate(userId, { mobile, dob });
    // Update session if needed
    req.session.user.mobile = mobile;
    req.session.user.dob = dob;
    res.redirect('/employee/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
});


app.post('/employee/request-edit/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employee') return res.redirect('/login');

  try {
    const invoiceId = req.params.id;
    const employeeId = req.session.user._id;

    const existing = await Request.findOne({ invoiceId, employeeId, status: 'pending' });
    if (existing) {
      return res.send('Request already sent for this invoice.');
    }

    await new Request({
      invoiceId,
      employeeId,
      status: 'pending'
    }).save();

    res.redirect('/employee/view-invoices');
  } catch (err) {
    console.error('Failed to send edit request:', err);
    res.status(500).send('Failed to send request.');
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/');
}

function ensureManager(req, res, next) {
  if (req.session.user && req.session.user.role === 'manager') return next();
  return res.redirect('/');
}

function ensureEmployee(req, res, next) {
  if (req.session.user && req.session.user.role === 'employee') return next();
  return res.redirect('/');
}

app.get('/manager/dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'manager') return res.redirect('/login');
  res.render('manager/dashboard', { user: req.session.user });
});

app.get('/manager/invoices-view', ensureManager, async (req, res) => {
  const invoices = await Invoice.find().populate('employeeId', 'username email');
  res.render('manager/view-invoices', { user: req.session.user, invoices });
});

app.get('/manager/employees-view', ensureManager, async (req, res) => {
  const employees = await User.find({ role: 'employee' });
  res.render('manager/view-employees', { user: req.session.user, employees });
});

app.post('/manager/remove-employee/:id', ensureManager, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Mark invoices as coming from past employee
    await Invoice.updateMany(
      { employeeId },
      { $set: { isPastEmployee: true } }
    );

    // Delete the employee record
    await User.findByIdAndDelete(employeeId);

    res.redirect('/manager/employees-view');
  } catch (err) {
    console.error("Failed to remove employee:", err);
    res.status(500).send("Failed to remove employee.");
  }
});

app.get('/manager/view-requests', ensureManager, async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' });

    const enriched = await Promise.all(requests.map(async (req) => {
      const invoice = await Invoice.findById(req.invoiceId);
      const employee = await User.findById(req.employeeId);
      return {
        _id: req._id,
        invoiceTitle: invoice?.title || 'N/A',
        employeeName: employee?.username || 'N/A',
        employeeEmail: employee?.email || 'N/A'
      };
    }));

    res.render('manager/view-requests', {
      user: req.session.user,
      requests: enriched
    });
  } catch (err) {
    console.error("Error loading requests:", err);
    res.status(500).send("Failed to load requests.");
  }
});

app.post("/manager/requests/:id/approve", async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect('/manager/view-requests');
});

app.post("/manager/requests/:id/reject", async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect('/manager/view-requests');
});

app.get('/manager/add-employee', ensureManager, (req, res) => {
  res.render('manager/add-employee', { user: req.session.user });
});

app.post('/manager/add-employee', ensureManager, async (req, res) => {
  const { username, email, password, dob, mobile } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'employee',
      dob,
      mobile
    });

    await newUser.save();
    res.redirect('/manager/employees-view');
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).send("Failed to add employee.");
  }
});

app.get('/manager/stats', ensureManager, async (req, res) => {
  try {
    const paidCount = await Invoice.countDocuments({ status: 'paid' });
    const pendingCount = await Invoice.countDocuments({ status: 'pending' });

    const companyBreakdown = await Invoice.aggregate([
      {
        $group: {
          _id: "$title",
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.render('manager/stats', {
      user: req.session.user,
      paidCount,
      pendingCount,
      companyBreakdown
    });
  } catch (err) {
    console.error("Error loading stats:", err);
    res.status(500).send("Error loading stats");
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
