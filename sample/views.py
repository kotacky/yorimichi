from __future__ import unicode_literals
from django.template.response import TemplateResponse
from rest_framework_mongoengine.viewsets import ModelViewSet as MongoModelViewSet
from sample.serializers import *
from sample.models import Tool, M_Category, T_User_Category


def index_view(request):
    context = {}
    return TemplateResponse(request, 'index.html', context)

class ToolViewSet(MongoModelViewSet):
    """
    Contains information about inputs/outputs of a single program
    that may be used in Universe workflows.
    """
    lookup_field = 'id'
    serializer_class = ToolSerializer

    def get_queryset(self):
        return Tool.objects.all()

from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.views import APIView


# トップページを表示させる際に使用する
class top_view(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'sample_screen.html'

    def get(self, request):
        m_category = M_Category.objects.all()
        serializer = MCategorySerializer(m_category)
        return Response({'serializer': serializer, 'm_category': m_category})

class MCategoryViewSet(MongoModelViewSet):
    lookup_field = 'id'
    serializer_class = MCategorySerializer

    def get_queryset(self):
        return M_Category.objects.all()

class TUserCategoryViewSet(MongoModelViewSet):
    lookup_field = 'id'
    serializer_class = TUserCategorySerializer

    def get_queryset(self):
        return T_User_Category.objects.all()

class YorimitiViewSet(MongoModelViewSet):
    lookup_field = 'sub_category_name'
    serializer_class = MCategorySerializer

    def get_queryset(self):
        return M_Category.objects.all()

class RadioViewSet(MongoModelViewSet):
    lookup_field = 'category_name'
    serializer_class = MCategorySerializer

    def get_queryset(self):
        return M_Category.objects.all()