//routes/index.js
var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('login');
});



router.post('/get-otp', (req, res) => {
  
  console.log(req.body)
  const enteredMobileNumber = req.body.mobilenumber;
  // Validate if the provided mobile number has exactly 10 digits and is '1234567890'
  if (enteredMobileNumber === '1234567890') {
    // Valid mobile number, generate and send OTP (skipping for simplicity)
    req.session.mobileNumber = enteredMobileNumber;
    res.render('otp');
  } else {
    res.render('login', { error: 'Invalid mobile number. Please enter the correct mobile number (1234567890).' });
  }
});






router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;

  // Check if the provided OTP is valid
  if (enteredOTP === '123456' ) {
    // Valid OTP, user is authenticated
    req.session.isAuthenticated = true;
    req.session.username = 'shiv'; // Set username to 'shiv'
    res.redirect('/dashboard');
  } else {
    res.render('otp-page', { error: 'Invalid OTP. Please try again.' });
  }
});

router.get('/dashboard', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobileNumber = req.session.mobileNumber;

    res.render('dashboard', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});


router.get('/list-products', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobileNumber = req.session.mobileNumber;
    
    res.render('list-products', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/order-history', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobileNumber = req.session.mobileNumber;
    
    res.render('order-history', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/private-chat', function (req, res, next) {

  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobileNumber = req.session.mobileNumber;
    
    res.render('private-chat', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.get('/contacts', function (req, res, next) {
// Check if the user is authenticated before rendering the dashboard
if (req.session.isAuthenticated) {
  const mobileNumber = req.session.mobileNumber;
  
  res.render('contacts', { username: req.session.username, mobileNumber: mobileNumber });
} else {
  // Redirect to login if not authenticated
  res.redirect('/');
}  
});

router.get('/settings', function (req, res, next) {
  // Check if the user is authenticated before rendering the dashboard
  if (req.session.isAuthenticated) {
    const mobileNumber = req.session.mobileNumber;
    
    res.render('settings', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    // Redirect to login if not authenticated
    res.redirect('/');
  }
});

router.post('/sendmsg', function (req, res, next) {

  const recipientPhoneNumber = req.body.mobileNumber;
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
      console.log(error.response?.data);
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
