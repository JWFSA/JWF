'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListaPrecio, getListaPrecioItems, upsertListaPrecioItem, deleteListaPrecioItem,
} from '@/services/fac';
import { getArticulos } from '@/services/stk';
import type { ListaPrecioDetalle } from '@/types/fac';
import type { Articulo } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { confirmDelete } from '@/lib/swal';
import PreciosPorPlanSection from './PreciosPorPlanSection';

const COLUMNS = [
  { key: 'art',    header: 'Artículo',         cell: (d: ListaPrecioDetalle) => d.art_desc,       cellClassName: 'font-medium text-gray-800 text-xs' },
  { key: 'um',     header: 'UM',               headerClassName: 'w-16 hidden sm:table-cell',       cell: (d: ListaPrecioDetalle) => d.art_unid_med ?? '—', cellClassName: 'text-xs text-gray-500 hidden sm:table-cell' },
  { key: 'precio', header: 'Precio unitario',  headerClassName: 'w-36 text-right',
    cell: (d: ListaPrecioDetalle) => Number(d.lipr_precio_unitario).toLocaleString('es-PY'),
    cellClassName: 'text-right font-mono text-xs text-gray-700' },
  { key: 'dcto',   header: '% Dto.',           headerClassName: 'w-20 hidden md:table-cell text-right',
    cell: (d: ListaPrecioDetalle) => `${Number(d.lipr_dcto).toFixed(2)}%`,
    cellClassName: 'hidden md:table-cell text-right text-xs text-gray-500' },
];

export default function ListaPrecioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const listaId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();

  // Items list
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Agregar artículo
  const [artSearch, setArtSearch] = useState('');
  const [debouncedArtSearch, setDebouncedArtSearch] = useState('');
  const [artDropOpen, setArtDropOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState<Articulo | null>(null);
  const [precio, setPrecio] = useState('');
  const [dcto, setDcto] = useState('0');
  const [addError, setAddError] = useState('');
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedArtSearch(artSearch), 400);
    return () => clearTimeout(t);
  }, [artSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artRef.current && !artRef.current.contains(e.target as Node)) setArtDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Modal de edición inline
  const [editItem, setEditItem] = useState<ListaPrecioDetalle | null>(null);
  const [editPrecio, setEditPrecio] = useState('');
  const [editDcto, setEditDcto] = useState('');

  const { data: listaData } = useQuery({
    queryKey: ['lista-precio', listaId],
    queryFn: () => getListaPrecio(listaId),
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['lista-precio-items', listaId, { page, limit, search: debouncedSearch }],
    queryFn: () => getListaPrecioItems(listaId, { page, limit, search: debouncedSearch }),
  });

  const { data: artData } = useQuery({
    queryKey: ['articulos-search', debouncedArtSearch],
    queryFn: () => getArticulos({ search: debouncedArtSearch, limit: 10 }),
    enabled: artDropOpen && debouncedArtSearch.length >= 2,
  });

  const inv = () => qc.invalidateQueries({ queryKey: ['lista-precio-items', listaId] });

  const upsertMut = useMutation({
    mutationFn: (data: Partial<ListaPrecioDetalle>) => upsertListaPrecioItem(listaId, data),
    onSuccess: () => { inv(); setSelectedArt(null); setArtSearch(''); setPrecio(''); setDcto('0'); setAddError(''); setEditItem(null); },
    onError: (e: any) => setAddError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMut = useMutation({
    mutationFn: (art: number) => deleteListaPrecioItem(listaId, art),
    onSuccess: inv,
  });

  const selectArticulo = (art: Articulo) => {
    setSelectedArt(art);
    setArtSearch(art.art_desc);
    setArtDropOpen(false);
  };

  const handleAdd = () => {
    if (!selectedArt) { setAddError('Seleccioná un artículo de la lista'); return; }
    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) { setAddError('El precio debe ser un número válido'); return; }
    upsertMut.mutate({ lipr_art: selectedArt.art_codigo, lipr_precio_unitario: Number(precio), lipr_dcto: Number(dcto) || 0, lipr_dctob: 0 });
  };

  const openEdit = (item: ListaPrecioDetalle) => {
    setEditItem(item);
    setEditPrecio(String(item.lipr_precio_unitario));
    setEditDcto(String(item.lipr_dcto));
    setAddError('');
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    upsertMut.mutate({ lipr_art: editItem.lipr_art, lipr_precio_unitario: Number(editPrecio), lipr_dcto: Number(editDcto) || 0, lipr_dctob: editItem.lipr_dctob });
  };

  const items = itemsData?.data ?? [];
  const pagination = itemsData?.pagination;
  const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/fac/listas-precio')}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {listaData ? listaData.lipe_desc : `Lista #${listaId}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Artículos y precios de la lista</p>
        </div>
        {listaData && (
          <span className={`ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium ${listaData.lipe_estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {listaData.lipe_estado === 'A' ? 'Activa' : 'Inactiva'}
          </span>
        )}
      </div>

      {/* Panel de agregar artículo */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agregar artículo</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Búsqueda de artículo */}
          <div className="relative flex-1" ref={artRef}>
            <Plus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={artSearch}
              onChange={(e) => { setArtSearch(e.target.value); setArtDropOpen(true); setSelectedArt(null); }}
              onFocus={() => setArtDropOpen(true)}
              placeholder="Buscar artículo..."
              className={`w-full pl-9 ${inp}`}
            />
            {artDropOpen && artSearch.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {(artData?.data ?? []).length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : (
                  (artData?.data ?? []).map((a) => (
                    <button key={a.art_codigo} type="button" onClick={() => selectArticulo(a)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                      <span className="font-medium">{a.art_desc}</span>
                      {a.art_unid_med && <span className="text-gray-400 ml-2 text-xs">{a.art_unid_med}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="w-full sm:w-40">
            <input type="number" min="0" step="0.01" value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Precio"
              className={`w-full text-right ${inp}`}
            />
          </div>

          {/* % Descuento */}
          <div className="w-full sm:w-28">
            <input type="number" min="0" max="100" step="0.01" value={dcto}
              onChange={(e) => setDcto(e.target.value)}
              placeholder="% Dto."
              className={`w-full text-right ${inp}`}
            />
          </div>

          <button type="button" onClick={handleAdd} disabled={upsertMut.isPending && !editItem}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2 justify-center">
            <Plus size={15} />
            Agregar
          </button>
        </div>
        {addError && !editItem && <p className="mt-2 text-xs text-red-600">{addError}</p>}
      </div>

      {/* Modal de edición */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Editar precio</h3>
            <p className="text-xs text-gray-500 mb-4">{editItem.art_desc}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="0.01" value={editPrecio}
                  onChange={(e) => setEditPrecio(e.target.value)}
                  className={`w-full text-right ${inp}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Descuento</label>
                <input type="number" min="0" max="100" step="0.01" value={editDcto}
                  onChange={(e) => setEditDcto(e.target.value)}
                  className={`w-full text-right ${inp}`} />
              </div>
              {addError && <p className="text-xs text-red-600">{addError}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditItem(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={upsertMut.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2">
                <Save size={14} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Precios por plan para pantallas DOOH (ART_LINEA = 12) */}
      <PreciosPorPlanSection listaId={listaId} />

      {/* Tabla de artículos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Artículos regulares</h2>
          <p className="text-xs text-gray-500 mb-3">Un precio unitario por artículo</p>
          <SearchField value={search} onChange={setSearch} placeholder="Buscar artículo en la lista..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={items}
          getRowKey={(d) => d.lipr_art}
          onEdit={openEdit}
          onDelete={async (d) => { if (await confirmDelete('¿Quitar este artículo de la lista?')) deleteMut.mutate(d.lipr_art); }}
          tableClassName="w-full text-sm min-w-[400px]"
          columns={COLUMNS}
        />
        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
