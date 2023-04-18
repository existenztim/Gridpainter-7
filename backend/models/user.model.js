const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: String,
    password: String,
})

module.exports = mongoose.model('user', UserSchema) 