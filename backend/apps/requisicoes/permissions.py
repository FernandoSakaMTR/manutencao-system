"""
Permissions customizadas baseadas em roles
Implementa controle de acesso granular (OWASP - Access Control)
"""
from rest_framework import permissions

class IsSolicitante(permissions.BasePermission):
    """Permite apenas usuários com role 'solicitante'"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'perfil') and
            request.user.perfil.role == 'solicitante'
        )


class IsAprovadorOrExecutor(permissions.BasePermission):
    """Permite apenas aprovadores ou executores"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'perfil'):
            return False
        
        return request.user.perfil.role in ['aprovador', 'executor']


class CanUpdateStatus(permissions.BasePermission):
    """
    Controla quem pode atualizar status:
    - Aprovador: pode aprovar (pendente → em_andamento)
    - Executor: pode atualizar progresso (em_andamento → concluido)
    """
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'perfil'):
            return False
        
        user_role = request.user.perfil.role
        
        # Aprovador pode aprovar requisições pendentes
        if user_role == 'aprovador' and obj.status == 'pendente':
            return True
        
        # Executor pode atualizar requisições em andamento
        if user_role == 'executor' and obj.status in ['em_andamento', 'pendente']:
            return True
        
        return False