const express = require('express');
const router = express.Router();
const SaveLoadImageModel = require('../models/saveLoad.model');

router.post('/save', async (req, res) => {
  try {
    console.log(req.body);
    const saveImage = new SaveLoadImageModel(req.body);
    saveImage.save();
    res.status(201).json(saveImage);
  } catch (err) {
    console.error(err);
  }
});

router.post('/load', async (req, res) => {
  try {
    const images = await SaveLoadImageModel.find({ userId: req.body.userId });
    if (images.length > 0) {
      res.status(200).json(images);
    } else {
      res.status(404).json(images);
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
