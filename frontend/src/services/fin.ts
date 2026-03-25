import api from '@/lib/api';
import type { Banco, FormaPago, Ramo, TipoProveedor, Proveedor, Paginated } from '@/types/fin';
import type { ListParams } from '@/services/gen';

// Bancos
export const getBancos      = (params?: ListParams) => api.get<Paginated<Banco>>('/fin/maestros/bancos', { params }).then((r) => r.data);
export const createBanco    = (data: Partial<Banco>) => api.post<Banco>('/fin/maestros/bancos', data).then((r) => r.data);
export const updateBanco    = (id: number, data: Partial<Banco>) => api.put<Banco>(`/fin/maestros/bancos/${id}`, data).then((r) => r.data);
export const deleteBanco    = (id: number) => api.delete(`/fin/maestros/bancos/${id}`);

// Formas de pago
export const getFormasPago    = (params?: ListParams) => api.get<Paginated<FormaPago>>('/fin/maestros/formas-pago', { params }).then((r) => r.data);
export const createFormaPago  = (data: Partial<FormaPago>) => api.post<FormaPago>('/fin/maestros/formas-pago', data).then((r) => r.data);
export const updateFormaPago  = (id: number, data: Partial<FormaPago>) => api.put<FormaPago>(`/fin/maestros/formas-pago/${id}`, data).then((r) => r.data);
export const deleteFormaPago  = (id: number) => api.delete(`/fin/maestros/formas-pago/${id}`);

// Ramos
export const getRamos      = (params?: ListParams) => api.get<Paginated<Ramo>>('/fin/maestros/ramos', { params }).then((r) => r.data);
export const createRamo    = (data: Partial<Ramo>) => api.post<Ramo>('/fin/maestros/ramos', data).then((r) => r.data);
export const updateRamo    = (id: number, data: Partial<Ramo>) => api.put<Ramo>(`/fin/maestros/ramos/${id}`, data).then((r) => r.data);
export const deleteRamo    = (id: number) => api.delete(`/fin/maestros/ramos/${id}`);

// Tipos de proveedor
export const getTiposProveedor    = (params?: ListParams) => api.get<Paginated<TipoProveedor>>('/fin/maestros/tipos-proveedor', { params }).then((r) => r.data);
export const createTipoProveedor  = (data: Partial<TipoProveedor>) => api.post<TipoProveedor>('/fin/maestros/tipos-proveedor', data).then((r) => r.data);
export const updateTipoProveedor  = (id: number, data: Partial<TipoProveedor>) => api.put<TipoProveedor>(`/fin/maestros/tipos-proveedor/${id}`, data).then((r) => r.data);
export const deleteTipoProveedor  = (id: number) => api.delete(`/fin/maestros/tipos-proveedor/${id}`);

// Proveedores
export const getProveedores   = (params?: ListParams) => api.get<Paginated<Proveedor>>('/fin/proveedores', { params }).then((r) => r.data);
export const getProveedor     = (id: number) => api.get<Proveedor>(`/fin/proveedores/${id}`).then((r) => r.data);
export const createProveedor  = (data: Partial<Proveedor>) => api.post<Proveedor>('/fin/proveedores', data).then((r) => r.data);
export const updateProveedor  = (id: number, data: Partial<Proveedor>) => api.put<Proveedor>(`/fin/proveedores/${id}`, data).then((r) => r.data);
export const deleteProveedor  = (id: number) => api.delete(`/fin/proveedores/${id}`);
