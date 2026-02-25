import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage'; // 1. Importa esto

// 🔴 PEGA AQUÍ TU CONFIGURACIÓN DE LA CONSOLA DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBztTYaU6rudTkJ5fMfyq-t3T6J1BYiiTE",
  authDomain: "test-app-chat-937bf.firebaseapp.com",
  projectId: "test-app-chat-937bf",
  storageBucket: "jonathan_chatapp_storage",
  messagingSenderId: "459303630591",
  appId: "1:459303630591:web:bdc9d88d985ecac3a87eca",
  measurementId: "G-KPK43CFP87"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia para React Native
// (Esto es clave para que no te pida login cada vez que abres la app)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Base de Datos
export const db = getFirestore(app);
export const storage = getStorage(app); // 3. Exporta esto