//App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Homecomponents/Home';
import ProviderLogin from './components/Providercomponents/ProviderLogin';
import LawfirmLogin from './components/Lawfirmcomponents/LawfirmLogin';
import NewUser from './components/Homecomponents/NewUser';
import ProviderSignUp from './components/Providercomponents/ProviderSignUp';
import LawFirmSignUp from './components/Lawfirmcomponents/LawFirmSignUp';
import VerifyAccount from './components/Homecomponents/VerifyAccount';
import LawFirmHomePage from './components/Lawfirmcomponents/LawFirmHomePage';
import ProviderHomePage from './components/Providercomponents/ProviderHomePage';
import PrivateRoute from './components/Homecomponents/PrivateRoute';
import CreateCase from './components/Lawfirmcomponents/CreateCase';
import ViewCases from './components/Lawfirmcomponents/ViewCases';
import LawCaseDetails from './components/Lawfirmcomponents/LawCaseDetails';
import NewDisbursementPath from './components/Lawfirmcomponents/NewDisbursementPath'; 
import ExistingDisbursementPaths from './components/Lawfirmcomponents/ExistingDisbursementPaths';

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
        <Route 
          path="/lawfirm-home" 
          element={
            <PrivateRoute>
              <LawFirmHomePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/provider-home" 
          element={
            <PrivateRoute>
              <ProviderHomePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/lawfirm-home/create-case" 
          element={
            <PrivateRoute>
              <CreateCase />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/lawfirm-home/view-cases" 
          element={
            <PrivateRoute>
              <ViewCases />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/case/:id" 
          element={
            <PrivateRoute>
              <LawCaseDetails />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/new-disbursement-path" 
          element={
            <PrivateRoute>
              <NewDisbursementPath />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/existing-disbursement-paths/:caseId" 
          element={
            <PrivateRoute>
              <ExistingDisbursementPaths />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
