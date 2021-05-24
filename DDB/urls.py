from django.urls import path
from .views import (TCSTATUSGETPOSTVIEW, USER_INFO_GET_POST_VIEW,
        USER_INFO_SPECIFIC_BY_ID, USER_INFO_SPECIFIC_BY_NAME, LOG,
        GETSETUPWISETCINFO, RELEASEINFO, GETPLATFORMWISETCINFO, RELEASEINFOPOST,
        GETPLATFORMANDSETUPWISETCINFO, TCAGGREGATE, DOMAINWISETCSTATUS, DOMAINWISETCINFO, USER_LOGIN_VIEW,DOMAINWISERELEASEINFO,
        GUITCSTATUSGETPOSTVIEW, createDB, AddDomainSubDomain, RELEASEWISE_CLI_PLATFORM,RELEASEWISE_GUI_PLATFORM, TCAGGREGATE_DASHBOARD)
from .sanityViews import SANITY_VIEW
from .defaultViews import DEFAULT_DOMAIN_GET_POST_VIEW, DEFAULT_SUBDOMAIN_GET_POST_VIEW

from .e2eResultViews import e2eResultUpdate
from .statusViews import TC_STATUS_UPDATE_VIEW, GUI_TC_STATUS_UPDATE_VIEW
from .latestStatusUpdate import LATEST_STATUS_VIEW_UPDATE_ALL
from .tcinfo import TC_INFO_GET_POST_VIEW, GET_TC_INFO_BY_ID, WHOLE_TC_INFO, MULTIPLE_TC_UPDATION, \
        UPDATE_TC_INFO_BY_ID, TcCountByFilter,MULTIPLE_TC_INFO_UPDATION, sync_tcs, sync_platform, duplicate_tcs, duplicate_tcs_gui, duplicate_tcs_by_rel,duplicate_tcs_by_rel_gui

from .getStatistics import BUG_WISE_BLOCKED_TCS 
from .gui import GUI_TC_INFO_GET_POST_VIEW, GUI_TC_STATUS_GET_POST_VIEW, GET_TC_INFO_GUI_ID, WHOLE_GUI_TC_INFO,MULTIPLE_TC_UPDATION_GUI
from .releaseBuildInfo import RELEASEBUILDINFOGETPOSTVIEW,RELEASEBUILDINFODELETEVIEW
from .createRelease import mergeDB
from .removeReleaseResults import  removeOldReleaseData
from .applicability import Applicable, AddPlatform,GetPlatformList, GetPlatformWiseTCList, update_rootRelease
from .automationCount import *
from .domain_subdomain import get_domain_subdomain_list
from .createDB import *

# my scripts
from .cleanup import RemoveStatus
from .migrate import Migrate
from .new import automation_count_get_post_view, custom_automation_count_get_view

from .mergeCardType import MergingCardTypes


urlpatterns = [
    path('mergecardtype/', MergingCardTypes),
    path ('getdomainsubdomainlist/<str:release>/<str:interface>', get_domain_subdomain_list),

    #Automation Count
    path('automationCount/<str:Release>', AutomationCount),
    path('automationCountForGUI/<str:Release>', AutomationCountForGUI),
    path('applicabilityData/<str:Release>', ApplicabilityData),
    path('automationCountByDomain/<str:Platform>', AutomationCountByDomain),
    path('automationCountByDomainForGUI/<str:Platform>', GUIAutomationCountByDomain),
    path('automation/', automation_count_get_post_view),
    path('customautomation/', custom_automation_count_get_view),

    #applicability api's
    path('applicable/platformList/', GetPlatformList),
    path('applicable/platformwisetc/<str:platform>', GetPlatformWiseTCList),
    path('applicable/<str:Release>', Applicable),
    #path('applicable/', Applicable),
    path('updateapplicable/', update_rootRelease),
    path('applicable/add/<str:Platform>', AddPlatform),
    #path('applicable/add/<str:Platform>/Release/<str:Release>/Interface/<str:Interface>', AddPlatform),

    # my scripts URLs
    path('removestatus/<str:Release>', RemoveStatus),
    path('migrate/<str:typ>', Migrate),
    path('updateOldStatusData/<str:Release>',removeOldReleaseData),

    #all api
    path('mergeDB/<str:Release>', mergeDB),
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
    path('sync', sync_tcs),
    path('wholeguitcinfo/<str:Release>', WHOLE_GUI_TC_INFO),
    path('tcinfogui/<str:Release>/id/<str:id>/browsername/<str:browserName>/cardType/<str:cardType>', GET_TC_INFO_GUI_ID),
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
    path('release/<str:Release>/<str:Domain>', DOMAINWISERELEASEINFO),
    path('release', RELEASEINFOPOST),
    path('cleanupdb', cleanupdb),
    path('updatee2eresult', e2eResultUpdate),

    path('<str:Release>/options/add', AddDomainSubDomain),
    path('<str:Release>/options/delete', AddDomainSubDomain),
    path('jenkinsBuild/',RELEASEBUILDINFOGETPOSTVIEW),
    path('jenkinsBuildDelete/',RELEASEBUILDINFODELETEVIEW),
    path('releasewiseplatformCli/<str:Release>', RELEASEWISE_CLI_PLATFORM),
    path('releasewiseplatformGui/<str:Release>', RELEASEWISE_GUI_PLATFORM),
    path('syncp', sync_platform),
    path('duptc', duplicate_tcs),
    path('dupbyrel',duplicate_tcs_by_rel),
    path('dupbyrelgui',duplicate_tcs_by_rel_gui),
    path('duptcgui', duplicate_tcs_gui),
    path('tcupdategui/<str:Release>', MULTIPLE_TC_UPDATION_GUI),
    path('release_all_info/releaseName/<str:Release>', TCAGGREGATE_DASHBOARD)
]
