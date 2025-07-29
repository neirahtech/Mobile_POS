const e = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username, email and password are required' 
      });
    }
    
    // Check if email exists in workers table
    const [worker] = await db.query(
      'SELECT role, branchCode FROM workers WHERE email = ?',
      [email]
    );
    
    if (worker.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email not found in our system. Please contact your administrator.' 
      });
    }
    
    // Check if username already exists in users_auth table
    const [existingUser] = await db.query(
      'SELECT id FROM users_auth WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Username or email already registered' 
      });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Get worker's role and branch code
    const { role, branchCode } = worker[0];
    
    // Insert into users_auth table
    await db.query(
      `INSERT INTO users_auth 
       (username, email, password_hash, role, branchCode) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password_hash, role, branchCode]
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      user: { 
        username, 
        email, 
        role,
        branchCode 
      }
    });
    
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Username and password are required' 
            });
        }
        
        // Find user in users_auth table
        const [users] = await db.query(
            `SELECT ua.*, w.name, w.contact 
             FROM users_auth ua
             LEFT JOIN workers w ON ua.email = w.email
             WHERE ua.username = ?`,
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }
        
        // Prepare user data for token and response
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            branchCode: user.branchCode,
            name: user.name,
            contact: user.contact
        };
        
        // Generate JWT token
        const token = jwt.sign(
            userData,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '8h' }
        );
        
        res.json({ 
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });
        
    } catch (error) {
        console.error('Login error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Login failed. Please try again later.'
        });
    }
};
module.exports = {register,login};