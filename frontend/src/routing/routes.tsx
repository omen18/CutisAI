import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoadingScreen from '../components/common/LoadingScreen/LoadingScreen';

const Landing         = lazy(() => import('../pages/Landing/Landing'));
const UserHome        = lazy(() => import('../pages/UserHome/UserHome'));
const UserResult      = lazy(() => import('../pages/UserResult/UserResult'));
const DoctorDashboard = lazy(() => import('../pages/DoctorDashboard/DoctorDashboard'));

const AppRouter: React.FC = () => {
  const [initialLoading, setInitialLoading] = React.useState<boolean>(() => {
    // Show boot loading animation once per session
    const hasBooted = sessionStorage.getItem('cutis_booted');
    return !hasBooted;
  });

  const handleBootComplete = () => {
    sessionStorage.setItem('cutis_booted', 'true');
    setInitialLoading(false);
  };

  if (initialLoading) {
    return <LoadingScreen isInitialBoot={true} onComplete={handleBootComplete} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen isInitialBoot={false} />}>
        <Routes>
          {/* Root → always go to landing first */}
          <Route path="/"        element={<Navigate to="/welcome" replace/>}/>

          {/* Landing page — role selection */}
          <Route path="/welcome" element={<Landing/>}/>

          {/* User Panel */}
          <Route path="/home"    element={<UserHome/>}/>
          <Route path="/result"  element={<UserResult/>}/>

          {/* Doctor Panel */}
          <Route path="/doctor"  element={<DoctorDashboard/>}/>

          {/* Catch-all */}
          <Route path="*"        element={<Navigate to="/welcome" replace/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;