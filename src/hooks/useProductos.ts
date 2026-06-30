import { useState, useEffect } from 'react';
import { Producto, TarifaProducto, ImagenProducto } from '../types/producto';

const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 'prd_1',
    codigo: 'PRD-000001',
    nombre: 'Azulejo Porcelánico Calacatta Gold 60x120 cm',
    categoria: 'Azulejos',
    descripcion: 'Gres porcelánico pulido rectificado imitación mármol Calacatta con vetas doradas. Ideal para pavimentos y revestimientos interiores de alta gama.',
    proveedorId: 'prv_1', // Porcelánicos Cerámica Levantina S.A.
    precioCompra: 18.50,
    precioVenta: 39.90,
    unidad: 'm2',
    stock: 120,
    stockMinimo: 40,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_2',
    codigo: 'PRD-000002',
    nombre: 'Mampara de Ducha Frontal Corredera Aura 120cm',
    categoria: 'Mamparas',
    descripcion: 'Mampara de ducha de un fijo y una corredera. Vidrio templado de seguridad de 8 mm con tratamiento antical de doble cara y perfilería de aluminio cromado pulido.',
    proveedorId: 'prv_2', // Saneamientos y Griferías del Turia
    precioCompra: 145.00,
    precioVenta: 295.00,
    unidad: 'ud',
    stock: 15,
    stockMinimo: 5,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_3',
    codigo: 'PRD-000003',
    nombre: 'Tira LED COB 24V Cálida 3000K (5 metros)',
    categoria: 'Iluminación',
    descripcion: 'Tira LED de alta densidad con tecnología COB que proporciona una iluminación lineal continua y homogénea sin puntos visibles. Consumo 15W/m. IP20.',
    proveedorId: 'prv_3', // Sanz Instalaciones Eléctricas S.L.
    precioCompra: 12.80,
    precioVenta: 28.50,
    unidad: 'ud',
    stock: 45,
    stockMinimo: 10,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_4',
    codigo: 'PRD-000004',
    nombre: 'Inodoro Suspendido Rimless Compacto Veneto',
    categoria: 'Sanitarios',
    descripcion: 'Inodoro suspendido fabricado en porcelana sanitaria de color blanco brillo. Diseño compacto con tecnología de descarga Rimless para máxima higiene y facilidad de limpieza. Asiento con caída amortiguada.',
    proveedorId: 'prv_2', // Saneamientos y Griferías del Turia
    precioCompra: 98.00,
    precioVenta: 189.00,
    unidad: 'ud',
    stock: 4, // Alerta: menor que stock mínimo (5)
    stockMinimo: 5,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_5',
    codigo: 'PRD-000005',
    nombre: 'Grifo Monomando Lavabo Negro Mate Velvet',
    categoria: 'Grifería',
    descripcion: 'Monomando de lavabo de diseño moderno con acabado negro mate de alta resistencia (pintura electroestática). Incluye cartucho cerámico de 35 mm y latiguillos flexibles de conexión.',
    proveedorId: 'prv_2', // Saneamientos y Griferías del Turia
    precioCompra: 32.50,
    precioVenta: 74.90,
    unidad: 'ud',
    stock: 22,
    stockMinimo: 8,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_6',
    codigo: 'PRD-000006',
    nombre: 'Tarima Flotante Laminada Roble Nórdico AC5 (Caja)',
    categoria: 'Carpintería',
    descripcion: 'Suelo laminado de alta resistencia AC5, grosor 8mm con bisel a los 4 lados. Textura sincronizada imitación madera real con tonos grisáceos claros. Caja contiene 2.22 m2.',
    proveedorId: 'prv_5', // Maderas y Tableros Alboraya S.L.
    precioCompra: 14.20,
    precioVenta: 24.95,
    unidad: 'caja',
    stock: 80,
    stockMinimo: 20,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_7',
    codigo: 'PRD-000007',
    nombre: 'Foco Downlight Empotrable Orientable Blanco 7W LED',
    categoria: 'Iluminación',
    descripcion: 'Downlight LED orientable redondo de aluminio lacado blanco mate. Chip COB Epistar, temperatura de color neutra (4000K), haz de luz de 60 grados. Driver incluido.',
    proveedorId: 'prv_3', // Sanz Instalaciones Eléctricas S.L.
    precioCompra: 4.90,
    precioVenta: 12.00,
    unidad: 'ud',
    stock: 120,
    stockMinimo: 30,
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prd_8',
    codigo: 'PRD-000008',
    nombre: 'Azulejo Revestimiento Metro Blanco Brillo 10x20',
    categoria: 'Azulejos',
    descripcion: 'Azulejo cerámico tipo metro con bisel pronunciado y acabado blanco brillo de alta luminosidad. Clásico vintage ideal para cocinas y baños con encanto.',
    proveedorId: 'prv_1', // Porcelánicos Cerámica Levantina S.A.
    precioCompra: 8.90,
    precioVenta: 19.50,
    unidad: 'm2',
    stock: 3, // Alerta: menor que stock mínimo (15)
    stockMinimo: 15,
    activo: false, // Producto inactivo
    imagenUrl: 'https://images.unsplash.com/photo-1502005229762-fc1b2381f0db?auto=format&fit=crop&w=600&q=80',
  }
];

const MOCK_TARIFAS: TarifaProducto[] = [
  {
    id: 'trf_1',
    productoId: 'prd_1',
    nombre: 'Tarifa General PVP',
    precio: 39.90,
    fechaVigencia: '2026-01-01',
  },
  {
    id: 'trf_2',
    productoId: 'prd_1',
    nombre: 'Tarifa Profesional Gremios',
    precio: 32.50,
    fechaVigencia: '2026-01-01',
  },
  {
    id: 'trf_3',
    productoId: 'prd_2',
    nombre: 'Tarifa General PVP',
    precio: 295.00,
    fechaVigencia: '2026-01-01',
  },
  {
    id: 'trf_4',
    productoId: 'prd_2',
    nombre: 'Tarifa Promocional Verano',
    precio: 265.00,
    fechaVigencia: '2026-06-01',
  },
  {
    id: 'trf_5',
    productoId: 'prd_3',
    nombre: 'Tarifa General PVP',
    precio: 28.50,
    fechaVigencia: '2026-01-01',
  },
  {
    id: 'trf_6',
    productoId: 'prd_5',
    nombre: 'Tarifa General PVP',
    precio: 74.90,
    fechaVigencia: '2026-01-01',
  },
  {
    id: 'trf_7',
    productoId: 'prd_6',
    nombre: 'Tarifa Obra Completa (>100m2)',
    precio: 21.00,
    fechaVigencia: '2026-02-15',
  }
];

const MOCK_IMAGENES: ImagenProducto[] = [
  { id: 'img_1_1', productoId: 'prd_1', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_1_2', productoId: 'prd_1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', esPrincipal: false },
  { id: 'img_2_1', productoId: 'prd_2', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_3_1', productoId: 'prd_3', url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_4_1', productoId: 'prd_4', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_5_1', productoId: 'prd_5', url: 'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_6_1', productoId: 'prd_6', url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_7_1', productoId: 'prd_7', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', esPrincipal: true },
  { id: 'img_8_1', productoId: 'prd_8', url: 'https://images.unsplash.com/photo-1502005229762-fc1b2381f0db?auto=format&fit=crop&w=600&q=80', esPrincipal: true }
];

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>(() => {
    const saved = localStorage.getItem('verini_productos');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTOS;
  });

  const [tarifas, setTarifas] = useState<TarifaProducto[]>(() => {
    const saved = localStorage.getItem('verini_productos_tarifas');
    return saved ? JSON.parse(saved) : MOCK_TARIFAS;
  });

  const [imagenes, setImagenes] = useState<ImagenProducto[]>(() => {
    const saved = localStorage.getItem('verini_productos_imagenes');
    return saved ? JSON.parse(saved) : MOCK_IMAGENES;
  });

  useEffect(() => {
    localStorage.setItem('verini_productos', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem('verini_productos_tarifas', JSON.stringify(tarifas));
  }, [tarifas]);

  useEffect(() => {
    localStorage.setItem('verini_productos_imagenes', JSON.stringify(imagenes));
  }, [imagenes]);

  // Generar código automático PRD-XXXXXX
  const generateNextCodigo = (): string => {
    if (productos.length === 0) return 'PRD-000001';

    const codigos = productos
      .map(p => {
        const match = p.codigo.match(/PRD-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    const maxNum = codigos.length > 0 ? Math.max(...codigos) : 0;
    const nextNum = maxNum + 1;
    return `PRD-${String(nextNum).padStart(6, '0')}`;
  };

  const addProducto = (prodData: Omit<Producto, 'id' | 'codigo'>) => {
    const newId = `prd_${Date.now()}`;
    const newProd: Producto = {
      ...prodData,
      id: newId,
      codigo: generateNextCodigo()
    };
    setProductos(prev => [newProd, ...prev]);

    // Also add the default main image to the images state
    if (prodData.imagenUrl) {
      const newImg: ImagenProducto = {
        id: `img_${Date.now()}`,
        productoId: newId,
        url: prodData.imagenUrl,
        esPrincipal: true
      };
      setImagenes(prev => [...prev, newImg]);
    }

    // Also automatically create a general PVP rate
    const newTarifa: TarifaProducto = {
      id: `trf_${Date.now()}`,
      productoId: newId,
      nombre: 'Tarifa General PVP',
      precio: prodData.precioVenta,
      fechaVigencia: new Date().toISOString().split('T')[0]
    };
    setTarifas(prev => [...prev, newTarifa]);

    return newProd;
  };

  const updateProducto = (id: string, updatedFields: Partial<Producto>) => {
    setProductos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    // Update main image in the images array if changed
    if (updatedFields.imagenUrl) {
      setImagenes(prev => {
        const filtered = prev.filter(img => !(img.productoId === id && img.esPrincipal));
        return [
          ...filtered,
          {
            id: `img_up_${Date.now()}`,
            productoId: id,
            url: updatedFields.imagenUrl!,
            esPrincipal: true
          }
        ];
      });
    }

    // Update or ensure general PVP rate exists and reflects updated priceVenta
    if (updatedFields.precioVenta !== undefined) {
      setTarifas(prev => {
        const hasPvp = prev.some(t => t.productoId === id && t.nombre === 'Tarifa General PVP');
        if (hasPvp) {
          return prev.map(t => 
            (t.productoId === id && t.nombre === 'Tarifa General PVP') 
              ? { ...t, precio: updatedFields.precioVenta! } 
              : t
          );
        } else {
          return [
            ...prev,
            {
              id: `trf_up_${Date.now()}`,
              productoId: id,
              nombre: 'Tarifa General PVP',
              precio: updatedFields.precioVenta!,
              fechaVigencia: new Date().toISOString().split('T')[0]
            }
          ];
        }
      });
    }
  };

  const deleteProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
    setTarifas(prev => prev.filter(t => t.productoId !== id));
    setImagenes(prev => prev.filter(img => img.productoId !== id));
  };

  const addTarifa = (tarifaData: Omit<TarifaProducto, 'id'>) => {
    const newTarifa: TarifaProducto = {
      ...tarifaData,
      id: `trf_${Date.now()}`
    };
    setTarifas(prev => [...prev, newTarifa]);
    return newTarifa;
  };

  const deleteTarifa = (id: string) => {
    setTarifas(prev => prev.filter(t => t.id !== id));
  };

  const addImagenProducto = (imgData: Omit<ImagenProducto, 'id'>) => {
    // If setting this one as principal, demote previous principal images
    if (imgData.esPrincipal) {
      setImagenes(prev =>
        prev.map(img => 
          img.productoId === imgData.productoId 
            ? { ...img, esPrincipal: false } 
            : img
        )
      );
    }
    const newImg: ImagenProducto = {
      ...imgData,
      id: `img_custom_${Date.now()}`
    };
    setImagenes(prev => [...prev, newImg]);

    // If principal, update the main product image url
    if (imgData.esPrincipal) {
      setProductos(prev =>
        prev.map(p => p.id === imgData.productoId ? { ...p, imagenUrl: imgData.url } : p)
      );
    }

    return newImg;
  };

  const deleteImagenProducto = (id: string) => {
    // Check if we are deleting the principal one, if so, we should promote another one
    const imageToDelete = imagenes.find(img => img.id === id);
    setImagenes(prev => {
      const filtered = prev.filter(img => img.id !== id);
      
      if (imageToDelete?.esPrincipal) {
        // Find another image of the same product
        const remaining = filtered.filter(img => img.productoId === imageToDelete.productoId);
        if (remaining.length > 0) {
          // Promote the first remaining to principal
          remaining[0].esPrincipal = true;
          // Update the main product url too
          setProductos(prods =>
            prods.map(p => p.id === imageToDelete.productoId ? { ...p, imagenUrl: remaining[0].url } : p)
          );
        } else {
          // No images left, clear product image url
          setProductos(prods =>
            prods.map(p => p.id === imageToDelete.productoId ? { ...p, imagenUrl: '' } : p)
          );
        }
      }
      return filtered;
    });
  };

  // Helper derived calculation: Margin (precioVenta - precioCompra) & Margin percentage
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
