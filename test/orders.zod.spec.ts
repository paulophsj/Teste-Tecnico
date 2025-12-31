import { orderSchema } from "../src/schemas/zod.schema";
import { z } from "zod";
import { invalidOrders, validOrders } from "./mocks/order.zod.mock";

describe("Teste do Schema de Pedido (orderSchema)", () => {
  // Testes para dados válidos
  describe("Casos válidos", () => {
    validOrders.forEach((order, index) => {
      it(`deve validar o pedido válido ${index + 1}`, () => {
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data).toEqual(order);
        }
      });
    });
  });

  // Testes para dados inválidos
  describe("Casos inválidos", () => {
    invalidOrders.forEach(({ description, data, expectedError }) => {
      it(`deve rejeitar ${description}`, () => {
        const result = orderSchema.safeParse(data);
        expect(result.success).toBe(false);

        if (!result.success) {
          // Verifica se o erro esperado está presente em algum lugar dos erros
          const hasExpectedError = result.error.issues.some((error) =>
            error.message.includes(expectedError)
          );
          expect(hasExpectedError).toBe(true);
        }
      });
    });
  });

  // Testes para validações específicas
  describe("Validações específicas do schema", () => {
    it("deve rejeitar quando id não é número", () => {
      const invalidData = {
        id: "não é número",
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes(
            "O campo id deve ser do tipo number e obrigatório"
          )
        );
        expect(hasError).toBe(true);
      }
    });

    it("deve rejeitar quando cliente tem mais de 100 caracteres", () => {
      const invalidData = {
        id: 1,
        cliente: "A".repeat(101), // 101 caracteres
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes(
            "O campo cliente deve ter no máximo 100 caracteres"
          )
        );
        expect(hasError).toBe(true);
      }
    });

    it("deve rejeitar quando itens está vazio", () => {
      const invalidData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [],
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes("O campo itens deve conter pelo menos 1 item")
        );
        expect(hasError).toBe(true);
      }
    });

    it("deve rejeitar quando produto tem mais de 100 caracteres", () => {
      const invalidData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          {
            produto: "P".repeat(101), // 101 caracteres
            quantidade: 1,
            precoUnitarioUSD: 100,
          },
        ],
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes(
            "O campo produto deve ter no máximo 100 caracteres"
          )
        );
        expect(hasError).toBe(true);
      }
    });

    it("deve rejeitar quando cliente está faltando", () => {
      const invalidData = {
        id: 1,
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes(
            "O campo cliente deve ser em formato de string e obrigatório"
          )
        );
        expect(hasError).toBe(true);
      }
    });

    it("deve rejeitar quando itens não é um array", () => {
      const invalidData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: "não é um array",
      };

      const result = orderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const hasError = result.error.issues.some((error) =>
          error.message.includes("O campo itens é obrigatório")
        );
        expect(hasError).toBe(true);
      }
    });
  });

  // Testes com parse() para verificar exceções
  describe("Testes com parse() que lançam exceções", () => {
    it("deve lançar exceção para ID negativo ao usar parse()", () => {
      const invalidData = {
        id: -1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      expect(() => orderSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it("deve passar sem erros para dados válidos ao usar parse()", () => {
      const validData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      expect(() => orderSchema.parse(validData)).not.toThrow();
    });
  });

  // Testes de borda
  describe("Testes de borda", () => {
    it("deve aceitar id igual a zero", () => {
      const edgeCaseData = {
        id: 0,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      const result = orderSchema.safeParse(edgeCaseData);
      expect(result.success).toBe(true);
    });

    it("deve aceitar quantidade igual a 1", () => {
      const edgeCaseData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 100 },
        ],
      };

      const result = orderSchema.safeParse(edgeCaseData);
      expect(result.success).toBe(true);
    });

    it("deve aceitar precoUnitarioUSD com valor decimal positivo", () => {
      const edgeCaseData = {
        id: 1,
        cliente: "Cliente Teste",
        pais: "Brasil",
        itens: [
          { produto: "Produto Teste", quantidade: 1, precoUnitarioUSD: 99.99 },
        ],
      };

      const result = orderSchema.safeParse(edgeCaseData);
      expect(result.success).toBe(true);
    });
  });
});
