from django.conf.urls import url
from common.routers import HybridRouter
from yorimichi.views import *

# We use a single global DRF Router that routes views from all apps in common
router = HybridRouter()

# app views and viewsets
# router.register(r'search', YorimitiViewSet, r"search")

# 参考 http://sandmark.hateblo.jp/entry/2017/10/05/162009
yorimichi_list = YorimichiViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
yorimichi_detail = YorimichiViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
yorimichi_search = YorimichiViewSet.as_view({
    'get': 'search',
})

yorimichi_history = SearchHistoryViewSet.as_view({
    'post': 'create'
})

search_history = GetSearchHistoryViewSet.as_view({
    'get': 'search',
})

crud_user_category = TUserCategoryViewSet.as_view({
    'get': 'search',
    'post': 'create',
    'delete': 'delete'
})

urlpatterns = [
    # common配下のurls.pyと紐づいている

    # TOP画面
    # http://127.0.0.1:8000/yorimichi/top/
    url(r'^top/', top_view.as_view(), name='top'),

    # -----------
    # 以下、API
    # -----------
    # M_Categoryテーブルを全件取得するAPI
    # http://127.0.0.1:8000/api/
    url(r'^api/$', yorimichi_list, name='yorimichi-list'),

    # viewのlookup_fieldに紐づくデータを取得するAPI
    # ?P<対象カラム>でそのあとの正規表現を紐づけている
    # 例) http://127.0.0.1:8000/yorimichi/api/サッカー/
    url(r'^api/(?P<sub_category_name>[-ー\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FD0]+)/$', yorimichi_detail, name='yorimichi-detail'),

    # M_CategoryテーブルをカテゴリーIDを条件に検索を行うAPI
    # 例) http://127.0.0.1:8000/yorimichi/api/1/search
    url(r'^api/([0-9a-z]+)/search', yorimichi_search, name='search'),

    # search_historyのCreateを行うAPI
    url(r'^api/create/create_search_history', yorimichi_history, name='yorimichi_history'),

    # Search_HistoryテーブルをユーザーIDを条件に検索を行うAPI
    # 例) http://127.0.0.1:8000/yorimichi/api/XXXX(user_id)/get_search_history
    url(r'^api/([0-9a-zA-Z]+)/get_search_history', search_history, name='search_history'),

    # T_User_Categoryテーブルの編集(削除、登録)を行うAPI
    url(r'^api/([0-9a-zA-Z]+)/crud_user_category', crud_user_category, name='crud'),

]