import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import '../style/Login.css';
import logo from '../assets/logoAlt-photoroom.png'; // make sure this path is correct
import Cubes from '../components/Cubes'; // assuming this is your animated background
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase';
import { getDoc} from 'firebase/firestore'

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) return alert("Fill all fields");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save initial profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: '',
        lastName: '',
        avatar: '', // can be updated later in profile setup
      });

      alert('Registration successful!');
      navigate('/complete-profile'); // redirect to setup profile page
    } catch (err) {
      console.error("Registration Error:", err);
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          createdAt: Date.now(),
          displayName: user.displayName || '',
        });
        navigate('/complete-profile');
      } else {
        navigate('/home');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="parent">
      <div className="div1">
        <div className="logo">
          <img src={logo} alt="Logo" />
          <h1>Chat. Connect. Collaborate.</h1>
        </div>
      </div>
      <div className="div-row">
        <div className="div2">
          <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <Cubes
              gridSize={10}
              maxAngle={90}
              radius={3}
              borderStyle="2px solid rgb(255, 255, 255)"
              faceColor="#1a1a2e"
              rippleColor="#ff6b6b"
              rippleSpeed={1.5}
              autoAnimate={true}
              rippleOnClick={true}
            />
          </div>
        </div>
        <div className="div3">
          <div className="login-card">
            <h1>Create Account</h1>
            <p>Register with email</p>
            <div className="social-icons">
              <div className="social-btn"><i className="fab fa-google" onClick={handleGoogleLogin}></i></div>
              <div className="social-btn"><i className="fas fa-envelope"></i></div>
              <div className="social-btn"><i className="fab fa-github"></i></div>
              <div className="social-btn"><i className="fab fa-apple"></i></div>
            </div>

            <div className="separator">
              <span className="line"></span>
              <span className="or-text">Or</span>
              <span className="line"></span>
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button className="main-login-btn" onClick={handleRegister}>
              Register
            </button>
            <button className="main-login-btn" onClick={() => navigate('/login')}>
              ⬅ Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
