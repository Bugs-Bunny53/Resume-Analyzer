import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './Pages/Splash';
import Dashboard from './Pages/Dashboard/Dashboard';
import Login from './Pages/Login';
import './global.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Splash />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
