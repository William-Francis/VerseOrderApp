import { DB, Migration } from "@operativa/verse-migrations";
import { SqlColumn, SqlType, sqlId } from "@operativa/verse/db/sql";

export function column(type: SqlType, nullable = true, identity = false) {
  return (name: string) => new SqlColumn(sqlId(name), type, nullable, identity);
}

const migration: Migration = (db: DB) => {
  db.createTable("users", {
    userId: column("integer", true),
    firstName: column("varchar(255)"),
  });
  db.createTable("products", {
    productId: column("integer", true),
    name: column("varchar(255)"),
    description: column("integer"),
    price: column("integer"),
  });
  // token: int({ generate: { default: 1 } }),

  db.createTable("orders", {
    orderId: column("integer", true),
    token: column("integer"),
    userId: column("integer"),
    created: column("integer"),
    lastUpdated: column("timestamp"),
    lock: column("boolean"),
  });
  db.createTable("items", {
    itemId: column("integer", true),
    _version: column("integer"),
    orderId: column("integer"),
    productId: column("integer"),
    quantity: column("integer"),
    overridePrice: column("integer"),
  });
};

export default migration;
