import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppButton from './AppButton';
import { uploadFile } from '../api/uploadApi';
import { colors } from '../utils/theme';

// Picks an image from the gallery, uploads it through /api/upload
// and hands the returned URL back to the parent form.
export default function ImageUploadField({ label = 'Photo', value, onUploaded, showPreview = true }) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (result.canceled) return;

    try {
      setUploading(true);
      const url = await uploadFile(result.assets[0]);
      onUploaded(url);
    } catch (error) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {showPreview && value ? <Image source={{ uri: value }} style={styles.preview} /> : null}
      <AppButton
        title={value ? 'Change image' : 'Pick and upload image'}
        variant="outline"
        loading={uploading}
        onPress={pickAndUpload}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { marginBottom: 6, color: colors.text, fontWeight: '600', fontSize: 13 },
  preview: { width: 90, height: 90, borderRadius: 8, marginBottom: 8 },
});
