"""
URLs do app de requisições
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RequisicaoViewSet

router = DefaultRouter()
router.register(r'requisicoes', RequisicaoViewSet, basename='requisicao')

urlpatterns = [
    path('', include(router.urls)),
]