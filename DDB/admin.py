from django.contrib import admin
from .models import AGGREGATE_TC_STATE, TC_INFO, USER_INFO, SETUP_INFO, \
    TC_STATUS, SANITY_RESULTS, RELEASES, LOGS

admin.site.register(AGGREGATE_TC_STATE)
admin.site.register(TC_INFO)
admin.site.register(USER_INFO)
admin.site.register(SETUP_INFO)
admin.site.register(TC_STATUS)
admin.site.register(SANITY_RESULTS)
admin.site.register(RELEASES)
admin.site.register(LOGS)
# Register your models here.
