export type ProductCategory =
  | "shoes"
  | "apparel"
  | "accessories"
  | "backpacks"
  | "jerseys"
  | "socks"
  | "sets"
  | "thermals"
  | "merch";    // kept for backward compatibility with existing products
export type ProductStyle = "basketball" | "lifestyle";
export type ProductBrand =
  | "Nike" | "Jordan" | "Adidas" | "Li-Ning" | "Anta"
  | "Travis Scott" | "UHA" | "Fear of God" | "Stussy"
  | "Supreme" | "KAWS" | "Vlone"
  | "Wilson" | "Spalding" | "Molten"  // ball brands
  | (string & {});  // allows custom admin-added brands without losing autocomplete
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
  style?: ProductStyle;    // "basketball" | "lifestyle"
  tags: string[];
  descriptionRu: string;
  descriptionUz: string;
  inStock?: number;
  sku: string;
  isFeatured?: boolean;
  isNew?: boolean;
  status?: "published" | "draft";
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
  version: ProductVersion;
}

// FilterState is defined and exported from @/components/ui/FilterBar — do not duplicate here.

/** A curated collection of products assembled by a player, creator, or community member. */
export interface PlayerSet {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  heroImage: string;
  productIds: string[];
  displayOrder: number;
  createdAt: string;
  // Task 5 extensibility — future collection types supported without schema changes
  type?: "player" | "featured" | "seasonal" | "creator" | "athlete" | "sponsored" | "campaign";
  isActive?: boolean;
  tags?: string[];
}
