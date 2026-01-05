import { readFile, writeFile } from "node:fs/promises";
import { orderSchema } from "../schemas/zod.schema";
import { Order, OrderBRL } from "../types/orders.type";
import ordersBrlUtil from "../util/orders.brl.util";
import { HttpError } from "../util/error.util";

export class OrdersService {
  private ordersPath = "./data/orders.json";
  private ordersBRLPath = "./data/orders_total_brl.json";
  private rankingPath = "./data/top_clientes.json";

  private async loadOrders(): Promise<Array<Partial<Order>>> {
    try {
      let file = await readFile(this.ordersPath, "utf-8");
  
      if(!file.trim()){
        throw new HttpError(400, "O arquivo principal da aplicação não possui dados. Por favor, insira dados em 'orders.json'")
      }
  
      return JSON.parse(file);
    } catch (error) {
      if(error instanceof HttpError){
        throw error
      }
      throw new HttpError(400, "Erro ao ler o arquivo 'orders.json' ");
    }
  }

  private async loadBRLOrders(): Promise<Array<OrderBRL>> {
    try {
      let file = await readFile(this.ordersBRLPath, "utf-8");

      if (!file.trim()) {
        console.log(
          "O arquivo ainda não possui dados. Gerando dados com base nos valores válidos..."
        );
        await this.getAllValidOrders();
        file = await readFile(this.ordersBRLPath, "utf-8");
      }

      return JSON.parse(file);
    } catch (error) {
      throw new HttpError(400, "Erro ao ler o arquivo 'orders_total_brl' ");
    }
  }

  async getPedidos() {
    let orders = await this.loadBRLOrders();

    if (orders.length === 0) {
      console.log(
        "Os pedidos em BRL ainda não foram carregados. Realizando requisição da cotação..."
      );
      await this.getAllValidOrders();
      orders = await this.loadBRLOrders();
    }

    return orders;
  }

  async getAllValidOrders() {
    try {
      const orders = await this.loadOrders();
      const validOrders: Order[] = [];

      for (const order of orders) {
        const parsedOrder = orderSchema.safeParse(order);

        if (!parsedOrder.success) {
          parsedOrder.error.issues.forEach((issue) =>
            console.error({
              message: issue.message,
              errorData: order,
            })
          );
          continue;
        }

        validOrders.push(parsedOrder.data);
      }

      await ordersBrlUtil.includeOrdersBRL(validOrders);

      return validOrders;
    } catch (error) {
      throw error;
    }
  }

  async getAllInvalidOrders() {
    const orders = await this.loadOrders();
    const invalidOrders: Array<Partial<Order>> = [];

    for (const order of orders) {
      const parsedOrder = orderSchema.safeParse(order);
      if (!parsedOrder.success) {
        invalidOrders.push(order);
      }
    }

    return invalidOrders;
  }

  async getRelatorios(top: number) {
    const pedidos = await this.getPedidos();

    const totalPedidos = pedidos.length;
    const rankingLimit = top === 0 ? totalPedidos : top;

    const ranking = [...pedidos]
      .sort((a, b) => b.totalBRL - a.totalBRL)
      .slice(0, rankingLimit);

    const somaTotalBRL = Number(
      ranking.reduce((acc, pedido) => acc + pedido.totalBRL, 0).toFixed(2)
    );

    await writeFile(
      this.rankingPath,
      JSON.stringify({ somaTotalBRL, ranking }, null, 2),
      "utf-8"
    );

    if (rankingLimit > totalPedidos) {
      console.log(`Os dados disponíveis são apenas ${totalPedidos}.`);
    }

    console.log(
      `Top ${
        rankingLimit === totalPedidos ? "todos" : ranking.length
      } clientes em BRL carregados.`
    );

    return {
      somaTotalBRL,
      ranking,
    };
  }
}

const ordersService = new OrdersService();
export default ordersService;
