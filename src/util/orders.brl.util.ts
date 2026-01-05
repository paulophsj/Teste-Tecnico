import fs from "fs/promises";
import { Order, OrderItem } from "../types/orders.type";
import axios from "axios";
import { HttpError } from "./error.util";

export class OrdersBRL {
  private path = "./data/orders_total_brl.json";
  private cotacaoRequest = "https://economia.awesomeapi.com.br/json/last/USD-BRL"

  private async getCotacao(): Promise<number> {
    try {
      const response = await axios.get(this.cotacaoRequest);

      const cotacao = Number(response.data?.USDBRL?.bid);

      if (isNaN(cotacao)) {
        throw new Error("Cotação inválida");
      }

      return cotacao;
    } catch (err) {
      throw new HttpError(502, "Erro ao tentar buscar cotação do dólar.");
    }
  }

  async includeOrdersBRL(orders: Array<Order>) {
    try {
      const cotacao = await this.getCotacao();

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

      await fs.writeFile(
        this.path,
        JSON.stringify(convertedOrders, null, 2),
        "utf-8"
      );
      return console.log("Pedidos válidos inclusos.");
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(500, "Erro ao incluir cotações do dólar no arquivo.");
    }
  }
}

export default new OrdersBRL();
