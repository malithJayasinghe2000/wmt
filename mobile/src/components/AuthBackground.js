import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';

// The background behind the login and register screens.
// A gradient plus two soft circles, so it needs no image file and
// still works with no internet.
//
// To use a real photo instead: put the file in mobile/assets/login-bg.jpg,
// import ImageBackground from react-native, and wrap the children in
// <ImageBackground source={require('../../assets/login-bg.jpg')} style={StyleSheet.absoluteFill}>
export default function AuthBackground({ children }) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  circleTop: { width: 260, height: 260, top: -90, right: -70 },
  circleBottom: { width: 200, height: 200, bottom: -60, left: -60 },
});
