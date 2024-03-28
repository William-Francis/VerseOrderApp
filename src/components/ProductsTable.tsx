import { Product } from "@/data";
import { Table } from "@mui/joy";
import Link from "next/link";

export function ProductsTable({ products }: { products: Array<Product> }) {
  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Products List</h1>
        <Link
          className="border border-slate-500 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 focus-within:bg-slate-300 outline-none"
          href="/products/addProduct"
        >
          Add Product
        </Link>
      </header>
      <Table aria-label="basic table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId}>
              <td>{product.productId}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
