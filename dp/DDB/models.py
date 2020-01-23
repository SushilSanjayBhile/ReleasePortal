from django.db import models
from django.contrib.postgres.fields import ArrayField
# import datetime

# Table per release
class AGGREGATE_TC_STATE(models.Model):
    Domain = models.CharField(max_length=50, blank = True) #storage, networking
    Total = models.IntegerField(default = 0)
    Automated = models.IntegerField(default = 0)
    Pass = models.IntegerField(default = 0)
    Fail = models.IntegerField(default = 0)

    def __str__(self):
        return self.Domain

# Table per release
class TC_INFO(models.Model):
    # TcID = models.CharField(max_length = 200, blank = False, primary_key=True)
    TcID = models.CharField(max_length = 200, blank = False)
    TcName = models.CharField(max_length = 2000, default = "NOT AUTOMATED")
    Domain = models.CharField(max_length=50, default = "UNKNOWN")  #storage, nw
    SubDomain = models.CharField(max_length=50, default = "UNKNOWN")  #remote, local, mirroring
    Scenario = models.CharField(max_length = 200, blank = True, default = "UNKNOWN") #stress, standard, negative
    Description = models.TextField(blank = True)
    ExpectedBehaviour = models.CharField(max_length = 5000, blank = True)
    Notes = models.CharField(max_length = 2000, blank = True)
    CardType = models.CharField(max_length = 100, blank = True, default=None)
    ServerType = ArrayField(models.CharField(max_length = 10, blank = True, default=None), blank = True)
    # OrchestrationPlatform = ArrayField(models.CharField(max_length = 10, blank = True, default = "UNKNOWN"), blank = True, default = list)
    Status = models.CharField(max_length = 50, blank = True, default = "CREATED")
    Date = models.DateTimeField(auto_now = True, blank = True)
    Assignee = models.CharField(max_length = 50, blank = True, default = "UNKNOWN")
    Creator = models.CharField(max_length = 50, blank = True, default = "ANONYMOUS")
    Tag = models.CharField(max_length = 20, blank = True, default = "NO TAG")
    Priority = models.CharField(max_length = 3, blank = True, default = "P4")

    def __str__(self):
        return self.TcID

# table per release
class DEFAULT_VALUES(models.Model):
    CardType = ArrayField(models.CharField(max_length = 20, blank = True), blank = True) # nynj / bos
    ServerType = ArrayField(models.CharField(max_length = 20, blank = True), blank = True) # dell, lenovo, software
    StatusValues = ArrayField(models.CharField(max_length = 20, blank = True), blank = True) # assigned, completed, manual_assigned, automation_completed
    UserRoles = ArrayField(models.CharField(max_length = 20, blank = True), blank = True) # dev, ui, automation tester, manual tester
    UserPermission = ArrayField(models.CharField(max_length = 20, blank = True), blank = True) # admin, user

# Universal
class USER_INFO(models.Model):
    Name = models.CharField(max_length = 100, blank = True)
    UserName = models.CharField(primary_key = True, max_length = 100, blank = False)
    Role = models.CharField(max_length = 10, default = "ENGG") # user / admin

    def __str__(self):
        return self.Name

# Table per release [Reason for maintaining into every release is, setups can be broken or nodes can be combined]
class SETUP_INFO(models.Model):
    State = (('Failed', 'Failed'), ('Good','Good'))
    Status = (('Idle','Idle'), ('In-use','In-Use'))

    SetupName = models.CharField(max_length = 20, primary_key = True)
    OwnerId = models.ForeignKey(USER_INFO, blank = False, on_delete = models.PROTECT, related_name = 'Owner')
    CurrentUserId = models.ForeignKey(USER_INFO, blank = True, on_delete = models.PROTECT, related_name = 'User')
    Inventory = models.CharField(max_length = 5000, blank = False)
    ClusterState = models.CharField(max_length = 6, choices = State) # in failed state to debug
    ClusterStatus = models.CharField(max_length = 6, choices = Status) # using or idle or running sanity

    def __str__(self):
        return self.SetupName

# Table per release
class TC_STATUS(models.Model):
    TcID = models.CharField(max_length = 200, blank = False)
    TcName = models.CharField(max_length = 2000, blank = True)
    Build = models.CharField(max_length = 1000, blank = True)
    Result = models.CharField(max_length = 14, blank = True)
    Bugs = models.CharField(max_length = 500, blank = True) # we can make this as list field also
    Date = models.DateTimeField(auto_now = True, blank = True)
    Domain = models.CharField(max_length=50, blank = True)  #storage, nw
    SubDomain = models.CharField(max_length=50, blank = True)  #remote, local, mirroring
    CardType = models.CharField(max_length = 10, default="BOS/NYNJ")
    # Logs = models.TextField()

    def __str__(self):
        return "TCID={0}".format(self.TcID)

# Table per release
class TC_STATUS_GUI(models.Model):
    TcID = models.CharField(max_length = 200, blank = False)
    # TcName = models.CharField(max_length = 2000, default="NOT AUTOMATED")

    BuildUbuntuChrome = models.CharField(max_length = 20, blank = True, default="BLANK")
    BuildUbuntuFirefox = models.CharField(max_length = 20, blank = True, default="BLANK")
    BuildWindowsChrome = models.CharField(max_length = 20, blank = True, default="BLANK")
    BuildWindowsFirefox = models.CharField(max_length = 20, blank = True, default="BLANK")
    BuildWindowsIE = models.CharField(max_length = 20, blank = True, default="BLANK")
    BuildMacSafari = models.CharField(max_length = 20, blank = True, default="BLANK")

    ResultUbuntuChrome = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    ResultUbuntuFirefox = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    ResultWindowsIE = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    ResultWindowsChrome = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    ResultWindowsFirefox = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    ResultMacSafari = models.CharField(max_length = 20, blank = True, default="NOT TESTED")
    
    Bug = models.CharField(max_length = 500, blank = True, default="NO BUG") # we can make this as list field also
    Date = models.DateTimeField(auto_now = False, blank = True)
    Domain = models.CharField(max_length=50, blank = True, default="UNKNOWN")  #storage, nw
    SubDomain = models.CharField(max_length=50, blank = True, default="UNKNOWN")  #remote, local, mirroring
    CardType = models.CharField(max_length = 10, blank = True, default="BLANK")
    # Logs = models.TextField()

    def __str__(self):
        return "TCID={0}".format(self.TcID)

# Table per release
class SANITY_RESULTS(models.Model):
    SanityType = (("Daily","Daily"),("Weekly","Weekly"), ("Sanity","Sanity"))
    Result = (("Pass","Pass"), ("Fail","Fail")) 

    SanityId = models.AutoField(primary_key = True) 
    Tag = models.CharField(max_length=6, choices = SanityType, default = "Daily", blank = False)
    Build = models.CharField(max_length=10, blank = False)
    Result = models.CharField(max_length=10, choices = Result, blank = False)
    Logs = models.TextField()
    Setup = models.ForeignKey(SETUP_INFO, on_delete = models.PROTECT)
    Timestamp = models.DateTimeField(auto_now = False, blank = True)

    def __str__(self):
        return "{0}{1}".format(self.SanityId, self.Timestamp)

# UNIVERSAL DATABASE ENTITY
class RELEASES(models.Model):
    ReleaseNumber = models.CharField(max_length = 10, blank = False, primary_key = True)
    BuildNumberList = ArrayField(models.CharField(max_length = 50, blank = True), blank = True)
    Engineers = ArrayField(models.CharField(max_length = 50, blank = True, null = True), blank = True, null = True)
    CardType = ArrayField(models.CharField(max_length = 100, blank = True), blank = True)
    ServerType = ArrayField(models.CharField(max_length = 100, blank = True), blank = True)
    SetupsUsed = ArrayField(models.CharField(max_length = 100, blank = True), blank = True)
    QAStartDate = models.DateTimeField(auto_now = False, blank = True, null=True)
    TargetedReleaseDate = models.DateTimeField(auto_now = False, blank = True, null=True)
    ActualReleaseDate = models.DateTimeField(auto_now = False, blank = True, null=True)
    TargetedCodeFreezeDate = models.DateTimeField(auto_now = False, blank = True, null=True)
    UpgradeTestingStartDate = models.DateTimeField(auto_now = False, blank = True, null=True)
    UpgradeMetrics = ArrayField(models.CharField(max_length = 100, blank = True), blank = True, null = True)
    Customers = ArrayField(models.CharField(max_length = 100, blank = True), blank = True)
    FinalBuild = models.CharField(max_length = 100, blank = True)
    FinalOS =  models.CharField(max_length = 100, blank = True)
    FinalDockerCore = models.CharField(max_length = 100, blank = True)
    UbootVersion = models.CharField(max_length = 100, blank = True)
    RedFlagsRisks = models.TextField(blank = True)
    AutomationSyncUp = models.TextField(blank = True)
    QARateOfProgress = models.IntegerField(default = -1, blank = True)
    Priority = models.CharField(max_length = 2, blank = True, null = True)

    def __str__(self):
        return self.ReleaseNumber


# # Universal
# class WORKSHEET(models.Model):
#     UserID = models.ForeignKey(USER_INFO, on_delete = models.PROTECT)
#     Release = models.ForeignKey(RELEASES, on_delete = models.PROTECT)
#     Timestamp = models.CharField(max_length=25, blank = False)
#     Work = models.TextField()


class LOGS(models.Model):
    logNo = models.AutoField(primary_key = True) 
    UserName = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Timestamp = models.DateTimeField(auto_now = True)
    RequestType = models.CharField(max_length = 10, blank = False)
    LogData = models.TextField()
    URL = models.CharField(max_length = 100, blank = True, null=True)
    # Link = models.TextField()
    # Link = models.ForeignKey('self', on_delete = models.PROTECT, blank=True, null=True)

    def __str__(self):
        return "{0}:-{1}".format(self.RequestType, self.Log)

"""

need to create this below table because we cannot simply maintain a list of description 
of features in releases table.
eg.) 
row 1)  releaseNumber = 1
        featureList = ["mirroring", "snapshot", "bakup"]
        featureDescription = ["suporting mirroring upto 3 nodes", "can take snapshot of volumes", "takes backup of volumes everyday"]
row 2)  releaseNumber = 2
        featureList = ["mirroring", "snapshot", "bakup"]
        featureDescription = ["suporting mirroring upto 3 nodes", "can take snapshot of volumes", "takes backup of volumes everyday"]
row 3)  releaseNumber = 3
        featureList = ["mirroring", "snapshot", "bakup"]
        featureDescription = ["suporting mirroring upto 3 nodes", "can take snapshot of volumes", "takes backup of volumes everyday"]

INSTEAD we can save it as 
row 1)  RN = r1
        FeatureList = [f1,f2,f3] #these will be foreign keys from below table
row 2)  RN = r2
        FeatureList = [f1,f2,f3] #these will be foreign keys from below table
row 3)  RN = r3
        FeatureList = [f1,f2,f3] #these will be foreign keys from below table
row 4)  RN = r4
        FeatureList = [f1,f2,f3] #these will be foreign keys from below table
"""


"""
function which returns same schema to create multile table of same schema


def getTcStatusModel(date):
   class TC_STATUS(models.Model):

    class Meta:
        TableName = Date

    Bugs = models.IntegerField()
    LogFilePath = models.CharField(max_length=300, blank = False)

    return TC_STATUS
"""