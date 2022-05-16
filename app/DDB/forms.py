from django.forms import ModelForm
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, E2E, UI, STRESS, LONGEVITY, \
        DEFAULT_DOMAIN_SUBDOMAIN, LATEST_TC_STATUS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LOGSGUI,RELEASEBUILDSINFO, \
        APPLICABILITY, AUTOMATION_COUNT

class AUTOMATION_COUNT_FORM(ModelForm):
    class Meta:
        model = AUTOMATION_COUNT
        fields = "__all__"

class APPLICABILITY_FORM(ModelForm):
    class Meta:
        model = APPLICABILITY
        fields = "__all__"

class RELEASEBUILDINFO_Form(ModelForm):
    class Meta:
        model = RELEASEBUILDSINFO
        fields = "__all__"

class GuiLogsForm(ModelForm):
    class Meta:
        model = LOGSGUI
        fields = "__all__"

class GuiStatusForm(ModelForm):
    class Meta:
        model = GUI_TC_STATUS
        fields = "__all__"

class GuiLatestStatusForm(ModelForm):
    class Meta:
        model = GUI_LATEST_TC_STATUS
        fields = "__all__"

class GuiInfoForm(ModelForm):
    class Meta:
        model = TC_INFO_GUI
        fields = "__all__"

class LatestStatusForm(ModelForm):
    class Meta:
        model = LATEST_TC_STATUS
        fields = "__all__"

class DomainSubDomainForm(ModelForm):
    class Meta:
        model = DEFAULT_DOMAIN_SUBDOMAIN
        fields = "__all__"

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

class E2EForm(ModelForm):
    class Meta:
        model = E2E
        fields = "__all__"

class UIForm(ModelForm):
    class Meta:
        model = UI
        fields = "__all__"

class StressForm(ModelForm):
    class Meta:
        model = STRESS
        fields = "__all__"

class LongevityForm(ModelForm):
    class Meta:
        model = LONGEVITY
        fields = "__all__"

class AggregationForm(ModelForm):
    class Meta:
        model = AGGREGATE_TC_STATE
        fields = "__all__"
