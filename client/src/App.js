//App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import ProviderLogin from './components/ProviderLogin';
import LawfirmLogin from './components/LawfirmLogin';
import NewUser from './components/NewUser';
import ProviderSignUp from './components/ProviderSignUp';
import LawFirmSignUp from './components/LawFirmSignUp';
import VerifyAccount from './components/VerifyAccount';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-user" element={<NewUser />}>
          <Route path="lawfirm-signup" element={<LawFirmSignUp />} />
          <Route path="provider-signup" element={<ProviderSignUp />} />
        </Route>
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/lawfirm-login" element={<LawfirmLogin />} />
        <Route path="/verify" element={<VerifyAccount />} />
  
      </Routes>
    </Router>
  );
}

export default App;

