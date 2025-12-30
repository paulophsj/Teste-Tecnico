import fs from "fs/promises";
import { Order, OrderItem } from "../types/orders.type";
import axios from "axios";

async function getCotacao(): Promise<number> {
  const response = await axios.get(
    "https://economia.awesomeapi.com.br/json/last/USD-BRL"
  );

  if (response.status !== 200) {
    throw new Error("Erro ao buscar cotação do dólar");
  }

  return Number(response.data.USDBRL.bid);
}

export async function includeOrdersBRL(orders: Array<Order>) {
  try {
    const path = "./data/orders_total_brl.json";
    const cotacao = await getCotacao();

    const convertedOrders = await Promise.all(
      orders.map(async (order: Order) => {
        //Calcular valor total em Dólar
        const totalUSD = Number(
          order.itens
            .reduce(
              (acc: number, item: OrderItem) =>
                acc + item.quantidade * item.precoUnitarioUSD,
              0
            )
            .toFixed(2)
        );

        //Calcular valor total em Reais pela cotação do Dólar
        const totalBRL = Number(
          order.itens
            .reduce(
              (acc: number, item: OrderItem) =>
                acc + item.quantidade * (item.precoUnitarioUSD * cotacao),
              0
            )
            .toFixed(2)
        );

        const newOrder = {
          id: order.id,
          cliente: order.cliente,
          totalBRL,
          totalUSD,
        };

        return newOrder;
      })
    );

    await fs.writeFile(path, JSON.stringify(convertedOrders, null, 2), "utf-8");
    console.log("Pedidos válidos inclusos.");
    return;
  } catch (error) {
    console.error(error || "Erro ao incluir pedidos.");
    return;
  }
}
