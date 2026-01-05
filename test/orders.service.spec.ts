import { readFile, writeFile } from "node:fs/promises";
import { OrdersService } from "../src/services/orders.service";
import { mockBRLOrdersData, mockOrdersData } from "./mocks/order.service.mock";
import { orderSchema } from "../src/schemas/zod.schema";
import { Order, OrderBRL } from "../src/types/orders.type";
import ordersBrlUtil from "../src/util/orders.brl.util";
import { HttpError } from "../src/util/error.util";

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
  __esModule: true,
  default: {
    includeOrdersBRL: jest.fn(),
  },
}));

describe("OrdersService", () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    ordersService = new OrdersService();
  });

  describe("loadOrders", () => {
    it("deve carregar pedidos do arquivo JSON com sucesso", async () => {
      const mockFileContent = JSON.stringify(mockOrdersData);
      (readFile as jest.Mock).mockResolvedValue(mockFileContent);

      const result = await (ordersService as any).loadOrders();

      expect(readFile).toHaveBeenCalledWith("./data/orders.json", "utf-8");
      expect(result).toEqual(mockOrdersData);
    });

    it("deve lançar HttpError se o arquivo estiver vazio", async () => {
      (readFile as jest.Mock).mockResolvedValue("   \n  \t  ");

      await expect((ordersService as any).loadOrders()).rejects.toThrow(
        new HttpError(
          400,
          "O arquivo principal da aplicação não possui dados. Por favor, insira dados em 'orders.json'"
        )
      );
    });

    it("deve lançar HttpError se o arquivo não existir", async () => {
      const error = new Error("Arquivo não encontrado");
      (readFile as jest.Mock).mockRejectedValue(error);

      await expect((ordersService as any).loadOrders()).rejects.toThrow(
        new HttpError(400, "Erro ao ler o arquivo 'orders.json' ")
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

    it("deve gerar pedidos BRL se o arquivo estiver vazio e recarregar", async () => {
      (readFile as jest.Mock)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce(JSON.stringify(mockBRLOrdersData));

      ordersService.getAllValidOrders = jest.fn().mockResolvedValue(undefined);
      console.log = jest.fn();

      const result = await (ordersService as any).loadBRLOrders();

      expect(console.log).toHaveBeenCalledWith(
        "O arquivo ainda não possui dados. Gerando dados com base nos valores válidos..."
      );
      expect(ordersService.getAllValidOrders).toHaveBeenCalled();
      expect(result).toEqual(mockBRLOrdersData);
    });

    it("deve lançar HttpError se houver erro na leitura", async () => {
      const error = new Error("Erro de leitura");
      (readFile as jest.Mock).mockRejectedValue(error);

      await expect((ordersService as any).loadBRLOrders()).rejects.toThrow(
        new HttpError(400, "Erro ao ler o arquivo 'orders_total_brl' ")
      );
    });
  });

  describe("getPedidos", () => {
    it("deve retornar pedidos em BRL se já existirem", async () => {
      (readFile as jest.Mock).mockResolvedValue(
        JSON.stringify(mockBRLOrdersData)
      );

      const result = await ordersService.getPedidos();

      expect(result).toEqual(mockBRLOrdersData);
      expect(readFile).toHaveBeenCalledTimes(1);
    });

    it("deve gerar pedidos BRL quando o array estiver vazio e recarregar", async () => {
      (readFile as jest.Mock)
        .mockResolvedValueOnce("[]")
        .mockResolvedValueOnce(JSON.stringify(mockBRLOrdersData));

      ordersService.getAllValidOrders = jest.fn().mockResolvedValue(undefined);
      console.log = jest.fn();

      const result = await ordersService.getPedidos();

      expect(console.log).toHaveBeenCalledWith(
        "Os pedidos em BRL ainda não foram carregados. Realizando requisição da cotação..."
      );
      expect(ordersService.getAllValidOrders).toHaveBeenCalled();
      expect(result).toEqual(mockBRLOrdersData);
    });
  });

  describe("getAllValidOrders", () => {
    it("deve retornar apenas pedidos válidos e chamar ordersBrlUtil", async () => {
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
      (ordersBrlUtil.includeOrdersBRL as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await ordersService.getAllValidOrders();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(ordersBrlUtil.includeOrdersBRL).toHaveBeenCalledWith([
        mockOrdersData[0] as Order,
        mockOrdersData[1] as Order,
      ]);
      expect(result).toEqual([
        mockOrdersData[0] as Order,
        mockOrdersData[1] as Order,
      ]);
    });

    it("deve retornar array vazio quando não houver pedidos válidos", async () => {
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (ordersBrlUtil.includeOrdersBRL as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await ordersService.getAllValidOrders();

      expect(result).toEqual([]);
      expect(ordersBrlUtil.includeOrdersBRL).toHaveBeenCalledWith([]);
    });

    it("deve lançar erro se loadOrders lançar HttpError", async () => {
      (readFile as jest.Mock).mockRejectedValue(new Error("Erro de leitura"));

      await expect(ordersService.getAllValidOrders()).rejects.toThrow(
        new HttpError(400, "Erro ao ler o arquivo 'orders.json' ")
      );
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
          error: { issues: [{ message: "Erro" }] },
        })
        .mockReturnValueOnce({
          success: false,
          error: { issues: [{ message: "Erro" }] },
        });

      const result = await ordersService.getAllInvalidOrders();

      expect(result).toEqual([mockOrdersData[1], mockOrdersData[2]]);
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

      expect(result).toEqual([]);
    });

    it("deve lançar erro se loadOrders lançar HttpError", async () => {
      (readFile as jest.Mock).mockRejectedValue(new Error("Erro de leitura"));

      await expect(ordersService.getAllInvalidOrders()).rejects.toThrow(
        new HttpError(400, "Erro ao ler o arquivo 'orders.json' ")
      );
    });
  });

  describe("getRelatorios", () => {
    beforeEach(() => {
      ordersService.getPedidos = jest.fn().mockResolvedValue(mockBRLOrdersData);
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

      const expectedSum = mockBRLOrdersData
        .sort((a, b) => b.totalBRL - a.totalBRL)
        .slice(0, 1)
        .reduce((acc, pedido) => acc + pedido.totalBRL, 0);

      expect(result.somaTotalBRL).toBeCloseTo(expectedSum, 2);
      expect(result.ranking).toHaveLength(1);
      expect(result.ranking[0].cliente).toBe("Maria Oliveira");

      expect(console.log).toHaveBeenCalledWith(
        "Top 1 clientes em BRL carregados."
      );
    });

    it("deve retornar todos os clientes quando top = 0", async () => {
      console.log = jest.fn();

      const result = await ordersService.getRelatorios(0);

      expect(result.ranking).toHaveLength(mockBRLOrdersData.length);

      const expectedSum = mockBRLOrdersData.reduce(
        (acc, pedido) => acc + pedido.totalBRL,
        0
      );
      expect(result.somaTotalBRL).toBeCloseTo(expectedSum, 2);

      expect(console.log).toHaveBeenCalledWith(
        "Top todos clientes em BRL carregados."
      );
    });

    it("deve retornar todos os clientes quando top é maior que o total", async () => {
      console.log = jest.fn();

      const result = await ordersService.getRelatorios(10);

      expect(result.ranking).toHaveLength(mockBRLOrdersData.length);
      expect(console.log).toHaveBeenCalledWith(
        `Os dados disponíveis são apenas ${mockBRLOrdersData.length}.`
      );
      expect(console.log).toHaveBeenCalledWith(
        `Top ${mockBRLOrdersData.length} clientes em BRL carregados.`
      );
    });

    it("deve ordenar clientes por totalBRL decrescente", async () => {
      const mockData = [
        { id: 1, cliente: "A", totalBRL: 100 },
        { id: 2, cliente: "B", totalBRL: 200 },
        { id: 3, cliente: "C", totalBRL: 150 },
      ] as OrderBRL[];

      ordersService.getPedidos = jest.fn().mockResolvedValue(mockData);

      const result = await ordersService.getRelatorios(3);

      expect(result.ranking[0].totalBRL).toBe(200);
      expect(result.ranking[1].totalBRL).toBe(150);
      expect(result.ranking[2].totalBRL).toBe(100);
    });

    it("deve lidar com array vazio de pedidos", async () => {
      ordersService.getPedidos = jest.fn().mockResolvedValue([]);

      const result = await ordersService.getRelatorios(5);

      expect(result.somaTotalBRL).toBe(0);
      expect(result.ranking).toEqual([]);
      expect(writeFile).toHaveBeenCalled();
    });

    it("deve lançar erro se getPedidos falhar", async () => {
      ordersService.getPedidos = jest.fn().mockRejectedValue(new Error("Erro"));

      await expect(ordersService.getRelatorios(2)).rejects.toThrow("Erro");
    });

    it("deve lançar erro se writeFile falhar", async () => {
      (writeFile as jest.Mock).mockRejectedValue(new Error("Erro de escrita"));

      await expect(ordersService.getRelatorios(2)).rejects.toThrow(
        "Erro de escrita"
      );
    });
  });

  describe("Integração com ordersBrlUtil", () => {
    it("deve chamar ordersBrlUtil com os pedidos válidos", async () => {
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
      (ordersBrlUtil.includeOrdersBRL as jest.Mock).mockResolvedValue(
        undefined
      );

      await ordersService.getAllValidOrders();

      expect(ordersBrlUtil.includeOrdersBRL).toHaveBeenCalledWith(validOrders);
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com JSON inválido no arquivo orders.json", async () => {
      (readFile as jest.Mock).mockResolvedValue("json inválido {");

      await expect(ordersService.getAllValidOrders()).rejects.toThrow();
    });

    it("deve lidar com JSON inválido no arquivo orders_total_brl.json", async () => {
      (readFile as jest.Mock).mockResolvedValue("json inválido {");

      await expect((ordersService as any).loadBRLOrders()).rejects.toThrow();
    });
  });
});
