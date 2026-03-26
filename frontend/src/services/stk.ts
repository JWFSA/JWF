import api from '@/lib/api';
import type { Articulo, Deposito, Linea, Marca, Rubro, UnidadMedida, Grupo, Paginated } from '@/types/stk';
import type { ListParams } from '@/services/gen';

// Líneas
export const getLineas    = (params?: ListParams) => api.get<Paginated<Linea>>('/stk/maestros/lineas', { params }).then((r) => r.data);
export const createLinea  = (data: Partial<Linea>) => api.post<Linea>('/stk/maestros/lineas', data).then((r) => r.data);
export const updateLinea  = (id: number, data: Partial<Linea>) => api.put<Linea>(`/stk/maestros/lineas/${id}`, data).then((r) => r.data);
export const deleteLinea  = (id: number) => api.delete(`/stk/maestros/lineas/${id}`);

// Marcas
export const getMarcas    = (params?: ListParams) => api.get<Paginated<Marca>>('/stk/maestros/marcas', { params }).then((r) => r.data);
export const createMarca  = (data: Partial<Marca>) => api.post<Marca>('/stk/maestros/marcas', data).then((r) => r.data);
export const updateMarca  = (id: number, data: Partial<Marca>) => api.put<Marca>(`/stk/maestros/marcas/${id}`, data).then((r) => r.data);
export const deleteMarca  = (id: number) => api.delete(`/stk/maestros/marcas/${id}`);

// Rubros
export const getRubros    = (params?: ListParams) => api.get<Paginated<Rubro>>('/stk/maestros/rubros', { params }).then((r) => r.data);
export const createRubro  = (data: Partial<Rubro>) => api.post<Rubro>('/stk/maestros/rubros', data).then((r) => r.data);
export const updateRubro  = (id: number, data: Partial<Rubro>) => api.put<Rubro>(`/stk/maestros/rubros/${id}`, data).then((r) => r.data);
export const deleteRubro  = (id: number) => api.delete(`/stk/maestros/rubros/${id}`);

// Unidades de medida
export const getUnidadesMedida    = (params?: ListParams) => api.get<Paginated<UnidadMedida>>('/stk/maestros/unidades-medida', { params }).then((r) => r.data);
export const createUnidadMedida   = (data: { um_codigo: string }) => api.post<UnidadMedida>('/stk/maestros/unidades-medida', data).then((r) => r.data);
export const deleteUnidadMedida   = (id: string) => api.delete(`/stk/maestros/unidades-medida/${id}`);

// Depósitos
export const getDepositos  = (params?: ListParams) => api.get<Paginated<Deposito>>('/stk/depositos', { params }).then((r) => r.data);
export const createDeposito = (data: Partial<Deposito>) => api.post<Deposito>('/stk/depositos', data).then((r) => r.data);
export const updateDeposito = (empr: number, suc: number, codigo: number, data: Partial<Deposito>) => api.put<Deposito>(`/stk/depositos/${empr}/${suc}/${codigo}`, data).then((r) => r.data);
export const deleteDeposito = (empr: number, suc: number, codigo: number) => api.delete(`/stk/depositos/${empr}/${suc}/${codigo}`);

// Grupos
export const getGrupos    = (params?: ListParams & { linea?: number }) => api.get<Paginated<Grupo>>('/stk/maestros/grupos', { params }).then((r) => r.data);
export const createGrupo  = (data: Partial<Grupo>) => api.post<Grupo>('/stk/maestros/grupos', data).then((r) => r.data);
export const updateGrupo  = (linea: number, codigo: number, data: Partial<Grupo>) => api.put<Grupo>(`/stk/maestros/grupos/${linea}/${codigo}`, data).then((r) => r.data);
export const deleteGrupo  = (linea: number, codigo: number) => api.delete(`/stk/maestros/grupos/${linea}/${codigo}`);

// Artículos
export const getArticulos = (params?: ListParams) =>
  api.get<Paginated<Articulo>>('/stk/articulos', { params }).then((r) => r.data);

export const getArticulo = (id: number) =>
  api.get<Articulo>(`/stk/articulos/${id}`).then((r) => r.data);

export const createArticulo = (data: Partial<Articulo>) =>
  api.post<Articulo>('/stk/articulos', data).then((r) => r.data);

export const updateArticulo = (id: number, data: Partial<Articulo>) =>
  api.put<Articulo>(`/stk/articulos/${id}`, data).then((r) => r.data);

export const deleteArticulo = (id: number) =>
  api.delete(`/stk/articulos/${id}`);
