import api from '@/lib/api';
import type { Cargo, Categoria, Area, Seccion, Turno, Empleado, Paginated } from '@/types/per';
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
