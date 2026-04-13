// ─── Formatação de moeda ────────────────────────────────────────────────────

export const formatCurrency = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  return (parseInt(numeric, 10) / 100).toFixed(2).replace(".", ",");
};

export const parseCurrency = (value) =>
  parseFloat(value.replace(",", ".")) || 0;

export const toCurrencyDisplay = (num) =>
  `R$ ${(num || 0).toFixed(2).replace(".", ",")}`;

// ─── Formatação de telefone ─────────────────────────────────────────────────

export const formatPhone = (value) => {
  const n = value.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  return value;
};
