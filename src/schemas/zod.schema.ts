import z from "zod";

export const orderSchema = z.object({
  id: z
    .number({
      error: "O campo id deve ser do tipo number e obrigatório",
    })
    .nonnegative("O campo id deve ser igual ou maior que zero."),

  cliente: z
    .string({
      error: "O campo cliente deve ser em formato de string e obrigatório.",
    })
    .max(100, "O campo cliente deve ter no máximo 100 caracteres."),

  pais: z
    .string({
      error: "O campo pais deve ser em formato de string e obrigatório.",
    })
    .max(100, "O campo pais deve ter no máximo 100 caracteres."),

  itens: z
    .array(
      z.object({
        produto: z
          .string({
            error: "O campo produto deve ser do tipo string e obrigatório.",
          })
          .max(100, "O campo produto deve ter no máximo 100 caracteres."),

        quantidade: z
          .number({
            error: "O campo quantidade deve ser do tipo number e obrigatório.",
          })
          .min(1, "O campo quantidade deve ser no mínimo 1."),

        precoUnitarioUSD: z
          .number({
            error:
              "O campo precoUnitarioUSD deve ser do tipo number e obrigatório.",
          })
          .positive("O campo precoUnitarioUSD deve ser maior que zero."),
      }),
      {
        error: "O campo itens é obrigatório.",
      }
    )
    .min(1, "O campo itens deve conter pelo menos 1 item."),
});
