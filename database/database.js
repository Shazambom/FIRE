const crypto = require('crypto');

const genSalt = function() {
    return crypto.randomBytes(128).toString('hex').slice(0, 256);
};
const hashId = function(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const val = hash.digest('hex');
    return val;
};
const verifyHash = function (name, user, id) {
  return user['name'] === name && user['hash'] === hashId(id, user['salt']);
};

const User = require('./models/User');
module.exports = {
    saveUser: function (id, name, callback) {
        const salt = genSalt();
        const newUser = new User({name: name, hash: hashId(id, salt), salt: salt});
        newUser.save(function (err) {
            if(err) {
                console.log(err);
                callback(false, err);
            }
            console.log("Saved: " + name + " with id:" + id);
            callback(true, err);
        });
    },
    verifyUser: function (id, name, callback) {
        User.findOne({name: name}).exec(function (err, elem) {
            if(err) {
                console.log(err);
                callback(false, err);
            } else {
                if (elem !== null) {
                    callback(verifyHash(name, elem, id), err);
                    console.log("Verified: " + name + " with id:" + id);
                } else {
                    callback(false, err);
                }
            }
        });
    }

};
