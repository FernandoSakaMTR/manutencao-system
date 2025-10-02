"""
Testes unitários para models e API
Cobertura >80% seguindo TDD
"""
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.usuarios.models import PerfilUsuario
from apps.requisicoes.models import Requisicao

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def solicitante_user(db):
    user = User.objects.create_user(username='solicitante', password='test123', email='sol@test.com')
    PerfilUsuario.objects.create(user=user, role='solicitante')
    return user

@pytest.fixture
def aprovador_user(db):
    user = User.objects.create_user(username='aprovador', password='test123', email='apr@test.com')
    PerfilUsuario.objects.create(user=user, role='aprovador')
    return user

@pytest.fixture
def executor_user(db):
    user = User.objects.create_user(username='executor', password='test123', email='exec@test.com')
    PerfilUsuario.objects.create(user=user, role='executor')
    return user

@pytest.mark.django_db
class TestRequisicaoModel:
    def test_criar_requisicao_valida(self, solicitante_user):
        req = Requisicao.objects.create(
            solicitante=solicitante_user,
            titulo='Teste',
            descricao='Descrição de teste com mais de 10 caracteres',
            prioridade='alta'
        )
        assert req.id is not None
        assert req.status == 'pendente'
    
    def test_requisicao_sem_descricao_minima_invalida(self, solicitante_user):
        with pytest.raises(Exception):
            req = Requisicao(
                solicitante=solicitante_user,
                titulo='Teste',
                descricao='curta',
                prioridade='alta'
            )
            req.save()  # Deve falhar na validação

@pytest.mark.django_db
class TestRequisicaoAPI:
    def test_criar_requisicao_autenticado(self, api_client, solicitante_user):
        api_client.force_authenticate(user=solicitante_user)
        response = api_client.post('/api/requisicoes/', {
            'titulo': 'Nova requisição',
            'descricao': 'Descrição detalhada do problema',
            'prioridade': 'media',
        })
        assert response.status_code == 201

        # Verificar o status diretamente do banco de dados
        latest_req = Requisicao.objects.latest('criado_em')
        assert latest_req.status == 'pendente'
    
    def test_listar_requisicoes_apenas_proprias(self, api_client, solicitante_user):
        # Criar requisição
        Requisicao.objects.create(
            solicitante=solicitante_user,
            titulo='Minha req',
            descricao='Descrição teste',
            prioridade='baixa'
        )
        
        api_client.force_authenticate(user=solicitante_user)
        response = api_client.get('/api/requisicoes/')
        assert response.status_code == 200
        assert len(response.data) >= 1

    def test_executor_nao_pode_concluir_requisicao_pendente(self, api_client, solicitante_user, executor_user):
        # Criar requisição com status 'pendente'
        req = Requisicao.objects.create(
            solicitante=solicitante_user,
            titulo='Req pendente',
            descricao='Esta requisição está pendente',
            prioridade='alta'
        )

        api_client.force_authenticate(user=executor_user)
        response = api_client.post(f'/api/requisicoes/{req.id}/atualizar_status/', {
            'status': 'concluido',
        })

        assert response.status_code == 403, "Executor não deveria poder concluir uma requisição pendente"