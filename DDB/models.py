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
    TcName = models.CharField(max_length = 2000, default = "TC NOT AUTOMATED", blank = True)
    Domain = models.CharField(max_length=50, default = "UNKNOWN", blank = True)  #storage, nw
    SubDomain = models.CharField(max_length=50, default = "UNKNOWN", blank = True)  #remote, local, mirroring
    Scenario = models.CharField(max_length = 200, blank = True, default = "UNKNOWN") #stress, standard, negative
    Description = models.TextField(blank = True, default = "NO DESCRIPTION PROVIDED")
    Steps = models.TextField(blank = True, default = "NO STEPS PROVIDED")
    ExpectedBehaviour = models.CharField(max_length = 5000, blank = True, default = "NO EXPECTED BEHAVIOUR PROVIDED")
    Notes = models.TextField(blank = True, default = "NO NOTES PROVIDED")
    CardType = models.CharField(max_length = 100, blank = True, default=None)
    ServerType = ArrayField(models.CharField(max_length = 10, blank = True, default=None), blank = True)
    Platform = ArrayField(models.CharField(max_length = 100, blank = True, default = "UNKNOWN"), blank = True, default = list)
    WorkingStatus = models.CharField(max_length = 50, blank = True, default = "CREATED")
    Date = models.DateTimeField(auto_now = True, blank = True)
    AutomationDate = models.DateTimeField(auto_now = False, blank = True,null = True)
    Assignee = models.CharField(max_length = 50, blank = True, default = "UNKNOWN")
    Creator = models.CharField(max_length = 50, blank = True, default = "ANONYMOUS")
    Tag = models.CharField(max_length = 20, blank = True, default = "NO TAG")
    Priority = models.CharField(max_length = 5, blank = True, default = "P4")
    #deleted = models.BooleanField(default = False)
    stateUserMapping = models.TextField(blank = True, default = "{\"CREATED\":\"DEFAULT\"}")
    applicable = models.TextField(blank = True, default = 'Applicable')
    OS = models.TextField(blank = True, null = True, default = 'NO OS')
    UnapproveTCReason = models.TextField(blank = True, default = "NO REASON PROVIDED")

    def __str__(self):
        return self.TcID

# Table per release
class TC_INFO_GUI(models.Model):
    TcID = models.CharField(max_length = 200, blank = False)
    TcName = models.CharField(max_length = 2000, default = "TC NOT AUTOMATED", blank = True)
    Domain = models.CharField(max_length=50, default = "UNKNOWN", blank = True)  #storage, nw
    SubDomain = models.CharField(max_length=50, default = "UNKNOWN", blank = True)  #remote, local, mirroring
    Scenario = models.CharField(max_length = 200, blank = True, default = "UNKNOWN") #stress, standard, negative
    Description = models.TextField(blank = True, default = "NO DESCRIPTION PROVIDED")
    Steps = models.TextField(blank = True, default = "NO STEPS PROVIDED")
    ExpectedBehaviour = models.CharField(max_length = 5000, blank = True, default = "NO EXPECTED BEHAVIOUR PROVIDED")
    Notes = models.TextField(blank = True, default = "NO NOTES PROVIDED")
    CardType = models.CharField(max_length = 100, blank = True, default=None)
    ServerType = ArrayField(models.CharField(max_length = 10, blank = True, default=None), blank = True)
    WorkingStatus = models.CharField(max_length = 50, blank = True, default = "CREATED")
    Date = models.DateTimeField(auto_now = True, blank = True)
    AutomationDate = models.DateTimeField(auto_now = False, blank = True,null = True)
    Assignee = models.CharField(max_length = 50, blank = True, default = "UNKNOWN")
    Creator = models.CharField(max_length = 50, blank = True, default = "ANONYMOUS")
    Tag = models.CharField(max_length = 20, blank = True, default = "NO TAG")
    Priority = models.CharField(max_length = 5, blank = True, default = "P4")
    #deleted = models.BooleanField(default = False)

    AutomatedTcName = models.CharField(max_length = 2000, default = "TC NOT AUTOMATED", blank = True)
    BrowserName = models.CharField(max_length = 100, blank = True, default=None)
    stateUserMapping = models.TextField(blank = True, null = True, default = "{\"CREATED\":\"DEFAULT\"}")
    applicable = models.TextField(blank = True, null = True, default = 'Applicable')
    OS = models.TextField(blank = True, null = True, default = 'NO OS')
    UnapproveTCReason = models.TextField(blank = True, default = "NO REASON PROVIDED")
    Platform = ArrayField(models.CharField(max_length = 100, blank = True, default = "UNKNOWN"), blank = True, default = list)

    def __str__(self):
        return self.TcID

# table to store GUI test case result
class GUI_TC_STATUS(models.Model):
    tcInfoNum = models.IntegerField(blank = True, null = True)
    Build = models.CharField(max_length = 1000, blank = True)
    Result = models.CharField(max_length = 14, blank = True)
    Bugs = models.CharField(max_length = 500, blank = True) # we can make this as list field also
    Date = models.DateTimeField(auto_now = True, blank = True)
    TestedOn = models.CharField(max_length = 50, blank = True, null = True) # BOS, NYNJ, Software solution

# table to store GUI test case result
class GUI_LATEST_TC_STATUS(models.Model):
    tcInfoNum = models.IntegerField(blank = True, null = True)
    Build = models.CharField(max_length = 1000, blank = True)
    Result = models.CharField(max_length = 14, blank = True)
    Bugs = models.CharField(max_length = 500, blank = True) # we can make this as list field also
    Date = models.DateTimeField(auto_now = True, blank = True)
    TestedOn = models.CharField(max_length = 50, blank = True, null = True) # BOS, NYNJ, Software solution

class DEFAULT_DOMAIN_SUBDOMAIN(models.Model):
    Domain = models.CharField(max_length = 200, blank = False, default = "NOT PROVIDED")
    SubDomain = ArrayField(models.CharField(max_length = 200, blank = True, null = True), blank = True, null = True)

# Universal
class USER_INFO(models.Model):
    genders = (("M", "MALE"), ("F", "FEMALE"))
    engtypes = (("CLI", "CLI"), ("GUI", "GUI"), ("CLI+GUI", "CLI+GUI"))
    bloodgroups = (("O+ve", "O+ve"), ("O-ve", "O-ve"), ("A+ve", "A+ve"), ("A-ve", "A-ve"), ("AB+ve", "AB+ve"), ("AB-ve", "AB-ve"), ("B+ve", "B+ve"), ("B-ve", "B-ve"))

    name = models.CharField(max_length = 100, blank = True)
    email = models.CharField(primary_key = True, max_length = 100, blank = False)
    role = models.CharField(max_length = 10, default = "ENGG") # user / admin

    Gender = models.CharField(max_length = 1, blank = True, null = True, choices = genders)
    EngineerType = models.CharField(max_length = 7, blank = True, null = True, choices = engtypes)
    BloodGroup = models.CharField(max_length = 5, blank = True, null = True, choices = bloodgroups)
    Qualification = models.CharField(max_length = 20, blank = True, null = True)
    PreviousWorkExperienceInMonth = models.IntegerField(blank = True, null = True)
    DateOfJoining = models.DateTimeField(auto_now = False, blank = True, null=True)
    DateOfBirth = models.DateTimeField(auto_now = False, blank = True, null=True)
    ContactNumber = models.CharField(max_length = 13, blank = True, null = True)
    PersonalEmail = models.CharField(max_length = 100, blank = True, null = True)
    PreviousCompany = models.CharField(max_length = 100, blank = True, null = True)
    TShirtSize = models.CharField(max_length = 10, blank = True, null = True)

    Address = models.TextField(blank = True, null = True)
    City = models.CharField(max_length = 20, blank = True, null = True)
    PinCode = models.CharField(max_length = 6, blank = True, null = True)
    State = models.CharField(max_length = 20, blank = True, null = True)

    EmergencyContactNumber = models.CharField(max_length = 13, blank = True, null = True)
    EmenrgencyContactPersonName = models.CharField(max_length = 50, blank = True, null = True)
    EmergencyCOntactPersonRelation = models.CharField(max_length = 20, blank  = True, null = True)
    AssignedReleases = ArrayField(models.CharField(max_length = 100, blank = True, default = "UNKNOWN"), blank = True, default = list)

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
class LATEST_TC_STATUS(models.Model):
    TcID = models.CharField(max_length = 200, blank = False)
    TcName = models.CharField(max_length = 2000, blank = True)
    Build = models.CharField(max_length = 1000, blank = True)
    Result = models.CharField(max_length = 14, blank = True)
    Bugs = models.CharField(max_length = 500, blank = True) # we can make this as list field also
    Date = models.DateTimeField(auto_now = True, blank = True)
    Domain = models.CharField(max_length=50, blank = True)  #storage, nw
    SubDomain = models.CharField(max_length=50, blank = True)  #remote, local, mirroring
    CardType = models.CharField(max_length = 100, default="NOT ENTERED")
    TestedOn = models.CharField(max_length = 50, blank = True, null = True) # BOS, NYNJ, Software solution
    # Logs = models.TextField()

    def __str__(self):
        return "TCID={0}".format(self.TcID)

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
    CardType = models.CharField(max_length = 100, default="BOS/NYNJ")
    TestedOn = models.CharField(max_length = 50, blank = True, null = True) # BOS, NYNJ, Software solution
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
    CardType = models.CharField(max_length = 100, blank = True, default="BLANK")
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

# Table to store UI result
class UI(models.Model):
    User = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Date = models.DateTimeField(auto_now = False, blank = True, null=True)
    Build = models.CharField(max_length = 100, blank = True, null = True)
    Tag = models.CharField(max_length = 100, blank = True, null = True)
    Result = models.CharField(max_length = 14, blank = True, null = True)
    Bugs = models.CharField(max_length = 500, blank = True, null = True) # we can make this as list field also
    CardType = models.CharField(max_length = 100, blank = True, null = True) # we can make this as list field also
    NoOfTCsPassed = models.IntegerField(blank = True, null = True)
    UIFocus = models.TextField(blank = True, null = True)
    UISkipList = models.TextField(blank = True, null = True)
    Setup = models.TextField(blank = True, null = True)
    Notes = models.TextField(blank = True, null = True)

# Table to store e2e result
class E2E(models.Model):
    User = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Date = models.DateTimeField(auto_now = False, blank = True, null=True)
    Build = models.CharField(max_length = 100, blank = True, null = True)
    Tag = models.CharField(max_length = 100, blank = True, null = True)
    Result = models.CharField(max_length = 14, blank = True, null = True)
    Bugs = models.CharField(max_length = 500, blank = True, null = True) # we can make this as list field also
    CardType = models.CharField(max_length = 100, blank = True, null = True) # we can make this as list field also
    NoOfTCsPassed = models.IntegerField(blank = True, null = True)
    #E2EFocus = models.CharField(max_length = 100, blank = True, null = True)
    E2EFocus = models.TextField(blank = True, null = True)
    E2ESkipList = models.TextField(blank = True, null = True)
    Setup = models.TextField(blank = True, null = True)
    Notes = models.TextField(blank = True, null = True)
    

# Table to store Longevity result
class LONGEVITY(models.Model):
    User = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Date = models.DateTimeField(auto_now = False, blank = True, null=True)
    Build = models.CharField(max_length = 100, blank = True, null = True)
    Result = models.CharField(max_length = 14, blank = True, null = True)
    Bugs = models.CharField(max_length = 500, blank = True, null = True) # we can make this as list field also
    CardType = models.CharField(max_length = 100, blank = True, null = True) # we can make this as list field also
    NoOfDuration = models.IntegerField(blank = True, null = True)
    Notes = models.TextField(blank = True, null = True)
    Setup = models.TextField(blank = True, null = True)

# Table to store Stress result
class STRESS(models.Model):
    User = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Date = models.DateTimeField(auto_now = False, blank = True, null=True)
    Build = models.CharField(max_length = 100, blank = True, null = True)
    CardType = models.CharField(max_length = 100, blank = True, null = True) # we can make this as list field also
    CfgFileUsed = models.CharField(max_length = 100, blank = True, null = True)
    Result = models.CharField(max_length = 14, blank = True, null = True)
    LinkFlap = models.CharField(max_length = 14, blank = True, null = True)
    NoOfIteration = models.IntegerField(blank = True, null = True)
    Bugs = models.CharField(max_length = 500, blank = True, null = True) # we can make this as list field also
    Notes = models.TextField(blank = True, null = True)
    Setup = models.TextField(blank = True, null = True)

# UNIVERSAL DATABASE ENTITY
class RELEASES(models.Model):
    ReleaseNumber = models.CharField(max_length = 50, blank = False, primary_key = True)
    CreationDate = models.DateTimeField(auto_now_add = True, blank = True,null = True)
    BuildNumberList = ArrayField(models.CharField(max_length = 50, blank = True), blank = True)
    Engineers = ArrayField(models.CharField(max_length = 50, blank = True, null = True), blank = True, null = True)
    CardType = ArrayField(models.CharField(max_length = 100, blank = True), blank = True)
    PlatformsCli = ArrayField(models.CharField(max_length = 100, blank = True, default = "UNKNOWN"), blank = True, default = list)
    PlatformsGui = ArrayField(models.CharField(max_length = 100, blank = True, default = "UNKNOWN"), blank = True, default = list)
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
    KubernetesVersion = models.TextField(blank = True, null = True)
    DockerVersion = models.TextField(blank = True, null = True)
    HelmVersion = models.TextField(blank = True, null = True)
    fixVersion = models.TextField(blank = True, null = True, default = 'UNKNOWN')
    epicLink = models.TextField(blank = True, null = True, default = 'UNKNOWN')
    #ParentReleaseNumber = models.CharField(max_length = 50, blank = False, primary_key = True)
    ParentRelease = models.CharField(max_length = 50, blank = False, default = "master")
    
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
    TcID = models.CharField(max_length = 200, blank = True, default = "NO ID PROVIDED")
    CardType = models.CharField(max_length = 100, blank = True, default = "NO CARD PROVIDED")
    # Link = models.TextField()
    # Link = models.ForeignKey('self', on_delete = models.PROTECT, blank=True, null=True)

    def __str__(self):
        return "{0}:-{1}".format(self.RequestType, self.Log)

class LOGSGUI(models.Model):
    logNo = models.AutoField(primary_key = True)
    tcInfoNum = models.IntegerField()
    UserName = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    Timestamp = models.DateTimeField(auto_now = True)
    RequestType = models.CharField(max_length = 10, blank = False)
    LogData = models.TextField()
    URL = models.CharField(max_length = 100, blank = True, null=True)

    def __str__(self):
        return "{0}:-{1}".format(self.RequestType, self.Log)


class RELEASEBUILDSINFO(models.Model):
    ReleaseNumber = models.CharField(max_length = 50, blank = False,default = "UNKNOWN")
    buildNumber = models.IntegerField(default = 0)
    buildName = models.CharField(max_length = 100, blank = False, default = "UNKNOWN")
    buildResult = models.CharField(max_length = 20, blank = True , default = "UNKNOWN")
    buildURL = models.CharField(max_length = 100 , blank = True , null = True)
#    timeStamp = models.CharField(max_length = 30)

    def __str__(self):
        return self.buildName

class APPLICABILITY(models.Model):
    Platform = models.CharField(max_length = 100, blank = False, default = "NO PLATFORM")
    ApplicableTCs = models.TextField()

class AUTOMATION_COUNT(models.Model):
    DateRange = models.DateTimeField(auto_now = False, blank = False)
    TotalCli = models.IntegerField()
    AutomatedCli = models.IntegerField()
    TotalGui = models.IntegerField()
    AutomatedGui = models.IntegerField()
