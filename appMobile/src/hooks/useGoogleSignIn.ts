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
import { makeRedirectUri, ResponseType } from 'expo-auth-session';

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

// Google OAuth Client IDs from environment variables
const GOOGLE_CLIENT_ID = {
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID 
};

export const useGoogleSignIn = () => {
  const { googleAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  // Create redirect URI - on web this will be the current origin + /auth/google/callback
const redirectUri = makeRedirectUri({
  scheme: 'vitrina',
  preferLocalhost: true,
});

  console.log('🔵 [useGoogleSignIn] Redirect URI:', redirectUri);

  // IMPORTANT: Use Authorization Code Flow for better token handling
  // ResponseType.Code gets both access_token AND id_token
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
    // Use code flow - Expo will exchange the code for tokens automatically
    responseType: ResponseType.Code,
    scopes: ['openid', 'email', 'profile'],
    redirectUri,
    // Ensure we get id_token in the response
    extraParams: {
      access_type: 'offline',
    },
  });

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}


useEffect(() => {
  console.log('🔵 [useGoogleSignIn] Response type:', response?.type);

  if (response?.type === 'success') {
    console.log('✅ [useGoogleSignIn] Google auth success');

    // ONLY accept id_token (JWT format), NOT access_token
    const idToken = response.authentication?.idToken;

    if (!idToken) {
      console.error('❌ [useGoogleSignIn] No ID token received from Google');
      console.error('❌ Received:', {
        hasAccessToken: !!response.authentication?.accessToken,
        hasIdToken: !!response.authentication?.idToken,
      });
      setLoading(false);
      Alert.alert(
        'Error de configuración',
        'No se recibió un ID token válido de Google. Verifica la configuración en Google Cloud Console.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    console.log('✅ [useGoogleSignIn] ID Token received (JWT format)');
    console.log('🔵 [useGoogleSignIn] Token starts with:', idToken.substring(0, 20) + '...');

    handleGoogleResponse(idToken);
  }
  else if (response?.type === 'error') {
    console.error('❌ [useGoogleSignIn] Google auth error:', response.error);
    setLoading(false);
  }
  else if (response?.type === 'cancel') {
    console.log('⚠️ [useGoogleSignIn] Google auth cancelled by user');
    setLoading(false);
  }
  else if (response?.type === 'dismiss') {
    console.log('⚠️ [useGoogleSignIn] Google auth dismissed');
    setLoading(false);
  }
}, [response]);


const handleGoogleResponse = async (idToken: string | undefined) => {
  if (!idToken) {
    console.error('❌ [useGoogleSignIn] No ID token provided');
    setLoading(false);
    return;
  }

  console.log('🔐 [useGoogleSignIn] Sending ID token to backend for verification...');

  setLoading(true);
  try {
    await googleAuth(idToken);
    console.log('✅ [useGoogleSignIn] Google auth successful - backend verified JWT');
  } catch (error) {
    console.error('❌ [useGoogleSignIn] Backend rejected ID token:', error);
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
        const result = await promptAsync();
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
