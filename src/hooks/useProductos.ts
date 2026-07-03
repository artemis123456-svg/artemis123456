import { useState, useEffect, useCallback } from 'react';
import { Producto, TarifaProducto, ImagenProducto } from '../types/producto';
import { supabase } from '../lib/supabaseClient';

function prodFromRow(row: any): Producto {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    proveedorId: row.proveedor_id,
    precioCompra: Number(row.precio_compra),
    precioVenta: Number(row.precio_venta),
    unidad: row.unidad,
    activo: !!row.activo,
    imagenUrl: row.imagen_url || '',
    stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : 0
  };
}

function prodToRow(prod: Partial<Producto>): any {
  const row: any = {};
  if (prod.id !== undefined) row.id = prod.id;
  if (prod.codigo !== undefined) row.codigo = prod.codigo;
  if (prod.nombre !== undefined) row.nombre = prod.nombre;
  if (prod.categoria !== undefined) row.categoria = prod.categoria;
  if (prod.descripcion !== undefined) row.descripcion = prod.descripcion;
  if (prod.proveedorId !== undefined) row.proveedor_id = prod.proveedorId;
  if (prod.precioCompra !== undefined) row.precio_compra = prod.precioCompra;
  if (prod.precioVenta !== undefined) row.precio_venta = prod.precioVenta;
  if (prod.unidad !== undefined) row.unidad = prod.unidad;
  if (prod.activo !== undefined) row.activo = prod.activo;
  if (prod.imagenUrl !== undefined) row.imagen_url = prod.imagenUrl;
  if (prod.stock !== undefined) row.stock = prod.stock;
  return row;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, tarifaRes, imgRes] = await Promise.all([
        supabase.from('productos').select('*').order('created_at', { ascending: false }),
        supabase.from('tarifas_producto').select('*').order('id', { ascending: true }),
        supabase.from('imagenes_producto').select('*').order('id', { ascending: true })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (tarifaRes.error) throw tarifaRes.error;
      if (imgRes.error) throw imgRes.error;

      if (prodRes.data) setProductos(prodRes.data.map(prodFromRow));
      if (tarifaRes.data) setTarifas(tarifaRes.data.map(tarifaFromRow));
      if (imgRes.data) setImagenes(imgRes.data.map(imgFromRow));
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

  const addProducto = async (prodData: Omit<Producto, 'id'>) => {
    try {
      const newId = `prd_${Date.now()}`;
      const newProd: Producto = {
        ...prodData,
        id: newId
      };

      // 1. Insert product
      const { error: err } = await supabase
        .from('productos')
        .insert([prodToRow(newProd)]);
      if (err) throw err;

      // 2. Insert main image if present
      if (prodData.imagenUrl) {
        const newImg: ImagenProducto = {
          id: `img_${Date.now()}`,
          productoId: newId,
          url: prodData.imagenUrl,
          esPrincipal: true
        };
        await supabase
          .from('imagenes_producto')
          .insert([imgToRow(newImg)]);
      }

      // 3. Create general PVP rate
      const newTarifa: TarifaProducto = {
        id: `trf_${Date.now()}`,
        productoId: newId,
        nombre: 'Tarifa General PVP',
        precio: prodData.precioVenta,
        fechaVigencia: new Date().toISOString().split('T')[0]
      };
      await supabase
        .from('tarifas_producto')
        .insert([tarifaToRow(newTarifa)]);

      await fetchAllData();
      return newProd;
    } catch (err: any) {
      console.error('Error adding product:', err);
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
        // Find existing main image in our state or just upsert in DB
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

      // 3. Update or ensure general PVP rate matches updated precioVenta
      if (updatedFields.precioVenta !== undefined) {
        const pvpTarifa = tarifas.find(t => t.productoId === id && t.nombre === 'Tarifa General PVP');
        if (pvpTarifa) {
          await supabase
            .from('tarifas_producto')
            .update({ precio: updatedFields.precioVenta })
            .eq('id', pvpTarifa.id);
        } else {
          const newTarifa: TarifaProducto = {
            id: `trf_up_${Date.now()}`,
            productoId: id,
            nombre: 'Tarifa General PVP',
            precio: updatedFields.precioVenta,
            fechaVigencia: new Date().toISOString().split('T')[0]
          };
          await supabase
            .from('tarifas_producto')
            .insert([tarifaToRow(newTarifa)]);
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

  // Helper derived calculation
  const getMargin = (producto: Producto) => {
    const diff = producto.precioVenta - producto.precioCompra;
    const pct = producto.precioCompra > 0 ? (diff / producto.precioCompra) * 100 : 0;
    const profitMarginPct = producto.precioVenta > 0 ? (diff / producto.precioVenta) * 100 : 0;
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
    loading,
    error,
    addProducto,
    updateProducto,
    deleteProducto,
    addTarifa,
    deleteTarifa,
    addImagenProducto,
    deleteImagenProducto,
    getMargin
  };
}
