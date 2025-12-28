/**
 * CategoryTransitionContext
 * Maneja el estado de la animación de cortina entre pantallas
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryTransitionState {
  isVisible: boolean;
  categoryName: string;
  categoryIcon: string;
  isLoading: boolean;
}

interface CategoryTransitionContextType {
  transitionState: CategoryTransitionState;
  startTransition: (categoryName: string, categoryIcon: string) => void;
  finishTransition: () => void;
  hideTransition: () => void;
}

const CategoryTransitionContext = createContext<CategoryTransitionContextType | undefined>(undefined);

export const CategoryTransitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transitionState, setTransitionState] = useState<CategoryTransitionState>({
    isVisible: false,
    categoryName: '',
    categoryIcon: 'tag',
    isLoading: false,
  });

  const startTransition = (categoryName: string, categoryIcon: string) => {
    console.log('[CategoryTransitionContext] startTransition llamado:', { categoryName, categoryIcon });
    setTransitionState({
      isVisible: true,
      categoryName,
      categoryIcon,
      isLoading: true,
    });
  };

  const finishTransition = () => {
    setTransitionState(prev => ({
      ...prev,
      isLoading: false,
    }));
  };

  const hideTransition = () => {
    setTransitionState({
      isVisible: false,
      categoryName: '',
      categoryIcon: 'tag',
      isLoading: false,
    });
  };

  return (
    <CategoryTransitionContext.Provider
      value={{
        transitionState,
        startTransition,
        finishTransition,
        hideTransition,
      }}
    >
      {children}
    </CategoryTransitionContext.Provider>
  );
};

export const useCategoryTransition = () => {
  const context = useContext(CategoryTransitionContext);
  if (context === undefined) {
    throw new Error('useCategoryTransition must be used within a CategoryTransitionProvider');
  }
  return context;
};
