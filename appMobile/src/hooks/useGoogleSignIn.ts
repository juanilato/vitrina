/**
 * Google Sign-In Hook
 * Using Expo AuthSession
 */

import { useState, useEffect } from 'react';
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

export const useGoogleSignIn = (mode: 'login' | 'register' = 'login') => {
  const { googleLogin, googleRegister } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.idToken);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      setLoading(false);
    } else if (response?.type === 'cancel') {
      console.log('Google auth cancelled by user');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      console.log('Google auth dismissed');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string | undefined) => {
    if (!idToken) {
      console.error('❌ No ID token received from Google');
      setLoading(false);
      return;
    }

    console.log('✅ ID token received, processing...');
    setLoading(true);
    try {
      if (mode === 'register') {
        console.log('📝 Registering with Google...');
        await googleRegister(idToken);
        console.log('✅ Google register successful');
      } else {
        console.log('🔐 Logging in with Google...');
        await googleLogin(idToken);
        console.log('✅ Google login successful');
      }
      // Navigation is handled by AuthContext
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error prompting Google sign-in:', error);
      setLoading(false);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading,
    disabled: !request || loading,
  };
};
