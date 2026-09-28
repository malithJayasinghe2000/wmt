import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorDetailScreen from '../screens/patient/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import PrescriptionsScreen from '../screens/shared/PrescriptionsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { stackOptions, tabOptions } from './screenOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Doctors -> Doctor detail -> Book appointment
const DoctorsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Find a doctor' }} />
    <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor' }} />
    <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book appointment' }} />
  </Stack.Navigator>
);

const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: 'My appointments' }} />
  </Stack.Navigator>
);

const PrescriptionsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="PrescriptionList" component={PrescriptionsScreen} options={{ title: 'My prescriptions' }} />
  </Stack.Navigator>
);

const AlertsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'My profile' }} />
  </Stack.Navigator>
);

// One icon per tab, so the bar is readable at a glance
const icons = {
  Doctors: 'medkit-outline',
  Appointments: 'calendar-outline',
  Prescriptions: 'document-text-outline',
  Alerts: 'notifications-outline',
  Profile: 'person-outline',
};

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Doctors" component={DoctorsStack} />
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ tabBarLabel: 'Visits' }} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsStack} options={{ tabBarLabel: 'Records' }} />
      <Tab.Screen name="Alerts" component={AlertsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
