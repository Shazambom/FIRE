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
ALGORITHM = 'AES-256-CBC'; // CBC because CTR isn't possible with the current version of the Node.JS crypto library
HMAC_ALGORITHM = 'SHA256';

var encryptAES = function (plain_text, KEY, HMAC_KEY) {
    if (plain_text == null) {
        plain_text = JSON.stringify({
            total_assets: 0,
            index_assets: 0,
            monthly_income: 0,
            monthly_expenses: 0
        });
    }

    var IV = new Buffer(crypto.randomBytes(16)); // ensure that the IV (initialization vector) is random
    var cipher_text;
    var hmac;
    var encryptor;

    encryptor = crypto.createCipheriv(ALGORITHM, KEY, IV);
    encryptor.setEncoding('hex');
    encryptor.write(plain_text);
    encryptor.end();

    cipher_text = encryptor.read();

    hmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex')); // ensure that both the IV and the cipher-text is protected by the HMAC

    // The IV isn't a secret so it can be stored along side everything else
    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex')

};

var decryptAES = function (cipher_text, KEY, HMAC_KEY) {
    var cipher_blob = cipher_text.split("$");
    var ct = cipher_blob[0];
    var IV = new Buffer(cipher_blob[1], 'hex');
    var hmac = cipher_blob[2];
    var decryptor;

    chmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
    chmac.update(ct);
    chmac.update(IV.toString('hex'));

    if (!constant_time_compare(chmac.digest('hex'), hmac)) {
        console.log("Encrypted Blob has been tampered with...");
        return null;
    }

    decryptor = crypto.createDecipheriv(ALGORITHM, KEY, IV);
    var decryptedText = decryptor.update(ct, 'hex', 'utf-8');
    return decryptedText + decryptor.final('utf-8');
};

var constant_time_compare = function (val1, val2) {
    var sentinel;

    if (val1.length !== val2.length) {
        return false;
    }


    for (var i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }

    return sentinel === 0
};

const User = require('./models/User');
const Article = require('./models/Article');
module.exports = {
    saveUser: function (id, name, userName, sessionID, htmlHead, callback) {
        const salt = genSalt();
        const tenMin = new Date();
        tenMin.setMinutes(tenMin.getMinutes() + 10);
        const newUser = new User({
            name: name,
            hash: hashId(id, salt),
            salt: salt,
            token: sessionID,
            expiration: tenMin,
            username: userName,
            htmlHead: htmlHead
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
    verifyUser: function (id, name, sessionID, htmlHead, callback) {
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
                        elem.htmlHead = htmlHead;
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
    getUserData: function(token, htmlHead, pass, callback) {
        User.findOne({token: token}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(null, err);
            } else if (elem.expiration > new Date() && htmlHead === elem.htmlHead) {
                if (pass !== null && elem['hash'] === hashId(pass, elem['salt']) && elem.data != null) {
                    const hash = crypto.createHmac('sha256', elem['salt']).update(pass).digest();
                    callback(JSON.parse(decryptAES(elem.data.toString(), hash, elem.salt).toString()), err);
                } else {
                    callback(null, err);
                }
            } else {
                elem.token = "";
                elem.expiration = new Date(0);
                elem.save();
                callback(null, err);
            }
        })
    },

    storeUserData: function(token, htmlHead, data, pass, callback) {
        User.findOne({token: token}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(false, err);
            } else if (elem.expiration > new Date() && htmlHead === elem.htmlHead) {
                if (hashId(pass, elem['salt']) === elem['hash']) {
                    if (elem.data == null) {
                        const hash = crypto.createHmac('sha256', elem['salt']).update(pass).digest();
                        elem.data = encryptAES(JSON.stringify(data), hash, elem.salt);
                    } else {

                        const hash = crypto.createHmac('sha256', elem['salt']).update(pass).digest();
                        elem.data = encryptAES(JSON.stringify(Object.assign({}, JSON.parse(decryptAES(elem.data.toString(), hash, elem.salt)), JSON.parse(data))), hash, elem.salt);
                    }
                    elem.save();
                    callback(true, err);
                } else {
                    callback(false, err);
                }
            } else {
                elem.token = "";
                elem.expiration = new Date(0);
                elem.save();
                callback(false, err);
            }
        })
    },

    checkToken: function (token, htmlHead, callback) {
        User.findOne({token: token}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(false, err);
            } else if (elem.expiration > new Date() && htmlHead === elem.htmlHead) {
                callback(true, err);
            } else {
                elem.token = "";
                elem.expiration = new Date(0);
                elem.save();
                callback(false, err);
            }

        })
    },

    checkAdmin: function(token, htmlHead, callback) {
        User.findOne({token: token}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(false, err);
            } else if (elem.expiration > new Date() && htmlHead === elem.htmlHead) {
                callback(elem.isAdmin, err);
            } else {
                elem.token = "";
                elem.expiration = new Date(0);
                elem.save();
                callback(false, err);
            }

        })
    },
    
    storeArticle: function (body, name, category, token, htmlHead, callback) {
        module.exports.checkAdmin(token, htmlHead, function (isAdmin, err) {
           if (err || !isAdmin) {
               callback(false, err)
           } else {
               const newArticle = new Article({
                   name: name,
                   body: encodeURI(body),
                   category: category,
                   date: new Date()
               });
               newArticle.save(function (errr) {
                   if (errr) {
                       console.log(errr);
                       callback(false, errr);
                   } else {
                       callback(true, errr);
                   }
               })
           }
        });
    },
    
    getArticle: function (articleID, callback) {
        Article.findOne({_id: articleID}).exec(function (err, elem) {
            if (err || elem === null) {
                console.log(err);
                callback(null, null, err);
            } else {
                callback(elem, decodeURI(elem.body), err);
            }
        });
    },

    getAllArticles: function (callback) {
        Article.find({}, function (err, articles) {
            if (err) {
                console.log(err);
                callback([]);
            } else {
                var toReturn = [];
                articles.forEach(function (elem) {
                    if (elem.category !== "home" && elem.category !== "stock" && elem.category !== "product") {
                        elem.body = decodeURI(elem.body);
                        toReturn.push(elem);
                    }
                });
                callback(toReturn);
            }
        });
    },

    getCategoryArticles: function (category, callback) {
        Article.find({category: category}, function (err, articles) {
           if (err) {
               console.log(err);
               callback([]);
           } else {
               articles.forEach(function (elem) {
                   elem.body = decodeURI(elem.body);
               });
               callback(articles);
           }
        });
    },
    changeArticleCategory: function (name, category, token, htmlHead, callback) {
        module.exports.checkAdmin(token, htmlHead, function (isAdmin, err) {
            if (err || !isAdmin) {
                callback(false, err)
            } else {
                Article.findOne({name: name}, function (errr, elem) {
                    if (errr || elem === null) {
                        console.log(errr);
                        callback(false, errr);
                    } else {
                        elem.category = category;
                        elem.save();
                        callback(true, errr);
                    }
                });
            }
        });
    },
    deleteArticle: function (name, token, htmlHead, callback) {
        module.exports.checkAdmin(token, htmlHead, function (isAdmin, err) {
            if (err || !isAdmin) {
                callback(false, err)
            } else {
                Article.find({name: name}).remove(function (errr) {
                    if (errr) {
                        console.log(errr);
                        callback(false, errr);
                    } else {
                        callback(true, errr);
                    }
                });
            }
        });
    }
};



User.findOne({name:"Ian Moreno"}, function (err, elem) {
    if (elem !== null) {
        elem.isAdmin = true;
        elem.save();
    }
});



