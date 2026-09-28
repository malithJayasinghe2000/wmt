import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import WritePrescriptionScreen from '../screens/doctor/WritePrescriptionScreen';
import MySlotsScreen from '../screens/doctor/MySlotsScreen';
import PrescriptionsScreen from '../screens/shared/PrescriptionsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { stackOptions, tabOptions } from './screenOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Appointments -> Write prescription
const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} options={{ title: 'Appointments' }} />
    <Stack.Screen name="WritePrescription" component={WritePrescriptionScreen} options={{ title: 'Write prescription' }} />
  </Stack.Navigator>
);

const SlotsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="MySlots" component={MySlotsScreen} options={{ title: 'My time slots' }} />
  </Stack.Navigator>
);

const PrescriptionsStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="PrescriptionList" component={PrescriptionsScreen} options={{ title: 'Prescriptions written' }} />
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

const icons = {
  Appointments: 'calendar-outline',
  'My slots': 'time-outline',
  Prescriptions: 'document-text-outline',
  Alerts: 'notifications-outline',
  Profile: 'person-outline',
};

export default function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ tabBarLabel: 'Visits' }} />
      <Tab.Screen name="My slots" component={SlotsStack} options={{ tabBarLabel: 'Slots' }} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsStack} options={{ tabBarLabel: 'Records' }} />
      <Tab.Screen name="Alerts" component={AlertsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
