var db = require('../models');

var utils = require('../utils/encryUtils');


exports.findById = function (userId, callback) {
    if (!callback)return;
    db.UserModel.findOne({_id: userId}, function (err, user) {
        if (err)
            callback(err);
        else
            callback(null, user);
    })
};

exports.reg = function (user,callback){
    new db.UserModel(user).save(function(err,user){
        if(err){
            callback(err);
        }
        else
            callback(null,user);
    })
}

exports.login = function(user,cb){
    db.UserModel.findOne({username:user.username,password:utils.getStringMd5(user.password)},function(err,findUser){
        if(err)
            cb(err);
        else{
            cb(null,findUser);
        }
    });
};

/* 测试
var user ={
    username:'yanlei',
    password:utils.getStringMd5('123456'),
    email:'yanlei@qq.com',
    avatar:'',
};

exports.reg(user,function(err,user){
    console.log(user);
});
*/

