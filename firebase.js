"use client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB9nu0EqFZNXJGb5GIzFhn8TUub9K3_YDI",
    authDomain: "inventory-management-92e74.firebaseapp.com",
    projectId: "inventory-management-92e74",
    storageBucket: "inventory-management-92e74.appspot.com",
    messagingSenderId: "295581208078",
    appId: "1:295581208078:web:9121e3544dadb8deefb65f",
    measurementId: "G-2X1X6G8888",
};
let app;
let firestore;
let storage;

try {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
} catch (e) {
    console.error('Error initializing Firebase:', error);
}

export { firestore, storage,app};
