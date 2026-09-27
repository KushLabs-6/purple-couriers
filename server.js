const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to Purple Couriers API! The package accountability system is currently under construction.');
});

app.listen(port, () => {
  console.log(`Purple Couriers app listening on port ${port}`);
});
