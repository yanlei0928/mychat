var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mychat');
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    avatar: String
});

//再定义model
module.exports.UserModel = mongoose.model('User', userSchema);
