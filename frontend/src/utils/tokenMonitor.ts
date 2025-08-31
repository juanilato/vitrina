// Utilidades para monitorear y debuggear el token

export interface TokenInfo {
  exists: boolean;
  length: number;
  preview: string;
  isExpired?: boolean;
  decodedPayload?: any;
}

/**
 * Obtiene información detallada del token almacenado
 */
export const getTokenInfo = (): TokenInfo => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return {
      exists: false,
      length: 0,
      preview: 'No token'
    };
  }

  // Intentar decodificar el token (JWT tiene 3 partes separadas por puntos)
  let decodedPayload: any = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = parts[1];
      const decoded = atob(payload);
      decodedPayload = JSON.parse(decoded);
    }
  } catch (error) {
    console.warn('⚠️ [TOKEN MONITOR] No se pudo decodificar el token:', error);
  }

  // Verificar si el token está expirado
  let isExpired = false;
  if (decodedPayload?.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    isExpired = currentTime > decodedPayload.exp;
  }

  return {
    exists: true,
    length: token.length,
    preview: `${token.substring(0, 20)}...`,
    isExpired,
    decodedPayload
  };
};

/**
 * Muestra información detallada del token en la consola
 */
export const logTokenInfo = (): void => {
  const tokenInfo = getTokenInfo();
  
  console.log('🔍 [TOKEN MONITOR] Información del token:', {
    exists: tokenInfo.exists,
    length: tokenInfo.length,
    preview: tokenInfo.preview,
    isExpired: tokenInfo.isExpired
  });

  if (tokenInfo.decodedPayload) {
    console.log('📋 [TOKEN MONITOR] Payload decodificado:', {
      sub: tokenInfo.decodedPayload.sub,
      email: tokenInfo.decodedPayload.email,
      type: tokenInfo.decodedPayload.type,
      iat: tokenInfo.decodedPayload.iat,
      exp: tokenInfo.decodedPayload.exp,
      issuer: tokenInfo.decodedPayload.iss,
      audience: tokenInfo.decodedPayload.aud
    });

    // Calcular tiempo restante
    if (tokenInfo.decodedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = tokenInfo.decodedPayload.exp - currentTime;
      const minutesRemaining = Math.floor(timeRemaining / 60);
      const secondsRemaining = timeRemaining % 60;
      
      console.log('⏰ [TOKEN MONITOR] Tiempo restante:', {
        totalSeconds: timeRemaining,
        minutes: minutesRemaining,
        seconds: secondsRemaining,
        isExpired: timeRemaining <= 0
      });
    }
  }
};

/**
 * Verifica si el token está próximo a expirar (dentro de 5 minutos)
 */
export const isTokenExpiringSoon = (): boolean => {
  const tokenInfo = getTokenInfo();
  
  if (!tokenInfo.exists || !tokenInfo.decodedPayload?.exp) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = tokenInfo.decodedPayload.exp - currentTime;
  const fiveMinutes = 5 * 60; // 5 minutos en segundos
  
  return timeRemaining <= fiveMinutes && timeRemaining > 0;
};

/**
 * Limpia el token del localStorage
 */
export const clearToken = (): void => {
  console.log('🗑️ [TOKEN MONITOR] Limpiando token del localStorage');
  localStorage.removeItem('token');
};

/**
 * Monitorea el token cada cierto tiempo y muestra alertas
 */
export const startTokenMonitoring = (intervalMs: number = 30000): (() => void) => {
  console.log('🔍 [TOKEN MONITOR] Iniciando monitoreo del token cada', intervalMs, 'ms');
  
  const interval = setInterval(() => {
    const tokenInfo = getTokenInfo();
    
    if (!tokenInfo.exists) {
      console.log('⚠️ [TOKEN MONITOR] No hay token activo');
      return;
    }

    if (tokenInfo.isExpired) {
      console.log('🚨 [TOKEN MONITOR] Token expirado!');
      clearToken();
      return;
    }

    if (isTokenExpiringSoon()) {
      console.log('⚠️ [TOKEN MONITOR] Token expirará pronto!');
    }

    // Log periódico del estado del token
    console.log('📊 [TOKEN MONITOR] Estado del token:', {
      exists: tokenInfo.exists,
      isExpired: tokenInfo.isExpired,
      expiringSoon: isTokenExpiringSoon()
    });
  }, intervalMs);

  // Retornar función para detener el monitoreo
  return () => {
    console.log('🛑 [TOKEN MONITOR] Deteniendo monitoreo del token');
    clearInterval(interval);
  };
};
