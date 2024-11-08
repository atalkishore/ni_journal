const firebase = require("firebase-admin");
const { LOGGER } = require('../config/winston-logger.config');

function firebaseBaseCollection(dateString = null) {


    let { monthName, collectionReference } = collection(dateString);
    return collectionReference
        .doc(monthName)
}

function firebaseBaseCollectionForIndex(dateString = null) {
    let { date, monthName, collectionReference } = collection(dateString);
    let documentPath = date.getDate() + "" + monthName;
    return collectionReference
        .doc(documentPath)
}

function collection(dateString) {
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    let date = dateString ? new Date(dateString) : new Date();
    let year = date.getFullYear().toString();
    let monthName = monthNames[date.getMonth()];
    let collectionReference = firebase.firestore()
        .collection(year);
    return { date, monthName, collectionReference };
}

function getDocument(collectionName, documentName) {
    return firebase
        .firestore()
        .collection(collectionName)
        .doc(documentName)
        .get()
        .then(function (querySnapshot) {
            let data = querySnapshot.data();
            return data;
        })
        .catch((err) => {
            LOGGER.error(`Error getting documents ${collectionName} ${documentName} ${err}`);
            return null;
        });
}

function getDocumentL2(collectionNameL1, docNameL1, collectionNameL2, docNameL2) {
    return firebase
        .firestore()
        .collection(collectionNameL1)
        .doc(docNameL1)
        .collection(collectionNameL2)
        .doc(docNameL2)
        .get()
        .then(function (querySnapshot) {
            let data = querySnapshot.data();
            return data;
        })
        .catch((err) => {
            LOGGER.error(`Error getting documents ${collectionNameL1} ${docNameL1} ${collectionNameL2} ${docNameL2} ${err}`);
            return null;
        });
}

function getDocumentLevel2(collectionNameL1, docNameL1, collectionNameL2, docNameL2) {
    return firebase
        .firestore()
        .collection(collectionNameL1)
        .doc(docNameL1)
        .collection(collectionNameL2)
        .doc(docNameL2)
}

async function getDocumentData(collectionName, documentName) {
    return await getDocument(collectionName, documentName);
}

async function getDocumentDataL2(collectionNameL1, docNameL1, collectionNameL2, docNameL2) {
    return await getDocumentL2(collectionNameL1, docNameL1, collectionNameL2, docNameL2);
}

module.exports.baseCollection = firebaseBaseCollection;
module.exports.baseCollectionForIndex = firebaseBaseCollectionForIndex;
module.exports.getDocument = getDocument;
module.exports.getDocumentLevel2 = getDocumentLevel2;
module.exports.getDocumentData = getDocumentData;
module.exports.getDocumentDataL2 = getDocumentDataL2;
