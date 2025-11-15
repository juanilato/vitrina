/**
 * Google Sign-In Hook (Simplificado)
 * Using Expo AuthSession
 * Maneja login/registro automáticamente con un solo flujo
 */

import { useState, useEffect, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';

// Complete auth session ONCE at module level
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

  // Memoize redirect URI to prevent infinite re-renders
  const redirectUri = useMemo(() => {
    if (Platform.OS === 'web') {
      // En web, usar la URL actual del navegador (funciona en dev y producción)
      // Esto permite que funcione tanto en localhost como en tu dominio
      if (typeof window !== 'undefined') {
        return window.location.origin; // http://localhost:8081 o https://tudominio.com
      }
    }

    // Para móvil, usar el scheme personalizado
    return makeRedirectUri({
      scheme: 'vitrina',
      preferLocalhost: true,
    });
  }, []);

  // Log ONCE when hook is first created
  useEffect(() => {
    console.log('🔵 [useGoogleSignIn] Redirect URI:', redirectUri);
  }, [redirectUri]);

  // IMPORTANT: Use IdToken response type to get the JWT directly
  // This is the proper way to get id_token on web without client_secret
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
    // Use IdToken response type - returns JWT directly
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'email', 'profile'],
    redirectUri,
  });


useEffect(() => {
  console.log('🔵 [useGoogleSignIn] Response type:', response?.type);

  if (response?.type === 'success') {
    console.log('✅ [useGoogleSignIn] Google auth success');
    console.log('🔵 [useGoogleSignIn] Full response object:', JSON.stringify({
      type: response.type,
      authentication: response.authentication,
      params: response.params,
      url: response.url,
    }, null, 2));

    console.log('🔵 [useGoogleSignIn] Response authentication:', {
      hasAccessToken: !!response.authentication?.accessToken,
      hasIdToken: !!response.authentication?.idToken,
      hasRefreshToken: !!response.authentication?.refreshToken,
    });

    // DEBUG: Log all available properties
    console.log('🔍 [useGoogleSignIn] ALL response properties:', Object.keys(response));
    console.log('🔍 [useGoogleSignIn] ALL params properties:', response.params ? Object.keys(response.params) : 'null');

    // PRIORITY 1: Check response.params.id_token FIRST (most reliable on web)
    // This is where Expo AuthSession puts the token on web with ResponseType.IdToken
    let idToken: string | undefined = undefined;

    if (response.params?.id_token) {
      console.log('✅ [useGoogleSignIn] ID Token found in response.params.id_token');
      idToken = response.params.id_token as string;
    }

    // PRIORITY 2: Check authentication.idToken (fallback for native)
    if (!idToken && response.authentication?.idToken) {
      console.log('✅ [useGoogleSignIn] ID Token found in response.authentication.idToken');
      idToken = response.authentication.idToken;
    }

    // On web, if still not found, extract manually from URL (hash or query params)
    if (!idToken && Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('🔍 [useGoogleSignIn] Attempting manual token extraction from URL');
      console.log('🔍 [useGoogleSignIn] Current URL:', window.location.href);
      console.log('🔍 [useGoogleSignIn] Response URL:', response.url);

      // Try hash fragment first (#id_token=...)
      if (window.location.hash) {
        console.log('🔍 [useGoogleSignIn] Checking hash:', window.location.hash);
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get('id_token');

        if (hashToken) {
          idToken = hashToken;
          console.log('✅ [useGoogleSignIn] ID Token extracted from URL hash');
          // Clean the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }

      // If not in hash, try query params (?id_token=...)
      if (!idToken && window.location.search) {
        console.log('🔍 [useGoogleSignIn] Checking query params:', window.location.search);
        const queryParams = new URLSearchParams(window.location.search);
        const queryToken = queryParams.get('id_token');

        if (queryToken) {
          idToken = queryToken;
          console.log('✅ [useGoogleSignIn] ID Token extracted from query params');
        }
      }

      // Last resort: try parsing response.url if available
      if (!idToken && response.url) {
        console.log('🔍 [useGoogleSignIn] Trying to parse response.url:', response.url);
        try {
          const url = new URL(response.url);

          // Check hash in response.url
          if (url.hash) {
            const urlHashParams = new URLSearchParams(url.hash.substring(1));
            const urlHashToken = urlHashParams.get('id_token');
            if (urlHashToken) {
              idToken = urlHashToken;
              console.log('✅ [useGoogleSignIn] ID Token extracted from response.url hash');
            }
          }

          // Check query params in response.url
          if (!idToken) {
            const urlQueryToken = url.searchParams.get('id_token');
            if (urlQueryToken) {
              idToken = urlQueryToken;
              console.log('✅ [useGoogleSignIn] ID Token extracted from response.url query');
            }
          }
        } catch (e) {
          console.error('❌ [useGoogleSignIn] Error parsing response.url:', e);
        }
      }

      if (idToken) {
        console.log('🔵 [useGoogleSignIn] Token starts with:', idToken.substring(0, 20) + '...');
      }
    }

    if (!idToken) {
      console.error('❌ [useGoogleSignIn] No ID token received from Google');
      console.error('❌ Full authentication object:', response.authentication);
      console.error('❌ Response params:', response.params);
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
