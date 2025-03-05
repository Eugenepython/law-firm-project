//App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Homecomponents/Home';
import ProviderLogin from './components/Providercomponents/ProviderLogin';
import LawfirmLogin from './components/Lawfirmcomponents/gettingIn/LawfirmLogin';
import NewUser from './components/Homecomponents/NewUser';
import ProviderSignUp from './components/Providercomponents/ProviderSignUp';
import LawFirmSignUp from './components/Lawfirmcomponents/gettingIn/LawFirmSignUp';
import VerifyAccount from './components/Homecomponents/VerifyAccount';
import ProviderVerificationFromInvite from './components/Providercomponents/ProviderVerificationFromInvite'; // Add the new component
import LawFirmHomePage from './components/Lawfirmcomponents/gettingIn/LawFirmHomePage.js';
import ProviderHomePage from './components/Providercomponents/1ProviderHomePage';
import PrivateRoute from './components/Homecomponents/PrivateRoute';
import CreateCase from './components/Lawfirmcomponents/newCases/CreateCase';
import ViewCases from './components/Lawfirmcomponents/lawCases/ViewCases.js';
import LawCaseDetails from './components/Lawfirmcomponents/lawCases/LawCaseDetails.js';
import NewDisbursementPath from './components/Lawfirmcomponents/disbursementManagement/1NewDisbursementPath.js';
import ExistingDisbursementPaths from './components/Lawfirmcomponents/disbursementManagement/1TheExistingDisbursementPaths.js';
import EachLawFirmDisbursementPath from './components/Lawfirmcomponents/disbursementManagement/2EachLawFirmDisbursementPath.js';
import ViewDisbursementsAndRequestsPage from './components/Providercomponents/Disbursements/2ViewDisbursementsAndRequestsPage.js';
//import NewRequests from './components/Providercomponents/NewRequests';
import PotentialDisbursementPage from './components/Lawfirmcomponents/disbursementManagement/3PotentialDisbursementPage';
import PreviousDisbursementsPage from './components/Lawfirmcomponents/disbursementManagement/3PreviousDisbursementsPage';
import EditAgreedDisbursementPage from './components/Lawfirmcomponents/disbursementManagement/4EditAgreedDisbursementPage';
import ProviderForgotPassword from './components/Providercomponents/providerForgotPassword';
import ProviderResetPassword from './components/Providercomponents/providerResetPassword';
import LawFirmForgotPassword from './components/Lawfirmcomponents/gettingIn/lawFirmForgotPassword';
import LawFirmResetPassword from './components/Lawfirmcomponents/gettingIn/lawFirmResetPassword';


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
        
        {/* Add the new route for provider verification from invite */}
        <Route 
          path="/verify-invite" 
          element={<ProviderVerificationFromInvite />} 
        />

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
          path="/provider-home/view-disbursements-requests" 
          element={
            <PrivateRoute>
              <ViewDisbursementsAndRequestsPage />
            </PrivateRoute>
          } 
        />
        <Route
          path="/provider-forgot-password"
          element={
          <ProviderForgotPassword />
        } 
        />
        <Route
          path="/provider-reset-password"
          element={
          <ProviderResetPassword />
        } 
        />
        <Route
          path="/lawfirm-forgot-password"
          element={
          <LawFirmForgotPassword />
        } 
        />
        <Route
          path="/lawfirm-reset-password"
          element={
          <LawFirmResetPassword />
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
          path="/existing-disbursement-paths" 
          element={
            <PrivateRoute>
              <ExistingDisbursementPaths />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/each-law-firm-disbursement-path" 
          element={
            <PrivateRoute>
              <EachLawFirmDisbursementPath key={Date.now()} /> 
            </PrivateRoute>
          } 
        />
        <Route 
          path="/potential-disbursement" 
          element={
            <PrivateRoute>
          <PotentialDisbursementPage />
          </PrivateRoute>
          } 
          />


<Route 
path="/previous-disbursements" 
element={
  <PrivateRoute>
<PreviousDisbursementsPage />
</PrivateRoute>
} 
/>
<Route
  path="/edit-agreed-disbursement/:id"
  element={
    <PrivateRoute>
  <EditAgreedDisbursementPage />
  </PrivateRoute>
  }
/>

      </Routes>
    </Router>
  );
}

export default App;
