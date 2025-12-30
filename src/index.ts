import "dotenv/config";
import express from "express";
import orderRouter from "./routers/orders.router";

const app = express();
app.use(express.json());

app.use(orderRouter);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
