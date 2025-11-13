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
import { makeRedirectUri } from 'expo-auth-session';

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

  // Create redirect URI - on web this will be the current origin + /auth/google/callback
  const redirectUri = makeRedirectUri({
    scheme: 'vitrina',
    path: 'auth/google/callback',
  });

  console.log('🔵 [useGoogleSignIn] Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
    redirectUri: redirectUri,
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
      console.log('🔵 [useGoogleSignIn] Starting Google sign-in prompt...');
      console.log('🔵 [useGoogleSignIn] Platform:', Platform.OS);
      console.log('🔵 [useGoogleSignIn] Redirect URI:', redirectUri);

      setLoading(true);

      if (Platform.OS === 'web') {
        console.log('🌐 [useGoogleSignIn] Using web-optimized OAuth flow');
        // En web, promptAsync abre una nueva pestaña/ventana para auth
        // El COOP error es una advertencia, no un error fatal
        const result = await promptAsync({ useProxy: false });
        console.log('🔵 [useGoogleSignIn] Prompt result:', result?.type);
      } else {
        // En móvil, usar el flujo normal
        await promptAsync();
      }
    } catch (error) {
      console.error('❌ [useGoogleSignIn] Error prompting Google sign-in:', error);
      setLoading(false);

      Alert.alert(
        'Error de autenticación',
        'No se pudo iniciar sesión con Google. Por favor, intenta nuevamente.',
        [{ text: 'Entendido' }]
      );

      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading,
    disabled: !request || loading,
  };
};
