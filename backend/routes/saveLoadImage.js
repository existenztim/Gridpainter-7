const express = require('express');
const router = express.Router();
const saveLoadImageSchema = require('../models/saveLoad.model');

router.post('/save', async (req, res) => {
  try {
    console.log('HEJ!');
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
