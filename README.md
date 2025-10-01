# 💍 Casandinhos - Lista de Casamento Digital

> **Sistema completo de lista de casamento online para Flaviana & Vicenzo**

Uma aplicação web moderna e elegante que permite aos noivos gerenciar sua lista de casamento e aos convidados visualizar e reservar presentes de forma prática e segura.

## 📋 Índice

- [🚀 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Instalação e Configuração](#️-instalação-e-configuração)
- [🔧 Scripts Disponíveis](#-scripts-disponíveis)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [🔐 Sistema de Autenticação](#-sistema-de-autenticação)
- [📡 API Endpoints](#-api-endpoints)
- [🎨 Componentes](#-componentes)
- [🌐 Deploy](#-deploy)
- [📱 Funcionalidades por Perfil](#-funcionalidades-por-perfil)
- [🤝 Contribuição](#-contribuição)

## 🚀 Sobre o Projeto

O **Casandinhos** é uma aplicação full-stack desenvolvida especificamente para o casamento de Flaviana & Vicenzo. O sistema permite:

- **Gestão completa** da lista de presentes pelos noivos
- **Visualização pública** da lista para convidados
- **Sistema de reservas** para evitar presentes duplicados
- **Autenticação segura** com diferentes níveis de acesso
- **Interface responsiva** para todos os dispositivos
- **Painéis administrativos** para gerenciamento

## ✨ Funcionalidades

### 👰🤵 Para os Noivos (Admin)
- ✅ **Gerenciamento completo** de itens do enxoval
- ✅ **Categorização inteligente** (Cozinha, Sala/Copa, Banheiro/Quintal, Quarto)
- ✅ **Controle de prioridades** (Baixa, Média, Alta, Essencial)
- ✅ **Dashboard com estatísticas** detalhadas
- ✅ **Visualização de reservas** e comentários
- ✅ **Sistema de diagnóstico** para monitoramento
- ✅ **Controle de usuários** e permissões

### 👨‍👩‍👧‍👦 Para os Convidados
- ✅ **Visualização da lista** completa de presentes
- ✅ **Sistema de reservas** com comentários personalizados
- ✅ **Filtros por categoria** e status
- ✅ **Interface intuitiva** e responsiva
- ✅ **Cadastro simples** e seguro

### 🔧 Funcionalidades Técnicas
- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Criptografia de senhas** com bcrypt
- ✅ **Validação de dados** em frontend e backend
- ✅ **Logs de auditoria** para ações administrativas
- ✅ **Sistema de backup** automático
- ✅ **Monitoramento de performance**

## 🛠️ Tecnologias

### Frontend
- **React 19.1.1** - Biblioteca principal para UI
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 5.4.20** - Build tool e dev server
- **CSS3** - Estilização customizada
- **Context API** - Gerenciamento de estado

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js 5.1.0** - Framework web
- **Prisma 6.16.3** - ORM e query builder
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless

### Segurança
- **bcryptjs 3.0.2** - Hash de senhas
- **Helmet 8.1.0** - Headers de segurança
- **CORS 2.8.5** - Controle de origem cruzada
- **Morgan 1.10.1** - Logs de requisições

### Deploy e DevOps
- **Vercel** - Plataforma de deploy
- **Git** - Controle de versão
- **ESLint** - Linting de código
- **TypeScript** - Checagem de tipos

## 📁 Estrutura do Projeto

```
casandinhos/
├── 📁 prisma/                    # Configurações do banco de dados
│   ├── schema.prisma            # Schema do Prisma
│   ├── seed.ts                  # Dados iniciais
│   └── migrations/              # Migrações do banco
├── 📁 public/                   # Arquivos públicos
│   ├── vite.svg                # Ícone do Vite
│   └── assets/                 # Assets estáticos
│       ├── favicon/            # Favicons e ícones
│       └── *.jpg              # PDFs do enxoval original
├── 📁 src/                     # Código fonte principal
│   ├── 📁 components/          # Componentes React
│   │   ├── AuthForm.tsx        # Formulário de autenticação
│   │   ├── Dashboard.tsx       # Painel administrativo
│   │   ├── ItemList.tsx        # Lista de itens
│   │   ├── ItemForm.tsx        # Formulário de itens
│   │   ├── ListaCasamento.tsx  # Lista pública
│   │   ├── PrismaTest.tsx      # Testes do banco
│   │   └── DiagnosticoProd.tsx # Diagnósticos de produção
│   ├── 📁 context/             # Contextos React
│   │   ├── AuthContext.tsx     # Contexto de autenticação
│   │   └── EnxovalContextAPI.tsx # Contexto da lista
│   ├── 📁 hooks/               # Hooks customizados
│   │   ├── useAuth.ts          # Hook de autenticação
│   │   └── useEnxoval.ts       # Hook da lista
│   ├── 📁 lib/                 # Utilitários e configurações
│   │   ├── prisma.ts           # Cliente Prisma
│   │   ├── auth.ts             # Utilitários de auth
│   │   ├── api.ts              # Cliente API
│   │   └── apiComplete.ts      # API completa
│   ├── 📁 styles/              # Estilos CSS
│   │   ├── Auth.css            # Estilos de autenticação
│   │   ├── Dashboard.css       # Estilos do dashboard
│   │   ├── ItemList.css        # Estilos da lista
│   │   └── *.css              # Outros estilos
│   ├── 📁 types/               # Definições TypeScript
│   │   └── index.ts            # Tipos principais da aplicação
│   ├── 📁 data/                # Dados iniciais
│   │   └── itensIniciais.ts    # Lista inicial de itens
│   ├── server.ts               # Servidor Express
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Entry point React
│   └── index.css               # Estilos globais
├── 📄 vercel.json              # Configuração do Vercel
├── 📄 vite.config.ts           # Configuração do Vite
├── 📄 package.json             # Dependências e scripts
├── 📄 tsconfig.json            # Configuração TypeScript
└── 📄 README.md                # Este arquivo
```

## ⚙️ Instalação e Configuração

### Pré-requisitos
- **Node.js** 20.17.0 ou superior
- **npm** ou **yarn**
- **PostgreSQL** (local ou remoto)
- **Git**

### 1. Clone o repositório
```bash
git clone https://github.com/Vicenzolol/casandinhos.git
cd casandinhos
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/casandinhos"

# JWT
JWT_SECRET="seu_jwt_secret_super_seguro_aqui"

# Ambiente
NODE_ENV="development"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Semear dados iniciais (opcional)
npx prisma db seed
```

### 5. Inicie o projeto

#### Desenvolvimento (Frontend + Backend separados)
```bash
# Terminal 1 - Backend API
npm run dev:server

# Terminal 2 - Frontend React
npm run dev
```

#### Produção local
```bash
# Build e start
npm run build
npm start
```

## 🔧 Scripts Disponíveis

```json
{
  "dev": "vite",                    // Inicia o frontend em desenvolvimento
  "dev:server": "tsx watch src/server.ts", // Inicia o backend com hot reload
  "build": "vite build",            // Build de produção do frontend
  "preview": "vite preview",        // Preview do build de produção
  "start": "node dist/server.js",   // Inicia servidor de produção
  "vercel-build": "npx prisma generate && vite build" // Build para Vercel
}
```

## 🗄️ Banco de Dados

### Schema Principal

#### 👤 **Users** (Usuários)
```sql
- id: Integer (PK, Auto-increment)
- nome: String (Nome completo)
- email: String (Unique, Email de login)
- telefone: String? (Opcional)
- senha: String (Hash bcrypt)
- isAdmin: Boolean (Permissões administrativas)
- createdAt: DateTime
- updatedAt: DateTime
```

#### 🎁 **EnxovalItem** (Itens da Lista)
```sql
- id: String (PK, CUID)
- nome: String (Nome do item)
- categoria: String (cozinha|sala-copa|banheiro-quintal|quarto)
- subCategoria: String? (Subcategoria opcional)
- descricao: String? (Descrição detalhada)
- adquirido: Boolean (Status de aquisição)
- comentario: String? (Comentários administrativos)
- dataConquista: DateTime? (Data da aquisição)
- prioridade: String (baixa|media|alta|essencial)
- createdAt: DateTime
- updatedAt: DateTime
```

#### 📝 **Reserva** (Reservas de Itens)
```sql
- id: String (PK, CUID)
- comentario: String? (Comentário do convidado)
- dataReserva: DateTime (Data da reserva)
- userId: Integer (FK -> Users)
- itemId: String (FK -> EnxovalItem)
```

### Relacionamentos
- **User** 1:N **Reserva** (Um usuário pode fazer várias reservas)
- **EnxovalItem** 1:N **Reserva** (Um item pode ter várias reservas)
- **Cascading Deletes** configurado para manter integridade

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Registro**: Usuário se cadastra com nome, email e senha
2. **Hash**: Senha é criptografada com bcrypt (salt rounds: 12)
3. **Login**: Verificação de credenciais e geração de JWT
4. **Token**: JWT contém `userId`, `email`, `isAdmin`
5. **Middleware**: Proteção de rotas sensíveis
6. **Autorização**: Diferenciação entre usuário comum e admin

### Níveis de Acesso

#### 👑 **Administrador** (isAdmin: true)
- Acesso total ao sistema
- CRUD completo de itens
- Visualização de todas as reservas
- Acesso a ferramentas de diagnóstico
- Gerenciamento de usuários

#### 👤 **Usuário Comum**
- Visualização da lista de presentes
- Criação e gerenciamento de próprias reservas
- Edição do próprio perfil
- Acesso limitado às APIs

### Middleware de Segurança
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origens permitidas
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Input Validation**: Sanitização de dados de entrada

## 📡 API Endpoints

### 🔐 **Autenticação**
```http
POST   /api/auth/login          # Login de usuário
POST   /api/auth/register       # Cadastro de usuário
GET    /api/auth/me             # Dados do usuário logado
```

### 🎁 **Itens do Enxoval**
```http
GET    /api/items               # Listar todos os itens
POST   /api/items               # Criar novo item (Admin)
PUT    /api/items/:id           # Atualizar item (Admin)
DELETE /api/items/:id           # Deletar item (Admin)
```

### 📝 **Reservas**
```http
GET    /api/reservas            # Listar reservas (próprias ou todas se admin)
POST   /api/reservas            # Criar nova reserva
DELETE /api/reservas/:id        # Deletar reserva (própria ou admin)
```

### 🔧 **Utilitários**
```http
GET    /api/health              # Health check da API
GET    /api/test/env            # Verificar variáveis de ambiente
GET    /api/test/prisma         # Teste completo do Prisma (Admin)
GET    /api/test/prisma/quick   # Teste rápido do Prisma (Público)
```

### Exemplos de Requisições

#### Login
```json
POST /api/auth/login
{
  "email": "flaviana@exemplo.com",
  "senha": "minhasenha123"
}

// Resposta
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Flaviana",
    "email": "flaviana@exemplo.com",
    "isAdmin": true
  }
}
```

#### Criar Reserva
```json
POST /api/reservas
Authorization: Bearer <token>
{
  "itemId": "cm123abc456def",
  "comentario": "Este presente é perfeito para vocês!"
}
```

## 🎨 Componentes

### **AuthForm.tsx**
- **Função**: Gerencia login e cadastro de usuários
- **Estados**: Mode (login/register), loading, errors
- **Validações**: Email format, password strength
- **Integração**: AuthContext para state management

### **Dashboard.tsx**
- **Função**: Painel administrativo com estatísticas
- **Métricas**: Total items, completion %, category breakdown
- **Gráficos**: Progress bars, category distribution
- **Ações**: Quick access to management functions

### **ListaCasamento.tsx**
- **Função**: Visualização pública da lista de presentes
- **Filtros**: Categoria, status (disponível/reservado)
- **Layout**: Grid responsivo com cards elegantes
- **Interações**: Reservar item, visualizar detalhes

### **ItemList.tsx**
- **Função**: Lista administrativa de itens
- **Funcionalidades**: CRUD operations, bulk actions
- **Filtros**: Categoria, prioridade, status
- **Ordenação**: Por data, nome, prioridade

### **ItemForm.tsx**
- **Função**: Formulário para criar/editar itens
- **Campos**: Nome, categoria, descrição, prioridade
- **Validações**: Required fields, data formats
- **Estados**: Create mode vs Edit mode

### **DiagnosticoProd.tsx**
- **Função**: Ferramenta de diagnóstico para produção
- **Testes**: API connectivity, database health
- **Métricas**: Response times, error rates
- **Logs**: Real-time system status

## 🌐 Deploy

### Configuração do Vercel

#### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### Processo de Deploy

1. **Build Automático**: Push para main → Deploy automático
2. **Environment Variables**: Configuradas no painel do Vercel
3. **Database**: PostgreSQL hospedado externamente
4. **Static Files**: Servidos pelo servidor Express integrado
5. **API Routes**: Todas as rotas gerenciadas pelo servidor único

### Variáveis de Ambiente (Vercel)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
```

### URLs de Produção
- **Aplicação**: https://casandinhos.vercel.app
- **API Health**: https://casandinhos.vercel.app/api/health
- **Dashboard**: https://casandinhos.vercel.app (após login admin)

## 📱 Funcionalidades por Perfil

### 👰🤵 **Perfil Administrador** (Noivos)

#### Dashboard Completo
- 📊 Estatísticas em tempo real
- 📈 Progresso por categoria
- 👥 Número de usuários cadastrados
- 💌 Últimas reservas recebidas

#### Gerenciamento de Itens
- ➕ Adicionar novos itens à lista
- ✏️ Editar informações existentes
- 🗑️ Remover itens desnecessários
- 🏷️ Organizar por categorias e prioridades

#### Controle de Reservas
- 👀 Visualizar todas as reservas
- 💬 Ler comentários dos convidados
- 🗑️ Cancelar reservas se necessário
- 📧 Contato com quem reservou

#### Ferramentas Avançadas
- 🔧 Diagnóstico do sistema
- 📊 Relatórios detalhados
- 🛠️ Testes de conectividade
- 📋 Logs de auditoria

### 👨‍👩‍👧‍👦 **Perfil Convidado**

#### Visualização da Lista
- 📋 Lista completa de presentes
- 🔍 Filtros por categoria
- 🎯 Indicação de prioridades
- ✅ Status (disponível/reservado)

#### Sistema de Reservas
- 🎁 Reservar presentes favoritos
- 💬 Deixar mensagens carinhosas
- ✏️ Editar reservas próprias
- ❌ Cancelar reservas se necessário

#### Experiência Personalizada
- 👤 Perfil próprio editável
- 📧 Histórico de reservas
- 🔔 Notificações de status
- 📱 Interface mobile-friendly

## 🤝 Contribuição

### Configuração para Desenvolvimento

1. **Fork** o repositório
2. **Clone** sua fork
3. **Configure** o ambiente local
4. **Crie** uma branch para sua feature
5. **Desenvolva** e teste localmente
6. **Commit** com mensagens descritivas
7. **Push** e abra um **Pull Request**

### Padrões de Código

#### Commits Convencionais
```
feat: adiciona nova funcionalidade
fix: corrige bug existente
docs: atualiza documentação
style: mudanças de estilo/formatação
refactor: refatoração de código
test: adiciona ou modifica testes
chore: tarefas de manutenção
```

#### Estrutura de Branches
- `main`: Código em produção
- `develop`: Desenvolvimento ativo
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Atualizações de documentação

### Tecnologias Utilizadas - Versões Específicas

```json
{
  "dependencies": {
    "@prisma/client": "^6.16.3",
    "@vercel/node": "^5.3.24",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.1",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.7.0",
    "eslint": "^9.36.0",
    "prisma": "^6.16.3",
    "tsx": "^4.20.6",
    "typescript": "~5.8.3",
    "vite": "^5.4.20"
  }
}
```

---

## 💝 Sobre o Projeto

Este sistema foi desenvolvido com muito carinho para o casamento de **Flaviana & Vicenzo**, combinando tecnologia moderna com a tradição das listas de casamento. Cada linha de código foi pensada para tornar este momento especial ainda mais organizado e memorable.

**Desenvolvido com ❤️ para um amor que merece ser celebrado.**

---

### 📞 Contato e Suporte

- **Repositório**: [GitHub - Casandinhos](https://github.com/Vicenzolol/casandinhos)
- **Deploy**: [casandinhos.vercel.app](https://casandinhos.vercel.app)
- **Issues**: [GitHub Issues](https://github.com/Vicenzolol/casandinhos/issues)

---

*Última atualização: 1 de outubro de 2025*