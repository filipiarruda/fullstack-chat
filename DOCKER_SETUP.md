# 🐳 Docker Setup - Fullstack Chat Application

## Visão Geral

Esta aplicação está configurada para rodar em Docker com:
- **Backend**: NestJS em container separado (porta 3002)
- **Frontend**: Next.js em container separado (porta 3000)
- **Database**: MySQL em container separado
- **Network**: Comunicação interna entre containers

## Arquitetura

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│  (fullstack-network - bridge)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌────────────────┐ │
│  │   Frontend     │  │   Backend      │ │
│  │   Next.js      │  │   NestJS       │ │
│  │   :3000        │  │   :3002        │ │
│  │                │  │                │ │
│  │ http://localhost:3000              │ │
│  │ http://localhost:3002/docs (Swagger)
│  │                                         │
│  └────────────────┘  └────────────────┘ │
│          │                   ▲           │
│          │ (interno)         │           │
│          └───────────────────┘           │
│                                         │
│  ┌────────────────┐                    │
│  │     MySQL      │                    │
│  │  :3306         │                    │
│  │  (interno)     │                    │
│  └────────────────┘                    │
│                                         │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Build das Imagens
```bash
docker-compose build
```

### 2. Iniciar os Containers
```bash
# Com logs (Ctrl+C para parar)
docker-compose up

# Em background
docker-compose up -d

# Com rebuild
docker-compose up --build
```

### 3. Acessar as Aplicações
```
Frontend:     http://localhost:3000
Backend:      http://localhost:3002
Swagger Docs: http://localhost:3002/docs
```

## 📋 Comandos Úteis

### Parar e Remover Containers
```bash
# Parar containers, mantém volumes
docker-compose down

# Parar containers e remover tudo (incluindo volumes)
docker-compose down -v

# Remove apenas os containers, não os volumes
docker-compose stop
```

### Logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas database
docker-compose logs -f mysql
```

### Acessar Container
```bash
# Shell do backend
docker exec -it fullstack-chat-backend sh

# Shell do frontend
docker exec -it fullstack-chat-frontend sh

# Shell do mysql
docker exec -it fullstack-chat-mysql mysql -u chat_user -p chat_password -e "use chat_db; SHOW TABLES;"
```

### Rebuild de um Serviço Específico
```bash
# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

## 🔧 Configuração para Desenvolvimento

### Ativar Volume Mounts para Hot Reload

Edite `docker-compose.yml` e descomente as seções `volumes`:

#### Backend
```yaml
backend:
  volumes:
    - ./apps/backend/src:/app/apps/backend/src
    - ./apps/backend/package.json:/app/apps/backend/package.json
    - backend-node-modules:/app/node_modules
```

#### Frontend
```yaml
frontend:
  volumes:
    - ./apps/frontend/app:/app/apps/frontend/app
    - ./apps/frontend/public:/app/apps/frontend/public
    - frontend-node-modules:/app/node_modules
```

### Usar Imagem com Node (para desenvolvimento)

Para desenvolvimento com watch mode, crie uma imagem de desenvolvimento:

```yaml
backend:
  build:
    context: .
    dockerfile: Dockerfile.backend
    target: builder  # Use builder stage para ter ferramentas de dev
  command: npm run dev
```

## 📝 Estrutura de Arquivos Docker

```
fullstack-chat/
├── docker-compose.yml       # Orquestra os 3 serviços
├── Dockerfile.backend       # Build multistage para NestJS
├── Dockerfile.frontend      # Build multistage para Next.js
├── .dockerignore           # Arquivos ignorados no build
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   ├── dist/
│   │   ├── package.json
│   │   └── package-lock.json
│   └── frontend/
│       ├── app/
│       ├── public/
│       ├── .next/
│       ├── package.json
│       └── package-lock.json
└── packages/
    └── ...
```

## 🌍 Variáveis de Ambiente

### Backend
```env
NODE_ENV=production
PORT=3002
DB_HOST=mysql
DB_PORT=3306
DB_NAME=chat_db
DB_USER=chat_user
DB_PASSWORD=chat_password
# JWT_SECRET=your-secret-key
```

### Frontend
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://backend:3002
```

### MySQL
```env
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=chat_db
MYSQL_USER=chat_user
MYSQL_PASSWORD=chat_password
```

## 🔍 Health Checks

Cada serviço tem health checks configurados:

```bash
# Backend (http get)
curl http://localhost:3002/health

# Frontend (http get)
curl http://localhost:3000

# MySQL (via mysqladmin)
docker exec fullstack-chat-mysql mysqladmin ping -h localhost
```

Ver status:
```bash
docker-compose ps
```

## 🚀 Build Otimizado com Multi-Stage

Os Dockerfiles usam **multi-stage builds** para reduzir o tamanho da imagem:

1. **Stage 1 - deps**: Instala dependências
2. **Stage 2 - builder**: Faz o build da aplicação
3. **Stage 3 - runtime**: Apenas o necessário para rodar

**Benefícios:**
- Imagens menores (~100-200MB vs 500MB+)
- Sem dependências de build na produção
- Mais rápido para executar

## 📊 Tamanho das Imagens

Estimado pós-build:

```
Backend:   ~150MB
Frontend:  ~180MB
Database:  ~150MB
Total:     ~480MB
```

## 🔐 Segurança

### Boas Práticas Implementadas

✅ Node Alpine (imagens pequenas)
✅ Multi-stage builds (sem ferramentas de build)
✅ Health checks (detecção de falhas)
✅ Volumes nomeados (dados persistentes)
✅ Network isolada (containers se falam internamente)
✅ Variáveis de ambiente configuráveis

### Recomendações

⚠️ **Para Produção:**
- Use `.env` com secrets gerenciados
- Não exponha senhas em compose files
- Use Docker Secrets ou AWS Secrets Manager
- Configure CORS adequadamente
- Use HTTPS/TLS
- Configure rate limiting

## 📦 Pushing para Registry

### Docker Hub
```bash
# Login
docker login

# Tag
docker tag fullstack-chat-backend:latest seu-usuario/fullstack-chat-backend:latest
docker tag fullstack-chat-frontend:latest seu-usuario/fullstack-chat-frontend:latest

# Push
docker push seu-usuario/fullstack-chat-backend:latest
docker push seu-usuario/fullstack-chat-frontend:latest
```

### GitLab Container Registry
```bash
docker tag fullstack-chat-backend:latest registry.gitlab.com/seu-grupo/fullstack-chat/backend:latest
docker push registry.gitlab.com/seu-grupo/fullstack-chat/backend:latest
```

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Verificar o que está usando a porta 3002
lsof -i :3002

# Usar porta diferente
docker-compose -f docker-compose.yml -p meu-projeto up -d
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs backend

# Rebuild sem cache
docker-compose build --no-cache backend
```

### Conectar ao MySQL externamente
```bash
# A partir do localhost (quando deve estar open)
mysql -h localhost -u chat_user -p -D chat_db

# De dentro de outro container
docker exec fullstack-chat-mysql mysql -u chat_user -p chat_password -D chat_db
```

### Limpar tudo
```bash
# Parar, remover containers, volumes e networks
docker-compose down -v

# Remover imagens também
docker system prune -a
```

## 📚 Recursos Úteis

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Dockerfiles](https://docs.docker.com/develop/dev-best-practices/dockerfile-best-practices/)
- [Node.js in Containers](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🎯 Próximos Passos

1. **CI/CD Integration**
   - GitHub Actions
   - GitLab CI/CD
   - Deploy automático

2. **Orchestration**
   - Kubernetes
   - Docker Swarm

3. **Monitoring**
   - Prometheus + Grafana
   - ELK Stack (Elasticsearch, Logstash, Kibana)

4. **Load Balancing**
   - Nginx
   - Traefik

---

**Desenvolvido com ❤️ para o Fullstack Chat**
