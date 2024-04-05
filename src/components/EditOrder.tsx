"use client";
import { Item, Order, Product } from "@/data";
import { redirectMe, updateOrderServer } from "@/server";
import { Button, Modal, ModalClose, Sheet, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { ItemDeltaTable } from "./ItemDeltaTable";
import { ItemTable } from "./ItemTable";
type ItemType = Omit<Item, "itemId" | "version">;

export function EditOrder({
  itemsIn,
  products,
  order,
}: {
  itemsIn: Array<Item>;
  products: Array<Product>;
  order: Order;
}) {
  const [originalItems, setOriginalItems] = useState<Item[]>(itemsIn);
  const [serverItemsDelta, setServerItemsDelta] = useState<Item[]>([]);
  const [currentItemsDelta, setCurrentItemsDelta] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>(itemsIn);
  const [itemsRemoved, setItemsRemoved] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(true);
  const [updateCount, setUpdateCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [openModal, setOpenModal] = useState<boolean>(false);

  const getFirstProduct = products[0];
  const productsPriceDict = Object.fromEntries(
    products.map((x) => [x.productId, x.price])
  );
  const productsNameDict = Object.fromEntries(
    products.map((x) => [x.productId, x.name])
  );

  useEffect(() => {
    setOriginalItems(JSON.parse(JSON.stringify(itemsIn)));
  }, []);

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
  const updateValue = (property: string, itemId: number, value: number) => {
    const tempItems = items;
    var index = tempItems.findIndex((obj) => {
      return obj.itemId === itemId;
    });

    tempItems[index][property as keyof ItemType] = value;

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
    // let response = updateOrderServer(items, order, itemsRemoved);
    updateOrderServer(items, order, itemsRemoved, false).then((response) => {
      if (response?.error) {
        setErrorMessage(response.error);
      }

      console.log("updateOrder originalItems", originalItems);
      console.log("updateOrder response", response);
      if (response.currentChange && response.currentChange.length !== 0) {
        setOpenModal(true);
      }
      setCurrentItemsDelta(returnDelta(response.currentChange));
      setServerItemsDelta(returnDelta(response.serverChange));
      redirectMe(order.orderId);
    });
  };

  const updateOrderWithDelta = (updatedItems: Array<Item>) => {
    // let response = updateOrderServer(items, order, itemsRemoved);
    updateOrderServer(updatedItems, order, itemsRemoved, true).then(
      (response) => {
        if (response?.error) {
          setErrorMessage(response.error);
        } else {
          setErrorMessage("");
        }
        setCurrentItemsDelta(returnDelta(response.currentChange));
        setServerItemsDelta(returnDelta(response.serverChange));
        setOpenModal(false);
        console.log("updateOrder originalItems", originalItems);
        console.log("updateOrder response", response);
        redirectMe(order.orderId);
      }
    );
  };

  const returnDelta = (ItemsIn: Array<Item>) => {
    // return the delta between the original items and the current items
    // original items are originalItems
    // current items are ItemsIn
    let delta = [];
    for (let i = 0; i < ItemsIn.length; i++) {
      let found = false;
      for (let j = 0; j < originalItems.length; j++) {
        if (ItemsIn[i].itemId == originalItems[j].itemId) {
          found = true;

          if (
            ItemsIn[i].productId != originalItems[j].productId ||
            ItemsIn[i].quantity != originalItems[j].quantity ||
            ItemsIn[i].overridePrice != originalItems[j].overridePrice
          ) {
            delta.push(ItemsIn[i]);
          }
        }
      }
      if (!found) {
        delta.push(ItemsIn[i]);
      }
    }
    console.log("returnDelta delta", delta);
    return delta;
  };
  const getOriginalValue = (
    itemId: number,
    property: string,
    currentValue: string | number
  ) => {
    // get the value of the property for the item with itemId in the originalItems array
    var index = originalItems.findIndex((obj) => {
      return obj.itemId === itemId;
    });
    if (index !== -1) {
      if (originalItems[index][property as keyof ItemType] === currentValue) {
        return null;
      } else {
        return originalItems[index][property as keyof ItemType];
      }
    } else {
      return "new ";
    }
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
        <h1 className="text-2xl"> </h1>
        <Button onClick={() => setEditMode(!editMode)}>Edit</Button>
      </header>
      <p>{errorMessage}</p>

      <Modal
        aria-labelledby="close-modal-title"
        open={openModal}
        onClose={(
          _event: React.MouseEvent<HTMLButtonElement>,
          reason: string
        ) => {
          // alert(`Reason: ${reason}`);
          setOpenModal(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            minWidth: 300,
            borderRadius: "md",
            p: 3,
          }}
        >
          <ModalClose variant="outlined" />
          <Typography
            component="h2"
            id="close-modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
          >
            Select changes to keep
            <div className="grid  grid-cols-2">
              <div style={{ borderRight: "1px solid black", paddingRight: 20 }}>
                <Button onClick={() => updateOrderWithDelta(items)}>
                  Override with your changes
                </Button>
                <ItemDeltaTable
                  title="Your changes"
                  items={currentItemsDelta}
                  editMode={editMode}
                  deltaMode={true}
                  updateCount={updateCount}
                  removeItem={removeItem}
                  productsNameDict={productsNameDict}
                  productsPriceDict={productsPriceDict}
                  getOriginalValue={getOriginalValue}
                  updateValue={updateValue}
                  products={products}
                />
              </div>

              <div style={{ paddingLeft: 20 }}>
                <Button onClick={() => updateOrderWithDelta(serverItemsDelta)}>
                  Keep server changes
                </Button>
                <ItemDeltaTable
                  title="Server changes"
                  items={serverItemsDelta}
                  editMode={false}
                  deltaMode={true}
                  updateCount={updateCount}
                  removeItem={removeItem}
                  productsNameDict={productsNameDict}
                  productsPriceDict={productsPriceDict}
                  getOriginalValue={getOriginalValue}
                  updateValue={updateValue}
                  products={products}
                />
              </div>
            </div>
          </Typography>
        </Sheet>
      </Modal>

      <ItemTable
        title="Item List"
        items={items}
        editMode={editMode}
        updateCount={updateCount}
        removeItem={removeItem}
        productsPriceDict={productsPriceDict}
        updateValue={updateValue}
        products={products}
      />
      {editMode && <Button onClick={() => addEmptyItem()}>Add</Button>}
    </>
  );
}
