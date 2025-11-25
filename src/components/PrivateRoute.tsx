import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const PrivateRoute: React.FC = () => {
  const { currentUser } = useAuth()
  return currentUser ? <Outlet /> : <Navigate to="/login" />
}
