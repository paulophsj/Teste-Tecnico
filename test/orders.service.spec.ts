import { readFile, writeFile } from "node:fs/promises";
import { OrdersService } from "../src/services/orders.service";
import { mockBRLOrdersData, mockOrdersData } from "./mocks/order.service.mock";
import { orderSchema } from "../src/schemas/zod.schema";
import { Order } from "../src/types/orders.type";
import { includeOrdersBRL } from "../src/util/orders.brl.util";

jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("../src/schemas/zod.schema", () => ({
  orderSchema: {
    safeParse: jest.fn(),
  },
}));

jest.mock("../src/util/orders.brl.util", () => ({
  includeOrdersBRL: jest.fn(),
}));

describe("OrdersService", () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    ordersService = new OrdersService();

    (ordersService as any).ordersPath = "./data/orders.json";
    (ordersService as any).ordersBRLPath = "./data/orders_total_brl.json";
    (ordersService as any).rankingPath = "./data/top_clientes.json";
  });

  describe("loadOrders", () => {
    it("deve carregar pedidos do arquivo JSON com sucesso", async () => {
      const mockFileContent = JSON.stringify(mockOrdersData);
      (readFile as jest.Mock).mockResolvedValue(mockFileContent);

      const result = await (ordersService as any).loadOrders();

      expect(readFile).toHaveBeenCalledWith("./data/orders.json", "utf-8");
      expect(result).toEqual(mockOrdersData);
    });

    it("deve lançar erro se o arquivo não existir", async () => {
      const error = new Error("Arquivo não encontrado");
      (readFile as jest.Mock).mockRejectedValue(error);

      await expect((ordersService as any).loadOrders()).rejects.toThrow(
        "Arquivo não encontrado"
      );
    });
  });

  describe("loadBRLOrders", () => {
    it("deve carregar pedidos em BRL do arquivo JSON com sucesso", async () => {
      const mockFileContent = JSON.stringify(mockBRLOrdersData);
      (readFile as jest.Mock).mockResolvedValue(mockFileContent);

      const result = await (ordersService as any).loadBRLOrders();

      expect(readFile).toHaveBeenCalledWith(
        "./data/orders_total_brl.json",
        "utf-8"
      );
      expect(result).toEqual(mockBRLOrdersData);
    });

    it("deve retornar array vazio se o arquivo estiver vazio", async () => {
      (readFile as jest.Mock).mockResolvedValue("");

      const result = await (ordersService as any).loadBRLOrders();

      expect(result).toEqual([]);
    });

    it("deve retornar array vazio se o arquivo contiver apenas espaços", async () => {
      (readFile as jest.Mock).mockResolvedValue("   \n  \t  ");

      const result = await (ordersService as any).loadBRLOrders();

      expect(result).toEqual([]);
    });
  });

  describe("getPedidos", () => {
    it("deve retornar pedidos em BRL se já existirem", async () => {
      (readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockBRLOrdersData)
      );

      const result = await ordersService.getPedidos();

      expect(result).toEqual({
        status: 200,
        data: mockBRLOrdersData,
      });
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledWith(
        "./data/orders_total_brl.json",
        "utf-8"
      );
    });

    it("deve chamar getAllValidOrders se não houver pedidos em BRL", async () => {
      (readFile as jest.Mock)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce(JSON.stringify(mockBRLOrdersData));

      console.log = jest.fn();

      ordersService.getAllValidOrders = jest.fn().mockResolvedValue({
        status: 200,
        data: mockOrdersData,
      });

      const result = await ordersService.getPedidos();

      expect(console.log).toHaveBeenCalledWith(
        "Os pedidos em BRL ainda não foram carregados. Realizando requisição da cotação..."
      );
      expect(ordersService.getAllValidOrders).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        data: mockBRLOrdersData,
      });
    });
  });

  describe("getAllValidOrders", () => {
    it("deve retornar apenas pedidos válidos", async () => {
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockOrdersData));

      const mockSafeParse = orderSchema.safeParse as jest.Mock;

      mockSafeParse
        .mockReturnValueOnce({
          success: true,
          data: mockOrdersData[0] as Order,
        })
        .mockReturnValueOnce({
          success: true,
          data: mockOrdersData[1] as Order,
        })
        .mockReturnValueOnce({
          success: false,
          error: {
            issues: [{ message: "ID inválido", path: ["id"] }],
          },
        });

      console.error = jest.fn();

      (includeOrdersBRL as jest.Mock).mockResolvedValue(undefined);

      const result = await ordersService.getAllValidOrders();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(includeOrdersBRL).toHaveBeenCalledWith([
        mockOrdersData[0] as Order,
        mockOrdersData[1] as Order,
      ]);
      expect(result).toEqual({
        status: 200,
        data: [mockOrdersData[0] as Order, mockOrdersData[1] as Order],
      });
    });

    it("deve lidar com array de pedidos vazio", async () => {
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (includeOrdersBRL as jest.Mock).mockResolvedValue(undefined);

      const result = await ordersService.getAllValidOrders();

      expect(result).toEqual({
        status: 200,
        data: [],
      });
    });
  });

  describe("getAllInvalidOrders", () => {
    it("deve retornar apenas pedidos inválidos", async () => {
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockOrdersData));

      const mockSafeParse = orderSchema.safeParse as jest.Mock;

      mockSafeParse
        .mockReturnValueOnce({
          success: true,
          data: mockOrdersData[0] as Order,
        })
        .mockReturnValueOnce({
          success: false,
          error: { issues: [] },
        })
        .mockReturnValueOnce({
          success: false,
          error: { issues: [] },
        });

      const result = await ordersService.getAllInvalidOrders();

      expect(result).toEqual({
        status: 200,
        data: [mockOrdersData[1], mockOrdersData[2]],
      });
    });

    it("deve retornar array vazio se todos os pedidos forem válidos", async () => {
      (readFile as jest.Mock).mockResolvedValue(
        JSON.stringify([mockOrdersData[0]])
      );

      (orderSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: mockOrdersData[0] as Order,
      });

      const result = await ordersService.getAllInvalidOrders();

      expect(result).toEqual({
        status: 200,
        data: [],
      });
    });
  });

  describe("getRelatorios", () => {
    beforeEach(() => {
      ordersService.getPedidos = jest.fn().mockResolvedValue({
        status: 200,
        data: mockBRLOrdersData,
      });

      (writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it("deve retornar relatório com top N clientes", async () => {
      console.log = jest.fn();

      const result = await ordersService.getRelatorios(1);

      expect(ordersService.getPedidos).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        "./data/top_clientes.json",
        expect.stringContaining('"somaTotalBRL"'),
        "utf-8"
      );

      expect(result.data.somaTotalBRL).toBeCloseTo(5476.2);
      expect(result.data.clientes).toHaveLength(1);
      expect(result.data.clientes[0].cliente).toBe("Maria Oliveira");

      expect(console.log).toHaveBeenCalledWith(
        "Top 1 clientes em BRL carregados."
      );
      expect(result.status).toBe(200);
    });

    it("deve retornar todos os clientes quando top = 0", async () => {
      console.log = jest.fn();

      const result = await ordersService.getRelatorios(0);

      expect(result.data.clientes).toHaveLength(2);
      expect(result.data.somaTotalBRL).toBeCloseTo(8542.87);

      expect(console.log).toHaveBeenCalledWith(
        "Top todos clientes em BRL carregados."
      );
    });

    it("deve retornar todos os clientes quando top é maior que o total", async () => {
      console.log = jest.fn();

      const result = await ordersService.getRelatorios(10);

      expect(result.data.clientes).toHaveLength(2);
      expect(console.log).toHaveBeenCalledWith(
        "Os dados disponíveis são apenas 2."
      );
      expect(console.log).toHaveBeenCalledWith(
        "Top 2 clientes em BRL carregados."
      );
    });

    it("deve ordenar clientes por totalBRL decrescente", async () => {
      const mockData = [
        { id: 1, cliente: "A", totalBRL: 100 },
        { id: 2, cliente: "B", totalBRL: 200 },
        { id: 3, cliente: "C", totalBRL: 150 },
      ];

      ordersService.getPedidos = jest.fn().mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const result = await ordersService.getRelatorios(3);

      expect(result.data.clientes[0].totalBRL).toBe(200);
      expect(result.data.clientes[1].totalBRL).toBe(150);
      expect(result.data.clientes[2].totalBRL).toBe(100);
    });

    it("deve lidar com array vazio de pedidos", async () => {
      ordersService.getPedidos = jest.fn().mockResolvedValue({
        status: 200,
        data: [],
      });

      const result = await ordersService.getRelatorios(5);

      expect(result.data.somaTotalBRL).toBe(0);
      expect(result.data.clientes).toEqual([]);
      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com erro ao ler arquivo orders.json", async () => {
      (readFile as jest.Mock).mockRejectedValue(new Error("Erro de leitura"));

      await expect(ordersService.getAllValidOrders()).rejects.toThrow(
        "Erro de leitura"
      );
    });

    it("deve lidar com JSON inválido no arquivo", async () => {
      (readFile as jest.Mock).mockResolvedValue("json inválido {");

      await expect(ordersService.getAllValidOrders()).rejects.toThrow();
    });

    it("deve lidar com erro ao escrever arquivo de ranking", async () => {
      ordersService.getPedidos = jest.fn().mockResolvedValue({
        status: 200,
        data: mockBRLOrdersData,
      });

      (writeFile as jest.Mock).mockRejectedValue(new Error("Erro de escrita"));

      await expect(ordersService.getRelatorios(2)).rejects.toThrow(
        "Erro de escrita"
      );
    });
  });

  describe("Integração com includeOrdersBRL", () => {
    it("deve chamar includeOrdersBRL com os pedidos válidos", async () => {
      const validOrders = [
        mockOrdersData[0] as Order,
        mockOrdersData[1] as Order,
      ];

      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockOrdersData));

      const mockSafeParse = orderSchema.safeParse as jest.Mock;
      mockSafeParse
        .mockReturnValueOnce({ success: true, data: validOrders[0] })
        .mockReturnValueOnce({ success: true, data: validOrders[1] })
        .mockReturnValueOnce({ success: false, error: { issues: [] } });

      console.error = jest.fn();
      (includeOrdersBRL as jest.Mock).mockResolvedValue(undefined);

      await ordersService.getAllValidOrders();

      expect(includeOrdersBRL).toHaveBeenCalledWith(validOrders);
    });
  });
});
