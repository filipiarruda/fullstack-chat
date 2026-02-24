# 💬 Fullstack Chat

Um chat em tempo real desenvolvido com **Next.js** no frontend, **NestJS** no backend e **MySQL** como banco de dados. O projeto utiliza o **Turborepo** como monorepo, garantindo uma base de código unificada em TypeScript e facilitando a execução de todas as aplicações com um único comando.

---

## 🚀 Tecnologias

| Camada      | Tecnologia                                    |
|-------------|-----------------------------------------------|
| Frontend    | [Next.js](https://nextjs.org/) + Tailwind CSS |
| Backend     | [NestJS](https://nestjs.com/) + Socket.IO     |
| Banco       | [MySQL](https://www.mysql.com/)               |
| Monorepo    | [Turborepo](https://turborepo.dev/)           |
| Linguagem   | [TypeScript](https://www.typescriptlang.org/) |

---

## 📁 Estrutura de pastas

```
fullstack-chat/
├── apps/
│   ├── frontend/          # Aplicação Next.js (porta 3000)
│   └── backend/           # API NestJS + WebSocket (porta 3002)
├── packages/
│   ├── eslint-config/     # Configurações ESLint compartilhadas
│   ├── typescript-config/ # Configurações TypeScript compartilhadas
│   └── ui/                # Componentes de UI compartilhados
├── package.json
└── turbo.json
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [MySQL](https://www.mysql.com/) rodando localmente
- npm >= 10

---

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/filipiarruda/fullstack-chat.git
cd fullstack-chat
```

---

### 2️⃣ Instale as dependências

Instale na raiz do projeto (gerencia o workspace do Turborepo):

```bash
npm install
```

Em seguida, instale nas aplicações individualmente:

```bash
# Frontend
cd apps/frontend
npm install

# Backend
cd ../backend
npm install

# Volte para a raiz
cd ../..
```

---

### 3️⃣ Configure as variáveis de ambiente

#### Backend — `apps/backend/.env`

Crie o arquivo `apps/backend/.env` com o conteúdo abaixo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=fullstack_chat
APP_PORT=3002
```

> ⚠️ Ajuste os valores de `DB_USER`, `DB_PASSWORD` e `DB_NAME` conforme a sua instalação local do MySQL.

#### Frontend — `apps/frontend/.env.local`

Crie o arquivo `apps/frontend/.env.local` com o conteúdo abaixo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

### 4️⃣ Execute o projeto

Na raiz do projeto, rode:

```bash
npm run dev
```

Esse comando inicializa o Turborepo, que sobe o **frontend** e o **backend** ao mesmo tempo.

| Aplicação | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:3002 |

---

## ✨ Funcionalidades

- 🔐 Autenticação com JWT
- 💬 Criação e participação em salas de chat
- ⚡ Mensagens em tempo real via WebSocket (Socket.IO)
- 📱 Interface responsiva com Tailwind CSS
