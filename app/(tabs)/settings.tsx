import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker'; // <--- Importamos esto
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '@/firebaseConfig'; // <--- Asegúrate que la ruta sea correcta
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Interfaz para los ítems
interface SettingItemProps {
  icon: any; // Usamos any para simplificar iconos de ionic
  title: string;
  subtitle?: string;
  hasSwitch?: boolean;
  onSwitch?: (value: boolean) => void;
}

const SettingItem = ({ icon, title, subtitle, hasSwitch = false, onSwitch = () => {} }: SettingItemProps) => (
  <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
    <View style={styles.settingIconContainer}>
      <Ionicons name={icon} size={24} color="#000" />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {hasSwitch ? (
      <Switch value={true} onValueChange={onSwitch} trackColor={{ false: "#767577", true: "#000" }} thumbColor={"#f4f3f4"} />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#999" />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { onLogout, authState } = useAuth();
  const user = authState.user;

  // Estados para la edición
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);

  // Función para elegir imagen de la galería
  const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    setLoading(true); // Mostrar un spinner si lo tienes
    try {
      const permanentURL = await uploadImageAsync(result.assets[0].uri);
      if (permanentURL) {
        setLocalImage(permanentURL); // Ahora la URL es de internet
      }
      Alert.alert("Éxito", "Foto de perfil actualizada para siempre 🚀");
    } catch (e) {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  }
};  
  
const uploadImageAsync = async (uri: string) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // 1. Convertir la imagen a Blob (necesario para Firebase en móvil)
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Crear una referencia única (carpeta avatars / id_usuario.jpg)
    const storageRef = ref(storage, `avatars/${user.uid}.jpg`);

    // 3. Subir el archivo
    await uploadBytes(storageRef, blob);

    // 4. Obtener la URL pública permanente
    const downloadURL = await getDownloadURL(storageRef);

    // 5. Actualizar Auth (para que useAuth() vea el cambio)
    await updateProfile(user, { photoURL: downloadURL });

    // 6. Actualizar Firestore (para que otros usuarios vean tu foto)
    await updateDoc(doc(db, "users", user.uid), {
      photoURL: downloadURL
    });

    return downloadURL;
  } catch (error) {
    console.error("Error al subir:", error);
    throw error;
  }
};
  // Función para guardar el nuevo nombre
  const handleSaveProfile = async () => {
    if (!user) return;
    if (newName.trim() === '') {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      // 1. Actualizar en Auth (Sesión actual)
      await updateProfile(user, {
        displayName: newName
      });

      // 2. Actualizar en Firestore (Base de datos pública)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: newName
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* 2. CONTENIDO */}
      <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          
          {/* --- Perfil de Usuario (DINÁMICO) --- */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={pickImage}>
                <Image 
                source={{ uri: localImage || user?.photoURL || 'https://i.pravatar.cc/150' }} 
                style={styles.profileImage} 
                />
                {/* Icono de cámara pequeño sobre la foto */}
                <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={12} color="#fff" />
                </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.displayName || "Usuario sin nombre"}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>

            {/* Botón Editar */}
            <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          {/* --- Secciones --- */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>GENERAL</Text>
            <SettingItem icon="person-outline" title="Account" subtitle="Privacy, security, change email" />
            <SettingItem icon="notifications-outline" title="Notifications" hasSwitch={true} />
            <SettingItem icon="moon-outline" title="Dark Mode" hasSwitch={true} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SUPPORT & ABOUT</Text>
            <SettingItem icon="help-circle-outline" title="Help & Support" />
            <SettingItem icon="document-text-outline" title="Terms and Policies" />
            <SettingItem icon="information-circle-outline" title="About App" subtitle="Version 1.0.0" />
          </View>

          {/* --- Botón Logout --- */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>App Version 1.0.0</Text>

        </ScrollView>
      </View>

      {/* --- MODAL PARA EDITAR NOMBRE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>
                
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <TextInput 
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Tu nombre"
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.modalBtn, styles.cancelBtn]} 
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.btnTextCancel}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.modalBtn, styles.saveBtn]} 
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.btnTextSave}>Guardar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { height: 120, justifyContent: 'flex-end', paddingHorizontal: 30, paddingBottom: 25 },
  headerTitle: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  whiteCard: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 60, overflow: 'hidden' },
  scrollViewContent: { padding: 30, paddingTop: 40 },
  
  // Perfil
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  profileImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#000' },
  cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { marginLeft: 20, flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  profileEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  editButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 25 },
  
  // Secciones
  section: { marginBottom: 35 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 15, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingIconContainer: { width: 40, alignItems: 'center', marginRight: 15 },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontSize: 17, color: '#000', fontWeight: '500' },
  settingSubtitle: { fontSize: 13, color: '#666', marginTop: 3 },
  
  // Logout
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', borderRadius: 15, paddingVertical: 18, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  logoutIcon: { marginRight: 10 },
  logoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 20 },

  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f0f0f0', marginRight: 10 },
  saveBtn: { backgroundColor: '#000', marginLeft: 10 },
  btnTextCancel: { color: '#000', fontWeight: '600' },
  btnTextSave: { color: '#fff', fontWeight: '600' }
});