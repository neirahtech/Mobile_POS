const db = require('../db');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Remove spaces from phone number
const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').replace(/\s+/g, '');

const client = twilio(accountSid, authToken);

// Function to format Sri Lankan phone numbers to E.164 format
const formatSriLankanNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Handle different Sri Lankan number formats
  if (cleanNumber.startsWith('94')) {
    // Already has country code
    return '+' + cleanNumber;
  } else if (cleanNumber.startsWith('0')) {
    // Local format starting with 0
    return '+94' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 9) {
    // 9 digit number without leading 0
    return '+94' + cleanNumber;
  } else if (cleanNumber.length === 10 && cleanNumber.startsWith('7')) {
    // 10 digit number starting with 7
    return '+94' + cleanNumber;
  } else {
    // Return as is with +94 prefix
    return '+94' + cleanNumber;
  }
};

// Function to validate Sri Lankan mobile number
const isValidSriLankanMobile = (phoneNumber) => {
  // Remove the +94 prefix and check if the remaining number is valid
  const numberWithoutCountryCode = phoneNumber.replace('+94', '');
  
  // Sri Lankan mobile numbers should be 9 digits and start with 7
  return /^7[0-9]{8}$/.test(numberWithoutCountryCode);
};

exports.sendNotification = async (req, res) => {
  try {
    const { customerId, message } = req.body;
    if (!customerId || !message) {
      return res.status(400).json({ message: 'customerId and message are required' });
    }

    // Fetch customer contact number and all necessary details
    const [rows] = await db.execute('SELECT contact, name, dateOfBirth FROM customers WHERE id = ?', [customerId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const customer = rows[0];
    let originalNumber = customer.contact;

    console.log('Original contact number from database:', originalNumber);

    // Format phone number to E.164
    let toNumber = formatSriLankanNumber(originalNumber);
    console.log('Formatted number:', toNumber);

    // Validate the formatted number
    if (!isValidSriLankanMobile(toNumber)) {
      return res.status(400).json({ 
        message: 'Invalid Sri Lankan mobile number format',
        error: `Invalid phone number: ${originalNumber} -> ${toNumber}`,
        details: 'Sri Lankan mobile numbers should be in format +947XXXXXXXX (9 digits after +94, starting with 7)',
        suggestion: 'Please ensure the contact number is a valid Sri Lankan mobile number (e.g., +94771234567 or 0771234567)'
      });
    }

    // Remove this block to allow sending to any number:
    // const VERIFIED_TEST_NUMBER = '+94763601990';
    // if (toNumber !== VERIFIED_TEST_NUMBER) {
    //   console.log(`Trial account: Redirecting SMS from ${toNumber} to verified number ${VERIFIED_TEST_NUMBER}`);
    //   toNumber = VERIFIED_TEST_NUMBER;
    // }

    if (!fromNumber.startsWith('+')) {
      return res.status(500).json({ 
        message: 'Twilio phone number configuration is incorrect', 
        fromNumber: fromNumber 
      });
    }

    // Replace template placeholders with customer data
    let finalMessage = message;
    if (customer) {
      // Replace common placeholders
      finalMessage = finalMessage
        .replace(/\{name\}/g, customer.name || 'Customer')
        .replace(/\{year\}/g, new Date().getFullYear())
        .replace(/\{discount\}/g, '10%') // Always use 10% or your preferred default
        .replace(/\{birthday\}/g, customer.dateOfBirth || '');

      // Clean up message for Twilio
      finalMessage = finalMessage
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters (emojis, etc.)
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    }

    // Validate message length and content
    if (!finalMessage || !finalMessage.trim()) {
      return res.status(400).json({
        message: 'Message cannot be empty after cleaning. Please remove emojis or special characters.',
        originalMessage: message,
        cleanedMessage: finalMessage
      });
    }
    if (finalMessage.length > 1600) {
      return res.status(400).json({
        message: 'Message is too long',
        length: finalMessage.length,
        cleanedMessage: finalMessage
      });
    }

    // Debug log
    console.log('Sending SMS:', { 
      originalNumber, 
      toNumber, 
      fromNumber, 
      messageLength: finalMessage.length,
      message: finalMessage.substring(0, 100) + (finalMessage.length > 100 ? '...' : '')
    });

    // Send SMS via Twilio
    try {
      const twilioMsg = await client.messages.create({
        body: finalMessage,
        from: fromNumber,
        to: toNumber
      });
      
      console.log('Message sent successfully:', twilioMsg.sid);
      
      res.json({
        message: 'Notification sent successfully',
        messageId: twilioMsg.sid,
        details: {
          originalNumber,
          sentToNumber: toNumber,
          fromNumber,
          messageLength: finalMessage.length
        }
      });
    } catch (twilioError) {
      // Log Twilio error details
      console.error('Twilio API error:', {
        message: twilioError.message,
        code: twilioError.code,
        moreInfo: twilioError.moreInfo,
        status: twilioError.status
      });
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to send notification';
      if (twilioError.code === 21211) {
        userMessage = `Invalid phone number format: ${toNumber}. Please check the contact number.`;
      } else if (twilioError.code === 21614) {
        userMessage = `Cannot send to unverified number: ${toNumber}. In trial mode, you can only send to verified numbers.`;
      } else if (twilioError.code === 21408) {
        userMessage = `Permission denied: Cannot send to ${toNumber}. This number may not be verified in your trial account.`;
      }
      
      res.status(500).json({
        message: userMessage,
        error: twilioError.message,
        twilioCode: twilioError.code,
        twilioMoreInfo: twilioError.moreInfo,
        twilioStatus: twilioError.status,
        details: {
          originalNumber,
          formattedNumber: toNumber,
          fromNumber,
          cleanedMessage: finalMessage
        }
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: err.message,
      details: err.stack
    });
  }
};