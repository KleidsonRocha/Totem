// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const authToken = sessionStorage.getItem('authToken');
  if (!authToken) {
    return <Navigate to="/Login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
