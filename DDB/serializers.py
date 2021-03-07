from rest_framework import serializers
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, E2E, UI, STRESS, LONGEVITY, \
        LATEST_TC_STATUS, DEFAULT_DOMAIN_SUBDOMAIN, TC_INFO_GUI, TC_INFO_GUI, GUI_LATEST_TC_STATUS, TC_STATUS_GUI, \
        LOGSGUI,RELEASEBUILDSINFO, APPLICABILITY, AUTOMATION_COUNT

class AUTOMATION_COUNT_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = AUTOMATION_COUNT
        fields = "__all__"

class APPLICABILITY_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = APPLICABILITY
        fields = "__all__"

class RELEASE_BUILD_INFO_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = RELEASEBUILDSINFO
        fields = "__all__"

class GUI_LOGS_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = LOGSGUI
        fields = "__all__"

class TC_STATUS_GUI_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TC_STATUS_GUI
        fields = '__all__'

class LATEST_TC_STATUS_GUI_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = GUI_LATEST_TC_STATUS
        fields = '__all__'

class TC_INFO_GUI_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TC_INFO_GUI
        fields = '__all__'

class DOMAIN_SUBDOMAIN_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = DEFAULT_DOMAIN_SUBDOMAIN
        fields = '__all__'

class TC_INFO_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TC_INFO
        fields = '__all__'

class LATEST_TC_STATUS_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = LATEST_TC_STATUS
        fields = '__all__'

class TC_STATUS_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TC_STATUS
        fields = '__all__'

class TC_STATUS_GUI_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TC_STATUS_GUI
        fields = '__all__'

class USER_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = USER_INFO
        fields = '__all__'

class LOG_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = LOGS
        fields = '__all__'

class RELEASE_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = RELEASES
        fields = '__all__'

class E2E_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = E2E
        fields = '__all__'

class UI_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = UI
        fields = '__all__'

class STRESS_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = STRESS
        fields = '__all__'

class LONGEVITY_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = LONGEVITY
        fields = '__all__'

class AGGREGATION_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = AGGREGATE_TC_STATE
        fields = '__all__'
