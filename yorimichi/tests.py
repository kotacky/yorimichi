from django.test import TestCase
from yorimichi.models import Tool, M_Category, T_User_Category
from yorimichi.serializers import *
import json
from rest_framework_mongoengine.viewsets import ModelViewSet as MongoModelViewSet
from django.core import serializers

# Create your tests here.

"""
テストは「～/PycharmProjects/Agile/yorimichi」で「 python manage.py test 」を入力することで実行できる
"""

class M_CategoryTests(TestCase):

    # テストデータ
    test_category_id       = "99"
    test_category_name     = "カテゴリー名"
    test_sub_category_id   = "999"
    test_sub_category_name = "サブカテゴリー名"

    """
    テスト実行前
    """
    def setUp(self):
        # テスト用のデータを登録
        mCategory = M_Category()
        # idは指定しない
        mCategory.id                = None
        mCategory.category_id       = self.test_category_id
        mCategory.category_name     = self.test_category_name
        mCategory.sub_category_id   = self.test_sub_category_id
        mCategory.sub_category_name = self.test_sub_category_name
        mCategory.save()

    # テストデータを取得
    def find_testData(self):
        return M_Category.objects.filter(category_id=      self.test_category_id,
                                         category_name=    self.test_category_name,
                                         sub_category_id=  self.test_sub_category_id,
                                         sub_category_name=self.test_sub_category_name)

    """
    テスト
    """
    # テスト用のデータが登録されていることを確認
    def test_find_testData(self):
        mCategory = self.find_testData()
        print("【クエリ取得結果】M_CategoryTests.test_find_testData")
        print("{}".format(mCategory.to_json(ensure_ascii=False,indent=4)))
        self.assertEqual(mCategory.count(), 1)
        self.assertEqual(mCategory.get().category_id,       self.test_category_id)
        self.assertEqual(mCategory.get().category_name,     self.test_category_name)
        self.assertEqual(mCategory.get().sub_category_id,   self.test_sub_category_id)
        self.assertEqual(mCategory.get().sub_category_name, self.test_sub_category_name)

    """ 
    テスト実行後
    """
    def tearDown(self):
        # テスト用に登録したデータを削除
        self.find_testData().delete()

