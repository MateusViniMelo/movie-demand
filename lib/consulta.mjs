export function textoDe(valor) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) return valor[0] ?? "";
  return "";
}
