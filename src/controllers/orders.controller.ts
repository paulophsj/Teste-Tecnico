import { Request, Response } from "express";
import ordersService from "../services/orders.service";

export class OrdersController {
  async nonRouter(res: Response) {
    return res.status(404).json({message: "Endereço não localizado."})
  }

  async getRelatorios(req: Request, res: Response) {
    try {
      const topParam = req.query.top;

      let top = 0;

      if (typeof topParam === "string" && topParam.trim() !== "") {
        top = Number(topParam);
      }

      if (isNaN(top) || (top !== 0 && top < 3)) {
        return res.status(400).json({
          message: "O parâmetro 'top' deve ser um número igual a zero (para buscar todos), ou maior ou igual a três.",
        });
      }

      const response = await ordersService.getRelatorios(top);
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getPedidos(req: Request, res: Response) {
    try {
      const response = await ordersService.getPedidos();
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getAllValidOrders(req: Request, res: Response) {
    try {
      const response = await ordersService.getAllValidOrders();
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getAllInvalidOrders(req: Request, res: Response) {
    try {
      const response = await ordersService.getAllInvalidOrders();
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

const ordersController = new OrdersController();
export default ordersController;