import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save basic user data in Firestore (used in login logic)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: '',
        lastName: '',
        avatar: ''
      });

      alert(`Registered as ${user.email}`);
      navigate('/complete-profile');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className='parent'>
      <div className="div1">
        <div className="welcome-root">
          <div className="layout-container">
            <div className="centered-container">
              <div className="layout-content">
                <div className="container">
                  <div className="responsive-padding">
                    <div
                      className="hero-image"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdKCruFcWFq13_ybtslxUKuI6xrf2ikTnJFyNYL5LSK4cw9PvEgdQJluSxavl14F37fcbZh5HKkQtcElmAHgJXHpFBBd9In-AlbDowfZ2KJcXHQ71-Wwwn-nqc_3rGzbJgM0AiB_jU1EeFnmmb7Rotct1-lEzRIOf0_jyFe-T1rrJaeUYeUFISVpBpgIrEeAdUqDzEafGA0C96uejxvWpgAWEPSZzgXtsd28aIwkNS-aP62CbzxJuHVe8PgUfLyaTJpKjQ4vBlR3w")',
                      }}
                    ></div>
                  </div>
                </div>

                <h2 className="welcome-title">Create your account</h2>
                <p className="welcome-subtitle">
                  Start chatting securely with friends and colleagues. Register to begin.
                </p>

                <div className="input-wrapper">
                  <input
                    type="email"
                    className="email-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="btn-wrapper">
                  <button className="google-btn" onClick={handleRegister}>
                    <span className="truncate">Register</span>
                  </button>
                </div>

                <p className="login-redirect">
                  Already have an account? <a href="/login">Login</a>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="div2">
        <div className="buttons">
          <button className="btn" disabled>
            <span>Login with Google</span>
            <img
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png"
              alt="Google"
            />
          </button>
          <button className="btn" disabled>
            <span>Login with Meta</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
              alt="Meta"
            />
          </button>
          <button className="btn" disabled>
            <span>Login with Apple</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/888/888847.png"
              alt="Apple"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
