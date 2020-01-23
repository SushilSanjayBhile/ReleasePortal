from django.urls import path
from .views import (TCSTATUSGETPOSTVIEW, USER_INFO_GET_POST_VIEW,
        USER_INFO_SPECIFIC_BY_ID, USER_INFO_SPECIFIC_BY_NAME, LOG,
        GETSETUPWISETCINFO, RELEASEINFO, GETPLATFORMWISETCINFO, RELEASEINFOPOST,
        GETPLATFORMANDSETUPWISETCINFO, TCAGGREGATE, DOMAINWISETCSTATUS, DOMAINWISETCINFO, USER_LOGIN_VIEW,
        GUITCSTATUSGETPOSTVIEW, createDB)

from .tcinfo import TC_INFO_GET_POST_VIEW, SPECIFIC_TC_INFO_BY_NAME, SPECIFIC_TC_INFO_BY_ID, WHOLE_TC_INFO, WHOLE_TC_INFO1, TC_INFO_PUT_VIEW

urlpatterns = [
    path('tcstatus/<str:Release>', TCSTATUSGETPOSTVIEW),
    path('guitcstatus/<str:Release>', GUITCSTATUSGETPOSTVIEW),
    path('<str:Release>/tcstatus/domain/<str:Domain>', DOMAINWISETCSTATUS),

    path('tcinfo/<str:Release>', TC_INFO_GET_POST_VIEW),
    path('tcinfo/<str:Release>/name/<str:name>/card/<str:card>', SPECIFIC_TC_INFO_BY_NAME),
    path('tcinfo/<str:Release>/id/<str:id>/card/<str:card>', SPECIFIC_TC_INFO_BY_ID),
    path('<str:Release>/tcinfo/domain/<str:Domain>', DOMAINWISETCINFO),
    path('tcinfoput/<str:Release>/id/<str:id>/card/<str:card>', TC_INFO_PUT_VIEW),

    path('wholetcinfo/<str:Release>', WHOLE_TC_INFO1),

    path('user/login', USER_LOGIN_VIEW),
    path('userinfo/', USER_INFO_GET_POST_VIEW),
    path('user/id/<int:id>/', USER_INFO_SPECIFIC_BY_ID),
    path('user/name/<str:uname>/', USER_INFO_SPECIFIC_BY_NAME),

    path('logs/', LOG),

    path('tcinfosetupwise/<str:SetupName>/', GETSETUPWISETCINFO),
    path('tcinfoplatformwise/<str:OrchestrationPlatform>/', GETPLATFORMWISETCINFO),
    path('platformandsetupwise/<str:OrchestrationPlatform>/<str:SetupName>/', GETPLATFORMANDSETUPWISETCINFO),

    path('release/<str:Release>', RELEASEINFO),
    path('release', RELEASEINFOPOST),
]
