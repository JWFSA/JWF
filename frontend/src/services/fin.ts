import api from '@/lib/api';
import type { Banco, FormaPago, Ramo, TipoProveedor, Proveedor, Personeria, ClaseDoc, CuentaBancaria, OrdenPago, Paginated } from '@/types/fin';
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

// Personerías
export const getPersonerias     = (params?: ListParams) => api.get<Paginated<Personeria>>('/fin/maestros/personerias', { params }).then((r) => r.data);
export const createPersoneria   = (data: Partial<Personeria>) => api.post<Personeria>('/fin/maestros/personerias', data).then((r) => r.data);
export const updatePersoneria   = (id: number, data: Partial<Personeria>) => api.put<Personeria>(`/fin/maestros/personerias/${id}`, data).then((r) => r.data);
export const deletePersoneria   = (id: number) => api.delete(`/fin/maestros/personerias/${id}`);

// Clases de documento
export const getClasesDoc     = (params?: ListParams) => api.get<Paginated<ClaseDoc>>('/fin/maestros/clases-doc', { params }).then((r) => r.data);
export const createClaseDoc   = (data: Partial<ClaseDoc>) => api.post<ClaseDoc>('/fin/maestros/clases-doc', data).then((r) => r.data);
export const updateClaseDoc   = (id: number, data: Partial<ClaseDoc>) => api.put<ClaseDoc>(`/fin/maestros/clases-doc/${id}`, data).then((r) => r.data);
export const deleteClaseDoc   = (id: number) => api.delete(`/fin/maestros/clases-doc/${id}`);

// Cuentas bancarias
export const getCuentasBancarias  = (params?: ListParams) => api.get<Paginated<CuentaBancaria>>('/fin/cuentas-bancarias', { params }).then((r) => r.data);
export const getCuentaBancaria    = (id: number) => api.get<CuentaBancaria>(`/fin/cuentas-bancarias/${id}`).then((r) => r.data);
export const createCuentaBancaria = (data: Partial<CuentaBancaria>) => api.post<CuentaBancaria>('/fin/cuentas-bancarias', data).then((r) => r.data);
export const updateCuentaBancaria = (id: number, data: Partial<CuentaBancaria>) => api.put<CuentaBancaria>(`/fin/cuentas-bancarias/${id}`, data).then((r) => r.data);
export const deleteCuentaBancaria = (id: number) => api.delete(`/fin/cuentas-bancarias/${id}`);

// Órdenes de pago
export const getOrdenesPago   = (params?: ListParams) => api.get<Paginated<OrdenPago>>('/fin/ordenes-pago', { params }).then((r) => r.data);
export const getOrdenPago     = (id: number) => api.get<OrdenPago>(`/fin/ordenes-pago/${id}`).then((r) => r.data);
export const createOrdenPago  = (data: Partial<OrdenPago>) => api.post<OrdenPago>('/fin/ordenes-pago', data).then((r) => r.data);
export const updateOrdenPago  = (id: number, data: Partial<OrdenPago>) => api.put<OrdenPago>(`/fin/ordenes-pago/${id}`, data).then((r) => r.data);
export const deleteOrdenPago  = (id: number) => api.delete(`/fin/ordenes-pago/${id}`);

// Proveedores
export const getProveedores   = (params?: ListParams) => api.get<Paginated<Proveedor>>('/fin/proveedores', { params }).then((r) => r.data);
export const getProveedor     = (id: number) => api.get<Proveedor>(`/fin/proveedores/${id}`).then((r) => r.data);
export const createProveedor  = (data: Partial<Proveedor>) => api.post<Proveedor>('/fin/proveedores', data).then((r) => r.data);
export const updateProveedor  = (id: number, data: Partial<Proveedor>) => api.put<Proveedor>(`/fin/proveedores/${id}`, data).then((r) => r.data);
export const deleteProveedor  = (id: number) => api.delete(`/fin/proveedores/${id}`);
