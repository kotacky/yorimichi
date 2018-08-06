from rest_framework import serializers
from rest_framework_mongoengine import serializers as mongoserializers

from sample.models import Tool, M_Category, T_User_Category


class ToolSerializer(mongoserializers.DocumentSerializer):
    id = serializers.CharField(read_only=False)
    class Meta:
        model = Tool
        fields = '__all__'

class MCategorySerializer(mongoserializers.DocumentSerializer):
    class Meta:
        model = M_Category
        fields = '__all__'

class TUserCategorySerializer(mongoserializers.DocumentSerializer):
    class Meta:
        model = T_User_Category
        fields = '__all__'