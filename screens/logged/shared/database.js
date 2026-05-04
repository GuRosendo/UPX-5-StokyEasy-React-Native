import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app.db");

export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS products (
      productId   TEXT PRIMARY KEY,
      userId      TEXT NOT NULL,
      name        TEXT NOT NULL,
      quantity    INTEGER NOT NULL DEFAULT 0,
      price       REAL NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      category    TEXT DEFAULT 'Outros',
      createdAt   INTEGER NOT NULL,
      updatedAt   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      clientId  TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      name      TEXT NOT NULL,
      email     TEXT DEFAULT '',
      phone     TEXT DEFAULT '',
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      orderId    TEXT PRIMARY KEY,
      clientId   TEXT NOT NULL,
      userId     TEXT NOT NULL,
      totalValue REAL NOT NULL DEFAULT 0,
      quantity   INTEGER NOT NULL DEFAULT 1,
      status     TEXT NOT NULL DEFAULT 'active',
      productRef TEXT DEFAULT '',
      productId  TEXT DEFAULT '',
      createdAt  INTEGER NOT NULL,
      FOREIGN KEY (clientId) REFERENCES clients(clientId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS installments (
      installmentId TEXT PRIMARY KEY,
      orderId       TEXT NOT NULL,
      idx           INTEGER NOT NULL,
      value         REAL NOT NULL DEFAULT 0,
      paid          INTEGER NOT NULL DEFAULT 0,
      paidAt        INTEGER,
      FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE
    );
  `);
}

export function getProducts(userId) {
  return db.getAllSync(
    "SELECT * FROM products WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  );
}

export function upsertProduct(product) {
  db.runSync(
    `INSERT INTO products (productId, userId, name, quantity, price, description, category, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(productId) DO UPDATE SET
       name = excluded.name,
       quantity = excluded.quantity,
       price = excluded.price,
       description = excluded.description,
       category = excluded.category,
       updatedAt = excluded.updatedAt`,
    [
      product.productId,
      product.userId,
      product.name,
      product.quantity,
      product.price,
      product.description ?? "",
      product.category ?? "Outros",
      product.createdAt,
      product.updatedAt,
    ]
  );
}

export function updateProductQuantity(productId, quantity) {
  db.runSync("UPDATE products SET quantity = ?, updatedAt = ? WHERE productId = ?", [
    quantity,
    Date.now(),
    productId,
  ]);
}

export function deleteProduct(productId) {
  db.runSync("DELETE FROM products WHERE productId = ?", [productId]);
}

export function getClients(userId) {
  const clients = db.getAllSync(
    "SELECT * FROM clients WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  );

  return clients.map((client) => {
    const orders = db.getAllSync(
      "SELECT * FROM orders WHERE clientId = ? ORDER BY createdAt DESC",
      [client.clientId]
    );

    const ordersWithInstallments = orders.map((order) => {
      const installments = db.getAllSync(
        "SELECT * FROM installments WHERE orderId = ? ORDER BY idx ASC",
        [order.orderId]
      );
      return {
        ...order,
        installments: installments.map((i) => ({
          ...i,
          paid: i.paid === 1,
          index: i.idx,
        })),
      };
    });

    return { ...client, orders: ordersWithInstallments };
  });
}

export function upsertClient(client) {
  db.runSync(
    `INSERT INTO clients (clientId, userId, name, email, phone, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(clientId) DO UPDATE SET
       name = excluded.name,
       email = excluded.email,
       phone = excluded.phone`,
    [
      client.clientId,
      client.userId,
      client.name,
      client.email ?? "",
      client.phone ?? "",
      client.createdAt,
    ]
  );
}

export function deleteClient(clientId) {
  db.runSync("DELETE FROM clients WHERE clientId = ?", [clientId]);
}

export function insertOrder(order) {
  db.runSync(
    `INSERT INTO orders (orderId, clientId, userId, totalValue, quantity, status, productRef, productId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.orderId,
      order.clientId,
      order.userId,
      order.totalValue,
      order.quantity,
      order.status ?? "active",
      order.productRef ?? "",
      order.productId ?? "",
      order.createdAt,
    ]
  );

  for (const inst of order.installments) {
    db.runSync(
      `INSERT INTO installments (installmentId, orderId, idx, value, paid, paidAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [inst.installmentId, order.orderId, inst.index, inst.value, 0, null]
    );
  }
}

export function updateOrderStatus(orderId, status) {
  db.runSync("UPDATE orders SET status = ? WHERE orderId = ?", [status, orderId]);
}

export function updateOrderTotalValue(orderId, totalValue) {
  db.runSync("UPDATE orders SET totalValue = ? WHERE orderId = ?", [totalValue, orderId]);
}

export function setInstallmentPaid(installmentId, paid) {
  db.runSync(
    "UPDATE installments SET paid = ?, paidAt = ? WHERE installmentId = ?",
    [paid ? 1 : 0, paid ? Date.now() : null, installmentId]
  );
}

export function insertInstallment(installment) {
  db.runSync(
    `INSERT INTO installments (installmentId, orderId, idx, value, paid, paidAt)
     VALUES (?, ?, ?, ?, 0, NULL)`,
    [
      installment.installmentId,
      installment.orderId,
      installment.index,
      installment.value,
    ]
  );
}
