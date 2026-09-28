import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';
import AdminTabs from './AdminTabs';

// Decides which app the user sees, based on the role inside their token.
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loader text="Starting..." />;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'admin' ? (
        <AdminTabs />
      ) : user.role === 'doctor' ? (
        <DoctorTabs />
      ) : (
        <PatientTabs />
      )}
    </NavigationContainer>
  );
}
