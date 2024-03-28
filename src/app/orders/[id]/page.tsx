import { ItemTable } from "@/components/ItemTable";
import { Item, Order, db } from "@/data";
type Props = {
  id: string;
};
export default async function Orders({ params }: { params: Props }) {
  const order = await db.from.orders
    .where(
      (order: Order, $orderIdIn: number) => order.orderId === $orderIdIn,
      params.id
    )
    .single();
  const items = await db.from.items
    .where(
      (item: Item, $orderIdIn: number) => item.orderId === $orderIdIn,
      params.id
    )
    .toArray();
  let productList = await db.from.products.toArray();

  return (
    <>
      <ItemTable
        itemsIn={JSON.parse(JSON.stringify(items))}
        products={JSON.parse(JSON.stringify(productList))}
        order={JSON.parse(JSON.stringify(order))}
      />
    </>
  );
}
