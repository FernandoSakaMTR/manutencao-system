"""
Serializers para API REST
Implementa validações e transformações de dados (DRY principle)
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Requisicao, HistoricoRequisicao
from apps.usuarios.models import PerfilUsuario

class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para usuários (evita exposição de dados sensíveis)"""
    role = serializers.CharField(source='perfil.role', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']


class HistoricoSerializer(serializers.ModelSerializer):
    """Serializer para histórico de mudanças"""
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = HistoricoRequisicao
        fields = ['id', 'status_anterior', 'status_novo', 'observacao', 'usuario_nome', 'criado_em']
        read_only_fields = ['id', 'criado_em']


class RequisicaoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para Requisições
    Inclui validações customizadas e campos read-only para segurança
    """
    solicitante_nome = serializers.CharField(source='solicitante.get_full_name', read_only=True)
    aprovador_nome = serializers.CharField(source='aprovador.get_full_name', read_only=True, allow_null=True)
    executor_nome = serializers.CharField(source='executor.get_full_name', read_only=True, allow_null=True)
    historico = HistoricoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Requisicao
        fields = [
            'id', 'titulo', 'descricao', 'prioridade', 'status', 'localizacao', 'observacoes',
            'anexo', 'solicitante', 'solicitante_nome', 'aprovador', 'aprovador_nome',
            'executor', 'executor_nome', 'criado_em', 'atualizado_em', 'data_aprovacao',
            'data_conclusao', 'historico'
        ]
        read_only_fields = ['id', 'solicitante', 'criado_em', 'atualizado_em']
    
    def validate_descricao(self, value):
        """Validação: descrição mínima de 10 caracteres"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Descrição deve ter pelo menos 10 caracteres.')
        return value
    
    def validate_titulo(self, value):
        """Validação: título não pode ser vazio"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError('Título deve ter pelo menos 5 caracteres.')
        return value
    
    def create(self, validated_data):
        """Override para adicionar solicitante automaticamente"""
        validated_data['solicitante'] = self.context['request'].user
        return super().create(validated_data)


class RequisicaoCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para criação (apenas campos necessários)"""
    
    class Meta:
        model = Requisicao
        fields = ['titulo', 'descricao', 'prioridade', 'localizacao', 'anexo']
    
    def validate_descricao(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Descrição deve ter pelo menos 10 caracteres.')
        return value


class RequisicaoUpdateStatusSerializer(serializers.Serializer):
    """Serializer para atualização de status (separado para clareza - SRP)"""
    status = serializers.ChoiceField(choices=Requisicao.STATUS_CHOICES)
    observacao = serializers.CharField(required=False, allow_blank=True)