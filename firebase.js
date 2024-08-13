// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore, getFireStore} from "firebase/firestore"
import { experimental_sx } from "@mui/material";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9nu0EqFZNXJGb5GIzFhn8TUub9K3_YDI",
  authDomain: "inventory-management-92e74.firebaseapp.com",
  projectId: "inventory-management-92e74",
  storageBucket: "inventory-management-92e74.appspot.com",
  messagingSenderId: "295581208078",
  appId: "1:295581208078:web:9121e3544dadb8deefb65f", measurementId: "G-2X1X6G8888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export{firestore}
