export type ProductCategory = "shoes" | "apparel" | "accessories" | "merch";
export type ProductBrand =
  | "Nike" | "Jordan" | "Adidas" | "Li-Ning" | "Anta"
  | "Travis Scott" | "UHA" | "Fear of God" | "Stussy"
  | "Supreme" | "KAWS" | "Vlone";
export type ProductType = "preorder" | "in_stock";
export type SortOption = "popular" | "price_asc" | "price_desc" | "new";
export type ProductVersion = "original" | "replica";

export interface ProductSize {
  eu: number;
  us?: number;
  available: boolean;
}

export interface ApparelSize {
  label: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  available: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  brand: ProductBrand;
  category: ProductCategory;
  type: ProductType;
  price: number;           // original price
  replicaPrice?: number;   // replica price (cheaper)
  originalPrice?: number;  // crossed-out price
  currency: "USD" | "UZS";
  image: string;
  images: string[];
  sizes: ProductSize[] | ApparelSize[];
  estimatedDelivery?: string;   // original delivery
  replicaDelivery?: string;     // replica delivery (faster)
  badge?: "new" | "popular" | "limited" | "sale";
  tags: string[];
  descriptionRu: string;
  descriptionUz: string;
  inStock?: number;
  sku: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
  version: ProductVersion;
}

export interface FilterState {
  brand: string;
  category: string;
  size: string;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
  search: string;
}
