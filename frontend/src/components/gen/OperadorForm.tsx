'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getEmpresas, getSucursales, getRoles } from '@/services/gen';
import type { Operador, Rol } from '@/types/gen';

interface Props {
  initial?: Operador;
  onSubmit: (data: Record<string, unknown>) => Promise<unknown>;
  isLoading?: boolean;
}

export default function OperadorForm({ initial, onSubmit, isLoading }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [nombre, setNombre] = useState(initial?.oper_nombre ?? '');
  const [apellido, setApellido] = useState(initial?.oper_apellido ?? '');
  const [login, setLogin] = useState(initial?.oper_login ?? '');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(initial?.oper_email ?? '');
  const [indAdmin, setIndAdmin] = useState(initial?.oper_ind_admin ?? 'N');
  const [indDesc, setIndDesc] = useState(initial?.oper_ind_desc ?? 'N');
  const [empr, setEmpr] = useState<number | ''>(initial?.oper_empr ?? '');
  const [suc, setSuc] = useState<number | ''>(initial?.oper_suc ?? '');
  const [selectedRoles, setSelectedRoles] = useState<number[]>(
    initial?.roles?.map((r: Rol) => r.rol_codigo) ?? []
  );

  const { data: empresasData } = useQuery({ queryKey: ['empresas', { all: true }], queryFn: () => getEmpresas({ all: true }) });
  const empresas = empresasData?.data ?? [];
  const { data: sucursales = [] } = useQuery({
    queryKey: ['sucursales', empr],
    queryFn: () => getSucursales(empr as number),
    enabled: !!empr,
  });
  const { data: rolesData } = useQuery({ queryKey: ['roles', { all: true }], queryFn: () => getRoles({ all: true }) });
  const roles = rolesData?.data ?? [];

  useEffect(() => {
    if (!initial || empr !== initial.oper_empr) setSuc('');
  }, [empr]);

  const toggleRol = (codigo: number) => {
    setSelectedRoles((prev) =>
      prev.includes(codigo) ? prev.filter((r) => r !== codigo) : [...prev, codigo]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      nombre: nombre.toUpperCase(),
      apellido: apellido ? apellido.toUpperCase() : null,
      login,
      ...((!isEdit || password) && { password }),
      email: email || null,
      indAdmin,
      indDesc,
      empr: empr || null,
      suc: suc || null,
      roles: selectedRoles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Datos personales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos del operador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Login *</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={isEdit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Empresa y Sucursal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Empresa y Sucursal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Empresa</label>
            <select
              value={empr}
              onChange={(e) => setEmpr(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Seleccionar —</option>
              {empresas.map((e) => (
                <option key={e.empr_codigo} value={e.empr_codigo}>
                  {e.empr_razon_social}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Sucursal</label>
            <select
              value={suc}
              onChange={(e) => setSuc(e.target.value ? Number(e.target.value) : '')}
              disabled={!empr}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Seleccionar —</option>
              {sucursales.map((s) => (
                <option key={s.suc_codigo} value={s.suc_codigo}>
                  {s.suc_desc}
                </option>
              ))}
            </select>
            {!empr && (
              <p className="text-xs text-gray-400 mt-1">Primero seleccioná una empresa</p>
            )}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Roles asignados</h2>
        {roles.length === 0 ? (
          <p className="text-sm text-gray-400">No hay roles creados aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {roles.map((rol) => (
              <label
                key={rol.rol_codigo}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(rol.rol_codigo)}
                  onChange={() => toggleRol(rol.rol_codigo)}
                  className="accent-primary-600"
                />
                {rol.rol_nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Configuración</h2>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={indAdmin === 'S'}
              onChange={(e) => setIndAdmin(e.target.checked ? 'S' : 'N')}
              className="accent-primary-600"
            />
            Administrador del sistema
          </label>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={indDesc === 'S'}
                onChange={(e) => setIndDesc(e.target.checked ? 'S' : 'N')}
                className="accent-red-500"
              />
              Desactivado
            </label>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => router.push('/gen/operadores')}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
