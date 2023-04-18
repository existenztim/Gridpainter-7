const express = require('express');
const router = express.Router();
const UserModel = require("../models/user.model")
const CryptoJS = require('crypto-js');

// HÄMTA SPECIFIK USER 
router.post('/', async (req, res, next) => {
    const { id } = req.body;
    const user = await UserModel.findById({_id: id})
  
    try{
      res.status(200).json(user);
    } catch (err){
      console.error(err);
      res.status(500).json({ msg: err });
    }
  });
  
  // SKAPA USER
  router.post('/add', async (req, res, next) => {
    const user = new UserModel(req.body)
    let encryptPassword = req.body.password;
    encryptPassword = CryptoJS.AES.encrypt(user.password, "salt key").toString();
    user.password = encryptPassword;
    await user.save();
  
    try {
      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err });
    }
  })
  
  // LOGGA IN USER 
  router.post('/login', async (req, res, next) => {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
  
    if (!user) {
      return res.status(400).json({ msg: 'No user found' });
    }
  
    const decryptPassword = CryptoJS.AES.decrypt(user.password, "salt key").toString(CryptoJS.enc.Utf8);
  
    if (decryptPassword !== password) {
      return res.status(400).json({ msg: 'Incorrect credentials' });
    }
  
    try {
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err });
    }
  });

module.exports = router;