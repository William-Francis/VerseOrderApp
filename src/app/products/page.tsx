import { ProductsTable } from "@/components/ProductsTable";
import { db } from "@/data";

export default async function Products() {
  const products = await db.from.products.toArray();

  return (
    <>
      <ProductsTable products={products} />
    </>
  );
}
