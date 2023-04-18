const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hej ifrån index endpoint!');
});

module.exports = router;