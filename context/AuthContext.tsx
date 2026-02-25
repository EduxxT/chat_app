import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  User // <--- Importamos el tipo 'User' de Firebase
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '@/firebaseConfig'; 

// 1. DEFINIMOS LA FORMA DE LOS DATOS (INTERFACE)
interface AuthState {
  user: User | null;
  authenticated: boolean;
  isLoading: boolean;
}

interface AuthContextProps {
  authState: AuthState;
  onLogin: (email: string, password: string) => Promise<{ success?: boolean; error?: { message: string } }>;
  onRegister: (email: string, password: string, name: string) => Promise<{ success?: boolean; error?: { message: string }; user?: User }>;
  onLogout: () => Promise<void>;
}

// 2. CREAMOS EL CONTEXTO CON ESE TIPO (Inicialmente undefined para forzar el Provider)
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 3. TIPAMOS EL ESTADO
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    authenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ [FIREBASE] Usuario detectado:", user.email);
        setAuthState({
          user: user,
          authenticated: true,
          isLoading: false,
        });
      } else {
        console.log("👋 [FIREBASE] Sin sesión");
        setAuthState({
          user: null,
          authenticated: false,
          isLoading: false,
        });
      }
    });
    return unsubscribe;
  }, []);

  const onLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      let msg = "Error al iniciar sesión";
      if (e.code === 'auth/invalid-email') msg = "Correo inválido";
      if (e.code === 'auth/user-not-found') msg = "Usuario no encontrado";
      if (e.code === 'auth/wrong-password') msg = "Contraseña incorrecta";
      if (e.code === 'auth/invalid-credential') msg = "Credenciales incorrectas";
      return { error: { message: msg } };
    }
  };

  const onRegister = async (email: string, password: string, name: string) => {
    try {
      // A. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // B. Actualizar el perfil interno (Auth)
      await updateProfile(user, {
        displayName: name,
        photoURL: 'https://i.pravatar.cc/150?u=' + user.uid 
      });

      // C. Guardar en Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: name,
        photoURL: 'https://i.pravatar.cc/150?u=' + user.uid,
        createdAt: new Date(),
      });

      return { success: true, user: user };
    } catch (e: any) {
      console.error(e);
      let msg = "Error al registrarse";
      if (e.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado";
      if (e.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres";
      return { error: { message: msg } };
    }
  };

  const onLogout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ onRegister, onLogin, onLogout, authState }}>
      {children}
    </AuthContext.Provider>
  );
};