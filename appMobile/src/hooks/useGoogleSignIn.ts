/**
 * Google Sign-In Hook (Simplificado)
 * Using Expo AuthSession
 * Maneja login/registro automáticamente con un solo flujo
 */

import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs from environment variables
const GOOGLE_CLIENT_ID = {
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "594374983119-XXXXandroid.apps.googleusercontent.com",
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "594374983119-fim5bq8eo4o2nn919cgl9d7cml4qvohn.apps.googleusercontent.com",
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "594374983119-9v4m67ml05lkeafou7hmasb20m1oj7c6.apps.googleusercontent.com",
};

export const useGoogleSignIn = () => {
  const { googleAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
    // Configuración adicional para web
    redirectUri: Platform.OS === 'web'
      ? 'https://vitrina.com.ar/auth/google/callback'
      : undefined,
  });

  useEffect(() => {
    console.log('🔵 [useGoogleSignIn] Response type:', response?.type);

    if (response?.type === 'success') {
      console.log('✅ [useGoogleSignIn] Google auth success');
      handleGoogleResponse(response.authentication?.idToken);
    } else if (response?.type === 'error') {
      console.error('❌ [useGoogleSignIn] Google auth error:', response.error);
      setLoading(false);
    } else if (response?.type === 'cancel') {
      console.log('⚠️ [useGoogleSignIn] Google auth cancelled by user');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      console.log('⚠️ [useGoogleSignIn] Google auth dismissed');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string | undefined) => {
    if (!idToken) {
      console.error('❌ [useGoogleSignIn] No ID token received from Google');
      setLoading(false);
      return;
    }

    console.log('✅ [useGoogleSignIn] ID token received, processing...');
    setLoading(true);
    try {
      console.log('🔐 [useGoogleSignIn] Calling googleAuth...');
      await googleAuth(idToken);
      console.log('✅ [useGoogleSignIn] Google auth successful');
      // Navigation is handled by AuthContext
    } catch (error) {
      console.error('❌ [useGoogleSignIn] Google auth error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Advertencia para plataforma web
      if (Platform.OS === 'web') {
        console.warn('⚠️ [useGoogleSignIn] Google Auth en web puede tener problemas CORS');
        console.warn('⚠️ [useGoogleSignIn] Recomendamos usar en dispositivo móvil o emulador');
      }

      console.log('🔵 [useGoogleSignIn] Starting Google sign-in prompt...');
      console.log('🔵 [useGoogleSignIn] Platform:', Platform.OS);
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('❌ [useGoogleSignIn] Error prompting Google sign-in:', error);
      setLoading(false);

      // Mensaje más descriptivo en web
      if (Platform.OS === 'web') {
        Alert.alert(
          'Error de Google Auth',
          'Google Auth tiene problemas en el navegador web debido a políticas CORS. Por favor, prueba en un dispositivo móvil o emulador (Android/iOS).',
          [{ text: 'Entendido' }]
        );
      }

      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading,
    disabled: !request || loading,
  };
};
