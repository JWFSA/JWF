'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { getCliente, updateCliente, getMarcasCliente, createCampanha, deleteCampanha, getCampanhaNombres } from '@/services/fac';
import ClienteForm, { type ClienteFormData } from '@/components/fac/ClienteForm';
import { Plus, Trash2 } from 'lucide-react';
import { confirmDelete, showSuccess, showError } from '@/lib/swal';

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<ClienteFormData | null>(null);
  const [error, setError] = useState('');
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [buscarMarca, setBuscarMarca] = useState('');
  const [debouncedBuscar, setDebouncedBuscar] = useState('');

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => getCliente(Number(id)),
  });

  const { data: marcas } = useQuery({
    queryKey: ['marcas-cliente', id],
    queryFn: () => getMarcasCliente(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBuscar(buscarMarca), 300);
    return () => clearTimeout(t);
  }, [buscarMarca]);

  const { data: nombresMarcas } = useQuery({
    queryKey: ['campanha-nombres', debouncedBuscar],
    queryFn: () => getCampanhaNombres(debouncedBuscar),
    enabled: buscarMarca.length >= 1,
  });

  useEffect(() => {
    if (!cliente) return;
    setForm({
      cli_nom: cliente.cli_nom ?? '',
      cli_ruc: cliente.cli_ruc ?? '',
      cli_tel: cliente.cli_tel ?? '',
      cli_fax: cliente.cli_fax ?? '',
      cli_emails: (() => { const e = [cliente.cli_email, cliente.cli_email2, cliente.cli_email3, cliente.cli_email4].filter((v): v is string => !!v); return e.length > 0 ? e : ['']; })(),
      cli_dir2: cliente.cli_dir2 ?? '',
      cli_localidad: cliente.cli_localidad ?? '',
      cli_departamento: cliente.cli_departamento ?? '',
      cli_cod_localidad: cliente.cli_cod_localidad ?? '',
      cli_cod_barrio: cliente.cli_cod_barrio ?? '',
      cli_zona: cliente.cli_zona ?? '',
      cli_categ: cliente.cli_categ ?? '',
      cli_pais: cliente.cli_pais ?? '',
      cli_est_cli: cliente.cli_est_cli ?? 'A',
      cli_imp_lim_cr: parseFloat(String(cliente.cli_imp_lim_cr)) || 0,
      cli_bloq_lim_cr: cliente.cli_bloq_lim_cr ?? 'N',
      cli_max_dias_atraso: cliente.cli_max_dias_atraso ?? 0,
      cli_ind_potencial: cliente.cli_ind_potencial ?? 'N',
      cli_obs: cliente.cli_obs ?? '',
      cli_pers_contacto: cliente.cli_pers_contacto ?? '',
      cli_vendedor: cliente.cli_vendedor ?? '',
      cli_tipo_vta: (cliente.cli_tipo_vta || 'C') as 'C' | 'R',
      cli_mod_venta: (cliente.cli_mod_venta || 'D') as 'D' | 'I',
      cli_agencia: cliente.cli_agencia ?? '',
      cli_comision_agen: cliente.cli_comision_agen ?? 0,
      cli_cond_venta: cliente.cli_cond_venta || 'CONTADO',
    });
  }, [cliente]);

  const updateMut = useMutation({
    mutationFn: (data: Partial<typeof form>) => updateCliente(Number(id), data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['cliente', id] });
      showSuccess('Los cambios se guardaron correctamente.');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? 'Error al guardar';
      setError(msg);
      showError(msg);
    },
  });

  const addMarcaMut = useMutation({
    mutationFn: (nombre: string) => createCampanha({ camp_cli: Number(id), camp_nombre: nombre, camp_ind_vigente: 'S' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marcas-cliente', id] }); setNuevaMarca(''); },
  });

  const deleteMarcaMut = useMutation({
    mutationFn: (nro: number) => deleteCampanha(Number(id), nro),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marcas-cliente', id] }),
  });

  const handleSubmit = () => {
    if (!form?.cli_nom.trim()) { setError('El nombre es requerido'); return; }
    setError('');
    const { cli_emails, ...rest } = form;
    const clean: Record<string, unknown> = { ...rest };
    for (const k of Object.keys(clean)) {
      if (clean[k] === '') clean[k] = null;
    }
    clean.cli_email  = cli_emails[0]?.trim() || null;
    clean.cli_email2 = cli_emails[1]?.trim() || null;
    clean.cli_email3 = cli_emails[2]?.trim() || null;
    clean.cli_email4 = cli_emails[3]?.trim() || null;
    updateMut.mutate(clean as any);
  };

  if (isLoading || !form) {
    return <div className="p-6 text-center text-sm text-gray-400">Cargando...</div>;
  }

  const marcasList = marcas ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cliente?.cli_nom} &middot; #{id}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ClienteForm
          form={form} onChange={setForm} error={error}
          isPending={updateMut.isPending} onSubmit={handleSubmit}
          onCancel={() => router.push('/fac/clientes')} isEdit
        />
      </div>

      {/* Marcas del cliente */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Marcas del cliente</h2>

        <div className="relative flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <input
              value={buscarMarca}
              onChange={(e) => { setBuscarMarca(e.target.value); setNuevaMarca(''); }}
              placeholder="Buscar marca existente..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {buscarMarca.length >= 1 && nombresMarcas && nombresMarcas.length > 0 && !nuevaMarca && (
              <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                {nombresMarcas
                  .filter((n) => !marcasList.some((m) => m.camp_nombre === n))
                  .map((nombre) => (
                    <li
                      key={nombre}
                      onClick={() => { setNuevaMarca(nombre); setBuscarMarca(nombre); }}
                      className="px-3 py-2 text-sm hover:bg-primary-50 cursor-pointer"
                    >
                      {nombre}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => { if (nuevaMarca.trim()) { addMarcaMut.mutate(nuevaMarca.trim()); setBuscarMarca(''); } }}
            disabled={!nuevaMarca.trim() || addMarcaMut.isPending}
            className="inline-flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {marcasList.length > 0 ? (
          <div className="space-y-1">
            {marcasList.map((m: { camp_nro: number; camp_nombre: string; camp_ind_vigente: string | null }) => (
              <div key={m.camp_nro} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 tabular-nums w-6">{m.camp_nro}</span>
                  <span className="text-sm text-gray-800">{m.camp_nombre}</span>
                  {m.camp_ind_vigente === 'N' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Inactiva</span>
                  )}
                </div>
                <button
                  onClick={async () => { if (await confirmDelete(`¿Eliminar la marca "${m.camp_nombre}"?`)) deleteMarcaMut.mutate(m.camp_nro); }}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Sin marcas asignadas</p>
        )}
      </div>
    </div>
  );
}
