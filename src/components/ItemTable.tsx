"use client";
import { Item, Order, Product } from "@/data";
import { updateOrderServer } from "@/server";
import { Button, Input, Table } from "@mui/joy";
import { useState } from "react";

export function ItemTable({
  itemsIn,
  products,
  order,
}: {
  itemsIn: Array<Item>;
  products: Array<Product>;
  order: Order;
}) {
  const [items, setItems] = useState<Item[]>(itemsIn);
  const [itemsRemoved, setItemsRemoved] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [updateCount, setUpdateCount] = useState(1);
  const getFirstProduct = products[0];
  const productsPriceDict = Object.fromEntries(
    products.map((x) => [x.productId, x.price])
  );
  const addEmptyItem = () => {
    let itemsTemp = [
      ...items,
      {
        itemId: -Math.floor(Math.random() * 1000 + 1),
        productId: getFirstProduct.productId,
        price: getFirstProduct.price,
        overridePrice: getFirstProduct.price,
        quantity: 1,
        orderId: order.orderId,
      },
    ];

    setUpdateCount(updateCount + 1);
    setItems(itemsTemp);
  };
  const removeItem = (itemId: number) => {
    const tempItems = items.filter((item) => item.itemId !== itemId);
    setItems(tempItems);
    setUpdateCount(updateCount + 1);
    if (itemId > 0) {
      setItemsRemoved([...itemsRemoved, itemId]);
    }
  };
  const updateValue = (
    property: string,
    itemId: number,
    value: string | number
  ) => {
    const tempItems = items;
    var index = tempItems.findIndex((obj) => {
      return obj.itemId === itemId;
    });

    tempItems[index][property] = value;

    // if productId is updated we also need to update the overridePrice attribute
    if (property == "productId") {
      var propIndex = products.findIndex((obj) => {
        return obj.productId === value;
      });
      tempItems[index].overridePrice = products[propIndex].price;
    }
    setItems(tempItems);
    setUpdateCount(updateCount + 1);
  };

  const updateOrder = () => {
    updateOrderServer(items, order, itemsRemoved);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">
          {order.token} Order {order.orderId} - {order.lastUpdated + ""}
        </h1>
        <Button onClick={() => updateOrder()}>Save</Button>
      </header>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Item List</h1>
        <Button onClick={() => setEditMode(!editMode)}>Edit</Button>
      </header>
      <Table aria-label="basic table">
        <thead>
          <tr>
            <th></th>
            <th>Id</th>
            <th>Name</th>
            <th>Price</th>
            <th>Override Price</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((obj: Item) => (
            <tr key={"key" + obj.itemId + updateCount}>
              <td>
                <Button
                  onClick={() => removeItem(obj.itemId)}
                  disabled={!editMode}
                >
                  Remove
                </Button>
              </td>
              <td>{obj.itemId}</td>
              <select
                name="productId"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                defaultValue={obj.productId + ""}
                disabled={!editMode}
                onChange={(e) =>
                  updateValue("productId", obj.itemId, parseInt(e.target.value))
                }
              >
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
              <td>
                <Input
                  type="number"
                  name="price"
                  defaultValue={productsPriceDict[obj.productId + ""]}
                  disabled={true}
                  className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="overridePrice"
                  defaultValue={obj.overridePrice}
                  disabled={!editMode}
                  className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
                  tabIndex={0}
                  onBlur={(e) => {
                    updateValue("overridePrice", obj.itemId, e.target.value);
                  }}
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="quantity"
                  defaultValue={obj.quantity}
                  disabled={!editMode}
                  className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
                  tabIndex={0}
                  onBlur={(e) => {
                    updateValue("quantity", obj.itemId, e.target.value);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editMode && <Button onClick={() => addEmptyItem()}>Add</Button>}
    </>
  );
}
