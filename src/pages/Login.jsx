import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import logo from '../assets/logoAlt-photoroom.png'
import Cubes from '../components/Cubes'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import '../style/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showEmailLogin, setShowEmailLogin] = useState(false);


  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate('/home');
      } else {
        navigate('/complete-profile');
      }
    } catch (error) {
      alert(error.message);
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

  const register = ()=> {
    navigate('/register')
  }

  return (
    <>
      <div className="parent">
        <div className="div1">
          <div className="logo">
            <img src={logo} alt="" />
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
              {!showEmailLogin ? (
                <>
                  <h1>Welcome to QuikPing</h1>
                  <p>Switch to Secure</p>

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

                  <button className="main-login-btn" onClick={() => setShowEmailLogin(true)}>
                    Login with Email .!
                  </button>
                </>
              ) : (
                <>
                  <h1>Email Login</h1>
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
                  <button className="main-login-btn" onClick={handleEmailLogin}>
                    Submit
                  </button>
                  <button className="main-login-btn" onClick={() => setShowEmailLogin(false)}>
                    ⬅ Back
                  </button>
                </>
              )}

              <a href="#" className="create-link" onClick={register}>
                New User →
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;
