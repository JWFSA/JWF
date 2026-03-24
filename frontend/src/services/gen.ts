import api from '@/lib/api';
import type { Operador, Rol, Empresa, Sucursal, Sistema, Programa, Moneda, Paginated } from '@/types/gen';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
}

// Auth
export const login = (data: { login: string; password: string }) =>
  api.post('/gen/auth/login', data).then((r) => r.data);

export const getMe = () =>
  api.get('/gen/auth/me').then((r) => r.data);

// Operadores
export const getOperadores = (params?: ListParams) =>
  api.get<Paginated<Operador>>('/gen/operadores', { params }).then((r) => r.data);

export const getOperador = (id: number) =>
  api.get<Operador>(`/gen/operadores/${id}`).then((r) => r.data);

export const createOperador = (data: Partial<Operador>) =>
  api.post<Operador>('/gen/operadores', data).then((r) => r.data);

export const updateOperador = (id: number, data: Partial<Operador>) =>
  api.put<Operador>(`/gen/operadores/${id}`, data).then((r) => r.data);

export const assignRolesOperador = (id: number, roles: number[]) =>
  api.put<Operador>(`/gen/operadores/${id}/roles`, { roles }).then((r) => r.data);

// Roles
export const getRoles = (params?: ListParams) =>
  api.get<Paginated<Rol>>('/gen/roles', { params }).then((r) => r.data);

export const getRol = (id: number) =>
  api.get<Rol>(`/gen/roles/${id}`).then((r) => r.data);

export const createRol = (data: { nombre: string }) =>
  api.post<Rol>('/gen/roles', data).then((r) => r.data);

export const updateRol = (id: number, data: { nombre: string }) =>
  api.put<Rol>(`/gen/roles/${id}`, data).then((r) => r.data);

export const deleteRol = (id: number) =>
  api.delete(`/gen/roles/${id}`);

export const assignProgramasRol = (id: number, programas: number[]) =>
  api.put<Rol>(`/gen/roles/${id}/programas`, { programas }).then((r) => r.data);

// Empresas
export const getEmpresas = (params?: ListParams) =>
  api.get<Paginated<Empresa>>('/gen/empresas', { params }).then((r) => r.data);

export const getEmpresa = (id: number) =>
  api.get<Empresa>(`/gen/empresas/${id}`).then((r) => r.data);

export const getSucursales = (empresaId: number) =>
  api.get<Sucursal[]>(`/gen/empresas/${empresaId}/sucursales`).then((r) => r.data);

// Maestros
export const getMonedas = () =>
  api.get<Moneda[]>('/gen/maestros/monedas').then((r) => r.data);

export const getPaises = () =>
  api.get('/gen/maestros/paises').then((r) => r.data);

export const getCiudades = () =>
  api.get('/gen/maestros/ciudades').then((r) => r.data);

export const getDepartamentos = () =>
  api.get('/gen/maestros/departamentos').then((r) => r.data);

export const getSecciones = (dpto?: number) =>
  api.get('/gen/maestros/secciones', { params: dpto ? { dpto } : {} }).then((r) => r.data);

export const getSistemas = () =>
  api.get<Sistema[]>('/gen/maestros/sistemas').then((r) => r.data);

export const getProgramas = (sistema?: number) =>
  api.get<Programa[]>('/gen/maestros/programas', { params: sistema ? { sistema } : {} }).then((r) => r.data);
