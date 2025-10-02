"""
Models para requisições de manutenção
Implementa validações e relacionamentos seguindo princípios SOLID
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Requisicao(models.Model):
    """
    Model principal para requisições de manutenção
    Campos obrigatórios: solicitante, descricao, prioridade
    """
    PRIORIDADES = [
        ('alta', 'Alta'),
        ('media', 'Média'),
        ('baixa', 'Baixa'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]
    
    # Relacionamentos
    solicitante = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='requisicoes_enviadas',
        help_text='Usuário que criou a requisição'
    )
    aprovador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requisicoes_aprovadas',
        help_text='Usuário que aprovou a requisição'
    )
    executor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requisicoes_executadas',
        help_text='Usuário responsável pela execução'
    )
    
    # Campos principais
    titulo = models.CharField(max_length=200, help_text='Título resumido da requisição')
    descricao = models.TextField(help_text='Descrição detalhada do problema/necessidade')
    prioridade = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    # Campos adicionais
    localizacao = models.CharField(max_length=200, blank=True, help_text='Local onde a manutenção deve ser realizada')
    observacoes = models.TextField(blank=True, help_text='Observações adicionais')
    
    # Anexos (campo para armazenar caminho de arquivos)
    anexo = models.FileField(upload_to='anexos/%Y/%m/%d/', blank=True, null=True)
    
    # Timestamps para análise de dados
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    data_aprovacao = models.DateTimeField(null=True, blank=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-criado_em']  # Mais recentes primeiro
        verbose_name = 'Requisição'
        verbose_name_plural = 'Requisições'
        indexes = [
            models.Index(fields=['-criado_em']),
            models.Index(fields=['status', 'prioridade']),
        ]
    
    def __str__(self):
        return f"Req #{self.id} - {self.titulo} ({self.get_prioridade_display()})"
    
    def clean(self):
        """Validação customizada (OWASP - Input Validation)"""
        if not self.descricao or len(self.descricao.strip()) < 10:
            raise ValidationError('Descrição deve ter pelo menos 10 caracteres')
    
    def save(self, *args, **kwargs):
        self.full_clean()  # Executa validações antes de salvar
        super().save(*args, **kwargs)


class HistoricoRequisicao(models.Model):
    """
    Model para rastrear mudanças de status (Audit Log)
    Segue Single Responsibility Principle
    """
    requisicao = models.ForeignKey(Requisicao, on_delete=models.CASCADE, related_name='historico')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status_anterior = models.CharField(max_length=20, choices=Requisicao.STATUS_CHOICES)
    status_novo = models.CharField(max_length=20, choices=Requisicao.STATUS_CHOICES)
    observacao = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-criado_em']
        verbose_name = 'Histórico'
        verbose_name_plural = 'Históricos'
    
    def __str__(self):
        return f"Req #{self.requisicao.id}: {self.status_anterior} → {self.status_novo}"