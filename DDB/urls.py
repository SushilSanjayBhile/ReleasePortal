from django.urls import path
from .views import (TCSTATUSGETPOSTVIEW, USER_INFO_GET_POST_VIEW,
        USER_INFO_SPECIFIC_BY_ID, USER_INFO_SPECIFIC_BY_NAME, LOG,
        GETSETUPWISETCINFO, RELEASEINFO, GETPLATFORMWISETCINFO, RELEASEINFOPOST,
        GETPLATFORMANDSETUPWISETCINFO, TCAGGREGATE, DOMAINWISETCSTATUS, DOMAINWISETCINFO, USER_LOGIN_VIEW,
        GUITCSTATUSGETPOSTVIEW, createDB)
from .sanityViews import SANITY_VIEW
from .defaultViews import DEFAULT_VALUES_GET_POST_VIEW, DEFAULT_VALUES_PUT_DELETE_VIEW, DEFAULT_DOMAIN_GET_POST_VIEW, DEFAULT_SUBDOMAIN_GET_POST_VIEW

from .e2eResultViews import e2eResultUpdate
from .statusViews import TC_STATUS_UPDATE_VIEW
from .latestStatusUpdate import LATEST_STATUS_VIEW_UPDATE_ALL
from .tcinfo import TC_INFO_GET_POST_VIEW, GET_TC_INFO_BY_ID, WHOLE_TC_INFO, MULTIPLE_TC_UPDATION, UPDATE_TC_INFO_BY_ID, TcCountByFilter, WHOLE_GUI_TC_INFO
#from .tcinfo import TC_INFO_GET_POST_VIEW, TC_INFO_BY_ID, WHOLE_TC_INFO, MULTIPLE_TC_UPDATION, TC_INFO_BY_ID, TcCountByFilter, WHOLE_GUI_TC_INFO

urlpatterns = [
    path('tcstatus/<str:Release>', TCSTATUSGETPOSTVIEW),
    path('tcstatusUpdate/<str:Release>', TC_STATUS_UPDATE_VIEW),
    path('guitcstatus/<str:Release>', GUITCSTATUSGETPOSTVIEW),
    path('<str:Release>/tcstatus/domain/<str:Domain>', DOMAINWISETCSTATUS),
    path('lateststatusupdate/<str:Release>', LATEST_STATUS_VIEW_UPDATE_ALL),

    path('tcinfo/<str:Release>', TC_INFO_GET_POST_VIEW),
    path('tccount/<str:Release>', TcCountByFilter),
    path('<str:Release>/tcinfo/domain/<str:Domain>', DOMAINWISETCINFO),
    path('tcupdate/<str:Release>', MULTIPLE_TC_UPDATION),

    path('tcinfo/<str:Release>/id/<str:id>/card/<str:card>', GET_TC_INFO_BY_ID),
    path('tcinfoput/<str:Release>/id/<str:id>/card/<str:card>', UPDATE_TC_INFO_BY_ID),
    #path('tcinfo/<str:Release>/id/<str:id>/card/<str:card>', TC_INFO_BY_ID),

    path('wholetcinfo/<str:Release>', WHOLE_TC_INFO),
    path('wholeguitcinfo/<str:Release>', WHOLE_GUI_TC_INFO),

    path('sanity/<str:SanityType>/<str:Release>', SANITY_VIEW),

    path('user/login', USER_LOGIN_VIEW),
    path('userinfo/', USER_INFO_GET_POST_VIEW),
    path('user/id/<int:id>/', USER_INFO_SPECIFIC_BY_ID),
    path('user1/name/<str:email>/', USER_INFO_SPECIFIC_BY_NAME),

    path('logs/<str:Release>', LOG),

    path('tcinfosetupwise/<str:SetupName>/', GETSETUPWISETCINFO),
    path('tcinfoplatformwise/<str:OrchestrationPlatform>/', GETPLATFORMWISETCINFO),
    path('platformandsetupwise/<str:OrchestrationPlatform>/<str:SetupName>/', GETPLATFORMANDSETUPWISETCINFO),

    path('release/<str:Release>', RELEASEINFO),
    path('release', RELEASEINFOPOST),
    path('updatee2eresult', e2eResultUpdate),

    path('defaultvalue/<str:Release>/<str:key>', DEFAULT_VALUES_GET_POST_VIEW),
    path('defaultvalue/<str:Release>/<str:key>', DEFAULT_VALUES_PUT_DELETE_VIEW),

    path('<str:Release>/options/add', DEFAULT_DOMAIN_GET_POST_VIEW),
    path('<str:Release>/options/add/subdomain', DEFAULT_SUBDOMAIN_GET_POST_VIEW),
]
