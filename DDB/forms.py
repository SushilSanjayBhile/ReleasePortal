from django.forms import ModelForm
#from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, E2E, STRESS, LONGEVITY, DEFAULT_VALUES, \
#        DEFAULT_DOMAIN, DEFAULT_SUBDOMAIN
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, E2E, STRESS, LONGEVITY, DEFAULT_VALUES, \
        DEFAULT_DOMAIN, DEFAULT_SUBDOMAIN, LATEST_TC_STATUS

class LatestStatusForm(ModelForm):
    class Meta:
        model = LATEST_TC_STATUS
        fields = "__all__"

class DomainForm(ModelForm):
    class Meta:
        model = DEFAULT_DOMAIN
        fields = "__all__"

class SubDomainForm(ModelForm):
    class Meta:
        model = DEFAULT_SUBDOMAIN
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

class DEFAULT_VALUES_FORM(ModelForm):
    class Meta:
        model = DEFAULT_VALUES
        fields = "__all__"
