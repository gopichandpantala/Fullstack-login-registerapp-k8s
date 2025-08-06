const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./config/db');
const userRoutes = require('./routes/user'); // ✅ fixed filename

app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);  // Routes

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
