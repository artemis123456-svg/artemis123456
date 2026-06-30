export interface Producto {
  id: string;
  codigo: string;            // automático, patrón PRD-000001
  nombre: string;
  categoria: string;         // ej: "Iluminación", "Mamparas", "Azulejos", "Sanitarios", "Grifería"
  descripcion: string;
  proveedorId: string;       // vínculo al proveedor (MISMO id que usa el módulo Proveedores)
  precioCompra: number;      // precio al que Verini lo compra
  precioVenta: number;       // precio de venta al cliente (PVP)
  unidad: 'ud' | 'm2' | 'ml' | 'caja';  // unidad de medida
  stock: number;
  stockMinimo: number;
  activo: boolean;
  imagenUrl: string;         // URL de imagen (mock, puede ser un placeholder)
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
