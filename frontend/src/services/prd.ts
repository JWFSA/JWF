import api from '@/lib/api';
import type { OrdenTrabajo, PedidoProduccion, TipoOT, GastoOT } from '@/types/prd';
import type { Paginated } from '@/types/gen';
import type { ListParams } from '@/services/gen';

// Tipos de OT
export const getTiposOT = () => api.get<TipoOT[]>('/prd/tipos-ot').then((r) => r.data);

// Ordenes de trabajo
export const getOrdenesTrabajoList = (params?: ListParams) => api.get<Paginated<OrdenTrabajo>>('/prd/ordenes-trabajo', { params }).then((r) => r.data);
export const getOrdenTrabajo       = (id: number) => api.get<OrdenTrabajo>(`/prd/ordenes-trabajo/${id}`).then((r) => r.data);
export const createOrdenTrabajo    = (data: Partial<OrdenTrabajo>) => api.post<OrdenTrabajo>('/prd/ordenes-trabajo', data).then((r) => r.data);
export const updateOrdenTrabajo    = (id: number, data: Partial<OrdenTrabajo>) => api.put<OrdenTrabajo>(`/prd/ordenes-trabajo/${id}`, data).then((r) => r.data);
export const deleteOrdenTrabajo    = (id: number) => api.delete(`/prd/ordenes-trabajo/${id}`);
export const crearOTDesdePedido    = (pedido_clave: number, item_ped?: number) => api.post<OrdenTrabajo>('/prd/ordenes-trabajo/desde-pedido', { pedido_clave, item_ped }).then((r) => r.data);

// Gastos de OT
export const addGastoOT    = (otId: number, data: Partial<GastoOT>) => api.post<OrdenTrabajo>(`/prd/ordenes-trabajo/${otId}/gastos`, data).then((r) => r.data);
export const removeGastoOT = (otId: number, item: number) => api.delete(`/prd/ordenes-trabajo/${otId}/gastos/${item}`).then((r) => r.data);

// Pedidos de produccion
export const getPedidosProduccion     = (params?: ListParams) => api.get<Paginated<PedidoProduccion>>('/prd/pedidos-produccion', { params }).then((r) => r.data);
export const getPedidoProduccion      = (id: number) => api.get<PedidoProduccion>(`/prd/pedidos-produccion/${id}`).then((r) => r.data);
export const crearPPDesdePedido       = (pedido_clave: number) => api.post<PedidoProduccion>('/prd/pedidos-produccion/desde-pedido', { pedido_clave }).then((r) => r.data);
