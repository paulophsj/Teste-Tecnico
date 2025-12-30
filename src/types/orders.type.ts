export type OrderItem = {
  produto: string;
  quantidade: number;
  precoUnitarioUSD: number;
};

export type Order = {
  id: number;
  cliente: string;
  pais: string;
  itens: OrderItem[];
};

export type OrderBRL = {
  id: number;
  cliente: string;
  totalUSD: number;
  totalBRL: number;
};
