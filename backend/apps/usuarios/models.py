"""
Models para gerenciamento de usuários e roles
Estende User do Django para adicionar roles específicos
"""
from django.db import models
from django.contrib.auth.models import User

class PerfilUsuario(models.Model):
    """
    Perfil estendido do usuário com role específico do sistema
    ROLES: solicitante (envia requisições), aprovador (prioriza/aprova), executor (atualiza status)
    """
    ROLES = [
        ('solicitante', 'Solicitante'),
        ('aprovador', 'Aprovador'),
        ('executor', 'Executor'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    role = models.CharField(max_length=20, choices=ROLES, default='solicitante')
    telefone = models.CharField(max_length=20, blank=True, null=True)
    setor = models.CharField(max_length=100, blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil de Usuário'
        verbose_name_plural = 'Perfis de Usuários'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"