import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAKvs44X5dA45AQxZ7Y-kOWdJw3Y7xIvy8",
    authDomain: "azerisiq-c50d8.firebaseapp.com",
    projectId: "azerisiq-c50d8",
    storageBucket: "azerisiq-c50d8.appspot.com",
    messagingSenderId: "240281968816",
    appId: "1:240281968816:web:9257a92816653cacd6db75",
    measurementId: "G-1NDHBZBVHT"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);