"""
Views da API usando ViewSets do DRF
Implementa lógica de negócio seguindo Clean Code
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Requisicao, HistoricoRequisicao
from .serializers import (
    RequisicaoSerializer, 
    RequisicaoCreateSerializer,
    RequisicaoUpdateStatusSerializer
)
from .permissions import CanUpdateStatus

class RequisicaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD de Requisições
    
    Endpoints:
    - GET /api/requisicoes/ - Lista todas as requisições (filtros disponíveis)
    - POST /api/requisicoes/ - Cria nova requisição
    - GET /api/requisicoes/{id}/ - Detalhes de uma requisição
    - PUT/PATCH /api/requisicoes/{id}/ - Atualiza requisição
    - DELETE /api/requisicoes/{id}/ - Deleta requisição
    - POST /api/requisicoes/{id}/atualizar_status/ - Atualiza status
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'prioridade', 'solicitante']
    search_fields = ['titulo', 'descricao', 'localizacao']
    ordering_fields = ['criado_em', 'prioridade']
    ordering = ['-criado_em']  # Default: mais recentes primeiro
    
    def get_queryset(self):
        """
        Filtra requisições baseado no role do usuário:
        - Solicitante: vê apenas suas próprias requisições
        - Aprovador/Executor: vê todas as requisições
        """
        user = self.request.user
        
        if not hasattr(user, 'perfil'):
            return Requisicao.objects.none()
        
        if user.perfil.role == 'solicitante':
            return Requisicao.objects.filter(solicitante=user)
        
        # Aprovadores e executores veem todas
        return Requisicao.objects.all()
    
    def get_serializer_class(self):
        """Usa serializer apropriado baseado na ação"""
        if self.action == 'create':
            return RequisicaoCreateSerializer
        return RequisicaoSerializer
    
    def perform_create(self, serializer):
        """Adiciona solicitante automaticamente na criação"""
        serializer.save(solicitante=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanUpdateStatus])
    def atualizar_status(self, request, pk=None):
        """
        Endpoint customizado para atualizar status da requisição
        Cria registro no histórico automaticamente
        """
        requisicao = self.get_object()
        serializer = RequisicaoUpdateStatusSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        novo_status = serializer.validated_data['status']
        observacao = serializer.validated_data.get('observacao', '')
        
        # Validações de transição de status
        if not self._validar_transicao_status(requisicao.status, novo_status, request.user):
            return Response(
                {'erro': 'Transição de status não permitida'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Salva status anterior para histórico
        status_anterior = requisicao.status
        
        # Atualiza requisição
        requisicao.status = novo_status
        
        # Atualiza campos de timestamp conforme status
        if novo_status == 'em_andamento' and not requisicao.data_aprovacao:
            requisicao.data_aprovacao = timezone.now()
            requisicao.aprovador = request.user
        elif novo_status == 'concluido':
            requisicao.data_conclusao = timezone.now()
            requisicao.executor = request.user
        
        requisicao.save()
        
        # Cria registro no histórico
        HistoricoRequisicao.objects.create(
            requisicao=requisicao,
            usuario=request.user,
            status_anterior=status_anterior,
            status_novo=novo_status,
            observacao=observacao
        )
        
        return Response(
            RequisicaoSerializer(requisicao).data,
            status=status.HTTP_200_OK
        )
    
    def _validar_transicao_status(self, status_atual, novo_status, user):
        """
        Valida se a transição de status é permitida baseado no role
        Regras de negócio centralizadas
        """
        if not hasattr(user, 'perfil'):
            return False
        
        user_role = user.perfil.role
        
        # Aprovador: pendente → em_andamento
        if user_role == 'aprovador':
            return status_atual == 'pendente' and novo_status == 'em_andamento'
        
        # Executor: em_andamento → concluido ou cancelado
        if user_role == 'executor':
            return status_atual in ['pendente', 'em_andamento'] and novo_status in ['concluido', 'cancelado']
        
        return False
    
    @action(detail=False, methods=['get'])
    def minhas_requisicoes(self, request):
        """Endpoint para listar apenas requisições do usuário logado"""
        requisicoes = Requisicao.objects.filter(solicitante=request.user)
        page = self.paginate_queryset(requisicoes)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(requisicoes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendentes(self, request):
        """Endpoint para listar apenas requisições pendentes"""
        requisicoes = self.get_queryset().filter(status='pendente')
        page = self.paginate_queryset(requisicoes)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(requisicoes, many=True)
        return Response(serializer.data)