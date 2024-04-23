import { DB, Migration } from "@operativa/verse-migrations";

const migration: Migration = (db: DB) => {
  db.insert("users", ["FirstName"], ["Will"]);
  db.insert("users", ["FirstName"], ["Jason"]);
};

export default migration;
