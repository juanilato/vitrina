/**
 * Alert Helper
 * Wrapper para Alert que funciona tanto en web como en mobile
 */

import { Alert as RNAlert, Platform } from 'react-native';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: any
  ) => {
    if (Platform.OS === 'web') {
      // En web, usar window.alert y window.confirm
      if (!buttons || buttons.length === 0) {
        // Solo un OK
        window.alert(`${title}\n\n${message || ''}`);
      } else if (buttons.length === 1) {
        // Un solo botón
        window.alert(`${title}\n\n${message || ''}`);
        buttons[0].onPress?.();
      } else {
        // Múltiples botones - usar confirm
        const result = window.confirm(`${title}\n\n${message || ''}`);

        // Buscar el botón destructivo o el segundo botón
        const destructiveButton = buttons.find(b => b.style === 'destructive');
        const cancelButton = buttons.find(b => b.style === 'cancel');

        if (result) {
          // Usuario presionó OK
          if (destructiveButton) {
            destructiveButton.onPress?.();
          } else {
            // Si no hay destructive, usar el último botón que no sea cancel
            const actionButton = buttons.find(b => b.style !== 'cancel');
            actionButton?.onPress?.();
          }
        } else {
          // Usuario presionó Cancel
          cancelButton?.onPress?.();
        }
      }
    } else {
      // En mobile, usar Alert nativo
      RNAlert.alert(title, message, buttons as any, options);
    }
  }
};
