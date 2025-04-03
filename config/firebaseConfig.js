const admin = require('firebase-admin');
// const serviceAccount = require('../firebaseServiceAccount.json');

const path = require("path");
const serviceAccount = require(path.join(__dirname, "firebaseServiceAccount.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
