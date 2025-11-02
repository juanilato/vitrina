/**
 * MenuDrawer Component
 * Drawer lateral derecho con opciones de navegación
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, textStyles, spacing } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 1, 320);

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  action?: () => void;
  badge?: number;
  divider?: boolean;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigate = (route?: string, action?: () => void) => {
    onClose();
    if (action) {
      action();
    } else if (route) {
      router.push(route as any);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Inicio',
      route: '/',
    },
    {
      icon: 'cart',
      label: 'Carrito',
      route: '/cart',
    },
    {
      icon: 'receipt',
      label: 'Pedidos',
      route: '/orders',
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
      route: '/notifications',
    },
    {
      divider: true,
      icon: 'ellipse',
      label: '',
    },
    {
      icon: 'person',
      label: 'Mi Perfil',
      route: '/profile',
    },
    {
      icon: 'settings',
      label: 'Configuración',
      route: '/settings',
    },
    {
      divider: true,
      icon: 'ellipse',
      label: '',
    },
    {
      icon: 'help-circle',
      label: 'Ayuda',
      route: '/help',
    },
    {
      icon: 'log-out',
      label: 'Cerrar Sesión',
      action: logout,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer Content */}
        <View style={styles.drawer}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Menú</Text>
                {user && (
                  <Text style={styles.headerSubtitle}>{user.name || user.email}</Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
            >
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return <View key={`divider-${index}`} style={styles.divider} />;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigate(item.route, item.action)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name={item.icon} size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>

                    {item.badge !== undefined && item.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}

                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Vitrina v1.0.0</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    
    top: "8%",
    width: "100%",
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.gray50,
  },
  headerTitle: {
    ...textStyles.title3,
    color: colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.white,
  },

  // Menu Items
  menuContainer: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
    borderRadius: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuItemText: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  footerText: {
    ...textStyles.caption2,
    color: colors.textTertiary,
  },
});
