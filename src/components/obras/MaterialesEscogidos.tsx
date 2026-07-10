import React, { useState } from 'react';
import { MaterialEscogido } from '../../types/materialEscogido';
import { useMaterialesEscogidos } from '../../hooks/useMaterialesEscogidos';
import { useProductos } from '../../hooks/useProductos';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DecimalInput } from '../ui/DecimalInput';
import { Trash2, Plus, Calendar, X, Search, ShoppingBag } from 'lucide-react';

interface MaterialesEscogidosProps {
  obraId: string;
}

export default function MaterialesEscogidos({ obraId }: MaterialesEscogidosProps) {
  const { productos, productosProveedores } = useProductos();
  const {
    materiales,
    loading,
    addMaterialEscogido,
    updateMaterialEscogido,
    deleteMaterialEscogido
  } = useMaterialesEscogidos(obraId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [pedidoRealizado, setPedidoRealizado] = useState(false);
  const [fechaPedido, setFechaPedido] = useState('');
  const [recibido, setRecibido] = useState(false);
  const [fechaRecibido, setFechaRecibido] = useState('');

  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing states for in-line changes
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPedidoRealizado, setEditPedidoRealizado] = useState(false);
  const [editFechaPedido, setEditFechaPedido] = useState('');
  const [editRecibido, setEditRecibido] = useState(false);
  const [editFechaRecibido, setEditFechaRecibido] = useState('');
  const [editCantidad, setEditCantidad] = useState(1);
  const [editPrecio, setEditPrecio] = useState(0);

  const handleProductSelect = (p: any) => {
    setSelectedProductId(p.id);
    const pps = productosProveedores[p.id] || [];
    const sellingPrice = pps.length > 0 ? pps[0].precioVenta : 0;
    setPrecioUnitario(sellingPrice);
    setActiveSearch(false);
    setSearchQuery('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    await addMaterialEscogido({
      obraId,
      productoId: selectedProductId,
      cantidad,
      precioUnitario,
      pedidoRealizado,
      fechaPedido: pedidoRealizado ? (fechaPedido || new Date().toISOString().split('T')[0]) : null,
      recibido,
      fechaRecibido: recibido ? (fechaRecibido || new Date().toISOString().split('T')[0]) : null
    });

    // Reset Form
    setSelectedProductId('');
    setCantidad(1);
    setPrecioUnitario(0);
    setPedidoRealizado(false);
    setFechaPedido('');
    setRecibido(false);
    setFechaRecibido('');
    setShowAddForm(false);
  };

  const startEditing = (m: MaterialEscogido) => {
    setEditingId(m.id);
    setEditPedidoRealizado(m.pedidoRealizado);
    setEditFechaPedido(m.fechaPedido || '');
    setEditRecibido(m.recibido);
    setEditFechaRecibido(m.fechaRecibido || '');
    setEditCantidad(m.cantidad);
    setEditPrecio(m.precioUnitario);
  };

  const saveEdit = async (id: string) => {
    await updateMaterialEscogido(id, {
      cantidad: editCantidad,
      precioUnitario: editPrecio,
      pedidoRealizado: editPedidoRealizado,
      fechaPedido: editPedidoRealizado ? (editFechaPedido || new Date().toISOString().split('T')[0]) : null,
      recibido: editRecibido,
      fechaRecibido: editRecibido ? (editFechaRecibido || new Date().toISOString().split('T')[0]) : null
    });
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 italic">
        Cargando materiales escogidos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Materiales Escogidos de la Obra
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Planifica, solicita y controla la recepción de materiales del catálogo para esta obra.
          </p>
        </div>
        
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-gray-950 hover:bg-gray-900 text-white font-bold text-xs px-3 h-8.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Elegir Material
          </Button>
        )}
      </div>

      {/* Expandable Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in-40 duration-150">
          <div className="flex items-center justify-between border-b border-slate-150 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Elegir nuevo material</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Catalog search selector */}
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Seleccionar Producto *</label>
              <div className="relative">
                {selectedProductId ? (
                  <div className="h-9.5 flex items-center justify-between px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                    <span className="truncate font-bold">
                      {productos.find(p => p.id === selectedProductId)?.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProductId('')}
                      className="text-red-500 hover:text-red-700 text-[10px] uppercase font-bold ml-2 shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSearch(true)}
                    className="w-full h-9.5 text-xs text-left justify-start font-semibold text-slate-600 bg-white border-slate-200"
                  >
                    <Search className="h-4 w-4 mr-2 text-slate-400" />
                    Buscar en catálogo...
                  </Button>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Cant.</label>
              <DecimalInput
                value={cantidad}
                onChange={setCantidad}
                className="h-9.5 text-xs font-semibold bg-white"
              />
            </div>

            {/* Precio Unitario */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Unit.</label>
              <div className="relative">
                <DecimalInput
                  value={precioUnitario}
                  onChange={setPrecioUnitario}
                  className="h-9.5 text-xs font-mono font-bold pr-6 bg-white"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">€</span>
              </div>
            </div>

            {/* Total display */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Importe Previsto</label>
              <div className="h-9.5 flex items-center justify-end px-3 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-xs text-slate-700 select-all">
                {(cantidad * precioUnitario).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Checkbox: Pedido realizado */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
              <input
                type="checkbox"
                id="pedidoRealizado"
                checked={pedidoRealizado}
                onChange={(e) => {
                  setPedidoRealizado(e.target.checked);
                  if (e.target.checked && !fechaPedido) {
                    setFechaPedido(new Date().toISOString().split('T')[0]);
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-gray-900 focus:ring-gray-900"
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="pedidoRealizado" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Pedido Realizado
                </label>
                {pedidoRealizado && (
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 animate-in fade-in duration-100" />
                    <Input
                      type="date"
                      value={fechaPedido}
                      onChange={(e) => setFechaPedido(e.target.value)}
                      className="h-8 text-xs bg-slate-50 border-slate-200 py-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox: Recibido */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
              <input
                type="checkbox"
                id="recibido"
                checked={recibido}
                onChange={(e) => {
                  setRecibido(e.target.checked);
                  if (e.target.checked && !fechaRecibido) {
                    setFechaRecibido(new Date().toISOString().split('T')[0]);
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-gray-900 focus:ring-gray-900"
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="recibido" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Material Recibido en Obra
                </label>
                {recibido && (
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 animate-in fade-in duration-100" />
                    <Input
                      type="date"
                      value={fechaRecibido}
                      onChange={(e) => setFechaRecibido(e.target.value)}
                      className="h-8 text-xs bg-slate-50 border-slate-200 py-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-150">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="h-8.5 px-3.5 text-[11px] font-bold border-slate-200 text-slate-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedProductId}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-[11px] h-8.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Guardar en Obra
            </Button>
          </div>
        </form>
      )}

      {/* Catalog search modal */}
      {activeSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[75vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Elegir del Catálogo</h4>
              <button
                type="button"
                onClick={() => {
                  setActiveSearch(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-3 border-b border-slate-100">
              <Input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs h-9"
                autoFocus
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(() => {
                const query = searchQuery.trim().toLowerCase();
                const filtered = productos.filter(p => 
                  p.activo && (
                    p.nombre.toLowerCase().includes(query) ||
                    p.codigo.toLowerCase().includes(query) ||
                    (p.descripcion && p.descripcion.toLowerCase().includes(query))
                  )
                );
                
                if (filtered.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      No se encontraron productos coincidentes.
                    </div>
                  );
                }
                
                return filtered.map(p => {
                  const pps = productosProveedores[p.id] || [];
                  const sellingPrice = pps.length > 0 ? pps[0].precioVenta : 0;
                  
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProductSelect(p)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left transition-colors border-b border-slate-50"
                    >
                      {p.imagenUrl ? (
                        <img
                          src={p.imagenUrl}
                          alt={p.nombre}
                          className="w-9 h-9 object-cover rounded border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 select-none">
                          s/f
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{p.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Cód: {p.codigo}</div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 shrink-0 font-mono">
                        {sellingPrice.toFixed(2)} €
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* List / Table of Chosen Materials */}
      {materiales.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/45 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400 italic font-medium">
            No se han escogido o planificado materiales para esta obra todavía.
          </p>
          <p className="text-[11px] text-slate-300 mt-1 font-bold">
            Haz clic en "Elegir Material" para agregar elementos desde el catálogo de productos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Material / Foto</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3 text-right">Cant.</th>
                  <th className="py-3 px-3 text-right">Precio</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Estado del Pedido</th>
                  <th className="py-3 px-3">Recepción</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materiales.map(m => {
                  const product = productos.find(p => p.id === m.productoId);
                  const isEditing = editingId === m.id;
                  const totalAmt = m.cantidad * m.precioUnitario;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product?.imagenUrl ? (
                            <img
                              src={product.imagenUrl}
                              alt={product.nombre}
                              className="w-10 h-10 object-cover rounded border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400 select-none">
                              s/f
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">
                              {product ? product.nombre : 'Producto Desconocido'}
                            </span>
                            <span className="text-[10px] text-slate-400 italic block font-bold">
                              {product?.categoria || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 text-xs font-mono text-slate-500 font-bold">
                        {product?.codigo || '--'}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <DecimalInput
                            value={editCantidad}
                            onChange={setEditCantidad}
                            className="h-8 text-xs font-semibold text-right w-16 ml-auto bg-white"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-800">
                            {m.cantidad}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="relative w-20 ml-auto">
                            <DecimalInput
                              value={editPrecio}
                              onChange={setEditPrecio}
                              className="h-8 text-xs font-mono font-bold text-right pr-4 bg-white"
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">€</span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {m.precioUnitario.toFixed(2)} €
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-xs text-slate-900">
                        {isEditing ? (
                          <span>{(editCantidad * editPrecio).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                        ) : (
                          <span>{totalAmt.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                        )}
                      </td>

                      {/* Order status */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="space-y-1 max-w-[130px]">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editPedidoRealizado}
                                onChange={(e) => {
                                  setEditPedidoRealizado(e.target.checked);
                                  if (e.target.checked && !editFechaPedido) {
                                    setEditFechaPedido(new Date().toISOString().split('T')[0]);
                                  }
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-gray-900 focus:ring-gray-900"
                              />
                              PEDIDO
                            </label>
                            {editPedidoRealizado && (
                              <Input
                                type="date"
                                value={editFechaPedido}
                                onChange={(e) => setEditFechaPedido(e.target.value)}
                                className="h-7 text-[10px] py-0 px-1 bg-white border-slate-200"
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            {m.pedidoRealizado ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-black rounded uppercase">
                                  ✓ Pedido
                                </span>
                                {m.fechaPedido && (
                                  <span className="text-[10px] text-slate-400 font-bold block">
                                    {new Date(m.fechaPedido).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-medium">No solicitado</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Receipt Status */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="space-y-1 max-w-[130px]">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editRecibido}
                                onChange={(e) => {
                                  setEditRecibido(e.target.checked);
                                  if (e.target.checked && !editFechaRecibido) {
                                    setEditFechaRecibido(new Date().toISOString().split('T')[0]);
                                  }
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-gray-900 focus:ring-gray-900"
                              />
                              RECIBIDO
                            </label>
                            {editRecibido && (
                              <Input
                                type="date"
                                value={editFechaRecibido}
                                onChange={(e) => setEditFechaRecibido(e.target.value)}
                                className="h-7 text-[10px] py-0 px-1 bg-white border-slate-200"
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            {m.recibido ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded uppercase">
                                  ✓ Recibido
                                </span>
                                {m.fechaRecibido && (
                                  <span className="text-[10px] text-slate-400 font-bold block">
                                    {new Date(m.fechaRecibido).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-medium">Pendiente</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <Button
                                onClick={() => saveEdit(m.id)}
                                size="sm"
                                className="h-7 px-2.5 text-[10px] font-black bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
                              >
                                Guardar
                              </Button>
                              <Button
                                onClick={cancelEditing}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => startEditing(m)}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                Editar
                              </Button>
                              
                              <button
                                onClick={() => deleteMaterialEscogido(m.id)}
                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                title="Eliminar material"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Summary of planned items */}
          <div className="bg-slate-50 p-3.5 border-t border-slate-150 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Resumen del Listado:</span>
            <div className="flex gap-4">
              <span>Items: {materiales.length}</span>
              <span>Total Estimado: {materiales.reduce((sum, m) => sum + (m.cantidad * m.precioUnitario), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
