'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getListasPrecio, createListaPrecio, updateListaPrecio, deleteListaPrecio } from '@/services/fac';
import type { ListaPrecio } from '@/types/fac';
import { List } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { useEffect } from 'react';

const emptyForm = { lipe_desc: '', lipe_mon: '', lipe_estado: 'A' as 'A' | 'I' };

const makeColumns = (onVerArticulos: (l: ListaPrecio) => void) => [
  { key: 'nro',    header: 'Nro.',        sortKey: 'nro',    headerClassName: 'w-16', cell: (l: ListaPrecio) => l.lipe_nro_lista_precio, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc',   cell: (l: ListaPrecio) => l.lipe_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'estado', header: 'Estado',      sortKey: 'estado',
    cell: (l: ListaPrecio) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${l.lipe_estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {l.lipe_estado === 'A' ? 'Activa' : 'Inactiva'}
      </span>
    ) },
  { key: 'items', header: '', headerClassName: 'w-10',
    cell: (l: ListaPrecio) => (
      <button type="button" onClick={(e) => { e.stopPropagation(); onVerArticulos(l); }}
        title="Ver artículos" className="p-1 text-gray-400 hover:text-primary-600 rounded transition">
        <List size={15} />
      </button>
    ), cellClassName: 'text-center' },
];

export default function ListasPrecioPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ListaPrecio | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['listas-precio', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getListasPrecio({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const listas     = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['listas-precio'] });

  const createMut = useMutation({
    mutationFn: createListaPrecio,
    onSuccess: () => { inv(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ListaPrecio> }) => updateListaPrecio(id, data),
    onSuccess: () => { inv(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const deleteMut = useMutation({ mutationFn: deleteListaPrecio, onSuccess: inv });

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (l: ListaPrecio) => {
    setEditing(l);
    setForm({ lipe_desc: l.lipe_desc, lipe_mon: String(l.lipe_mon ?? ''), lipe_estado: l.lipe_estado });
    setError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.lipe_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload: Partial<ListaPrecio> = {
      lipe_desc: form.lipe_desc,
      lipe_mon: form.lipe_mon ? Number(form.lipe_mon) : null,
      lipe_estado: form.lipe_estado,
    };
    if (editing) {
      updateMut.mutate({ id: editing.lipe_nro_lista_precio, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Listas de precio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogos de precios de venta</p>
        </div>
        <PrimaryAddButton label="Nueva lista" shortLabel="Nueva" onClick={openNew} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={listas}
          getRowKey={(l) => l.lipe_nro_lista_precio}
          onRowClick={(l) => router.push(`/fac/listas-precio/${l.lipe_nro_lista_precio}`)}
          onEdit={openEdit}
          onDelete={(l) => deleteMut.mutate(l.lipe_nro_lista_precio)}
          deleteConfirmMessage="¿Eliminar esta lista de precio?"
          tableClassName="w-full min-w-[400px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={makeColumns((l) => router.push(`/fac/listas-precio/${l.lipe_nro_lista_precio}`))}
        />

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal && (
        <FormModal
          title={editing ? 'Editar lista de precio' : 'Nueva lista de precio'}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.lipe_desc} onChange={(e) => setForm({ ...form, lipe_desc: e.target.value })}
                placeholder="Ej: Precio USD Basic"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.lipe_estado} onChange={(e) => setForm({ ...form, lipe_estado: e.target.value as 'A' | 'I' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="A">Activa</option>
                <option value="I">Inactiva</option>
              </select>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
