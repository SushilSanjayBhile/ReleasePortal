from django.urls import path
from .views import (TCSTATUSGETPOSTVIEW, USER_INFO_GET_POST_VIEW,
        USER_INFO_SPECIFIC_BY_ID, USER_INFO_SPECIFIC_BY_NAME, LOG,
        GETSETUPWISETCINFO, RELEASEINFO, GETPLATFORMWISETCINFO, RELEASEINFOPOST,
        GETPLATFORMANDSETUPWISETCINFO, TCAGGREGATE, DOMAINWISETCSTATUS, DOMAINWISETCINFO, USER_LOGIN_VIEW,
        GUITCSTATUSGETPOSTVIEW, createDB, AddDomainSubDomain)
from .sanityViews import SANITY_VIEW
from .defaultViews import DEFAULT_DOMAIN_GET_POST_VIEW, DEFAULT_SUBDOMAIN_GET_POST_VIEW

from .e2eResultViews import e2eResultUpdate
from .statusViews import TC_STATUS_UPDATE_VIEW, GUI_TC_STATUS_UPDATE_VIEW
from .latestStatusUpdate import LATEST_STATUS_VIEW_UPDATE_ALL
from .tcinfo import TC_INFO_GET_POST_VIEW, GET_TC_INFO_BY_ID, WHOLE_TC_INFO, MULTIPLE_TC_UPDATION, \
        UPDATE_TC_INFO_BY_ID, TcCountByFilter,MULTIPLE_TC_INFO_UPDATION

from .getStatistics import BUG_WISE_BLOCKED_TCS 
from .gui import GUI_TC_INFO_GET_POST_VIEW, GUI_TC_STATUS_GET_POST_VIEW, GET_TC_INFO_GUI_ID, WHOLE_GUI_TC_INFO
from .releaseBuildInfo import RELEASEBUILDINFOGETPOSTVIEW

# my scripts
from .cleanup import RemoveStatus
from .migrate import Migrate

urlpatterns = [
    # my scripts URLs
    path('removestatus/<str:Release>', RemoveStatus),
    path('migrate', Migrate),

    #all api
    path('bugwiseblockedtcs/<str:Release>', BUG_WISE_BLOCKED_TCS),
    path('guitcstatusUpdate/<str:Release>', GUI_TC_STATUS_UPDATE_VIEW),
    path('tcstatus/<str:Release>', TCSTATUSGETPOSTVIEW),
    path('tcstatusUpdate/<str:Release>', TC_STATUS_UPDATE_VIEW),
    path('guitcstatus/<str:Release>', GUITCSTATUSGETPOSTVIEW),
    path('<str:Release>/tcstatus/domain/<str:Domain>', DOMAINWISETCSTATUS),
    path('lateststatusupdate/<str:Release>', LATEST_STATUS_VIEW_UPDATE_ALL),

    path('tcinfo/<str:Release>', TC_INFO_GET_POST_VIEW),
    path('tccount/<str:Release>', TcCountByFilter),
    path('<str:Release>/tcinfo/domain/<str:Domain>', DOMAINWISETCINFO),
    path('tcupdate/<str:Release>', MULTIPLE_TC_UPDATION),
    path('multipletcinfoupdate/<str:Release>', MULTIPLE_TC_INFO_UPDATION),

    path('tcinfogui/<str:Release>', GUI_TC_INFO_GET_POST_VIEW),
    path('tcstatusgui/<str:Release>', GUI_TC_STATUS_GET_POST_VIEW),
   # path('tcinfoGUIput/<str:Release>/id/<str:id>/card/<str:card>',UPDATE_TC_INFO_GUI_BY_ID)

    path('tccount/<str:Release>', TcCountByFilter),
    path('tcinfo/<str:Release>/id/<str:id>/card/<str:card>', GET_TC_INFO_BY_ID),
    path('tcinfoput/<str:Release>/id/<str:id>/card/<str:card>', UPDATE_TC_INFO_BY_ID),
    #path('tcinfo/<str:Release>/id/<str:id>/card/<str:card>', TC_INFO_BY_ID),

    path('wholetcinfo/<str:Release>', WHOLE_TC_INFO),
    path('wholeguitcinfo/<str:Release>', WHOLE_GUI_TC_INFO),
    path('tcinfogui/<str:Release>/id/<str:id>/browsername/<str:browserName>',GET_TC_INFO_GUI_ID),
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

    path('<str:Release>/options/add', AddDomainSubDomain),
    path('jenkinsBuild/',RELEASEBUILDINFOGETPOSTVIEW),
]
