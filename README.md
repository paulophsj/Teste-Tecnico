# 📦 Orders Processing API

API desenvolvida em Node.js + Express + TypeScript para processamento de pedidos, validação de dados, conversão de valores de USD para BRL e geração de relatórios financeiros, utilizando dados armazenados em arquivos JSON.

## ✨ Funcionalidades

- 📖 **Leitura de pedidos** a partir de um arquivo JSON
- 🛡️ **Validação de dados** com Zod
- 🔀 **Separação automática** entre pedidos válidos e inválidos
- 💱 **Conversão automática** de valores de USD para BRL usando cotação em tempo real
- 📊 **Geração de relatório financeiro** com:
  - Total geral em BRL
  - Ranking dos clientes que mais gastaram
- 💾 **Persistência de dados** processados em arquivos auxiliares
- 🏗️ **API REST** organizada em Controllers, Services, Routers e Utils

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Ambiente de execução
- **Express** - Framework web
- **TypeScript** - Superset JavaScript tipado
- **Zod** - Validação de dados
- **Axios** - Requisições HTTP
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **File System (fs/promises)** - Manipulação de arquivos
- **Jest** - Testes unitários

## 📁 Estrutura do Projeto

```
data/
├── orders.json              # Dados brutos dos pedidos
├── orders_total_brl.json    # Pedidos com valores convertidos
└── top_clientes.json       # Relatório de clientes

src/
├── controllers/
│   └── orders.controller.ts  # Controladores das rotas
├── services/
│   └── orders.service.ts     # Lógica de negócio
├── routers/
│   └── orders.router.ts      # Definição de rotas
├── schemas/
│   └── zod.schema.ts         # Schemas de validação Zod
├── util/
│   └── orders.brl.util.ts    # Utilitários para conversão
├── types/
│   └── orders.type.ts        # Tipos TypeScript
└── index.ts                 # Ponto de entrada
```
# 🧪 Testes Unitários

O projeto inclui uma **solução completa de testes unitários**

## 📊 Testes Implementados

### ✅ **OrdersService**
- `loadOrders()`
- `loadBRLOrders()`
- `getPedidos()`
- `getAllValidOrders()`
- `getAllInvalidOrders()`
- `getRelatorios()`
- `Integração com includeOrdersBRL()`

### ✅ **Validation Schemas**
- Validação de **pedidos válidos** (dados completos e corretos)
- Validação de **pedidos inválidos** (campos faltantes, tipos errados, valores inválidos)

## 🛠️ Executando os Testes

### **Modo Desenvolvimento**
```bash
# Executar todos os testes uma vez
npm test
```

## 🧪 Estrutura de Testes

```
├──tests/
│   ├── mocks/
│   │   └── order.service.mock.ts
│   │   └── order.zod.mock.ts
│   │
│   └── order.service.spec.ts
│   └── order.zod.spec.ts
```

## 📄 Arquivos de Dados

### `orders.json`
Arquivo base com pedidos de exemplo (válidos e inválidos). É a fonte principal de dados do sistema.

**Exemplo:**
```json
{
  "id": 1,
  "cliente": "João da Silva",
  "pais": "Brasil",
  "itens": [
    { "produto": "Câmera", "quantidade": 1, "precoUnitarioUSD": 500 }
  ]
}
```

### `orders_total_brl.json`
Arquivo gerado automaticamente contendo:
- Total do pedido em USD
- Total do pedido em BRL

### `top_clientes.json`
Arquivo gerado a partir do relatório contendo:
- Soma total de todos os pedidos em BRL
- Ranking dos clientes por valor gasto

## 🚀 Começando

### Pré-requisitos
- Node.js (v16 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/paulophsj/Teste-Tecnico.git
cd Teste-Tecnico
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
   Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
```

4. **Inicie o servidor**

   **Modo desenvolvimento:**
   ```bash
   npm start
   ```

   A API ficará disponível em: `http://localhost:8080`

## 🌐 Rotas da API

### 🔹 `GET /pedidos`
Retorna todos os pedidos convertidos para BRL. Caso ainda não existam, o sistema processa automaticamente os pedidos válidos.

### 🔹 `GET /validos`
Retorna apenas os pedidos válidos, após validação com Zod.

### 🔹 `GET /invalidos`
Retorna os pedidos inválidos, ou seja, que não passaram no schema de validação.

### 🔹 `GET /relatorios?top=3`
Gera um relatório financeiro com:
- Soma total em BRL
- Ranking dos clientes que mais gastaram

**Parâmetros:**
- `top` (opcional): quantidade de clientes no ranking (mínimo 3, padrão: 3, total: 0)

## 🏗️ Arquitetura

### 🧩 Controllers
Responsáveis por:
- Receber as requisições HTTP
- Validar parâmetros de entrada
- Chamar os Services apropriados
- Retornar respostas padronizadas

### ⚙️ Services
Concentram **toda a lógica de negócio**:
- Leitura e escrita dos arquivos JSON
- Validação dos pedidos
- Separação entre pedidos válidos e inválidos
- Cálculo de totais
- Geração de relatórios
- Ordenação e ranking de clientes

## 🛡️ Validação com Zod

O projeto utiliza **Zod** para validação rigorosa dos pedidos:
- Tipos corretos (number, string)
- Valores mínimos e máximos definidos
- Mensagens de erro claras e específicas
- Validação de arrays e objetos aninhados

**Exemplos de regras:**
- `id` deve ser número não negativo
- `quantidade` mínima de 1
- `precoUnitarioUSD` deve ser positivo
- Campos obrigatórios bem definidos

Pedidos inválidos são **descartados automaticamente** e registrados para análise.

## 🧠 TypeScript e Tipagem Forte

- **Types** para pedidos, itens e relatórios
- **Classes bem definidas** (OrdersService, OrdersController)
- **Tipagem forte** em parâmetros, retornos e estruturas de dados
- **Maior segurança, legibilidade** e prevenção de erros em tempo de desenvolvimento

## ✅ Boas Práticas Aplicadas

- **Separação de responsabilidades** (Controller/Service/Router/Schemas/Util)
- **Código assíncrono** com async/await
- **Organização escalável** para projetos maiores

## 📌 Observações Finais

Este projeto é ideal para demonstrar:
- Conhecimento em **Node.js + TypeScript**
- **Validação robusta** de dados com Zod
- **Arquitetura limpa** e organizada
- **Processamento e análise** de dados
- **Boas práticas** de desenvolvimento de API REST

---