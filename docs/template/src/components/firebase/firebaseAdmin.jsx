import * as firebaseAdmin from "firebase-admin"
import serviceAccount from "config/firebase-service-account.json"
import FIREBASE from "config/firebase.config"

// Check whether firebase form has been initialized
if (!firebaseAdmin.apps.length) {
  // Initialize firebase form
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: FIREBASE.databaseURL
  })
}

export { firebaseAdmin }
