import { NextFunction, Request, Response } from "express";
import ordersService from "../services/orders.service";
import { HttpError } from "../util/error.util";

export class OrdersController {
  async nonRouter(req: Request, res: Response) {
    return res.status(404).json({message: "Endereço não localizado."})
  }

  async getRelatorios(req: Request, res: Response, next: NextFunction) {
    try {
      const topParam = req.query.top;

      let top = 0;

      if (typeof topParam === "string" && topParam.trim() !== "") {
        top = Number(topParam);
      }

      if (isNaN(top) || (top !== 0 && top < 3)) {
        throw new HttpError(400, "O parâmetro 'top' deve ser um número igual a zero (para buscar todos), ou maior ou igual a três.")
      }

      const response = await ordersService.getRelatorios(top);
      return res.status(200).json(response);
    } catch (error) {
      next(error)
    }
  }

  async getPedidos(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ordersService.getPedidos();
      return res.status(200).json(response);
    } catch (error) {
      next(error)
    }
  }

  async getAllValidOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ordersService.getAllValidOrders();
      return res.status(200).json(response);
    } catch (error) {
      next(error)
    }
  }

  async getAllInvalidOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ordersService.getAllInvalidOrders();
      return res.status(200).json(response);
    } catch (error) {
      next(error)
    }
  }
}

const ordersController = new OrdersController();
export default ordersController;