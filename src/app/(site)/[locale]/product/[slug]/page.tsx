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

  const title = `${product.name} — ${product.brand}`;
  const description = product.descriptionRu ?? `${product.name} от ${product.brand} — купить в UHA SHOP.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
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
