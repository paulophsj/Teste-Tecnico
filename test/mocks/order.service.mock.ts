export const mockOrdersData = [
  {
    id: 1,
    cliente: "João da Silva",
    pais: "Brasil",
    itens: [
      { produto: "Câmera", quantidade: 1, precoUnitarioUSD: 500 },
      { produto: "Cartão de Memória", quantidade: 2, precoUnitarioUSD: 30 },
    ],
  },
  {
    id: 2,
    cliente: "Maria Oliveira",
    pais: "Brasil",
    itens: [{ produto: "Notebook", quantidade: 1, precoUnitarioUSD: 1000 }],
  },
  {
    id: -1,
    cliente: "Pedido com ID inválido",
    pais: "Brasil",
    itens: [{ produto: "Teclado", quantidade: 1, precoUnitarioUSD: 100 }],
  },
];

export const mockBRLOrdersData = [
  {
    id: 1,
    cliente: "João da Silva",
    totalBRL: 3066.67,
    totalUSD: 560,
  },
  {
    id: 2,
    cliente: "Maria Oliveira",
    totalBRL: 5476.2,
    totalUSD: 1000,
  },
];

export const mockTopClientesData = {
  somaTotalBRL: 8542.87,
  ranking: [
    {
      id: 2,
      cliente: "Maria Oliveira",
      totalBRL: 5476.2,
      totalUSD: 1000,
    },
    {
      id: 1,
      cliente: "João da Silva",
      totalBRL: 3066.67,
      totalUSD: 560,
    },
  ],
};
