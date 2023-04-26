const express = require('express');
const router = express.Router();
const ReferenceImage = require('../models/referenceImage');

router.get('/randomGameImage', async (req, res) => {
    try {
      const count = await ReferenceImage.countDocuments();
      const randomIndex = Math.floor(Math.random() * count);
      const referenceImage = await ReferenceImage.findOne().skip(randomIndex);
      res.status(200).json(referenceImage);
    } catch (err) {
      console.error(err);
    }
  });

module.exports = router;