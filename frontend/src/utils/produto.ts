export function formatProdutoLabel(nome: string, tamanho?: string): string {
  return tamanho?.trim() ? `${nome} — ${tamanho}` : nome;
}

export function sortProdutosByTamanho<T extends { nome: string; tamanho?: string }>(
  items: T[],
  tamanhos: string[]
): T[] {
  const order = new Map(tamanhos.map((t, i) => [t.toLowerCase(), i]));

  return [...items].sort((a, b) => {
    const aTamanho = a.tamanho?.trim() ?? '';
    const bTamanho = b.tamanho?.trim() ?? '';

    if (!aTamanho && !bTamanho) {
      return a.nome.localeCompare(b.nome);
    }
    if (!aTamanho) return 1;
    if (!bTamanho) return -1;

    const aOrder = order.get(aTamanho.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(bTamanho.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    return a.nome.localeCompare(b.nome);
  });
}
