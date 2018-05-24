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
                    if (elem.category !== "home" && elem.category !== "stock") {
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

/*
User.findOne({name:"Ian Moreno"}, function (err, elem) {
    elem.isAdmin = true;
    elem.save();
});
*/
