# 🏛️ Arquitetura Recomendada - Kaora

## 📁 Estrutura Proposta

```
packages/
├── domain/                 # 🔵 CORE - Regras de Negócio
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/ (interfaces)
│   └── use-cases/
│
├── infrastructure/         # 🟡 INFRAESTRUTURA
│   ├── database/
│   │   ├── prisma/
│   │   └── repositories/ (implementações)
│   ├── email/
│   └── cache/
│
├── application/           # 🟢 APLICAÇÃO/API
│   ├── services/
│   ├── dto/
│   └── di/ (dependency injection)
│
└── web/                   # 🔴 INTERFACE/FRONTEND
    └── pages/api/ (apenas controllers)
```

## 🔄 Fluxo de Dados

```
[Frontend] → [API Controller] → [Application Service] → [Domain Use Case] → [Repository Interface] → [Infrastructure Repository] → [Database]
```

## 🛡️ Princípios

1. **Domain** nunca conhece infraestrutura
2. **Frontend** nunca conhece domain diretamente  
3. **Infrastructure** implementa interfaces do domain
4. **Application** orquestra tudo via DI

## 📋 Benefícios

✅ Domain 100% puro (sem Prisma)
✅ Frontend não conhece lógica de negócio
✅ Infraestrutura substituível
✅ Testabilidade máxima
✅ DI automática
