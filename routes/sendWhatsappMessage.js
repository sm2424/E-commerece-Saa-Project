const axios = require('axios');
let data = JSON.stringify({
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "9925206198",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "text-message-content"
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
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
