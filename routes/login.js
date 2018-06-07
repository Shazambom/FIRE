const express = require('express');
const db = require('../database/database');
const router = express.Router();
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '813941670344-9el2iuapfhtvv2gd1marealcu1on6u1e.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);




async function verify(token, res, req) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (payload['aud'] === CLIENT_ID) {
        req.session.regenerate(function (err) {
            if (err) {
                console.log(err)
            } else {
                db.verifyUser(payload['sub'], payload['name'], req.sessionID, req.headers["user-agent"], function (valid, err) {
                    if (valid) {
                        res.send(valid);
                    } else {
                        if (err) {
                            console.log(err);
                            res.send(false);
                            req.session.destroy(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        } else {
                            db.saveUser(payload['sub'], payload['name'], payload['given_name'] + " " +payload['family_name'][0], req.sessionID, req.headers["user-agent"], function (saved, err) {
                                if (err) {
                                    console.log(err);
                                    res.send(false);
                                    req.session.destroy(function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                } else {
                                    res.send(saved);
                                }
                            })
                        }
                    }
                });
            }
        });
    }
}

async function verifyProfile(token, res, req, isGet) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (payload['aud'] === CLIENT_ID) {
        var get = (isGet == "true");
        if (get) {
            db.getUserData(req.sessionID, req.headers['user-agent'], payload['sub'], function (userData, err) {
                if (err) {
                    res.status(403);
                } else if (userData === null) {
                    db.storeUserData(req.sessionID, req.headers['user-agent'], req.body['data'], payload['sub'], function (saved, err) {
                        if (err || !saved) {
                            res.status(403);
                        } else {
                            db.getUserData(req.sessionID, req.headers['user-agent'], payload['sub'], function (userData, err) {
                                if (err || userData === null) {
                                    res.status(403);
                                } else {
                                    res.send(JSON.stringify({data: userData}));
                                }
                            });
                        }
                    });
                } else {
                    res.send(JSON.stringify({data: userData}));
                }
            });
        } else {
            db.storeUserData(req.sessionID, req.headers['user-agent'], req.body['data'], payload['sub'], function (saved, err) {
                if (err || !saved) {
                    res.status(403);
                } else {
                    db.getUserData(req.sessionID, req.headers['user-agent'], payload['sub'], function (userData, err) {
                        if (err || userData === null) {
                            res.status(403);
                        } else {
                            res.send(JSON.stringify({data: userData}));
                        }
                    });
                }
            });
        }
    }
}

/* GET home page. */

router.post('/', function(req, res, next) {

    console.log("SessionID: " + req.sessionID);
    const token = req['body']['idtoken'];
    verify(token, res, req).catch(console.error);

});

router.post('/profile', function (req, res, next) {
    console.log(req['body']['data']);
    verifyProfile(req['body']['idtoken'], res, req, req['body']['isGet']);
});


module.exports = router;