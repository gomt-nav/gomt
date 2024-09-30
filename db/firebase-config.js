 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
   apiKey: "AIzaSyBJhKP4APZJqUnZzACj9EiAcyuhwgr3wgE",
   authDomain: "gomt-9518e.firebaseapp.com",
   projectId: "gomt-9518e",
   storageBucket: "gomt-9518e.appspot.com",
   messagingSenderId: "169885183614",
   appId: "1:169885183614:web:f9d0c9d5ff8224f74a722f",
   measurementId: "G-DTTTWQ7BZB"
 };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);