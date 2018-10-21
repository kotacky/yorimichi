from mongoengine import Document, EmbeddedDocument, fields

class M_Category(Document):
    id = fields.StringField(required=True)
    category_id = fields.StringField(required=True)
    category_name = fields.StringField(required=True)
    sub_category_id = fields.StringField(required=True)
    sub_category_name = fields.StringField(required=True)

class T_User_Category(Document):
    id = fields.StringField(required=True)
    user_id = fields.StringField(required=True)
    category_id = fields.StringField(required=True)
    sub_category_id = fields.StringField(required=True)
    entry_date = fields.DateTimeField(required=True)

class Search_History(Document):
    id = fields.StringField(required=True)
    user_id = fields.StringField(required=True)
    search_place = fields.StringField(required=True)
    search_time = fields.DateTimeField(required=True)
    category_name = fields.StringField(required=True)

class ToolInput(EmbeddedDocument):
    id = fields.StringField(required=True)
    type = fields.ListField(fields.DynamicField(null=True))
    label = fields.StringField(required=True, null=True)
    description = fields.StringField(required=False, null=True)
    default = fields.DynamicField(required=False)
    inputBinding = fields.DynamicField(required=True)
    required = fields.BooleanField(required=False, default=True)


class ToolOutput(EmbeddedDocument):
    id = fields.StringField(required=True)
    type = fields.ListField(fields.DynamicField(null=True))
    label = fields.StringField(required=False)
    default = fields.DynamicField(required=False, null=True)
    description = fields.StringField(required=False)
    outputBinding = fields.DynamicField(required=False)
    required = fields.BooleanField(required=False, default=True)


class Tool(Document):
    id = fields.StringField(required=True, primary_key=True)
    # 'class' is a reserved word in python, so to get a field called "class", we use the following trick with vars():
    vars()['class'] = fields.StringField(verbose_name="class", required=True)
    label = fields.StringField(required=True)
    description = fields.StringField(required=True, null=True)
    owner = fields.ListField(fields.StringField())
    contributor = fields.ListField(fields.StringField())
    inputs = fields.EmbeddedDocumentListField(ToolInput)
    outputs = fields.EmbeddedDocumentListField(ToolOutput)
    baseCommand = fields.DynamicField(required=True)
    arguments = fields.DynamicField(required=True)
    requirements = fields.DynamicField(required=True, null=True)
    hints = fields.DynamicField(required=False, null=True)
    cwlVersion = fields.StringField(required=False, null=True, choices=['cwl:draft-2'])
    stdin = fields.StringField(required=False, null=True)
    stdout = fields.StringField(required=False, null=True)
    successCodes = fields.ListField(fields.IntField(), required=False)
    temporaryFailCodes = fields.ListField(fields.IntField(), required=False)
    permanentFailCodes = fields.ListField(fields.IntField(), required=False)

