# 🗓️ Mini Task Scheduler  
> Sistema Full-Stack para gestão de tarefas com Kanban, Dashboard, modo escuro e exportação PDF.  
> Desenvolvido por **Cristina Avelar** 🇵🇹  

---

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Backend-red?style=flat-square&logo=nestjs" />
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-DB-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" />
  <img src="https://img.shields.io/badge/TailwindCSS-Design-38B2AC?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/TypeScript-💙-007ACC?style=flat-square&logo=typescript" />
</p>

---

## 🌟 Funcionalidades Principais

✅ **Autenticação JWT** (login, persistência local)  
✅ **CRUD de Tarefas** com prioridades e prazos  
✅ **Kanban dinâmico** (drag & drop com atualização instantânea)  
✅ **Dashboard interativo** com KPIs e exportação para **PDF**  
✅ **Modo escuro / claro** (persistente)  
✅ **Design moderno com TailwindCSS**  
✅ **Swagger UI** para documentação da API  

---

## 🧩 Stack Tecnológica

| Camada | Tecnologia | Função |
|:--|:--|:--|
| **Frontend** | React + Vite + TailwindCSS | Interface responsiva e dinâmica |
| **Backend** | NestJS + Prisma + JWT | API REST segura e modular |
| **Base de Dados** | PostgreSQL | Persistência relacional |
| **Infraestrutura** | Docker + Compose | Orquestração local |
| **Deploy-ready** | Qualquer servidor Docker | Pronto para produção |

---

## ⚙️ Instalação e Execução

### 🔧 Clonar o repositório
```bash
git clone https://github.com/<teu-username>/mini-task-scheduler.git
cd mini-task-scheduler
📄 Criar o .env no backend
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5433/mts?schema=public"
JWT_SECRET="supersecret"
ENABLE_SWAGGER=true
NODE_ENV=development

🐳 Subir via Docker Compose
docker compose up --build


📍 Endpoints principais:

Frontend: http://localhost:5174

API: http://localhost:4000/api

Swagger: http://localhost:4000/api/docs

👥 Credenciais de Teste
Email	Password
test@example.com	password123
🧭 Navegação
Página	Função
Dashboard	KPIs + exportação PDF
Tasks	Lista CRUD completa
Kanban	Gestão visual com drag & drop
Login	Autenticação JWT
Navbar	Alternância Dark/Light
💡 Destaques do Dashboard

Total de tarefas

Percentagem concluída

Tarefas vencidas

Criadas nos últimos 7 dias

Exportação direta para PDF (modo impressão otimizado)

🧱 Estrutura do Projeto
mini-task-scheduler/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── tasks/
│   │   └── main.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   └── Kanban.tsx
│   │   ├── utils/api.ts
│   │   ├── ui/Toast.tsx
│   │   └── theme/
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md

🧰 Scripts úteis
🖥️ Frontend
cd frontend
npm run dev         # inicia Vite em localhost:5174
npm run build       # build de produção
npm run preview     # pré-visualiza build

⚙️ Backend
cd backend
npm run start:dev   # inicia NestJS (modo dev)
npm run prisma:studio  # abre Prisma Studio

🔐 Autenticação

O sistema usa JWT Tokens:

Gerados no login (/auth/login)

Guardados em localStorage

Incluídos automaticamente no header Authorization: Bearer <token>

Validados via JwtStrategy no backend

💾 Modelo de Dados (Prisma)
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  tasks        Task[]
}

model Task {
  id          String       @id @default(uuid())
  title       String
  status      TaskStatus   @default(todo)
  priority    TaskPriority @default(medium)
  dueAt       DateTime?
  description String?
  ownerId     String
  owner       User         @relation(fields: [ownerId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

📜 API Endpoints
Método	Endpoint	Descrição
POST	/auth/login	Login com email/password
GET	/auth/me	Devolve o utilizador autenticado
GET	/tasks	Lista todas as tarefas
POST	/tasks	Cria uma nova tarefa
PATCH	/tasks/:id	Atualiza tarefa
DELETE	/tasks/:id	Remove tarefa

🧭 Documentação completa: Swagger UI →

🌙 Dark Mode

Ativa automaticamente com o tema do sistema ou manualmente pelo botão 🌙 / ☀️ na Navbar.

🧑‍💻 Autoria

Desenvolvido por Cristina Avelar 🇵🇹
💻 Explorando tecnologia, design e desenvolvimento Full Stack com foco em qualidade e detalhe.

🪪 Licença

Distribuído livremente para fins educativos e demonstrativos.
© 2025 Cristina Avelar