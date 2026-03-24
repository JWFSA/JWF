'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRol, updateRol, assignProgramasRol, getSistemas, getProgramas } from '@/services/gen';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Check } from 'lucide-react';

export default function EditarRolPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: rol, isLoading: loadingRol } = useQuery({
    queryKey: ['rol', id],
    queryFn: () => getRol(Number(id)),
  });

  const { data: sistemas = [] } = useQuery({
    queryKey: ['sistemas'],
    queryFn: getSistemas,
  });

  const { data: todosProgramas = [] } = useQuery({
    queryKey: ['programas'],
    queryFn: () => getProgramas(),
  });

  const [nombre, setNombre] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (rol) {
      setNombre(rol.rol_nombre);
      setSeleccionados(new Set(rol.programas?.map((p) => p.prog_clave) ?? []));
    }
  }, [rol]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateRol(Number(id), { nombre });
      await assignProgramasRol(Number(id), Array.from(seleccionados));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['rol', id] });
      router.push('/gen/roles');
    },
  });

  const togglePrograma = (clave: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(clave) ? next.delete(clave) : next.add(clave);
      return next;
    });
  };

  const toggleSistema = (sistCodigo: number) => {
    const progs = todosProgramas.filter((p) => p.prog_sistema === sistCodigo).map((p) => p.prog_clave);
    const todosActivos = progs.every((c) => seleccionados.has(c));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      progs.forEach((c) => todosActivos ? next.delete(c) : next.add(c));
      return next;
    });
  };

  if (loadingRol) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;
  if (!rol) return <div className="p-6 text-sm text-red-500">Rol no encontrado.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/gen/roles" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Editar rol</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nombre y permisos de acceso</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del rol</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Programas agrupados por sistema */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Permisos por programa
            <span className="ml-2 text-xs font-normal text-gray-400">
              {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
            </span>
          </h2>

          {sistemas.length === 0 ? (
            <p className="text-sm text-gray-400">Sin sistemas disponibles.</p>
          ) : (
            <div className="space-y-5">
              {sistemas.map((sist) => {
                const progs = todosProgramas.filter((p) => p.prog_sistema === sist.sist_codigo);
                if (progs.length === 0) return null;
                const todosActivos = progs.every((p) => seleccionados.has(p.prog_clave));
                const algunoActivo = progs.some((p) => seleccionados.has(p.prog_clave));

                return (
                  <div key={sist.sist_codigo}>
                    <button
                      type="button"
                      onClick={() => toggleSistema(sist.sist_codigo)}
                      className="flex items-center gap-2 mb-2 group"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                        todosActivos ? 'bg-primary-600 border-primary-600' :
                        algunoActivo ? 'bg-primary-100 border-primary-400' :
                        'border-gray-300 group-hover:border-primary-400'
                      }`}>
                        {todosActivos && <Check size={11} className="text-white" />}
                        {!todosActivos && algunoActivo && <span className="w-2 h-0.5 bg-primary-500 rounded" />}
                      </span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                        {sist.sist_desc}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({progs.filter((p) => seleccionados.has(p.prog_clave)).length}/{progs.length})
                      </span>
                    </button>

                    <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {progs.map((prog) => (
                        <label key={prog.prog_clave} className="flex items-center gap-2 cursor-pointer group">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                            seleccionados.has(prog.prog_clave)
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-gray-300 group-hover:border-primary-400'
                          }`}>
                            {seleccionados.has(prog.prog_clave) && <Check size={11} className="text-white" />}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={seleccionados.has(prog.prog_clave)}
                            onChange={() => togglePrograma(prog.prog_clave)}
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-800">{prog.prog_desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {saveMutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {(saveMutation.error as any)?.response?.data?.message ?? 'Error al guardar'}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/gen/roles" className="w-full sm:w-auto text-center px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </Link>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!nombre.trim() || saveMutation.isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <Save size={15} />
            {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
