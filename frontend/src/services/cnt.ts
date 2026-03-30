import api from '@/lib/api';
import type { GrupoCuenta, RubroCuenta, CentroCosto, Ejercicio, Cuenta, Asiento, Paginated } from '@/types/cnt';
import type { ListParams } from '@/services/gen';

// Grupos
export const getGrupos      = (params?: ListParams) => api.get<Paginated<GrupoCuenta>>('/cnt/maestros/grupos', { params }).then((r) => r.data);
export const createGrupo    = (data: Partial<GrupoCuenta> & { desc: string; saldo_normal?: string }) => api.post<GrupoCuenta>('/cnt/maestros/grupos', data).then((r) => r.data);
export const updateGrupo    = (id: number, data: { desc?: string; saldo_normal?: string }) => api.put(`/cnt/maestros/grupos/${id}`, data).then((r) => r.data);
export const deleteGrupo    = (id: number) => api.delete(`/cnt/maestros/grupos/${id}`);

// Rubros
export const getRubros      = (params?: ListParams) => api.get<Paginated<RubroCuenta>>('/cnt/maestros/rubros', { params }).then((r) => r.data);
export const createRubro    = (data: { desc: string }) => api.post<RubroCuenta>('/cnt/maestros/rubros', data).then((r) => r.data);
export const updateRubro    = (id: number, data: { desc?: string }) => api.put(`/cnt/maestros/rubros/${id}`, data).then((r) => r.data);
export const deleteRubro    = (id: number) => api.delete(`/cnt/maestros/rubros/${id}`);

// Centros de costo
export const getCentrosCosto     = (params?: ListParams) => api.get<Paginated<CentroCosto>>('/cnt/maestros/centros-costo', { params }).then((r) => r.data);
export const createCentroCosto   = (data: { desc: string }) => api.post<CentroCosto>('/cnt/maestros/centros-costo', data).then((r) => r.data);
export const updateCentroCosto   = (id: number, data: { desc?: string }) => api.put(`/cnt/maestros/centros-costo/${id}`, data).then((r) => r.data);
export const deleteCentroCosto   = (id: number) => api.delete(`/cnt/maestros/centros-costo/${id}`);

// Ejercicios
export const getEjercicios  = (params?: ListParams) => api.get<Paginated<Ejercicio>>('/cnt/ejercicios', { params }).then((r) => r.data);
export const getEjercicio   = (id: number) => api.get<Ejercicio>(`/cnt/ejercicios/${id}`).then((r) => r.data);
export const createEjercicio = (data: Partial<Ejercicio>) => api.post<Ejercicio>('/cnt/ejercicios', data).then((r) => r.data);
export const updateEjercicio = (id: number, data: Partial<Ejercicio>) => api.put<Ejercicio>(`/cnt/ejercicios/${id}`, data).then((r) => r.data);
export const deleteEjercicio = (id: number) => api.delete(`/cnt/ejercicios/${id}`);

// Plan de cuentas
export const getCuentas     = (params?: ListParams) => api.get<Paginated<Cuenta>>('/cnt/cuentas', { params }).then((r) => r.data);
export const getCuenta      = (id: number) => api.get<Cuenta>(`/cnt/cuentas/${id}`).then((r) => r.data);
export const createCuenta   = (data: Partial<Cuenta>) => api.post<Cuenta>('/cnt/cuentas', data).then((r) => r.data);
export const updateCuenta   = (id: number, data: Partial<Cuenta>) => api.put<Cuenta>(`/cnt/cuentas/${id}`, data).then((r) => r.data);
export const deleteCuenta   = (id: number) => api.delete(`/cnt/cuentas/${id}`);

// Asientos
export const getAsientos    = (params?: ListParams) => api.get<Paginated<Asiento>>('/cnt/asientos', { params }).then((r) => r.data);
export const getAsiento     = (id: number) => api.get<Asiento>(`/cnt/asientos/${id}`).then((r) => r.data);
export const createAsiento  = (data: Partial<Asiento>) => api.post<Asiento>('/cnt/asientos', data).then((r) => r.data);
export const updateAsiento  = (id: number, data: Partial<Asiento>) => api.put<Asiento>(`/cnt/asientos/${id}`, data).then((r) => r.data);
export const deleteAsiento  = (id: number) => api.delete(`/cnt/asientos/${id}`);
