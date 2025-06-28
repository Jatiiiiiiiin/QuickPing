import React, { useState } from 'react';
import '../style/Starter.css';
import logo from '../assets/logoAlt-Photoroom.png';
import bg from '../assets/bg.png';
import { useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Starter() {
  const [hovered, setHovered] = useState(false);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate("/home");
    }
  }, [loading, currentUser]);


  const Login = () => {
    navigate('/login');
  };

  if(loading) return null;

  return (
    <div className="starter-page">
      <Particles
        particleColors={['#ffffff', '#ffffff']}
        particleCount={500}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        particleHoverFactor={1}
        alphaParticles={false}
        disableRotation={false}
      />
      <div className="starter-container">
        <div className="starter-content">
          <img src={logo} alt="QuickPing Logo" />
          <button
            className="btn-primary"
            onClick={Login}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {hovered ? "lesss gooo!" : 'Get Started'}
          </button>
        </div>
      </div>
      <footer className="starter-footer">
        <p>&copy; 2023 QuickPing. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Starter;
