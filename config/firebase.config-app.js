const firebase = require('firebase-admin');
const serviceAccount = require('../lib/serviceAccountKey.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://stock-trade-app.firebaseio.com'
});

module.exports = firebase;
