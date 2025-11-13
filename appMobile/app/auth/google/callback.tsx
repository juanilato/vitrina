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

      // Extraer el access_token del hash de la URL
      // En Expo Web, los parámetros vienen en el formato: #access_token=...&token_type=...
      const accessToken = params.access_token as string;

      if (!accessToken) {
        console.error('❌ [GoogleCallback] No se encontró access_token en la URL');
        throw new Error('No se recibió el token de Google');
      }

      console.log('✅ [GoogleCallback] Access token recibido');
      console.log('🔐 [GoogleCallback] Llamando googleAuth...');

      // IMPORTANTE: El access_token de Google NO es lo mismo que el idToken
      // Necesitamos usar este access_token para obtener el idToken o la info del usuario
      // Por ahora, vamos a enviar el access_token al backend y que él lo maneje

      await googleAuth(accessToken);

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
