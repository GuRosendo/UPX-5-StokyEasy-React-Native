import * as SQLite from "expo-sqlite";

// ─── Abrir banco ─────────────────────────────────────────────────────────────
const db = SQLite.openDatabaseSync("app.db");

const PAGE_SIZE = 30;

// ─── Inicializar tabelas ──────────────────────────────────────────────────────
export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      productId   TEXT PRIMARY KEY,
      userId      TEXT NOT NULL,
      name        TEXT NOT NULL,
      quantity    INTEGER NOT NULL DEFAULT 0,
      price       REAL NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      category    TEXT DEFAULT 'Outros',
      imageUri    TEXT DEFAULT '',
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
      dueDate       INTEGER,
      FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE
    );
  `);

  // Migrações seguras para bancos criados em versões anteriores
  try { db.execSync("ALTER TABLE installments ADD COLUMN dueDate INTEGER;"); } catch (_) {}
  try { db.execSync("ALTER TABLE products ADD COLUMN imageUri TEXT DEFAULT '';"); } catch (_) {}
}

// ─── PRODUTOS — CRUD ─────────────────────────────────────────────────────────

/** Retorna todos os produtos (sem paginação) — usado internamente e no picker. */
export function getProducts(userId) {
  return db.getAllSync(
    "SELECT * FROM products WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  );
}

/**
 * Retorna uma página de produtos com busca opcional no banco.
 *
 * @param {string} userId
 * @param {number} page     — 1-based
 * @param {string} search   — string de busca (nome, categoria, descrição)
 * @returns {{ items: Array, total: number, totalPages: number }}
 */
export function getProductsPaged(userId, page = 1, search = "") {
  const offset = (page - 1) * PAGE_SIZE;
  const like   = `%${search.trim()}%`;
  const hasSearch = search.trim().length > 0;

  const whereExtra = hasSearch
    ? "AND (LOWER(name) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))"
    : "";
  const params = hasSearch
    ? [userId, like, like, like]
    : [userId];
  const countParams = hasSearch
    ? [userId, like, like, like]
    : [userId];

  const total = db.getFirstSync(
    `SELECT COUNT(*) as cnt FROM products WHERE userId = ? ${whereExtra}`,
    countParams
  )?.cnt ?? 0;

  const items = db.getAllSync(
    `SELECT * FROM products WHERE userId = ? ${whereExtra}
     ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset]
  );

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * Retorna uma página de produtos COM ESTOQUE > 0 — para o ProductPickerModal.
 *
 * @param {string} userId
 * @param {number} page     — 1-based
 * @param {string} search
 * @returns {{ items: Array, total: number, totalPages: number }}
 */
export function getAvailableProductsPaged(userId, page = 1, search = "") {
  const offset    = (page - 1) * PAGE_SIZE;
  const like      = `%${search.trim()}%`;
  const hasSearch = search.trim().length > 0;

  const whereExtra = hasSearch
    ? "AND (LOWER(name) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))"
    : "";
  const params = hasSearch
    ? [userId, like, like]
    : [userId];

  const total = db.getFirstSync(
    `SELECT COUNT(*) as cnt FROM products WHERE userId = ? AND quantity > 0 ${whereExtra}`,
    params
  )?.cnt ?? 0;

  const items = db.getAllSync(
    `SELECT * FROM products WHERE userId = ? AND quantity > 0 ${whereExtra}
     ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset]
  );

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function getProductById(productId) {
  return db.getFirstSync("SELECT * FROM products WHERE productId = ?", [productId]);
}

export function upsertProduct(product) {
  db.runSync(
    `INSERT INTO products (productId, userId, name, quantity, price, description, category, imageUri, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(productId) DO UPDATE SET
       name        = excluded.name,
       quantity    = excluded.quantity,
       price       = excluded.price,
       description = excluded.description,
       category    = excluded.category,
       imageUri    = excluded.imageUri,
       updatedAt   = excluded.updatedAt`,
    [
      product.productId, product.userId,      product.name,
      product.quantity,  product.price,        product.description ?? "",
      product.category ?? "Outros",            product.imageUri ?? "",
      product.createdAt, product.updatedAt,
    ]
  );
}

export function updateProductQuantity(productId, quantity) {
  db.runSync(
    "UPDATE products SET quantity = ?, updatedAt = ? WHERE productId = ?",
    [quantity, Date.now(), productId]
  );
}

export function deleteProduct(productId) {
  db.runSync("DELETE FROM products WHERE productId = ?", [productId]);
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

/**
 * Retorna todos os clientes com pedidos e parcelas (sem paginação).
 * Usado internamente para derivar totais e operar sobre pedidos.
 */
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

/**
 * Retorna uma página de clientes com busca opcional no banco.
 * Cada cliente já vem com seus pedidos e parcelas.
 *
 * @param {string} userId
 * @param {number} page       — 1-based
 * @param {string} search     — busca por nome, email ou telefone
 * @param {boolean} showCompleted — se true, retorna apenas clientes com pedidos "completed"
 * @returns {{ items: Array, total: number, totalPages: number }}
 */
export function getClientsPaged(userId, page = 1, search = "", showCompleted = false) {
  const offset    = (page - 1) * PAGE_SIZE;
  const like      = `%${search.trim()}%`;
  const hasSearch = search.trim().length > 0;

  const whereExtra = hasSearch
    ? "AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR phone LIKE ?)"
    : "";
  const params = hasSearch
    ? [userId, like, like, like]
    : [userId];

  // Quando showCompleted, filtra apenas clientes que têm ao menos 1 pedido "completed"
  const completedFilter = showCompleted
    ? `AND clientId IN (
         SELECT DISTINCT clientId FROM orders
         WHERE userId = '${userId}' AND status = 'completed'
       )`
    : "";

  const total = db.getFirstSync(
    `SELECT COUNT(*) as cnt FROM clients
     WHERE userId = ? ${whereExtra} ${completedFilter}`,
    params
  )?.cnt ?? 0;

  const clientRows = db.getAllSync(
    `SELECT * FROM clients
     WHERE userId = ? ${whereExtra} ${completedFilter}
     ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset]
  );

  // Hidrata pedidos + parcelas para cada cliente da página
  const items = clientRows.map((client) => {
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

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function upsertClient(client) {
  db.runSync(
    `INSERT INTO clients (clientId, userId, name, email, phone, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(clientId) DO UPDATE SET
       name  = excluded.name,
       email = excluded.email,
       phone = excluded.phone`,
    [client.clientId, client.userId, client.name,
     client.email ?? "", client.phone ?? "", client.createdAt]
  );
}

export function deleteClient(clientId) {
  db.runSync("DELETE FROM clients WHERE clientId = ?", [clientId]);
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────

export function insertOrder(order) {
  db.runSync(
    `INSERT INTO orders (orderId, clientId, userId, totalValue, quantity, status, productRef, productId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.orderId,    order.clientId,   order.userId,
      order.totalValue, order.quantity,   order.status ?? "active",
      order.productRef ?? "",             order.productId ?? "",
      order.createdAt,
    ]
  );
  for (const inst of order.installments) {
    db.runSync(
      `INSERT INTO installments (installmentId, orderId, idx, value, paid, paidAt, dueDate)
       VALUES (?, ?, ?, ?, 0, NULL, ?)`,
      [inst.installmentId, order.orderId, inst.index, inst.value, inst.dueDate ?? null]
    );
  }
}

export function updateOrderCore(orderId, { totalValue, quantity, productRef, productId }) {
  db.runSync(
    "UPDATE orders SET totalValue = ?, quantity = ?, productRef = ?, productId = ? WHERE orderId = ?",
    [totalValue, quantity, productRef, productId, orderId]
  );
}

export function updateOrderStatus(orderId, status) {
  db.runSync("UPDATE orders SET status = ? WHERE orderId = ?", [status, orderId]);
}

export function updateOrderTotalValue(orderId, totalValue) {
  db.runSync("UPDATE orders SET totalValue = ? WHERE orderId = ?", [totalValue, orderId]);
}

export function deleteOrder(orderId) {
  db.runSync("DELETE FROM orders WHERE orderId = ?", [orderId]);
}

// ─── PARCELAS ─────────────────────────────────────────────────────────────────

export function setInstallmentPaid(installmentId, paid) {
  db.runSync(
    "UPDATE installments SET paid = ?, paidAt = ? WHERE installmentId = ?",
    [paid ? 1 : 0, paid ? Date.now() : null, installmentId]
  );
}

export function insertInstallment(installment) {
  db.runSync(
    `INSERT INTO installments (installmentId, orderId, idx, value, paid, paidAt, dueDate)
     VALUES (?, ?, ?, ?, 0, NULL, ?)`,
    [
      installment.installmentId, installment.orderId,
      installment.index,         installment.value,
      installment.dueDate ?? null,
    ]
  );
}

export function updateInstallmentValue(installmentId, value) {
  db.runSync(
    "UPDATE installments SET value = ? WHERE installmentId = ?",
    [value, installmentId]
  );
}

export function updateInstallmentDueDate(installmentId, dueDate) {
  db.runSync(
    "UPDATE installments SET dueDate = ? WHERE installmentId = ?",
    [dueDate, installmentId]
  );
}

export function deleteInstallment(installmentId) {
  db.runSync("DELETE FROM installments WHERE installmentId = ?", [installmentId]);
}

export function reindexInstallments(orderId) {
  const rows = db.getAllSync(
    "SELECT installmentId FROM installments WHERE orderId = ? ORDER BY idx ASC",
    [orderId]
  );
  rows.forEach((row, i) => {
    db.runSync(
      "UPDATE installments SET idx = ? WHERE installmentId = ?",
      [i + 1, row.installmentId]
    );
  });
}