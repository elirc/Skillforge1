interface Product { id: string; name: string; price: number; }
export type ProductPatch = Partial<Omit<Product, 'id'>>;
export {};
