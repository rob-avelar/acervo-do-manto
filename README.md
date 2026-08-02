# Acervo do Manto

Loja de camisas de futebol para o **mercado brasileiro** (clubes, seleções, retrôs e edições limitadas).

- **Stack:** Next.js 14 (App Router) · Prisma · PostgreSQL · Tailwind
- **Idioma:** português do Brasil (pt-BR)
- **Moeda:** BRL (valores em centavos na base de dados; formatados como `R$ 1.234,56`)
- **Catálogo:** 1414 produtos no seed (`prisma/seed-store.ts`)

## Começar

```bash
yarn install            # ou npm install
cp .env.example .env    # configurar DATABASE_URL (PostgreSQL)
yarn db:push            # criar tabelas
yarn db:seed            # importar os 1414 produtos
yarn dev                # http://localhost:3000
```

## Estado

- [x] Modelos: StoreProduct, Customer, Address, Order, OrderItem
- [x] Catálogo com filtros por categoria e paginação
- [x] Página de produto (galeria, tamanhos, preço em BRL)
- [ ] Carrinho + checkout
- [ ] Pagamento brasileiro (Pix / boleto / cartão)
- [ ] Frete por CEP (Correios / Melhor Envio)
- [ ] Painel admin (pedidos, envios)
