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
    saveUser: function (id, name, userName, sessionID, callback) {
        const salt = genSalt();
        const tenMin = new Date();
        tenMin.setMinutes(tenMin.getMinutes() + 10);
        const newUser = new User({
            name: name,
            hash: hashId(id, salt),
            salt: salt,
            token: sessionID,
            expiration: tenMin,
            username: userName
        });
        newUser.save(function (err) {
            if(err) {
                console.log(err);
                callback(false, err);
            }
            console.log("Saved: " + name + " with id:" + id);
            callback(true, err);
        });
    },
    verifyUser: function (id, name, sessionID, callback) {
        User.findOne({name: name}).exec(function (err, elem) {
            if(err) {
                console.log(err);
                callback(false, err);
            } else {
                if (elem !== null) {
                    const ver = verifyHash(name, elem, id);
                    if (ver) {
                        elem.token = sessionID;
                        const tenMin = new Date();
                        tenMin.setMinutes(tenMin.getMinutes() + 10);
                        elem.expiration = tenMin;
                        console.log("Verified: " + name + " with id:" + id);
                        elem.save();

                    }
                    callback(ver, err);
                } else {
                    callback(false, err);
                }
            }
        });
    },

    checkToken: function (token, callback) {
        User.findOne({token: token}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(false, err);
            } else if (elem.expiration > new Date()) {
                callback(true, err);
            } else {
                console.log(elem.expiration + " vs " + new Date());
                elem.token = "";
                elem.expiration = new Date(0);
                elem.save();
                callback(false, err);
            }

        })
    }


};
