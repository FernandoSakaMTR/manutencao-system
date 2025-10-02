markdown# Sistema de Requisição de Manutenção - MVP

Sistema completo para gerenciamento de requisições de manutenção com autenticação, roles e interface intuitiva.

## 🚀 Tecnologias

**Backend:**
- Python 3.11+
- Django 5.0
- Django REST Framework
- PostgreSQL / SQLite
- JWT Authentication

**Frontend:**
- React 18
- TypeScript
- TailwindCSS
- React Query
- Vite

## 📋 Pré-requisitos

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (opcional)

## 🔧 Setup de Desenvolvimento

### Backend

1. Clone o repositório e entre na pasta backend:
```bash
cd backend

Crie ambiente virtual e instale dependências:

bashpython -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

Configure variáveis de ambiente (copie .env.example para .env)
Execute migrações:

bashpython manage.py makemigrations
python manage.py migrate

Crie superusuário:

bashpython manage.py createsuperuser

Rode o servidor:

bashpython manage.py runserver
Frontend

Entre na pasta frontend:

bashcd frontend

Instale dependências:

bashnpm install

Rode em desenvolvimento:

bashnpm run dev

Acesse: http://localhost:5173

🐳 Setup com Docker
bashdocker-compose up --build
Acesse:

Frontend: http://localhost:5173
Backend: http://localhost:8000
API Docs: http://localhost:8000/api/docs/

📖 Documentação da API
Documentação interativa disponível em: http://localhost:8000/api/docs/
Endpoints Principais

POST /api/token/ - Login (retorna JWT)
GET /api/requisicoes/ - Lista requisições
POST /api/requisicoes/ - Cria requisição
GET /api/requisicoes/{id}/ - Detalhes
POST /api/requisicoes/{id}/atualizar_status/ - Atualiza status

🧪 Testes
bashcd backend
pytest
🔐 Segurança

Autenticação JWT
Validações OWASP
Permissions baseadas em roles
CORS configurado
Input validation

📦 Deploy
Frontend (Vercel)
bashcd frontend
npm run build
# Deploy pasta dist/
Backend (Railway/Heroku)
bash# Configure PostgreSQL
# Adicione variáveis de ambiente
# Push para repositório Git conectado
👥 Roles

Solicitante: Cria e visualiza suas requisições
Aprovador: Aprova e prioriza requisições
Executor: Atualiza status e conclui requisições

📝 Licença
MIT

---

## ✅ Checklist Final de Qualidade

### Backend
✅ Models com validações  
✅ Serializers com DRY  
✅ Permissions baseadas em roles  
✅ API RESTful documentada  
✅ JWT configurado  
✅ Testes unitários  
✅ Code formatting (Black/PEP8)  

### Frontend
✅ TypeScript para type safety  
✅ React Query para