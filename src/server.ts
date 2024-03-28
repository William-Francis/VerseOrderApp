"use server";

import { Item, Order, db } from "@/data";
import { redirect } from "next/navigation";

export async function addItem(data: FormData) {
  const orderId = parseInt(data.get("orderId")?.valueOf() + "");
  const productId = data.get("productId")?.valueOf();
  const quantity = data.get("quantity")?.valueOf();
  const price = data.get("price")?.valueOf();

  const uow = db.uow();
  await uow.items.add(new Item(orderId, productId, quantity, price));
  await uow.commit();

  redirect("/orders/" + orderId);
}
export async function removeItem($itemId: number, currentOrderId: number) {
  const uow = db.uow();
  const item = await uow.items.single(
    (item, $itemId) => item.itemId === $itemId,
    $itemId
  );
  uow.items.remove(item);
  await uow.commit();
  redirect("/orders/" + currentOrderId);
}
export async function createOrderServer(data: any) {
  console.log("createOrder data", data);
  console.log("createOrder data length", data.length);

  const uow = db.uow();
  const order = new Order(1, new Date(), new Date());
  await uow.add(order);
  await uow.commit();
  console.log("createOrder order", order);
  console.log("createOrder order.id", order.orderId);
  // iterate through data and add items
  let multipleObjectsCreated = new Array(data.length)
    .fill(null)
    .map((x, index) => {
      console.log("createOrder data x", x);
      console.log("createOrder data y", index);
      return new Item(
        order.orderId,
        // data[index].orderId, // need to use order.id
        data[index].productId,
        data[index].quantity,
        data[index].overridePrice
      );
    });
  console.log("createOrder multipleObjectsCreated", multipleObjectsCreated);
  await uow.items.add(...multipleObjectsCreated);
  await uow.commit();

  redirect("/orders");
}

export async function updateOrderServer(
  items: Array<Item>,
  order: Order,
  itemsRemoved: Array<number>
) {
  console.log("updateOrderServer items", items);
  console.log("updateOrderServer itemsRemoved", itemsRemoved);

  // const updatedItems = items.filter((item) => item.itemId > 0);
  // const updateItemsIds = updatedItems.map((item) => item.itemId);

  const uow = db.uow();

  // iterate through items and update or add
  for (const item of items) {
    // items with a negative ID are new
    if (item.itemId > 0) {
      const dbItem = await uow.items
        .where((item, $itemId) => item.itemId === $itemId, item.itemId)
        .single();
      uow.entry(dbItem)?.update(item);
    } else {
      uow.items.add(item);
    }
  }

  // remove items with ids in itemsRemoved
  // mark for deletion instead of removing
  for (const itemId of itemsRemoved) {
    const dbItem = await uow.items
      .where((item, $itemId) => item.itemId === $itemId, itemId)
      .single();
    uow.items.remove(dbItem);
  }

  // We want to update the order's last updated.
  // This will also check to see if the order has been updated by another user via the token.
  const orderServer = await uow.orders
    .where(
      (order, $currentOrderId) => order.orderId === $currentOrderId,
      order.orderId
    )
    .single();

  uow.entry(order)?.update({ lastUpdated: new Date(), token: order.token });

  await uow.commit();
}
