import api from '@/lib/api';
import type { Cargo, Categoria, Area, Seccion, Turno, TipoContrato, MotivoAusencia, FormaPago, TipoLiquidacion, TipoPago, TipoFamiliar, Idioma, Carrera, Bachillerato, Capacitacion, NivelCapacitacion, EstadoEstudio, Funcion, ClasificacionDescuento, Empleado, Paginated } from '@/types/per';
import type { ListParams } from '@/services/gen';

// Cargos
export const getCargos    = (params?: ListParams) => api.get<Paginated<Cargo>>('/per/maestros/cargos', { params }).then((r) => r.data);
export const createCargo  = (data: Partial<Cargo>) => api.post<Cargo>('/per/maestros/cargos', data).then((r) => r.data);
export const updateCargo  = (id: number, data: Partial<Cargo>) => api.put<Cargo>(`/per/maestros/cargos/${id}`, data).then((r) => r.data);
export const deleteCargo  = (id: number) => api.delete(`/per/maestros/cargos/${id}`);

// Categorías
export const getCategorias    = (params?: ListParams) => api.get<Paginated<Categoria>>('/per/maestros/categorias', { params }).then((r) => r.data);
export const createCategoria  = (data: Partial<Categoria>) => api.post<Categoria>('/per/maestros/categorias', data).then((r) => r.data);
export const updateCategoria  = (id: number, data: Partial<Categoria>) => api.put<Categoria>(`/per/maestros/categorias/${id}`, data).then((r) => r.data);
export const deleteCategoria  = (id: number) => api.delete(`/per/maestros/categorias/${id}`);

// Áreas
export const getAreas    = (params?: ListParams) => api.get<Paginated<Area>>('/per/maestros/areas', { params }).then((r) => r.data);
export const createArea  = (data: Partial<Area>) => api.post<Area>('/per/maestros/areas', data).then((r) => r.data);
export const updateArea  = (id: number, data: Partial<Area>) => api.put<Area>(`/per/maestros/areas/${id}`, data).then((r) => r.data);
export const deleteArea  = (id: number) => api.delete(`/per/maestros/areas/${id}`);

// Secciones
export const getSecciones    = (params?: ListParams) => api.get<Paginated<Seccion>>('/per/maestros/secciones', { params }).then((r) => r.data);
export const createSeccion   = (data: Partial<Seccion>) => api.post<Seccion>('/per/maestros/secciones', data).then((r) => r.data);
export const updateSeccion   = (id: number, data: Partial<Seccion>) => api.put<Seccion>(`/per/maestros/secciones/${id}`, data).then((r) => r.data);
export const deleteSeccion   = (id: number) => api.delete(`/per/maestros/secciones/${id}`);

// Turnos
export const getTurnos    = (params?: ListParams) => api.get<Paginated<Turno>>('/per/maestros/turnos', { params }).then((r) => r.data);
export const createTurno  = (data: Partial<Turno>) => api.post<Turno>('/per/maestros/turnos', data).then((r) => r.data);
export const updateTurno  = (id: number, data: Partial<Turno>) => api.put<Turno>(`/per/maestros/turnos/${id}`, data).then((r) => r.data);
export const deleteTurno  = (id: number) => api.delete(`/per/maestros/turnos/${id}`);

// Tipos de contrato
export const getTiposContrato    = (params?: ListParams) => api.get<Paginated<TipoContrato>>('/per/maestros/tipos-contrato', { params }).then((r) => r.data);
export const createTipoContrato  = (data: Partial<TipoContrato>) => api.post<TipoContrato>('/per/maestros/tipos-contrato', data).then((r) => r.data);
export const updateTipoContrato  = (id: number, data: Partial<TipoContrato>) => api.put<TipoContrato>(`/per/maestros/tipos-contrato/${id}`, data).then((r) => r.data);
export const deleteTipoContrato  = (id: number) => api.delete(`/per/maestros/tipos-contrato/${id}`);

// Motivos de ausencia
export const getMotivosAusencia    = (params?: ListParams) => api.get<Paginated<MotivoAusencia>>('/per/maestros/motivos-ausencia', { params }).then((r) => r.data);
export const createMotivoAusencia  = (data: Partial<MotivoAusencia>) => api.post<MotivoAusencia>('/per/maestros/motivos-ausencia', data).then((r) => r.data);
export const updateMotivoAusencia  = (id: number, data: Partial<MotivoAusencia>) => api.put<MotivoAusencia>(`/per/maestros/motivos-ausencia/${id}`, data).then((r) => r.data);
export const deleteMotivoAusencia  = (id: number) => api.delete(`/per/maestros/motivos-ausencia/${id}`);

// Formas de pago
export const getFormasPago    = (params?: ListParams) => api.get<Paginated<FormaPago>>('/per/maestros/formas-pago', { params }).then((r) => r.data);
export const createFormaPago  = (data: Partial<FormaPago>) => api.post<FormaPago>('/per/maestros/formas-pago', data).then((r) => r.data);
export const updateFormaPago  = (id: number, data: Partial<FormaPago>) => api.put<FormaPago>(`/per/maestros/formas-pago/${id}`, data).then((r) => r.data);
export const deleteFormaPago  = (id: number) => api.delete(`/per/maestros/formas-pago/${id}`);

// Tipos de liquidación
export const getTiposLiquidacion    = (params?: ListParams) => api.get<Paginated<TipoLiquidacion>>('/per/maestros/tipos-liquidacion', { params }).then((r) => r.data);
export const createTipoLiquidacion  = (data: Partial<TipoLiquidacion>) => api.post<TipoLiquidacion>('/per/maestros/tipos-liquidacion', data).then((r) => r.data);
export const updateTipoLiquidacion  = (id: number, data: Partial<TipoLiquidacion>) => api.put<TipoLiquidacion>(`/per/maestros/tipos-liquidacion/${id}`, data).then((r) => r.data);
export const deleteTipoLiquidacion  = (id: number) => api.delete(`/per/maestros/tipos-liquidacion/${id}`);

// Tipos de pago
export const getTiposPago    = (params?: ListParams) => api.get<Paginated<TipoPago>>('/per/maestros/tipos-pago', { params }).then((r) => r.data);
export const createTipoPago  = (data: Partial<TipoPago>) => api.post<TipoPago>('/per/maestros/tipos-pago', data).then((r) => r.data);
export const updateTipoPago  = (id: number, data: Partial<TipoPago>) => api.put<TipoPago>(`/per/maestros/tipos-pago/${id}`, data).then((r) => r.data);
export const deleteTipoPago  = (id: number) => api.delete(`/per/maestros/tipos-pago/${id}`);

// Tipos de familiar
export const getTiposFamiliar    = (params?: ListParams) => api.get<Paginated<TipoFamiliar>>('/per/maestros/tipos-familiar', { params }).then((r) => r.data);
export const createTipoFamiliar  = (data: Partial<TipoFamiliar>) => api.post<TipoFamiliar>('/per/maestros/tipos-familiar', data).then((r) => r.data);
export const updateTipoFamiliar  = (id: number, data: Partial<TipoFamiliar>) => api.put<TipoFamiliar>(`/per/maestros/tipos-familiar/${id}`, data).then((r) => r.data);
export const deleteTipoFamiliar  = (id: number) => api.delete(`/per/maestros/tipos-familiar/${id}`);

// Idiomas
export const getIdiomas    = (params?: ListParams) => api.get<Paginated<Idioma>>('/per/maestros/idiomas', { params }).then((r) => r.data);
export const createIdioma  = (data: Partial<Idioma>) => api.post<Idioma>('/per/maestros/idiomas', data).then((r) => r.data);
export const updateIdioma  = (id: number, data: Partial<Idioma>) => api.put<Idioma>(`/per/maestros/idiomas/${id}`, data).then((r) => r.data);
export const deleteIdioma  = (id: number) => api.delete(`/per/maestros/idiomas/${id}`);

// Carreras
export const getCarreras    = (params?: ListParams) => api.get<Paginated<Carrera>>('/per/maestros/carreras', { params }).then((r) => r.data);
export const createCarrera  = (data: Partial<Carrera>) => api.post<Carrera>('/per/maestros/carreras', data).then((r) => r.data);
export const updateCarrera  = (id: number, data: Partial<Carrera>) => api.put<Carrera>(`/per/maestros/carreras/${id}`, data).then((r) => r.data);
export const deleteCarrera  = (id: number) => api.delete(`/per/maestros/carreras/${id}`);

// Bachilleratos
export const getBachilleratos    = (params?: ListParams) => api.get<Paginated<Bachillerato>>('/per/maestros/bachilleratos', { params }).then((r) => r.data);
export const createBachillerato  = (data: Partial<Bachillerato>) => api.post<Bachillerato>('/per/maestros/bachilleratos', data).then((r) => r.data);
export const updateBachillerato  = (id: number, data: Partial<Bachillerato>) => api.put<Bachillerato>(`/per/maestros/bachilleratos/${id}`, data).then((r) => r.data);
export const deleteBachillerato  = (id: number) => api.delete(`/per/maestros/bachilleratos/${id}`);

// Capacitaciones
export const getCapacitaciones    = (params?: ListParams) => api.get<Paginated<Capacitacion>>('/per/maestros/capacitaciones', { params }).then((r) => r.data);
export const createCapacitacion  = (data: Partial<Capacitacion>) => api.post<Capacitacion>('/per/maestros/capacitaciones', data).then((r) => r.data);
export const updateCapacitacion  = (id: number, data: Partial<Capacitacion>) => api.put<Capacitacion>(`/per/maestros/capacitaciones/${id}`, data).then((r) => r.data);
export const deleteCapacitacion  = (id: number) => api.delete(`/per/maestros/capacitaciones/${id}`);

// Niveles de capacitación
export const getNivelesCapacitacion    = (params?: ListParams) => api.get<Paginated<NivelCapacitacion>>('/per/maestros/niveles-capacitacion', { params }).then((r) => r.data);
export const createNivelCapacitacion  = (data: Partial<NivelCapacitacion>) => api.post<NivelCapacitacion>('/per/maestros/niveles-capacitacion', data).then((r) => r.data);
export const updateNivelCapacitacion  = (id: number, data: Partial<NivelCapacitacion>) => api.put<NivelCapacitacion>(`/per/maestros/niveles-capacitacion/${id}`, data).then((r) => r.data);
export const deleteNivelCapacitacion  = (id: number) => api.delete(`/per/maestros/niveles-capacitacion/${id}`);

// Estados de estudio
export const getEstadosEstudio    = (params?: ListParams) => api.get<Paginated<EstadoEstudio>>('/per/maestros/estados-estudio', { params }).then((r) => r.data);
export const createEstadoEstudio  = (data: Partial<EstadoEstudio>) => api.post<EstadoEstudio>('/per/maestros/estados-estudio', data).then((r) => r.data);
export const updateEstadoEstudio  = (id: number, data: Partial<EstadoEstudio>) => api.put<EstadoEstudio>(`/per/maestros/estados-estudio/${id}`, data).then((r) => r.data);
export const deleteEstadoEstudio  = (id: number) => api.delete(`/per/maestros/estados-estudio/${id}`);

// Funciones
export const getFunciones    = (params?: ListParams) => api.get<Paginated<Funcion>>('/per/maestros/funciones', { params }).then((r) => r.data);
export const createFuncion  = (data: Partial<Funcion>) => api.post<Funcion>('/per/maestros/funciones', data).then((r) => r.data);
export const updateFuncion  = (id: number, data: Partial<Funcion>) => api.put<Funcion>(`/per/maestros/funciones/${id}`, data).then((r) => r.data);
export const deleteFuncion  = (id: number) => api.delete(`/per/maestros/funciones/${id}`);

// Clasificaciones de descuento
export const getClasificacionesDescuento    = (params?: ListParams) => api.get<Paginated<ClasificacionDescuento>>('/per/maestros/clasificaciones-descuento', { params }).then((r) => r.data);
export const createClasificacionDescuento  = (data: Partial<ClasificacionDescuento>) => api.post<ClasificacionDescuento>('/per/maestros/clasificaciones-descuento', data).then((r) => r.data);
export const updateClasificacionDescuento  = (id: number, data: Partial<ClasificacionDescuento>) => api.put<ClasificacionDescuento>(`/per/maestros/clasificaciones-descuento/${id}`, data).then((r) => r.data);
export const deleteClasificacionDescuento  = (id: number) => api.delete(`/per/maestros/clasificaciones-descuento/${id}`);

// Empleados
export const getEmpleados = (params?: ListParams) =>
  api.get<Paginated<Empleado>>('/per/empleados', { params }).then((r) => r.data);

export const getEmpleado = (id: number) =>
  api.get<Empleado>(`/per/empleados/${id}`).then((r) => r.data);

export const createEmpleado = (data: Partial<Empleado>) =>
  api.post<Empleado>('/per/empleados', data).then((r) => r.data);

export const updateEmpleado = (id: number, data: Partial<Empleado>) =>
  api.put<Empleado>(`/per/empleados/${id}`, data).then((r) => r.data);

export const deleteEmpleado = (id: number) =>
  api.delete(`/per/empleados/${id}`);
