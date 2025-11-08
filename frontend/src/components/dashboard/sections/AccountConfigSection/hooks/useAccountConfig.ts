import { useState, useEffect, useCallback } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import axiosInstance from '../../../../../config/axios.config';
import {
  AccountConfigState,
  AccountConfigActions,
  EmpresaData,
  UpdateEmpresaData,
  UpdateUbicacionData,
  PrecioEnvioData,
  CreatePrecioEnvioData,
  UpdatePrecioEnvioData,
  SocialLink,
  UpdateEmpresaExtrasPayload,
  UbicacionData,
  Ubicacion,
  CategoriaData,
  UpdateCategoriasPayload
} from '../types';

const normalizeSocials = (arr: SocialLink[]) =>
  (arr || []).map(r => ({
    key: (r.key || "otros").toString().toLowerCase(),
    label: (r.label || "Link").trim(),
    value: (r.value || "").trim(),
  }));
  
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

    console.log('🏢 [FRONTEND] Cargando datos de empresa para usuario:', user.id);

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axiosInstance.get(`/empresas/${user.id}`);
      const empresaData: EmpresaData = response.data;
      console.log(empresaData);
      // Log para debuggear
      console.log('🏢 [FRONTEND] Datos recibidos de empresa:', {
        id: empresaData.id,
        name: empresaData.name,
        ubicacionesCount: empresaData.ubicaciones?.length || 0,
        ubicaciones: empresaData.ubicaciones,
        rawResponse: response.data
      });
      
      // Log simple para verificar
      console.log('UBICACIONES:', empresaData.ubicaciones);

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

      console.log('🏢 [FRONTEND] Estado actualizado con ubicaciones:', empresaData.ubicaciones?.length || 0);
    } catch (error: any) {
      console.error('❌ [FRONTEND] Error al cargar datos de empresa:', error);
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

    console.log('🏢 [FRONTEND] Actualizando ubicación:', { locationId, data });

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      // Remover empresaId del payload si existe
      const { empresaId, ...locationData } = data as any;
      
      console.log('🏢 [FRONTEND] Enviando datos de actualización:', locationData);
      
      const response = await axiosInstance.patch(`/empresas/${user.id}/ubicaciones/${locationId}`, locationData);
      
      console.log('🏢 [FRONTEND] Respuesta del servidor:', response.data);
      
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
      console.error('❌ [FRONTEND] Error al actualizar ubicación:', error);
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

    console.log('🏢 [FRONTEND] Agregando ubicación:', data);

    setState(prev => ({ ...prev, saving: true, error: null, success: null }));

    try {
      // Remover empresaId del payload ya que el backend lo obtiene del parámetro de la URL
      const { empresaId, ...locationData } = data as any;
      
      console.log('🏢 [FRONTEND] Enviando datos de ubicación:', locationData);
      
      const response = await axiosInstance.post(`/empresas/${user.id}/ubicaciones`, locationData);
      

      
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
      console.error('❌ [FRONTEND] Error al agregar ubicación:', error);
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
  const uploadFoto = useCallback(async (file: File, dashboard?: Boolean): Promise<string> => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    console.log('📤 [UPLOAD] Iniciando subida de foto:', { dashboard, fileName: file.name, fileSize: file.size });

    setState(prev => ({ ...prev, saving: true, error: null }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      let response: any;
      if (dashboard){
        console.log('📤 [UPLOAD] Subiendo foto de dashboard...');
        response = await axiosInstance.post(`/empresas/${user.id}/upload-dashboard`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ [UPLOAD] Dashboard foto subida:', response.data);
      }else{
        console.log('📤 [UPLOAD] Subiendo logo...');
        response = await axiosInstance.post(`/empresas/${user.id}/upload-logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ [UPLOAD] Logo subido:', response.data);
      }

      // Recargar datos de la empresa para obtener la URL actualizada
      await loadEmpresaData();

      setState(prev => ({ ...prev, saving: false }));

      return response.data?.dashUrl || response.data?.logoUrl || '';
    } catch (error: any) {
      console.error('❌ [UPLOAD] Error al subir foto:', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al subir la foto'
      }));
      throw new Error(error.response?.data?.message || 'Error al subir foto');
    }
  }, [user?.id, loadEmpresaData]);

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

  // Log para rastrear cambios en ubicaciones
  useEffect(() => {
    console.log('🏢 [FRONTEND] Ubicaciones cambiaron:', {
      ubicacionesCount: state.formData.ubicaciones?.length || 0,
      ubicaciones: state.formData.ubicaciones
    });
    
  // Log simple para verificar
  console.log('UBICACIONES EN HOOK:', state.formData.ubicaciones);
  }, [state.formData.ubicaciones]);

  // Precios de envío
  const getPreciosEnvio = useCallback(async (ubicacionId: number): Promise<PrecioEnvioData[]> => {
    if (!user?.id) {
      console.log('🚚 [PRECIOS ENVIO] No hay usuario autenticado');
      return [];
    }

    try {
      console.log('🚚 [PRECIOS ENVIO] Haciendo petición a:', `/empresas/${user.id}/ubicaciones/${ubicacionId}/precios-envio`);
      const response = await axiosInstance.get(`/empresas/${user.id}/ubicaciones/${ubicacionId}/precios-envio`);
      console.log('🚚 [PRECIOS ENVIO] Respuesta del servidor:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRECIOS ENVIO] Error al cargar precios de envío:', error);
      console.error('❌ [PRECIOS ENVIO] Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.id]);

  const createPrecioEnvio = useCallback(async (ubicacionId: number, data: CreatePrecioEnvioData) => {
    if (!user?.id) return;

    try {
      await axiosInstance.post(`/empresas/${user.id}/ubicaciones/${ubicacionId}/precios-envio`, data);
    } catch (error: any) {
      console.error('Error al crear precio de envío:', error);
      throw error;
    }
  }, [user?.id]);

  const updatePrecioEnvio = useCallback(async (ubicacionId: number, precioId: number, data: UpdatePrecioEnvioData) => {
    if (!user?.id) return;

    try {
      await axiosInstance.patch(`/empresas/${user.id}/ubicaciones/${ubicacionId}/precios-envio/${precioId}`, data);
    } catch (error: any) {
      console.error('Error al actualizar precio de envío:', error);
      throw error;
    }
  }, [user?.id]);

  const removePrecioEnvio = useCallback(async (ubicacionId: number, precioId: number) => {
    if (!user?.id) return;

    try {
      await axiosInstance.delete(`/empresas/${user.id}/ubicaciones/${ubicacionId}/precios-envio/${precioId}`);
    } catch (error: any) {
      console.error('Error al eliminar precio de envío:', error);
      throw error;
    }
  }, [user?.id]);

  const updatePreferences = useCallback(async (payload: any) =>{
    if (!user?.id) return;
    console.log("PAYLOAD", payload);
    setState(prev => ({ ...prev, saving: true, error: null, success: null }));
    try{
      await axiosInstance.patch(`/empresas/${user.id}/preferencias`, payload);
      await loadEmpresaData();
      setState(prev => ({
        ...prev,
        saving: false,
        success: 'Preferencias guardadas exitosamente'
      }));
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error: any){
      console.error ('Error al guardar preferencias', error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error.response?.data?.message || 'Error al guardar preferencias'
      }));
      throw error;
    }

  },[user?.id, loadEmpresaData])

  // Guardar solo apariencia (colores y envío a domicilio)
  const updateApariencia = useCallback(async (colorBotones: string, colorFondo: string, envioDomicilio: boolean) => {
    if (!user?.id || !state.empresaData?.id) return;

    console.log('🎨 [APARIENCIA] Guardando apariencia...');

    const payload = {
      empresaId: state.empresaData.id,
      colorBotones: colorBotones || null,
      colorFondo: colorFondo || null,
      envioDomicilio,
      dashboardFoto: state.empresaData?.preferenciasWeb?.dashboardFoto || null,
      horarios: (state.empresaData?.preferenciasWeb?.horarios || []).map((h: any) => ({
        day: h.day,
        slotIndex: 0,
        abreMin: h.abreMin,
        cierraMin: h.cierraMin,
        cerrado: h.cerrado || false
      }))
    };

    await updatePreferences(payload);
  }, [user?.id, state.empresaData, updatePreferences]);

  // Guardar solo horarios
  const updateHorarios = useCallback(async (schedule: Record<string, any[]>) => {
    if (!user?.id || !state.empresaData?.id) return;

    console.log('🕒 [HORARIOS] Guardando horarios...');

    const DAYS: { key: string; label: string }[] = [
      { key: 'LUN', label: 'Lunes' },
      { key: 'MAR', label: 'Martes' },
      { key: 'MIE', label: 'Miércoles' },
      { key: 'JUE', label: 'Jueves' },
      { key: 'VIE', label: 'Viernes' },
      { key: 'SAB', label: 'Sábado' },
      { key: 'DOM', label: 'Domingo' },
    ];

    const payload = {
      empresaId: state.empresaData.id,
      colorBotones: state.empresaData?.preferenciasWeb?.colorBotones || null,
      colorFondo: state.empresaData?.preferenciasWeb?.colorFondo || null,
      envioDomicilio: state.empresaData?.preferenciasWeb?.envioDomicilio || false,
      dashboardFoto: state.empresaData?.preferenciasWeb?.dashboardFoto || null,
      horarios: DAYS.flatMap(({ key }) =>
        (schedule[key] || []).map((slot: any, idx: number) => {
          const [oh, om] = slot.open.split(':').map(Number);
          const [ch, cm] = slot.close.split(':').map(Number);
          return {
            day: key,
            slotIndex: idx,
            abreMin: (oh || 0) * 60 + (om || 0),
            cierraMin: (ch || 0) * 60 + (cm || 0),
            cerrado: false,
          };
        })
      )
    };

    await updatePreferences(payload);
  }, [user?.id, state.empresaData, updatePreferences]);



const updateEmpresaExtras = useCallback(async (payload: UpdateEmpresaExtrasPayload) => {
  const { empresaId, alias, redesSociales } = payload;

  // Optimistic UI
  setState(s => ({
    ...s,
    empresaData: s.empresaData
      ? {
          ...s.empresaData,
          alias: alias || undefined,
          redesSociales: normalizeSocials(redesSociales || []),
        }
      : s.empresaData,
    saving: true,
    error: null,
    success: null,
  }));

  try {
    // PATCH directo a tu backend (siguiendo tu convención /empresas/:id/...)
    const normalizedSocials = normalizeSocials(redesSociales || []);

    const { data: updated } = await axiosInstance.patch<EmpresaData>(
      `/empresas/${empresaId}/extras`,
      {
        alias: alias || undefined, // 👈 undefined si está vacío
        redesSociales: normalizedSocials.length > 0 ? normalizedSocials : [], // 👈 array vacío si no hay redes
      }
    );

    setState(s => ({
      ...s,
      empresaData: updated || s.empresaData,
      saving: false,
      success: "Datos de empresa actualizados",
    }));
  } catch (e: any) {
    setState(s => ({
      ...s,
      saving: false,
      error: e?.response?.data?.message || e?.message || "No se pudieron guardar los extras de la empresa",
    }));
    // revert/refresh (te conviene refrescar del back)
    await loadEmpresaData().catch(() => {});
    throw e;
  }
}, [loadEmpresaData]);




const cargaUbicacionInicial = useCallback(async (empresaId: string,ubicacion: Ubicacion) => {

  try {
    // PATCH directo a tu backend (siguiendo tu convención /empresas/:id/...)
    const { data: updated } = await axiosInstance.post<Ubicacion>(
      `/empresas/${empresaId}/ubicaciones`,
      {
        ...ubicacion
      }
    );
    return updated;
    }  catch (e: any) {

    await loadEmpresaData().catch(() => {});
    throw e;
  }
}, [loadEmpresaData]);

// Obtener categorías
const getCategorias = useCallback(async (): Promise<CategoriaData[]> => {
  try {
    const response = await axiosInstance.get('/categorias');
    return response.data;
  } catch (error: any) {
    console.error('Error al cargar categorías:', error);
    throw error;
  }
}, []);

// Actualizar categorías y subcategorías
const updateCategorias = useCallback(async (payload: UpdateCategoriasPayload) => {
  if (!user?.id) return;

  setState(prev => ({ ...prev, saving: true, error: null, success: null }));

  try {
    const response = await axiosInstance.patch(`/empresas/${user.id}/categorias`, payload);
    const updatedEmpresa: EmpresaData = response.data;

    setState(prev => ({
      ...prev,
      saving: false,
      empresaData: updatedEmpresa,
      success: 'Categorías actualizadas exitosamente'
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, success: null }));
    }, 3000);
  } catch (error: any) {
    console.error('Error al actualizar categorías:', error);
    setState(prev => ({
      ...prev,
      saving: false,
      error: error.response?.data?.message || 'Error al actualizar categorías'
    }));
  }
}, [user?.id]);

  return {
    ...state,
    loadEmpresaData,
    updateProfile,
    updateLocation,
    addLocation,
    removeLocation,
    changePassword,
    uploadFoto,
    resetForm,
    setActiveTab,
    getPreciosEnvio,
    createPrecioEnvio,
    updatePrecioEnvio,
    removePrecioEnvio,
    updatePreferences,
    updateApariencia,
    updateHorarios,
    updateEmpresaExtras,
    cargaUbicacionInicial,
    getCategorias,
    updateCategorias
  };
};

export default useAccountConfig;
