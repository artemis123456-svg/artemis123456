export interface Producto {
  id: string;
  codigo: string;            // automático, patrón PRD-000001
  nombre: string;
  categoria: string;         // ej: "Iluminación", "Mamparas", "Azulejos", "Sanitarios", "Grifería"
  descripcion: string;
  unidad: 'ud' | 'm2' | 'ml' | 'caja';  // unidad de medida
  activo: boolean;
  imagenUrl: string;         // URL de imagen (mock, puede ser un placeholder)
}

export interface ProductoProveedor {
  id: string;
  productoId: string;
  proveedorId: string;
  precioCompra: number;
  precioVenta: number;
  referenciaProveedor?: string;  // SKU/código del proveedor
  activo: boolean;
}

export interface TarifaProducto {
  id: string;
  productoId: string;
  nombre: string;            // ej "Tarifa general", "Tarifa profesional"
  precio: number;
  fechaVigencia: string;
}

export interface ImagenProducto {
  id: string;
  productoId: string;
  url: string;
  esPrincipal: boolean;
}
