import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCdWgAPK5sXEFwzwe3BQ6s0LRUOAdaBLCs",
  authDomain: "quikping-f026d.firebaseapp.com",
  projectId: "quikping-f026d",
  storageBucket: "quikping-f026d.firebasestorage.app",
  messagingSenderId: "754164899857",
  appId: "1:754164899857:web:098b4b6ad4d9c5f3e6d1b0",
  measurementId: "G-GFSV2MCV67"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export { auth, db, googleProvider };