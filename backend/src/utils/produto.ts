export function formatProdutoLabel(nome: string, tamanho?: string): string {
  return tamanho?.trim() ? `${nome} — ${tamanho}` : nome;
}

export function normalizeTamanho(tamanho?: string): string {
  return tamanho?.trim() ?? '';
}
