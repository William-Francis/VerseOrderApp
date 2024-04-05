import { EditOrder } from "@/components/EditOrder";
import { db } from "@/data";
type Props = {
  id: string;
};
export default async function Orders({ params }: { params: Props }) {
  const order = await db.from.orders
    .where(
      (order, $orderIdIn: number) => order.orderId === $orderIdIn,
      parseInt(params.id)
    )
    .single();
  const items = await db.from.items
    .where(
      (item, $orderIdIn: number) => item.orderId === $orderIdIn,
      parseInt(params.id)
    )
    .toArray();
  let productList = await db.from.products.toArray();

  return (
    <>
      <EditOrder
        itemsIn={JSON.parse(JSON.stringify(items))}
        products={JSON.parse(JSON.stringify(productList))}
        order={JSON.parse(JSON.stringify(order))}
      />
    </>
  );
}
