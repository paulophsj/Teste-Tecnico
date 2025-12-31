export const validOrders = [
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
    id: 3,
    cliente: "Carlos Pereira",
    pais: "Portugal",
    itens: [{ produto: "Smartphone", quantidade: 2, precoUnitarioUSD: 800 }],
  },
  {
    id: 4,
    cliente: "Ana Souza",
    pais: "Estados Unidos",
    itens: [
      { produto: "Headphone", quantidade: 1, precoUnitarioUSD: 150 },
      { produto: "Mouse", quantidade: 2, precoUnitarioUSD: 40 },
    ],
  },
];

export const invalidOrders = [
  {
    description: "ID negativo",
    data: {
      id: -1,
      cliente: "Pedido com ID inválido",
      pais: "Brasil",
      itens: [{ produto: "Teclado", quantidade: 1, precoUnitarioUSD: 100 }],
    },
    expectedError: "O campo id deve ser igual ou maior que zero.",
  },
  {
    description: "Quantidade inválida (0)",
    data: {
      id: 5,
      cliente: "Cliente com quantidade inválida",
      pais: "Brasil",
      itens: [{ produto: "Monitor", quantidade: 0, precoUnitarioUSD: 300 }],
    },
    expectedError: "O campo quantidade deve ser no mínimo 1.",
  },
  {
    description: "Preço unitário negativo",
    data: {
      id: 6,
      cliente: "Cliente com preço inválido",
      pais: "Brasil",
      itens: [{ produto: "Webcam", quantidade: 1, precoUnitarioUSD: -50 }],
    },
    expectedError: "O campo precoUnitarioUSD deve ser maior que zero.",
  },
];
