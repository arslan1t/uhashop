import type { Metadata } from "next";
import { getProductBySlug, products } from "@/data/products";
import { ProductDetailClient } from "./ProductDetailClient";
import { CustomProductFallback } from "./CustomProductFallback";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product | UHA SHOP" };
  return {
    title: product.name,
    description: product.descriptionRu,
    openGraph: {
      title: product.name,
      description: product.descriptionRu,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Found in static catalog — render directly
  if (product) {
    return <ProductDetailClient product={product} />;
  }

  // Not in static catalog — might be a custom product from admin
  // Delegate to client component that reads from the custom products store
  return <CustomProductFallback slug={slug} />;
}
