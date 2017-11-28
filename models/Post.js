var mongoose = require('mongoose');
var usersSchema = require('../schemas/posts');

module.exports = mongoose.model('Post', usersSchema);