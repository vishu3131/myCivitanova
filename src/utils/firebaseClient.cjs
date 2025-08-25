"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
// Configurazione Firebase
var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
// Verifica se le variabili di ambiente sono configurate
var isValidConfig = function () {
    var requiredValues = [
        firebaseConfig.apiKey,
        firebaseConfig.authDomain,
        firebaseConfig.projectId
    ];
    return requiredValues.every(function (value) {
        // Controlla che la variabile esista e non sia un placeholder
        return value &&
            value.trim() !== '' &&
            !value.includes('your_firebase_') &&
            !value.includes('your_project_id') &&
            !value.includes('AIzaSyDemo') &&
            !value.includes('replace-with-your') &&
            !value.includes('placeholder');
    });
};
var app;
var auth;
var db;
// Inizializza Firebase
try {
    // Verifica che le variabili di ambiente siano configurate
    if (!isValidConfig()) {
        console.error('❌ Firebase configuration is missing or invalid!');
        console.error('Please check your .env.local file and ensure all Firebase variables are set.');
        console.error('Required variables:', {
            NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'
        });
    }
    app = (0, app_1.initializeApp)(firebaseConfig);
    exports.auth = auth = (0, auth_1.getAuth)(app);
    exports.db = db = (0, firestore_1.getFirestore)(app);
    console.log('✅ Firebase initialized successfully');
    console.log('🔥 Project ID:', firebaseConfig.projectId);
    // Connetti agli emulatori in sviluppo se necessario
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        try {
            (0, auth_1.connectAuthEmulator)(auth, 'http://localhost:9099');
            (0, firestore_1.connectFirestoreEmulator)(db, 'localhost', 8080);
            console.log('🔧 Firebase emulators connected');
        }
        catch (error) {
            console.warn('⚠️ Firebase emulators already connected or not available');
        }
    }
}
catch (error) {
    console.error('💥 Failed to initialize Firebase:', error);
    // Crea oggetti dummy per evitare errori durante il build
    exports.auth = auth = null;
    exports.db = db = null;
}
exports.default = app;
