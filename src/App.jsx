import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import './App.css';
import ProfileSetup from './pages/ProfileSetup.jsx';
import Starter from './pages/Starter.jsx';
import ChatUI from './pages/ChatUI.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { Settings } from 'react-feather';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Starter />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/complete-profile" element={<ProfileSetup />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <ChatUI />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
