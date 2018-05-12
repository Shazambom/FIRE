const express = require('express');
const db = require('../database/database');
const app = require('../app');
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
    //console.log(payload);
    if (payload['aud'] === CLIENT_ID) {
        //res.send(payload['name']);
        db.verifyUser(payload['sub'], payload['name'], function (valid, err) {
            if (valid) {
                res.send(valid);
                req.session.regenerate(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                if (err !== null) {
                    console.log(err);
                    res.send("An error logging in occured");
                    req.session.destroy(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                } else {
                    db.saveUser(payload['sub'], payload['name'], function (saved, err) {
                        if (err) {
                            console.log(err);
                            res.send("An error creating your account occured");
                            req.session.destroy(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        } else {
                            res.send(true);
                            req.session.regenerate(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    })
                }
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