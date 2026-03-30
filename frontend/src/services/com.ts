import api from '@/lib/api';
import type { OrdenCompra, ContratoProv, Paginated } from '@/types/com';
import type { ListParams } from '@/services/gen';

// Órdenes de compra
export const getOrdenesCompra  = (params?: ListParams) => api.get<Paginated<OrdenCompra>>('/com/ordenes-compra', { params }).then((r) => r.data);
export const getOrdenCompra    = (id: number) => api.get<OrdenCompra>(`/com/ordenes-compra/${id}`).then((r) => r.data);
export const createOrdenCompra = (data: Partial<OrdenCompra>) => api.post<OrdenCompra>('/com/ordenes-compra', data).then((r) => r.data);
export const updateOrdenCompra = (id: number, data: Partial<OrdenCompra>) => api.put<OrdenCompra>(`/com/ordenes-compra/${id}`, data).then((r) => r.data);
export const deleteOrdenCompra = (id: number) => api.delete(`/com/ordenes-compra/${id}`);

// Contratos de proveedor
export const getContratosProv  = (params?: ListParams) => api.get<Paginated<ContratoProv>>('/com/contratos', { params }).then((r) => r.data);
export const getContratoProv   = (id: number) => api.get<ContratoProv>(`/com/contratos/${id}`).then((r) => r.data);
export const createContratoProv = (data: Partial<ContratoProv>) => api.post<ContratoProv>('/com/contratos', data).then((r) => r.data);
export const updateContratoProv = (id: number, data: Partial<ContratoProv>) => api.put<ContratoProv>(`/com/contratos/${id}`, data).then((r) => r.data);
export const deleteContratoProv = (id: number) => api.delete(`/com/contratos/${id}`);
