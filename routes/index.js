var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});

router.get('/dashboard-02', function (req, res, next) {
  res.render('dashboard-02');
});


router.get('/list-products', function (req, res, next) {
  res.render('list-products');
});

router.get('/order-history', function (req, res, next) {
  res.render('order-history');
});

router.get('/private-chat', function (req, res, next) {
  res.render('private-chat');
});

router.get('/contacts', function (req, res, next) {
  res.render('contacts');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/otp-page', function (req, res, next) {
  res.render('otp-page');
});

router.get('/settings', function (req, res, next) {
  res.render('settings');
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

module.exports = router;
