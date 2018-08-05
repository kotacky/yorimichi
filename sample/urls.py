from django.conf.urls import url
from common.routers import HybridRouter
from sample.views import *

# We use a single global DRF Router that routes views from all apps in common
router = HybridRouter()

# app views and viewsets
# router.register(r'search', YorimitiViewSet, r"search")

urlpatterns = [
    # common配下のurls.pyと紐づいている

    # TOP画面
    # http://127.0.0.1:8000/sample/top/
    url(r'^top/', top_view.as_view(), name='top'),

    # ?P<対象カラム>でそのあとの正規表現を紐づけている模様
    url(r'^search/(?P<sub_category_name>[-ー\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FD0]+]+)/$', YorimitiViewSet.as_view({'get': 'retrieve'}), name='search'),
    url(r'^radio_search/(?P<category_name>[-ー\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FD0]+]+)', RadioViewSet.as_view({'get': 'list'}), name='list'),
]