// ── Admin data — generated from products.ts to stay always in sync ──
import { products } from "./products";

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  nameUz: string;
  brand: string;
  category: string;
  price: number;
  replicaPrice?: number;
  status: "published" | "draft" | "archived";
  type: "preorder" | "in_stock";
  isFeatured: boolean;
  stock?: number;
  estimatedDelivery: string;
  replicaDelivery?: string;
  image: string;
  images: string[];
  imageCount: number;
  createdAt: string;
  badge?: string;
  descriptionRu?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  telegram: string;
  phone?: string;
  city: string;
  products: { name: string; size: string; qty: number; price: number; version: string }[];
  total: number;
  status: "new" | "processing" | "ordered" | "delivered" | "cancelled";
  type: "preorder" | "in_stock";
  notes?: string;
  createdAt: string;
}

// ── Generate adminProducts from products.ts ─────────────────────────
export const adminProducts: AdminProduct[] = products.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  nameRu: p.nameRu,
  nameUz: p.nameRu, // fallback to RU if no UZ name field on product type
  brand: p.brand,
  category: p.category,
  price: p.price,
  replicaPrice: p.replicaPrice,
  status: "published" as const,
  type: p.type,
  isFeatured: p.isFeatured ?? false,
  stock: p.inStock,
  estimatedDelivery: p.estimatedDelivery ?? "14–21 дней",
  replicaDelivery: p.replicaDelivery,
  image: p.image,
  images: p.images,
  imageCount: p.images.length || 1,
  descriptionRu: p.descriptionRu,
  createdAt: "2024-01-15",
  badge: p.badge,
}));

// ── Mock orders ─────────────────────────────────────────────────────
export const adminOrders: AdminOrder[] = [
  {
    id: "1", orderNumber: "UHA-2024-001", customer: "Арслан Шипулин",
    telegram: "@arslan_uz", phone: "+998901234567", city: "Ташкент",
    products: [{ name: "Air Jordan 1 Lucky Green", size: "EU 42", qty: 1, price: 189, version: "original" }],
    total: 189, status: "delivered", type: "preorder", createdAt: "2024-01-20",
  },
  {
    id: "2", orderNumber: "UHA-2024-002", customer: "Камол Рашидов",
    telegram: "@kamal_r", phone: "+998901111111", city: "Самарканд",
    products: [{ name: "Travis Scott × Jordan 1 Low Mocha", size: "EU 43", qty: 1, price: 149, version: "replica" }],
    total: 149, status: "processing", type: "preorder", createdAt: "2024-02-01",
  },
  {
    id: "3", orderNumber: "UHA-2024-003", customer: "Нодира Каримова",
    telegram: "@nodira_k", city: "Ташкент",
    products: [
      { name: "Nike Dunk Low Panda", size: "EU 39", qty: 1, price: 139, version: "original" },
      { name: "FOG Essentials Tee", size: "M", qty: 2, price: 79, version: "original" },
    ],
    total: 297, status: "new", type: "preorder", createdAt: "2024-02-05",
  },
  {
    id: "4", orderNumber: "UHA-2024-004", customer: "Бобур Тошматов",
    telegram: "@bobur_t", phone: "+998907654321", city: "Бухара",
    products: [{ name: "Yeezy Boost 350 V2 Carbon", size: "EU 44", qty: 1, price: 229, version: "original" }],
    total: 229, status: "ordered", type: "preorder", notes: "Срочный заказ", createdAt: "2024-02-08",
  },
  {
    id: "5", orderNumber: "UHA-2024-005", customer: "Алишер Назаров",
    telegram: "@alisher_n", city: "Ташкент",
    products: [{ name: "UHA Classic Tee", size: "L", qty: 2, price: 35, version: "original" }],
    total: 70, status: "new", type: "in_stock", createdAt: "2024-02-10",
  },
  {
    id: "6", orderNumber: "UHA-2024-006", customer: "Феруза Ахмедова",
    telegram: "@feruza_a", city: "Ташкент",
    products: [{ name: "Travis Scott × Nike SB Dunk Low", size: "EU 38", qty: 1, price: 175, version: "replica" }],
    total: 175, status: "new", type: "preorder", createdAt: "2024-02-11",
  },
  {
    id: "7", orderNumber: "UHA-2024-007", customer: "Санжар Усмонов",
    telegram: "@sanjar_u", phone: "+998905555555", city: "Андижан",
    products: [{ name: "Adidas Samba OG Black", size: "EU 41", qty: 1, price: 125, version: "original" }],
    total: 125, status: "processing", type: "preorder", createdAt: "2024-02-12",
  },
  {
    id: "8", orderNumber: "UHA-2024-008", customer: "Дильноза Хасанова",
    telegram: "@dilnoza_h", city: "Ташкент",
    products: [
      { name: "Jordan 4 Military Black", size: "EU 42.5", qty: 1, price: 95, version: "replica" },
      { name: "Supreme Box Logo Tee", size: "M", qty: 1, price: 40, version: "replica" },
    ],
    total: 135, status: "cancelled", type: "preorder", notes: "Передумала", createdAt: "2024-02-13",
  },
];

export const STATS = {
  totalProducts: adminProducts.length,
  publishedProducts: adminProducts.length,
  draftProducts: 0,
  totalOrders: adminOrders.length,
  newOrders: adminOrders.filter(o => o.status === "new").length,
  processingOrders: adminOrders.filter(o => o.status === "processing").length,
  deliveredOrders: adminOrders.filter(o => o.status === "delivered").length,
  revenue: adminOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
  featuredProducts: adminProducts.filter(p => p.isFeatured).length,
};
