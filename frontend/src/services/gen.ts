import api from '@/lib/api';
import type { Operador, Rol, Empresa, Sucursal, Sistema, Programa, Moneda, Pais, Departamento, Seccion, Ciudad, Impuesto, TipoImpuesto, Profesion, Distrito, MotivoAnulacion, Localidad, Barrio, Paginated } from '@/types/gen';

export type { Pais, Departamento, Seccion };

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}

// Dashboard
export const getDashboard = () =>
  api.get('/gen/dashboard').then((r) => r.data);

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

export const createEmpresa = (data: Partial<Empresa>) =>
  api.post<Empresa>('/gen/empresas', data).then((r) => r.data);

export const updateEmpresa = (id: number, data: Partial<Empresa>) =>
  api.put<Empresa>(`/gen/empresas/${id}`, data).then((r) => r.data);

export const getSucursales = (empresaId: number) =>
  api.get<Sucursal[]>(`/gen/empresas/${empresaId}/sucursales`).then((r) => r.data);

export const createSucursal = (empresaId: number, data: Partial<Sucursal>) =>
  api.post<Sucursal[]>(`/gen/empresas/${empresaId}/sucursales`, data).then((r) => r.data);

export const updateSucursal = (empresaId: number, sucId: number, data: Partial<Sucursal>) =>
  api.put<Sucursal[]>(`/gen/empresas/${empresaId}/sucursales/${sucId}`, data).then((r) => r.data);

export const deleteSucursal = (empresaId: number, sucId: number) =>
  api.delete(`/gen/empresas/${empresaId}/sucursales/${sucId}`);

// Maestros
// Monedas
export const getMonedas    = () => api.get<Moneda[]>('/gen/maestros/monedas').then((r) => r.data);
export const createMoneda  = (data: Partial<Moneda>) => api.post<Moneda>('/gen/maestros/monedas', data).then((r) => r.data);
export const updateMoneda  = (id: number, data: Partial<Moneda>) => api.put<Moneda>(`/gen/maestros/monedas/${id}`, data).then((r) => r.data);
export const deleteMoneda  = (id: number) => api.delete(`/gen/maestros/monedas/${id}`);

// Países
export const getPaises     = () => api.get<Pais[]>('/gen/maestros/paises').then((r) => r.data);
export const createPais    = (data: Partial<Pais>) => api.post<Pais>('/gen/maestros/paises', data).then((r) => r.data);
export const updatePais    = (id: number, data: Partial<Pais>) => api.put<Pais>(`/gen/maestros/paises/${id}`, data).then((r) => r.data);
export const deletePais    = (id: number) => api.delete(`/gen/maestros/paises/${id}`);

// Ciudades
export const getCiudades      = (params?: ListParams) => api.get<Paginated<Ciudad>>('/gen/maestros/ciudades', { params }).then((r) => r.data);
export const createCiudad     = (data: Partial<Ciudad>) => api.post<Ciudad>('/gen/maestros/ciudades', data).then((r) => r.data);
export const updateCiudad     = (id: number, data: Partial<Ciudad>) => api.put<Ciudad>(`/gen/maestros/ciudades/${id}`, data).then((r) => r.data);
export const deleteCiudad     = (id: number) => api.delete(`/gen/maestros/ciudades/${id}`);

// Impuestos
export const getImpuestos     = (params?: ListParams) => api.get<Paginated<Impuesto>>('/gen/maestros/impuestos', { params }).then((r) => r.data);
export const createImpuesto   = (data: Partial<Impuesto>) => api.post<Impuesto>('/gen/maestros/impuestos', data).then((r) => r.data);
export const updateImpuesto   = (id: number, data: Partial<Impuesto>) => api.put<Impuesto>(`/gen/maestros/impuestos/${id}`, data).then((r) => r.data);
export const deleteImpuesto   = (id: number) => api.delete(`/gen/maestros/impuestos/${id}`);

// Tipos de impuesto
export const getTiposImpuesto    = () => api.get<TipoImpuesto[]>('/gen/maestros/tipos-impuesto').then((r) => r.data);
export const createTipoImpuesto  = (data: Partial<TipoImpuesto>) => api.post<TipoImpuesto>('/gen/maestros/tipos-impuesto', data).then((r) => r.data);
export const updateTipoImpuesto  = (id: number, data: Partial<TipoImpuesto>) => api.put<TipoImpuesto>(`/gen/maestros/tipos-impuesto/${id}`, data).then((r) => r.data);
export const deleteTipoImpuesto  = (id: number) => api.delete(`/gen/maestros/tipos-impuesto/${id}`);

// Departamentos
export const getDepartamentos    = () => api.get<Departamento[]>('/gen/maestros/departamentos').then((r) => r.data);
export const createDepartamento  = (data: Partial<Departamento>) => api.post<Departamento>('/gen/maestros/departamentos', data).then((r) => r.data);
export const updateDepartamento  = (id: number, data: Partial<Departamento>) => api.put<Departamento>(`/gen/maestros/departamentos/${id}`, data).then((r) => r.data);
export const deleteDepartamento  = (id: number) => api.delete(`/gen/maestros/departamentos/${id}`);

// Secciones
export const getSecciones        = (dpto?: number) => api.get<Seccion[]>('/gen/maestros/secciones', { params: dpto ? { dpto } : {} }).then((r) => r.data);
export const createSeccion       = (dpto: number, data: Partial<Seccion>) => api.post<Seccion[]>(`/gen/maestros/departamentos/${dpto}/secciones`, data).then((r) => r.data);
export const updateSeccion       = (dpto: number, id: number, data: Partial<Seccion>) => api.put<Seccion[]>(`/gen/maestros/departamentos/${dpto}/secciones/${id}`, data).then((r) => r.data);
export const deleteSeccion       = (dpto: number, id: number) => api.delete(`/gen/maestros/departamentos/${dpto}/secciones/${id}`);

// Sistemas
export const getSistemas   = () => api.get<Sistema[]>('/gen/maestros/sistemas').then((r) => r.data);

// Programas
export const getProgramas  = (sistema?: number) => api.get<Programa[]>('/gen/maestros/programas', { params: sistema ? { sistema } : {} }).then((r) => r.data);
export const createPrograma = (data: Partial<Programa>) => api.post<Programa>('/gen/maestros/programas', data).then((r) => r.data);
export const updatePrograma = (id: number, data: Partial<Programa>) => api.put<Programa>(`/gen/maestros/programas/${id}`, data).then((r) => r.data);
export const deletePrograma = (id: number) => api.delete(`/gen/maestros/programas/${id}`);

// Profesiones
export const getProfesiones    = (params?: ListParams) => api.get<Paginated<Profesion>>('/gen/maestros/profesiones', { params }).then((r) => r.data);
export const createProfesion   = (data: Partial<Profesion>) => api.post<Profesion>('/gen/maestros/profesiones', data).then((r) => r.data);
export const updateProfesion   = (id: number, data: Partial<Profesion>) => api.put<Profesion>(`/gen/maestros/profesiones/${id}`, data).then((r) => r.data);
export const deleteProfesion   = (id: number) => api.delete(`/gen/maestros/profesiones/${id}`);

// Distritos
export const getDistritos      = (params?: ListParams) => api.get<Paginated<Distrito>>('/gen/maestros/distritos', { params }).then((r) => r.data);
export const createDistrito    = (data: Partial<Distrito>) => api.post<Distrito>('/gen/maestros/distritos', data).then((r) => r.data);
export const updateDistrito    = (id: number, data: Partial<Distrito>) => api.put<Distrito>(`/gen/maestros/distritos/${id}`, data).then((r) => r.data);
export const deleteDistrito    = (id: number) => api.delete(`/gen/maestros/distritos/${id}`);

// Motivos de anulación
export const getMotivosAnulacion   = (params?: ListParams) => api.get<Paginated<MotivoAnulacion>>('/gen/maestros/motivos-anulacion', { params }).then((r) => r.data);
export const createMotivoAnulacion = (data: Partial<MotivoAnulacion>) => api.post<MotivoAnulacion>('/gen/maestros/motivos-anulacion', data).then((r) => r.data);
export const updateMotivoAnulacion = (id: number, data: Partial<MotivoAnulacion>) => api.put<MotivoAnulacion>(`/gen/maestros/motivos-anulacion/${id}`, data).then((r) => r.data);
export const deleteMotivoAnulacion = (id: number) => api.delete(`/gen/maestros/motivos-anulacion/${id}`);

// Localidades
export const getLocalidades    = (params?: ListParams) => api.get<Paginated<Localidad>>('/gen/maestros/localidades', { params }).then((r) => r.data);
export const createLocalidad   = (data: Partial<Localidad>) => api.post<Localidad>('/gen/maestros/localidades', data).then((r) => r.data);
export const updateLocalidad   = (id: number, data: Partial<Localidad>) => api.put<Localidad>(`/gen/maestros/localidades/${id}`, data).then((r) => r.data);
export const deleteLocalidad   = (id: number) => api.delete(`/gen/maestros/localidades/${id}`);

// Barrios
export const getBarrios        = (params?: ListParams) => api.get<Paginated<Barrio>>('/gen/maestros/barrios', { params }).then((r) => r.data);
export const createBarrio      = (data: Partial<Barrio>) => api.post<Barrio>('/gen/maestros/barrios', data).then((r) => r.data);
export const updateBarrio      = (id: number, data: Partial<Barrio>) => api.put<Barrio>(`/gen/maestros/barrios/${id}`, data).then((r) => r.data);
export const deleteBarrio      = (id: number) => api.delete(`/gen/maestros/barrios/${id}`);

// Planes Pantalla (DOOH)
export interface PlanPantalla {
  plan_codigo: string;
  plan_nombre: string;
  plan_inserciones: number;
  plan_descripcion: string | null;
  plan_orden: number;
  plan_activo: string; // 'S' o 'N'
}
export const getPlanesPantalla      = () => api.get<PlanPantalla[]>('/gen/maestros/planes-pantalla').then((r) => r.data);
export const createPlanPantalla     = (data: Partial<PlanPantalla>) => api.post<PlanPantalla>('/gen/maestros/planes-pantalla', data).then((r) => r.data);
export const updatePlanPantalla     = (codigo: string, data: Partial<PlanPantalla>) => api.put<PlanPantalla>(`/gen/maestros/planes-pantalla/${codigo}`, data).then((r) => r.data);
export const deletePlanPantalla     = (codigo: string) => api.delete(`/gen/maestros/planes-pantalla/${codigo}`);
