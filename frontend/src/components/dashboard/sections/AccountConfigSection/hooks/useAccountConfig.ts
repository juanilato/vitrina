import { useState, useEffect, useCallback } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import axiosInstance from '../../../../../config/axios.config';
import { 
  AccountConfigState, 
  AccountConfigActions, 
  EmpresaData, 
  UpdateEmpresaData, 
  UpdateUbicacionData
} from '../types';

const useAccountConfig = (): AccountConfigState & AccountConfigActions => {
  const { user } = useAuthOptimized();
  
  const [state, setState] = useState<AccountConfigState>({
    loading: false,
    saving: false,
    error: null,
    success: null,
    empresaData: null,
    formData: {
      name: '',
      email: '',
      logo: '',
      ubicaciones: []
    },
    hasChanges: false,
    activeTab: 'profile'
  });

  // Cargar datos de la empresa
  const loadEmpresaData = useCallback(async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axiosInstance.get(`/empresas/${user.id}`);
      const empresaData: EmpresaData = response.data;

      // Log para debuggear
      console.log('🏢 [FRONTEND] Datos recibidos de empresa:', {
        id: empresaData.id,
        name: empresaData.name,
        ubicacionesCount: empresaData.ubicaciones?.length || 0,
        ubicaciones: empresaData.ubicaciones
      });

      setState(prev => ({
        ...prev,
        loading: false,
        empresaData,
        formData: {
          name: empresaData.name,
          email: empresaData.email,
          logo: empresaData.logo || '',
          ubicaciones: empresaData.ubicaciones || []
        },
        hasChanges: false
      }));
    } catch (error: any) {
      console.error('Error al cargar datos de empresa:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Error al cargar datos de la empresa'
      }));
    }
  }, [user?.id]);

  // Actualizar perfil
  const updateProfile = useCallback(async (data: UpdateEmpresaData) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      const response = await axiosInstance.patch(`/empresas/${user.id}`, data);
      const updatedEmpresa: EmpresaData = response.data;

      setState(prev => ({
        ...prev,
        saving: false,
        empresaData: updatedEmpresa,
        formData: {
          ...prev.formData,
          name: updatedEmpresa.name,
          email: updatedEmpresa.email,
          logo: updatedEmpresa.logo || ''
        },
        hasChanges: false,
        success: 'Perfil actualizado exitosamente'
      }));

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al actualizar perfil'
      }));
    }
  }, [user?.id]);

  // Actualizar ubicación
  const updateLocation = useCallback(async (locationId: number, data: UpdateUbicacionData) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      await axiosInstance.patch(`/empresas/${user.id}/ubicaciones/${locationId}`, data);
      
      // Recargar datos de la empresa
      await loadEmpresaData();
      
      setState(prev => ({
        ...prev,
        saving: false,
        success: 'Ubicación actualizada exitosamente'
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar ubicación:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al actualizar ubicación'
      }));
    }
  }, [user?.id, loadEmpresaData]);

  // Agregar ubicación
  const addLocation = useCallback(async (data: Omit<UpdateUbicacionData, 'id'>) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      await axiosInstance.post(`/empresas/${user.id}/ubicaciones`, data);
      
      // Recargar datos de la empresa
      await loadEmpresaData();
      
      setState(prev => ({
        ...prev,
        saving: false,
        success: 'Ubicación agregada exitosamente'
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any) {
      console.error('Error al agregar ubicación:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al agregar ubicación'
      }));
    }
  }, [user?.id, loadEmpresaData]);

  // Eliminar ubicación
  const removeLocation = useCallback(async (locationId: number) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      await axiosInstance.delete(`/empresas/${user.id}/ubicaciones/${locationId}`);
      
      // Recargar datos de la empresa
      await loadEmpresaData();
      
      setState(prev => ({
        ...prev,
        saving: false,
        success: 'Ubicación eliminada exitosamente'
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any) {
      console.error('Error al eliminar ubicación:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al eliminar ubicación'
      }));
    }
  }, [user?.id, loadEmpresaData]);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      await axiosInstance.patch(`/empresas/${user.id}/password`, {
        currentPassword,
        newPassword
      });
      
      setState(prev => ({
        ...prev,
        saving: false,
        success: 'Contraseña actualizada exitosamente'
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al cambiar contraseña'
      }));
    }
  }, [user?.id]);

  // Subir logo
  const uploadLogo = useCallback(async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(`/empresas/${user.id}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.logoUrl;
    } catch (error: any) {
      console.error('Error al subir logo:', error);
      throw new Error(error.response?.data?.message || 'Error al subir logo');
    }
  }, [user?.id]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    if (state.empresaData) {
      setState(prev => ({
        ...prev,
        formData: {
          name: state.empresaData!.name,
          email: state.empresaData!.email,
          logo: state.empresaData!.logo || '',
          ubicaciones: state.empresaData!.ubicaciones || []
        },
        hasChanges: false,
        error: null,
        success: null
      }));
    }
  }, [state.empresaData]);

  // Cambiar tab activo
  const setActiveTab = useCallback((tab: AccountConfigState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadEmpresaData();
    }
  }, [user?.id, loadEmpresaData]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (state.empresaData) {
      const hasChanges = 
        state.formData.name !== state.empresaData.name ||
        state.formData.email !== state.empresaData.email ||
        state.formData.logo !== (state.empresaData.logo || '') ||
        JSON.stringify(state.formData.ubicaciones) !== JSON.stringify(state.empresaData.ubicaciones || []);

      setState(prev => ({ ...prev, hasChanges }));
    }
  }, [state.formData, state.empresaData]);

  return {
    ...state,
    loadEmpresaData,
    updateProfile,
    updateLocation,
    addLocation,
    removeLocation,
    changePassword,
    uploadLogo,
    resetForm,
    setActiveTab
  };
};

export default useAccountConfig;
