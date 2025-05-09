const express = require("express");
const cors = require("cors");
const exe = require("./conn.js"); // DB helper (MySQL connection)

const app = express();
app.use(cors());
app.use(express.json()); // Accept JSON bodies

// Helper: Calculate subscription end date
const getEndDate = (startDate, duration) => {
  const date = new Date(startDate);
  if (duration === '1_month') date.setMonth(date.getMonth() + 1);
  else if (duration === '1_year') date.setFullYear(date.getFullYear() + 1);
  return date;
};

// Helper to determine status
const getStatus = (endDate) => {
    const today = new Date();
    return today <= new Date(endDate) ? 'Active' : 'Expired';
  };


// Register route
app.post('/register', async (req, res) => {
  try {
    const { email, password, startdate, subscriptionDuration } = req.body;

    if (!email || !password || !startdate || !subscriptionDuration) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const subscriptionStart = new Date(startdate);
    const subscriptionEnd = getEndDate(startdate, subscriptionDuration);
    const status = getStatus(subscriptionEnd);
    
    
 
    const sql = `INSERT INTO users (email, password, subscriptionStart, subscriptionEnd ,status) VALUES (?, ?, ?, ?,?)`;
    const values = [email, password, subscriptionStart, subscriptionEnd,status];
    
    await exe(sql, values);

    return res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// Login route

app.post('/loginform', async (req, res) => {
    try {
      const { email, password } = req.body;
      const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
      const result = await exe(sql, [email, password]);
  
      if (result.length > 0) {
        return res.json({ success: true, message: "Login successful" });
      } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Status route
  app.get('/status/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const sql = `SELECT subscriptionEnd FROM users WHERE email = ?`;
      const result = await exe(sql, [email]);
  
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const subscriptionEnd = result[0].subscriptionEnd;
      const status = getStatus(subscriptionEnd);
  
      res.json({
        success: true,
        status,
        subscriptionEnd,
      });
    } catch (err) {
      console.error("Status fetch error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
