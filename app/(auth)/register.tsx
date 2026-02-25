import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert // <--- Importamos Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <--- Descomentado
import { useAuth } from '../../context/AuthContext'; // <--- Descomentado

export default function RegisterScreen() {
  const router = useRouter(); // <--- Descomentado
  const { onRegister } = useAuth(); // <--- Descomentado

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Para evitar doble click

  const handleRegister = async () => {
    // 1. Validaciones básicas
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    // 2. Unimos Nombre y Apellido
    const fullName = `${firstName} ${lastName}`;

    // 3. Llamamos a Firebase
    try {
      await onRegister(email, password, fullName);
      setLoading(false);
      // Si es exitoso, el AuthContext actualizará el estado y el RootLayout te redirigirá solo.
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error en registro', error?.message || 'Algo salió mal');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>
      </View>

      {/* FORMULARIO */}
      <View style={styles.formContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            
            {/* Input: First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First name</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Nombre"
                  placeholderTextColor="#A0A0A0"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            {/* Input: Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last name</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Apellido"
                  placeholderTextColor="#A0A0A0"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Input: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="xxx@email.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Input: Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Botón Sign Up */}
            <TouchableOpacity 
                style={styles.registerButton} 
                onPress={handleRegister}
                disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Creando cuenta..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have any account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// ... TUS MISMOS ESTYLES (No hace falta cambiarlos) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerContainer: { height: 150, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 40 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 20 },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  formContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 60, paddingHorizontal: 30, paddingTop: 40, overflow: 'hidden' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '600' },
  inputWrapper: { backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 0.5, borderColor: '#f0f0f0' },
  input: { fontSize: 16, color: '#000' },
  registerButton: { backgroundColor: '#000', borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: 40 },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});