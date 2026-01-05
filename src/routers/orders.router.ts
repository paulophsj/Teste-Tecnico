import { Router } from "express";
import ordersController from "../controllers/orders.controller";

const router = Router();

router.get("/relatorios", ordersController.getRelatorios);
router.get("/pedidos", ordersController.getPedidos);
router.get("/validos", ordersController.getAllValidOrders);
router.get("/invalidos", ordersController.getAllInvalidOrders);

router.use(ordersController.nonRouter)

export default router;
