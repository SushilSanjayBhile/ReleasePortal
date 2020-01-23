from django.forms import ModelForm
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI


class TcInfoForm(ModelForm):
    class Meta:
        model = TC_INFO
        fields = "__all__"

class TcStatusForm(ModelForm):
    class Meta:
        model = TC_STATUS
        fields = "__all__"

class GuiTcInfoForm(ModelForm):
    class Meta:
        model = TC_STATUS_GUI
        fields = "__all__"

class UserInfoForm(ModelForm):
    class Meta:
        model = USER_INFO
        fields = "__all__"

class LogForm(ModelForm):
    class Meta:
        model = LOGS
        fields = '__all__'

class ReleaseInfoForm(ModelForm):
    class Meta:
        model = RELEASES
        fields = '__all__'

class AggregationForm(ModelForm):
    class Meta:
        model = AGGREGATE_TC_STATE
        fields = "__all__"
