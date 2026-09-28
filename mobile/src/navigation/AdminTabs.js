import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ManageDoctorsScreen from '../screens/admin/ManageDoctorsScreen';
import DoctorFormScreen from '../screens/admin/DoctorFormScreen';
import ManageSpecializationsScreen from '../screens/admin/ManageSpecializationsScreen';
import ManageAppointmentsScreen from '../screens/admin/ManageAppointmentsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { stackOptions, tabOptions } from './screenOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

// Doctors -> add/edit doctor, and the specialization master data
const DoctorsAdminStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ManageDoctors" component={ManageDoctorsScreen} options={{ title: 'Doctors' }} />
    <Stack.Screen name="DoctorForm" component={DoctorFormScreen} options={{ title: 'Doctor details' }} />
    <Stack.Screen name="ManageSpecializations" component={ManageSpecializationsScreen} options={{ title: 'Specializations' }} />
  </Stack.Navigator>
);

const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} options={{ title: 'All appointments' }} />
  </Stack.Navigator>
);

const UsersStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ title: 'Users' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'My profile' }} />
  </Stack.Navigator>
);

const icons = {
  Dashboard: 'grid-outline',
  Doctors: 'medkit-outline',
  Appointments: 'calendar-outline',
  Users: 'people-outline',
  Profile: 'person-outline',
};

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Doctors" component={DoctorsAdminStack} />
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ tabBarLabel: 'Visits' }} />
      <Tab.Screen name="Users" component={UsersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
