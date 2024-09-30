// Firebase 初始化代碼
const firebaseConfig = {
    apiKey: "AIzaSyBJhKP4APZJqUnZzACj9EiAcyuhwgr3wgE",
    authDomain: "gomt-9518e.firebaseapp.com",
    projectId: "gomt-9518e",
    storageBucket: "gomt-9518e.appspot.com",
    messagingSenderId: "169885183614",
    appId: "1:169885183614:web:f9d0c9d5ff8224f74a722f",
    measurementId: "G-DTTTWQ7BZB"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 初始化 Firestore
const db = firebase.firestore();
