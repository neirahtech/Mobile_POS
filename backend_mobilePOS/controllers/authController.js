const e = require('express');
const db = require('../db');
const jwt= require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Add this line

const register = async (req, res) => {
try {
    const { username, password, email,contact } = req.body;
if (!username || !password || !email ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user already exists
    const [existingUser] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

   //hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // store user data to the database
   const sql = 'INSERT INTO users (username, email,contact ,password) VALUES (?, ?, ?, ?)';
    await db.query(sql, [username, email,contact||null, hashedPassword]); 

    res.status(201).json({ message: 'User registered successfully' });
  }
  catch (error) {
    console.error('Error during registration:', error);
    // Add this for more detailed error output
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: error.stack // Add stack trace for debugging
    });
  }
};
const login = async (req, res) => {
    try {
        const { username, email, password } = req.body; // Add email here
        const [users] = await db.query(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, email]
        );
        console.log(users);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username' });
        }
        const user = users[0];
        // Compare the provided password with the hashed password in the database}
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            return res.status(401).json({ message: 'Invalid password' });
        }
        // Generate JWT token
        const token = jwt.sign({id: user.id }, process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRES});
        console.log(token);
        res.json({
            message: 'Login successful'})
    }

        catch (error) {
            res.status(500).json({
                message: 'Internal server error', error: error.message  });
        }
};
module.exports = {register,login};