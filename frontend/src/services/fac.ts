import api from '@/lib/api';
import type { Barrio, Zona, Categoria, Condicion, Vendedor, Cliente, Articulo, Pedido, ListaPrecio, ListaPrecioDetalle, Factura, FacturaDet, PedidoParaFacturar, Campanha, ComisionFac, SolicitudDescuento, Paginated } from '@/types/fac';
import type { ListParams } from '@/services/gen';

// Barrios
export const getBarrios    = (params?: ListParams) => api.get<Paginated<Barrio>>('/fac/maestros/barrios', { params }).then((r) => r.data);
export const createBarrio  = (data: Partial<Barrio>) => api.post<Barrio>('/fac/maestros/barrios', data).then((r) => r.data);
export const updateBarrio  = (id: number, data: Partial<Barrio>) => api.put<Barrio>(`/fac/maestros/barrios/${id}`, data).then((r) => r.data);
export const deleteBarrio  = (id: number) => api.delete(`/fac/maestros/barrios/${id}`);

// Zonas
export const getZonas      = (params?: ListParams) => api.get<Paginated<Zona>>('/fac/maestros/zonas', { params }).then((r) => r.data);
export const createZona    = (data: Partial<Zona>) => api.post<Zona>('/fac/maestros/zonas', data).then((r) => r.data);
export const updateZona    = (id: number, data: Partial<Zona>) => api.put<Zona>(`/fac/maestros/zonas/${id}`, data).then((r) => r.data);
export const deleteZona    = (id: number) => api.delete(`/fac/maestros/zonas/${id}`);

// Categorías
export const getCategorias    = (params?: ListParams) => api.get<Paginated<Categoria>>('/fac/maestros/categorias', { params }).then((r) => r.data);
export const createCategoria  = (data: Partial<Categoria>) => api.post<Categoria>('/fac/maestros/categorias', data).then((r) => r.data);
export const updateCategoria  = (id: number, data: Partial<Categoria>) => api.put<Categoria>(`/fac/maestros/categorias/${id}`, data).then((r) => r.data);
export const deleteCategoria  = (id: number) => api.delete(`/fac/maestros/categorias/${id}`);

// Condiciones
export const getCondiciones   = () => api.get<Condicion[]>('/fac/maestros/condiciones').then((r) => r.data);
export const createCondicion  = (data: { con_desc: string }) => api.post<Condicion>('/fac/maestros/condiciones', data).then((r) => r.data);
export const deleteCondicion  = (desc: string) => api.delete(`/fac/maestros/condiciones/${encodeURIComponent(desc)}`);

// Listas de precio
export const getListasPrecio         = (params?: ListParams) => api.get<Paginated<ListaPrecio>>('/fac/maestros/listas-precio', { params }).then((r) => r.data);
export const getListaPrecio          = (id: number) => api.get<ListaPrecio>(`/fac/maestros/listas-precio/${id}`).then((r) => r.data);
export const createListaPrecio       = (data: Partial<ListaPrecio>) => api.post<ListaPrecio>('/fac/maestros/listas-precio', data).then((r) => r.data);
export const updateListaPrecio       = (id: number, data: Partial<ListaPrecio>) => api.put<ListaPrecio>(`/fac/maestros/listas-precio/${id}`, data).then((r) => r.data);
export const deleteListaPrecio       = (id: number) => api.delete(`/fac/maestros/listas-precio/${id}`);
export const getListaPrecioItems     = (id: number, params?: ListParams) => api.get<Paginated<ListaPrecioDetalle>>(`/fac/maestros/listas-precio/${id}/items`, { params }).then((r) => r.data);
export const upsertListaPrecioItem   = (id: number, data: Partial<ListaPrecioDetalle>) => api.post(`/fac/maestros/listas-precio/${id}/items`, data).then((r) => r.data);
export const deleteListaPrecioItem   = (id: number, art: number) => api.delete(`/fac/maestros/listas-precio/${id}/items/${art}`);

// Vendedores
export const getVendedores    = (params?: ListParams) => api.get<Paginated<Vendedor>>('/fac/vendedores', { params }).then((r) => r.data);
export const createVendedor   = (data: Partial<Vendedor>) => api.post<Vendedor>('/fac/vendedores', data).then((r) => r.data);
export const updateVendedor   = (id: number, data: Partial<Vendedor>) => api.put<Vendedor>(`/fac/vendedores/${id}`, data).then((r) => r.data);
export const deleteVendedor   = (id: number) => api.delete(`/fac/vendedores/${id}`);

// Clientes
export const getClientes   = (params?: ListParams) => api.get<Paginated<Cliente>>('/fac/clientes', { params }).then((r) => r.data);
export const getCliente    = (id: number) => api.get<Cliente>(`/fac/clientes/${id}`).then((r) => r.data);
export const createCliente = (data: Partial<Cliente>) => api.post<Cliente>('/fac/clientes', data).then((r) => r.data);
export const updateCliente = (id: number, data: Partial<Cliente>) => api.put<Cliente>(`/fac/clientes/${id}`, data).then((r) => r.data);
export const deleteCliente = (id: number) => api.delete(`/fac/clientes/${id}`);

// Artículos
export const getArticulos = (params?: ListParams) => api.get<Paginated<Articulo>>('/fac/articulos', { params }).then((r) => r.data);

// Pedidos
export const getPedidos    = (params?: ListParams) => api.get<Paginated<Pedido>>('/fac/pedidos', { params }).then((r) => r.data);
export const getPedido     = (id: number) => api.get<Pedido>(`/fac/pedidos/${id}`).then((r) => r.data);
export const createPedido  = (data: Partial<Pedido>) => api.post<Pedido>('/fac/pedidos', data).then((r) => r.data);
export const updatePedido  = (id: number, data: Partial<Pedido>) => api.put<Pedido>(`/fac/pedidos/${id}`, data).then((r) => r.data);
export const deletePedido  = (id: number) => api.delete(`/fac/pedidos/${id}`);

// Pedido → Factura
export const getPedidoParaFacturar = (id: number) => api.get<PedidoParaFacturar>(`/fac/pedidos/${id}/para-facturar`).then((r) => r.data);
export const copiarPedido          = (id: number) => api.post<Pedido>(`/fac/pedidos/${id}/copiar`).then((r) => r.data);
export const aprobarPedido         = (id: number) => api.post<Pedido>(`/fac/pedidos/${id}/aprobar`).then((r) => r.data);
export const rechazarPedido        = (id: number, motivo: string) => api.post<Pedido>(`/fac/pedidos/${id}/rechazar`, { motivo }).then((r) => r.data);

// Presupuestos
export const getPresupuestos      = (params?: ListParams) => api.get<Paginated<Pedido>>('/fac/presupuestos', { params }).then((r) => r.data);
export const getPresupuesto       = (id: number) => api.get<Pedido>(`/fac/presupuestos/${id}`).then((r) => r.data);
export const createPresupuesto    = (data: Partial<Pedido>) => api.post<Pedido>('/fac/presupuestos', data).then((r) => r.data);
export const updatePresupuesto    = (id: number, data: Partial<Pedido>) => api.put<Pedido>(`/fac/presupuestos/${id}`, data).then((r) => r.data);
export const deletePresupuesto    = (id: number) => api.delete(`/fac/presupuestos/${id}`);
export const convertirPresupuesto = (id: number) => api.post<Pedido>(`/fac/presupuestos/${id}/convertir`).then((r) => r.data);
export const copiarPresupuesto    = (id: number) => api.post<Pedido>(`/fac/presupuestos/${id}/copiar`).then((r) => r.data);

// Facturas
export const getFacturas   = (params?: ListParams) => api.get<Paginated<Factura>>('/fac/facturas', { params }).then((r) => r.data);
export const getFactura    = (id: number) => api.get<Factura>(`/fac/facturas/${id}`).then((r) => r.data);
export const createFactura = (data: Partial<Factura>) => api.post<Factura>('/fac/facturas', data).then((r) => r.data);
export const updateFactura = (id: number, data: Partial<Factura>) => api.put<Factura>(`/fac/facturas/${id}`, data).then((r) => r.data);
export const deleteFactura = (id: number) => api.delete(`/fac/facturas/${id}`);

// Campañas
export const getCampanhas     = (params?: ListParams) => api.get<Paginated<Campanha>>('/fac/campanhas', { params }).then((r) => r.data);
export const createCampanha   = (data: Partial<Campanha>) => api.post<Campanha>('/fac/campanhas', data).then((r) => r.data);
export const updateCampanha   = (cli: number, nro: number, data: Partial<Campanha>) => api.put(`/fac/campanhas/${cli}/${nro}`, data).then((r) => r.data);
export const deleteCampanha   = (cli: number, nro: number) => api.delete(`/fac/campanhas/${cli}/${nro}`);

// Comisiones (solo lectura)
export const getComisiones    = (params?: ListParams) => api.get<Paginated<ComisionFac>>('/fac/comisiones', { params }).then((r) => r.data);

// Solicitudes de descuento
export const getSolicitudesDescuento = (params?: ListParams) => api.get<Paginated<SolicitudDescuento>>('/fac/solicitudes-descuento', { params }).then((r) => r.data);
export const getSolicitudDescuento   = (id: number) => api.get<SolicitudDescuento>(`/fac/solicitudes-descuento/${id}`).then((r) => r.data);
export const createSolicitudDescuento = (data: Record<string, unknown>) => api.post<SolicitudDescuento>('/fac/solicitudes-descuento', data).then((r) => r.data);
export const aprobarSolicitudItem    = (id: number, item: number, data?: Record<string, unknown>) => api.post<SolicitudDescuento>(`/fac/solicitudes-descuento/${id}/item/${item}/aprobar`, data).then((r) => r.data);
export const rechazarSolicitudItem   = (id: number, item: number) => api.post<SolicitudDescuento>(`/fac/solicitudes-descuento/${id}/item/${item}/rechazar`).then((r) => r.data);
export const aprobarSolicitudTodos   = (id: number) => api.post<SolicitudDescuento>(`/fac/solicitudes-descuento/${id}/aprobar`).then((r) => r.data);
export const rechazarSolicitudTodos  = (id: number) => api.post<SolicitudDescuento>(`/fac/solicitudes-descuento/${id}/rechazar`).then((r) => r.data);
