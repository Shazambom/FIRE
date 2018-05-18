const express = require('express');
const db = require('../database/database');
const crypto = require('crypto');
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
                db.verifyUser(payload['sub'], payload['name'], req.sessionID, function (valid, err) {
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
                            db.saveUser(payload['sub'], payload['name'], payload['given_name'] + " " +payload['family_name'][0], req.sessionID, function (saved, err) {
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

/* GET home page. */

router.post('/', function(req, res, next) {

    console.log("SessionID: " + req.sessionID);
    const token = req['body']['idtoken'];
    verify(token, res, req).catch(console.error);

});


module.exports = router;