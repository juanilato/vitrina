/**
 * BaseDrawer Component
 * Componente base reutilizable para drawers laterales
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 320);

interface BaseDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
}

export const BaseDrawer: React.FC<BaseDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  side = 'left',
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer */}
        <View style={[styles.drawer, side === 'right' && styles.drawerRight]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              {children}
            </ScrollView>

            {/* Footer (opcional) */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  drawerRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    shadowOffset: { width: -2, height: 0 },
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
