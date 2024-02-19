//routes/index.js
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const axios = require('axios');
const uuid = require('uuid');
const db = require("../config/db");

// Add body-parser middleware
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  // Check if the session is active
  if (req.session.isAuthenticated) {
    // If the session is active, redirect to dashboard
    res.redirect('/dashboard');
  } else {
    // If the session is not active, render the login page
    res.render('login', { mobile_number: req.session.mobile_number});
  }
});

router.post('/get-otp', (req, res) => {
  const enteredmobile_number = req.body.mobile_number;

  // Check if the mobile number exists in the database
  const sqlCheckMobile = 'SELECT * FROM users WHERE mobile_number = ?';
  db.query(sqlCheckMobile, [enteredmobile_number], (err, result) => {
    if (err) {
      console.error('Error checking mobile number:', err);
      res.render('login', { error: 'An error occurred. Please try again.' });
    } else {
      if (result.length > 0) {
        // Mobile number exists, initiate session and redirect to verify OTP
        const user_id = result[0].id; // Assuming the primary key is named 'id'
        const username = result[0].username;
        req.session.isAuthenticated = true;
        req.session.mobile_number = enteredmobile_number;
        req.session.username = username;
        req.session.user_id = user_id; // Store user_id in the session
        res.redirect('/verify-otp');
      } else {
        // Mobile number doesn't exist, treat as new user
        // Generate a new OTP and proceed with registration
         
        const generatedOTP = '123456'; // For simplicity
        const sessionId = uuid.v4(); // Generate UUID for session ID
        console.log("Session UUID:", sessionId); // Print session UUID to the terminal

         // Store mobile number, OTP, uuid in the database
         const sqlInsert = 'INSERT INTO users (mobile_number, otp, uuid) VALUES (?, ?, ?)';
         db.query(sqlInsert, [enteredmobile_number, generatedOTP, sessionId], (err, result) => {
           if (err) {
              console.error('Error inserting new user:', err);
              res.render('login', { error: 'An error occurred. Please try again.' });
           } else {
            // Initiate session and redirect to verify OTP
             req.session.isAuthenticated = true;
             req.session.mobile_number = enteredmobile_number;
             req.session.user_id = result.insertId; // Store the newly inserted user_id in the session
             res.redirect('/verify-otp');
             
           }
         });
      }
    }
  });
});

router.get('/verify-otp', (req, res) => {
  // Render OTP verification page
  res.render('otp');
});

router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;
  const enteredmobile_number = req.session.mobile_number;

  // Check if the provided OTP is valid
  const sql = 'SELECT * FROM users WHERE mobile_number = ? AND otp = ?';
  db.query(sql, [enteredmobile_number,enteredOTP], (err, result) => {
    if (err) {
      console.error('Error verifying OTP:', err);
      res.render('otp', { error: 'An error occurred. Please try again.' });
  } else if (result.length > 0 ) {
    // Valid OTP, user is authenticated
    req.session.isAuthenticated = true;
    //req.session.username = 'Name'; // Set username to 'Name'
    res.redirect('/dashboard');
  } else {
    res.render('otp', { error: 'Invalid OTP. Please try again.' });
  }

});
});

router.get('/dashboard', function (req, res, next) {
  // Check if the user is authenticated 
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('dashboard', { mobile_number, username });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/list-products', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('list-products', { mobile_number, username });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/order-history', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('order-history', { mobile_number, username });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/private-chat', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('private-chat', { mobile_number, username });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    const phone_number_id = req.session.phone_number_id; // Assuming phone_number_id is stored in session
    const fb_pat = req.session.fb_pat; // Assuming fb_pat is stored in session
    const org_name = req.session.org_name;
    res.render('profile', { pageTitle: 'User Profile', isLoggedIn: true, mobile_number, username, phone_number_id, fb_pat, org_name });
  } else {
    res.redirect('/');
  }
});

router.post("/profile", (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const action = req.body.action;
    if (action === 'fetch') {
      const mobile_number = req.session.mobile_number; 
      const sql = 'SELECT * FROM users WHERE mobile_number = ?';
      db.query(sql, [mobile_number], (err, data) => {
        if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).json({ error: 'An error occurred while fetching user data.' });
        } else {
          res.json({ data });
        }
      });
    } else if (action === 'edit') {
      const { username, phone_number_id, fb_pat, org_name } = req.body.userData;
     
      const mobile_number = req.session.mobile_number;
      
      // Update user data in the database
      const sql = 'UPDATE users SET username = ?, phone_number_id = ?, fb_pat = ?, org_name = ? WHERE mobile_number = ?';
      db.query(sql, [username, phone_number_id, fb_pat, org_name, mobile_number ], (err, data) => {
        if (err) {
          console.error('Error updating user data:', err);
          res.status(500).json({ error: 'An error occurred while updating user data.' });
        } else {
          res.json({ message: 'Data Edited' });
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});



router.get('/contacts', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('contacts', { mobile_number, username });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.post('/save-contact', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const { full_name, whatsapp_number, m_f, dob, address, city, state, country, pincode } = req.body;
    const admin_id = req.session.user_id; // Assuming user_id is stored in session

    // Insert contact details into the database
    const sql = 'INSERT INTO contacts (admin_id, full_name, whatsapp_number, m_f, dob, address, city, state, country, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [admin_id, full_name, whatsapp_number, m_f, dob, address, city, state, country, pincode], (err, result) => {
      if (err) {
        console.error('Error saving contact:', err);
        res.render('error', { error: 'An error occurred while saving contact.' });
      } else {
        console.log('Contact saved successfully');
        
        //res.redirect('/contacts'); // Redirect to contacts page after saving
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/fetch-contact-details', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const adminId = req.params.adminId;

    // Fetch contact details from the database using the adminId
    const sql = 'SELECT full_name, whatsapp_number, m_f, dob, address, city, state, country, pincode FROM contacts WHERE admin_id = ?';
    db.query(sql, [adminId], (err, result) => {
      if (err) {
        console.error('Error fetching contact details:', err);
        res.render('error', { error: 'An error occurred while fetching contact details.' });
      } else {
        if (result.length > 0) {
          const contactDetails = result[0];
          res.render('view-contact', { contactDetails });
        } else {
          res.render('error', { error: 'Contact not found.' });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});






router.post('/sendmsg', function (req, res, next) {

  const recipientPhoneNumber = req.body.mobile_number;
  const messageContent = req.body.message;

  if (!recipientPhoneNumber || !messageContent) {
    return res.status(400).json({ success: false, message: 'Mobile number and message are required.' });
  }


  let data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": recipientPhoneNumber,
    "type": "text",
    "text": {
      "preview_url": false,
      "body": messageContent
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v19.0/142850812255645/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer EAAFQzmahBXQBOZCjPLVxsfjd9lLSdrNEApQZAm5uqwHZCpuRb3ZAXVwcZBfqZAQQT3QJfJdlH3ZA7cyjTuHN2hBnAzAgVKOJKDqOL9ZBHOU4EGSbWAXGaVpQH0at9ZCuHBfgYg7K4P7zuPn5vmIWtsRZCxOwdJfARfX2aqnCxsvm842Ltbem53PZC4YzKOGoueZAjbtPDZAE9Om03ZBC0Av3UfDy0ZD'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      const responseData = {
        to: recipientPhoneNumber,
        body: messageContent,
        facebookApiResponse: response.data
      };

      // console.log(JSON.stringify(response.data));
      res.json(response.data);
    })
    .catch((error) => {
      // console.log(error);
      res.status(500).json({ success: false, message: 'Failed to send WhatsApp message.' });
      console.log(error.response.data);
    });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;