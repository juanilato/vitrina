/**
 * Google OAuth Callback Handler
 * Maneja el redirect de Google después de la autenticación
 */

import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function GoogleCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { googleAuth } = useAuth();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('🔵 [GoogleCallback] Procesando callback de Google');
      console.log('🔵 [GoogleCallback] Params:', params);
      console.log('🔵 [GoogleCallback] Window location:', typeof window !== 'undefined' ? window.location.href : 'N/A');

      // En web, los parámetros OAuth vienen en el hash (#) de la URL
      let idToken: string | null = null;
      let accessToken: string | null = null;

      // Intentar extraer del hash primero (OAuth implicit flow)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        idToken = hashParams.get('id_token');
        accessToken = hashParams.get('access_token');

        console.log('🔵 [GoogleCallback] Hash params:', {
          hasIdToken: !!idToken,
          hasAccessToken: !!accessToken,
        });
      }

      // Si no está en el hash, intentar desde los params de la URL
      if (!idToken && !accessToken) {
        idToken = params.id_token as string;
        accessToken = params.access_token as string;
      }

      // Priorizar id_token sobre access_token
      const token = idToken || accessToken;

      if (!token) {
        console.error('❌ [GoogleCallback] No se encontró id_token ni access_token');
        console.error('❌ [GoogleCallback] Params disponibles:', Object.keys(params));
        throw new Error('No se recibió el token de Google');
      }

      console.log('✅ [GoogleCallback] Token recibido:', idToken ? 'id_token' : 'access_token');
      console.log('🔐 [GoogleCallback] Llamando googleAuth...');

      await googleAuth(token);

      console.log('✅ [GoogleCallback] Autenticación exitosa, redirigiendo...');

      // Redirigir al home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ [GoogleCallback] Error:', error);

      // Redirigir al login con error
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Completando inicio de sesión...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
