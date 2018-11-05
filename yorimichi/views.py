from __future__ import unicode_literals
from django.template.response import TemplateResponse
from rest_framework_mongoengine.viewsets import ModelViewSet as MongoModelViewSet
from yorimichi.serializers import *
from yorimichi.models import Tool, M_Category, T_User_Category, Search_History
from django.http import HttpResponse

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

class MCategoryViewSet(MongoModelViewSet):
    lookup_field = 'id'
    serializer_class = MCategorySerializer

    def get_queryset(self):
        return M_Category.objects.all()
    def delete(self,request):
        M_Category.objects.all().delete();
        return HttpResponse("【M_Category】 削除完了")

class TUserCategoryViewSet(MongoModelViewSet):
    lookup_field = 'id'
    serializer_class = TUserCategorySerializer

    def get_queryset(self):
        return T_User_Category.objects.all()

class SearchHistoryViewSet(MongoModelViewSet):
    lookup_field = 'id'
    serializer_class = SearchHistorySerializer

    def get_queryset(self):
        return Search_History.objects.all()

from rest_framework.decorators import  detail_route
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.views import APIView

# ------------------------------------
# トップページを表示させる際に使用する
# ------------------------------------
class top_view(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'yorimichi_screen.html'

    def get(self, request):
        m_category = M_Category.objects.all()
        serializer = MCategorySerializer(m_category)
        return Response({'serializer': serializer, 'm_category': m_category})

# ------------------------------------
# rest frameworkを利用してAPIを作成
# ------------------------------------
class YorimichiViewSet(MongoModelViewSet):
    lookup_field = 'sub_category_name'
    queryset = M_Category.objects.all()
    serializer_class = MCategorySerializer

    # @detail_routeを使用して、独自のsearchアクションを作成
    @detail_route()
    def search(self, request, *args, **kwargs):
        print("【YorimichiViewSet.search処理開始】")
        print("【検索条件】category_id = " + repr(args[0]))
        mCategory = M_Category.objects.all().filter(category_id=args[0])
        serializer = self.get_serializer(mCategory, many=True)
        print("【M_Categoryテーブル取得結果】" + repr(serializer.data))
        print("【YorimichiViewSet.search処理終了】")
        return Response(serializer.data)

