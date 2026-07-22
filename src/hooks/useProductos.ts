import { useState, useEffect, useCallback } from 'react';
import { Producto, TarifaProducto, ImagenProducto, ProductoProveedor } from '../types/producto';
import { supabase } from '../lib/supabaseClient';

function prodFromRow(row: any): Producto {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    unidad: row.unidad,
    activo: !!row.activo,
    imagenUrl: row.imagen_url || '',
    ivaPorDefecto: row.iva_por_defecto !== undefined && row.iva_por_defecto !== null ? Number(row.iva_por_defecto) : 21,
    precioCoste: row.precio_coste !== undefined && row.precio_coste !== null ? Number(row.precio_coste) : 0,
    descuento: row.descuento !== undefined && row.descuento !== null ? Number(row.descuento) : 0,
    precioVenta: row.precio_venta !== undefined && row.precio_venta !== null ? Number(row.precio_venta) : 0
  };
}

function prodToRow(prod: Partial<Producto>): any {
  const row: any = {};
  if (prod.id !== undefined) row.id = prod.id;
  if (prod.codigo !== undefined) row.codigo = prod.codigo;
  if (prod.nombre !== undefined) row.nombre = prod.nombre;
  if (prod.categoria !== undefined) row.categoria = prod.categoria;
  if (prod.descripcion !== undefined) row.descripcion = prod.descripcion;
  if (prod.unidad !== undefined) row.unidad = prod.unidad;
  if (prod.activo !== undefined) row.activo = prod.activo;
  if (prod.imagenUrl !== undefined) row.imagen_url = prod.imagenUrl;
  if (prod.ivaPorDefecto !== undefined) row.iva_por_defecto = prod.ivaPorDefecto;
  if (prod.precioCoste !== undefined) row.precio_coste = prod.precioCoste;
  if (prod.descuento !== undefined) row.descuento = prod.descuento;
  if (prod.precioVenta !== undefined) row.precio_venta = prod.precioVenta;
  return row;
}

function productoProveedorFromRow(row: any): ProductoProveedor {
  return {
    id: row.id,
    productoId: row.producto_id,
    proveedorId: row.proveedor_id,
    precioCompra: Number(row.precio_compra),
    precioVenta: Number(row.precio_venta),
    referenciaProveedor: row.referencia_proveedor,
    activo: !!row.activo
  };
}

function productoProveedorToRow(pp: ProductoProveedor): any {
  return {
    id: pp.id,
    producto_id: pp.productoId,
    proveedor_id: pp.proveedorId,
    precio_compra: pp.precioCompra,
    precio_venta: pp.precioVenta,
    referencia_proveedor: pp.referenciaProveedor,
    activo: pp.activo
  };
}

function tarifaFromRow(row: any): TarifaProducto {
  return {
    id: row.id,
    productoId: row.producto_id,
    nombre: row.nombre,
    precio: Number(row.precio),
    fechaVigencia: row.fecha_vigencia
  };
}

function tarifaToRow(tarifa: Partial<TarifaProducto>): any {
  const row: any = {};
  if (tarifa.id !== undefined) row.id = tarifa.id;
  if (tarifa.productoId !== undefined) row.producto_id = tarifa.productoId;
  if (tarifa.nombre !== undefined) row.nombre = tarifa.nombre;
  if (tarifa.precio !== undefined) row.precio = tarifa.precio;
  if (tarifa.fechaVigencia !== undefined) row.fecha_vigencia = tarifa.fechaVigencia;
  return row;
}

function imgFromRow(row: any): ImagenProducto {
  return {
    id: row.id,
    productoId: row.producto_id,
    url: row.url,
    esPrincipal: !!row.es_principal
  };
}

function imgToRow(img: Partial<ImagenProducto>): any {
  const row: any = {};
  if (img.id !== undefined) row.id = img.id;
  if (img.productoId !== undefined) row.producto_id = img.productoId;
  if (img.url !== undefined) row.url = img.url;
  if (img.esPrincipal !== undefined) row.es_principal = img.esPrincipal;
  return row;
}

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tarifas, setTarifas] = useState<TarifaProducto[]>([]);
  const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
  const [productosProveedores, setProductosProveedores] = useState<Record<string, ProductoProveedor[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, tarifaRes, imgRes, ppRes] = await Promise.all([
        supabase.from('productos').select('*').order('created_at', { ascending: false }),
        supabase.from('tarifas_producto').select('*').order('id', { ascending: true }),
        supabase.from('imagenes_producto').select('*').order('id', { ascending: true }),
        supabase.from('producto_proveedor').select('*').order('id', { ascending: true })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (tarifaRes.error) throw tarifaRes.error;
      if (imgRes.error) throw imgRes.error;
      if (ppRes.error) throw ppRes.error;

      if (prodRes.data) setProductos(prodRes.data.map(prodFromRow));
      if (tarifaRes.data) setTarifas(tarifaRes.data.map(tarifaFromRow));
      if (imgRes.data) setImagenes(imgRes.data.map(imgFromRow));

      const ppMap: Record<string, ProductoProveedor[]> = {};
      if (ppRes.data) {
        ppRes.data.forEach((row: any) => {
          const pp = productoProveedorFromRow(row);
          if (!ppMap[pp.productoId]) {
            ppMap[pp.productoId] = [];
          }
          ppMap[pp.productoId].push(pp);
        });
      }
      setProductosProveedores(ppMap);
    } catch (err: any) {
      console.error('Error fetching products data:', err);
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Generar código automático PRD-XXXXXX (deprecated but kept for compatibility if needed)
  const generateNextCodigo = (): string => {
    if (productos.length === 0) return 'PRD-000001';

    const codigos = productos
      .map(p => {
        const match = p.codigo?.match(/PRD-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    const maxNum = codigos.length > 0 ? Math.max(...codigos) : 0;
    const nextNum = maxNum + 1;
    return `PRD-${String(nextNum).padStart(6, '0')}`;
  };

  const addProducto = async (productoData: Omit<Producto, 'id'>) => {
    try {
      // Verificar que codigo no sea duplicado
      const { data: existing, error: checkError } = await supabase
        .from('productos')
        .select('id, codigo')
        .eq('codigo', productoData.codigo)
        .single();

      if (existing) {
        throw new Error(
          `⚠️ Ya existe un producto con referencia "${productoData.codigo}" (ID: ${existing.id}). ` +
          `¿Deseas editar ese producto en lugar de crear uno nuevo?`
        );
      }

      // Si check_error es "no rows", continue (es OK, no hay duplicado)
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const newId = `prod_${Date.now()}`;
      const newProducto: Producto = {
        ...productoData,
        id: newId
      };

      const { error: insertError } = await supabase
        .from('productos')
        .insert([prodToRow(newProducto)]);
      
      if (insertError) throw insertError;

      await fetchAllData();
      return newProducto;
    } catch (err: any) {
      console.error('Error adding producto:', err);
      setError(err.message || 'Error al añadir el producto');
      throw err;
    }
  };

  const updateProducto = async (id: string, updatedFields: Partial<Producto>) => {
    try {
      // 1. Update product main table
      const { error: err } = await supabase
        .from('productos')
        .update(prodToRow(updatedFields))
        .eq('id', id);
      if (err) throw err;

      // 2. Update main image if url changed
      if (updatedFields.imagenUrl) {
        const existingMain = imagenes.find(img => img.productoId === id && img.esPrincipal);
        if (existingMain) {
          await supabase
            .from('imagenes_producto')
            .update({ url: updatedFields.imagenUrl })
            .eq('id', existingMain.id);
        } else {
          const newImg: ImagenProducto = {
            id: `img_up_${Date.now()}`,
            productoId: id,
            url: updatedFields.imagenUrl,
            esPrincipal: true
          };
          await supabase
            .from('imagenes_producto')
            .insert([imgToRow(newImg)]);
        }
      }

      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Error al actualizar el producto');
      throw err;
    }
  };

  const deleteProducto = async (id: string) => {
    try {
      // Delete child relations manually to avoid FK errors
      await Promise.all([
        supabase.from('producto_proveedor').delete().eq('producto_id', id),
        supabase.from('tarifas_producto').delete().eq('producto_id', id),
        supabase.from('imagenes_producto').delete().eq('producto_id', id)
      ]);

      const { error: err } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Error al eliminar el producto');
      throw err;
    }
  };

  const addTarifa = async (tarifaData: Omit<TarifaProducto, 'id'>) => {
    try {
      const newId = `trf_${Date.now()}`;
      const newTarifa: TarifaProducto = {
        ...tarifaData,
        id: newId
      };

      const { error: err } = await supabase
        .from('tarifas_producto')
        .insert([tarifaToRow(newTarifa)]);
      if (err) throw err;

      await fetchAllData();
      return newTarifa;
    } catch (err: any) {
      console.error('Error adding tariff:', err);
      setError(err.message || 'Error al añadir la tarifa');
      throw err;
    }
  };

  const deleteTarifa = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('tarifas_producto')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting tariff:', err);
      setError(err.message || 'Error al eliminar la tarifa');
      throw err;
    }
  };

  const addImagenProducto = async (imgData: Omit<ImagenProducto, 'id'>) => {
    try {
      const newId = `img_custom_${Date.now()}`;
      const newImg: ImagenProducto = {
        ...imgData,
        id: newId
      };

      // If setting this one as principal, demote previous principal images in DB
      if (imgData.esPrincipal) {
        await supabase
          .from('imagenes_producto')
          .update({ es_principal: false })
          .eq('producto_id', imgData.productoId);
      }

      const { error: err } = await supabase
        .from('imagenes_producto')
        .insert([imgToRow(newImg)]);
      if (err) throw err;

      // If principal, update the main product image url
      if (imgData.esPrincipal) {
        await supabase
          .from('productos')
          .update({ imagen_url: imgData.url })
          .eq('id', imgData.productoId);
      }

      await fetchAllData();
      return newImg;
    } catch (err: any) {
      console.error('Error adding product image:', err);
      setError(err.message || 'Error al añadir la imagen del producto');
      throw err;
    }
  };

  const deleteImagenProducto = async (id: string) => {
    try {
      const imageToDelete = imagenes.find(img => img.id === id);
      if (!imageToDelete) return;

      if (imageToDelete.esPrincipal) {
        // Find another image of the same product
        const remaining = imagenes.filter(img => img.productoId === imageToDelete.productoId && img.id !== id);
        if (remaining.length > 0) {
          // Promote the first remaining to principal
          await supabase
            .from('imagenes_producto')
            .update({ es_principal: true })
            .eq('id', remaining[0].id);
          // Update product url too
          await supabase
            .from('productos')
            .update({ imagen_url: remaining[0].url })
            .eq('id', imageToDelete.productoId);
        } else {
          // No images left, clear product image url
          await supabase
            .from('productos')
            .update({ imagen_url: '' })
            .eq('id', imageToDelete.productoId);
        }
      }

      const { error: err } = await supabase
        .from('imagenes_producto')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting product image:', err);
      setError(err.message || 'Error al eliminar la imagen del producto');
      throw err;
    }
  };

  const addProductoProveedor = async (
    productoId: string,
    proveedorId: string,
    precioCompra: number,
    precioVenta: number,
    referenciaProveedor?: string
  ) => {
    try {
      const newId = `pp_${Date.now()}`;
      const { error } = await supabase
        .from('producto_proveedor')
        .insert([{
          id: newId,
          producto_id: productoId,
          proveedor_id: proveedorId,
          precio_compra: precioCompra,
          precio_venta: precioVenta,
          referencia_proveedor: referenciaProveedor,
          activo: true
        }]);

      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      console.error('Error adding producto-proveedor:', err);
      setError(err.message || 'Error al añadir el proveedor del producto');
      throw err;
    }
  };

  const deleteProductoProveedor = async (ppId: string) => {
    try {
      const { error } = await supabase
        .from('producto_proveedor')
        .delete()
        .eq('id', ppId);

      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting producto-proveedor:', err);
      setError(err.message || 'Error al eliminar el proveedor del producto');
      throw err;
    }
  };

  const updateProductoProveedor = async (ppId: string, updates: Partial<ProductoProveedor>) => {
    try {
      const { error } = await supabase
        .from('producto_proveedor')
        .update(productoProveedorToRow(updates as ProductoProveedor))
        .eq('id', ppId);

      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating producto-proveedor:', err);
      setError(err.message || 'Error al actualizar el proveedor del producto');
      throw err;
    }
  };

  // Helper derived calculation
  const getMargin = (precioCompra: number, precioVenta: number) => {
    const diff = precioVenta - precioCompra;
    const pct = precioCompra > 0 ? (diff / precioCompra) * 100 : 0;
    const profitMarginPct = precioVenta > 0 ? (diff / precioVenta) * 100 : 0;
    return {
      absolute: diff,
      markupPct: pct,          // Sobre coste (markup)
      profitMarginPct: profitMarginPct // Margen comercial sobre venta (margin)
    };
  };

  return {
    productos,
    tarifas,
    imagenes,
    productosProveedores,
    loading,
    error,
    addProducto,
    updateProducto,
    deleteProducto,
    addTarifa,
    deleteTarifa,
    addImagenProducto,
    deleteImagenProducto,
    addProductoProveedor,
    updateProductoProveedor,
    deleteProductoProveedor,
    getMargin
  };
}
