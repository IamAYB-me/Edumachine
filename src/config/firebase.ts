import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCv3iVJUrlmAx5Qy1akA4KCy0X9lAcVgiO",
  authDomain: "myskulboot.firebaseapp.com",
  projectId: "myskulboot",
  storageBucket: "myskulboot.firebasestorage.app",
  messagingSenderId: "891879596883",
  appId: "1:891879596883:web:07868644ad00676181b7a6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
