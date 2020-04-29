// TODO: after uploading images data to server the extension of images is changed
export const GOOGLE_MAP_NOT_FOUND = 'GOOGLE_MAP_NOT_FOUND';

export const DEFAULT_MARKER_PATH = `${process.env.PUBLIC_URL}/data/fotos/App/journey.jpg`;
export const MARKER = `${process.env.PUBLIC_URL}/data/fotos/App/marker.png`;
export const APP_RESERVED_FEED_ID = 'APP_RESERVED_FEED_ID';
export const APP_RESERVED_USER_ID = 'APP_RESERVED_USER_ID';
export const APP_RESERVED_USER_NAME = 'App';
export const TOP_JOURNEY = 'top';
export const FOTO_CATEGORY = {
    FOOD: 'food',
    PLACE: 'place'
}

// ROUTES
export const journeyPathName = '/home/journey';


// MOOD
export const MOOD = {
    FOOD: 'FOOD',
    TRAVEL: 'TRAVEL',
    JOURNEY: 'JOURNEY',
    FEED: 'FEED',
    LIVE: 'LIVE'
};

export const WEATHER = {
    RAIN: 'RAIN'
}

export const EMOJI = {
    'LIVE': `${process.env.PUBLIC_URL}/live.PNG`,
    'FOOD': `${process.env.PUBLIC_URL}/hungry.PNG`,
    'TRAVEL': `${process.env.PUBLIC_URL}/travel.PNG`,
    'JOURNEY': `${process.env.PUBLIC_URL}/journey.PNG`,
    'FEED': `${process.env.PUBLIC_URL}/general.PNG`,
    'RAIN': `${process.env.PUBLIC_URL}/rain.PNG`,
};

export const TABLE_OPTIONS = {
    EDIT: 'EDIT',
    DELETE: 'DELETE',
    ADD: 'ADD'
}
//APPROVED UNAPPROVED ARE ACTIONS
export const flow = {

    newTC1: [
        //non-admin actions
        { PreviousWorkingStatus: 'CREATED', WorkingStatus: 'PENDING_FOR_APPROVAL', assignee: 'SELF', InitialWorkingStatus: 'CREATED' }, //(admin,non-admin) -> admin //1
        { PreviousWorkingStatus: 'CREATED', WorkingStatus: 'UNAPPROVED', assignee: 'SELF', InitialWorkingStatus: 'CREATED' }, //admin ->(admin, non-admin) (-) //3

        { PreviousWorkingStatus: 'FROM_MASTER/CREATED', WorkingStatus: 'UNASSIGNED', assignee: 'SELF', InitialWorkingStatus: 'FROM_MASTER/CREATED' }, //(admin,non-admin) -> admin //2

        //admin actions

        { PreviousWorkingStatus: 'APPROVED', WorkingStatus: 'DELETED', assignee: 'any', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin  (-) //4
        // {PreviousWorkingStatus: 'APPROVED', WorkingStatus: 'UNASSIGNED', assignee: 'ANY', InitialWorkingStatus: 'CREATED/FROM_MASTER'}, //admin->null (+) //5

        { PreviousWorkingStatus: 'APPROVED/UNAPPROVED', WorkingStatus: 'MANUAL_ASSIGNED', assignee: 'ANY', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin->qa (+) //6
        { PreviousWorkingStatus: 'APPROVED/UNAPPROVED', WorkingStatus: 'AUTO_ASSIGNED', assignee: 'ANY', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin ->qa (+) //7
        { PreviousWorkingStatus: 'APPROVED/UNAPPROVED', WorkingStatus: 'DEV_ASSIGNED', assignee: 'ANY', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin ->dev (+) //8


        { PreviousWorkingStatus: 'APPROVED', WorkingStatus: 'DEV_APPROVED', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin->dev (-) //10
        { PreviousWorkingStatus: 'APPROVED', WorkingStatus: 'MANUAL_COMPLETED', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin->dev (-) //11
        { PreviousWorkingStatus: 'APPROVED', WorkingStatus: 'AUTO_COMPLETED', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //admin->dev (-) //12


        //non-admin actions
        // {PreviousWorkingStatus: 'DELETED', WorkingStatus: 'PENDING_FOR_APPROVAL', assignee: 'SELF,any',}, //non-admin  (-) //13

        // dev actions
        { PreviousWorkingStatus: 'DEV_APPROVED', WorkingStatus: 'PENDING_FOR_APPROVAL', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //dev->admin (+) //14

        // manual actions
        { PreviousWorkingStatus: 'MANUAL_COMPLETED', WorkingStatus: 'PENDING_FOR_APPROVAL', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //dev->admin (+) //16
        //admin actions


        // auto actions
        { PreviousWorkingStatus: 'AUTO_COMPLETED', WorkingStatus: 'PENDING_FOR_APPROVAL', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //dev->admin (+) //18
        //admin actions

        // ADD IN FUTURE
        { PreviousWorkingStatus: 'ANY', WorkingStatus: 'PENDING_FOR_APPROVAL', askForDelete: 'BOOLEAN', InitialWorkingStatus: 'CREATED/FROM_MASTER' }, //dev->admin (+) //19
    ]
}

export const operations = {
    onAdminCreate: 'onAdminCreate',
    onAdminMasterClone: 'onAdminMasterClone',
    onNonAdminCreate: 'onNonAdminCreate'
}
export const assigneeTypes = {
    SELF: 'SELF',
    ADMIN: 'ADMIN'
}

export const AssigneeMissing = (request, method) => {
    if (request && request.assignee && request.assignee !== 'ADMIN') {
        return false;
    } else {
        return { error: `assignee required for ${method}` }
    }
}
export const AutoAssigneeMissing = (request, method) => {
    if (request && request.autoAssignee && request.autoAssignee !== 'ADMIN') {
        return false;
    } else {
        return { error: `auto-assignee required for ${method}` }
    }
}
export const DevAssigneeMissing = (request, method) => {
    if (request && request.devAssignee && request.devAssignee !== 'ADMIN') {
        return false;
    } else {
        return { error: `dev-assignee required for ${method}` }
    }
}

export const steps = {
    'onAdminCreate': () => ({ step: 'onAdminCreate', PreviousWorkingStatus: 'onAdminCreate', WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', AutoAssignee: 'ADMIN', DevAssignee: null, InitialWorkingStatus: 'CREATED' }), //2.1
    'onAdminMasterClone': () => ({ step: 'onAdminMasterClone', PreviousWorkingStatus: 'onAdminMasterClone', WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', AutoAssignee: 'ADMIN', DevAssignee: null, InitialWorkingStatus: 'FROM_MASTER' }), //2.2

    'onAdminInit': (request) => {
        return {
            step: 'onAdminInit',
            PreviousWorkingStatus: request.step,
            WorkingStatus: 'UNASSIGNED',
            Assignee: 'ADMIN',
            AutoAssignee: 'ADMIN',
            DevAssignee: null,
            InitialWorkingStatus: request && request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
        }
    }, //2.5 
    // 'onAdminPendingForRegression': (request) => {
    //     return {
    //         step: 'onAdminPendingForRegression',
    //         PreviousWorkingStatus: request.step,
    //         WorkingStatus: 'UNASSIGNED',
    //         Assignee: 'ADMIN',
    //         AutoAssignee: request && request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
    //         DevAssignee: request && request.DevAssignee ? request.DevAssignee : null,
    //         InitialWorkingStatus: request && request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
    //     }
    // },
    // 'onAdminPendingForAuto': (request) => {
    //     return {
    //         step: 'onAdminPendingForAuto',
    //         PreviousWorkingStatus: request.step,
    //         WorkingStatus: 'UNASSIGNED',
    //         Assignee: request && request.Assignee ? request.Assignee : 'ADMIN',
    //         AutoAssignee: 'ADMIN',
    //         DevAssignee: request && request.DevAssignee ? request.DevAssignee : null,
    //         InitialWorkingStatus: request && request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
    //     }
    // },

    'onNonAdminCreateRequest': (request) => {
        let missing = AssigneeMissing(request, 'onNonAdminCreateRequest')
        if (!missing) {
            return { step: 'onNonAdminCreateRequest', PreviousWorkingStatus: 'onNonAdminCreateRequest', WorkingStatus: 'PENDING_FOR_APPROVAL', Assignee: request.Assignee, AutoAssignee: 'ADMIN', DevAssignee: null, InitialWorkingStatus: 'CREATED' }
        }
        return missing
    }, //1 //Assignee compulsory

    'onAdminDelete': (request) => {
        let missing = AssigneeMissing(request, 'onAdminDelete')
        if (!missing) {
            return {
                step: 'onAdminDelete',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'DELETED',
                Assignee: request.Assignee,
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //1 //Assignee compulsory

    'onAdminCreateRequestUnApprove': (request) => {
        let missing = AssigneeMissing(request, 'onAdminCreateRequestUnApprove')
        if (!missing) {
            return { step: 'onAdminCreateRequestUnApprove', PreviousWorkingStatus: request.step, WorkingStatus: 'UNAPPROVED', Assignee: request.Assignee, AutoAssignee: 'ADMIN', DevAssignee: null, InitialWorkingStatus: 'CREATED' }
        }
        return missing
    }, //3 //Assignee compulsory

    'onAdminCreateRequestApprove': (request) => ({
        step: 'onAdminCreateRequestApprove',
        PreviousWorkingStatus: request.step,
        WorkingStatus: 'UNASSIGNED',
        Assignee: 'ADMIN',
        AutoAssignee: 'ADMIN', DevAssignee: null, InitialWorkingStatus: 'CREATED'
    }), //2.3



    'onAdminManualAssigned': (request) => {
        let missing = AssigneeMissing(request, 'onAdminManualAssigned')
        if (!missing) {
            return {
                step: 'onAdminManualAssigned',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'MANUAL_ASSIGNED',
                Assignee: request.Assignee,
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //6 //Assignee compulsory

    'onNonAdminManualCompleted': (request) => {
        let missing = AssigneeMissing(request, 'onNonAdminManualCompleted')
        if (!missing) {
            return {
                step: 'onNonAdminManualCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'PENDING_FOR_APPROVAL',
                Assignee: request.Assignee,
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, // 16 //Assignee compulsory

    'onAdminManualCompleted': (request) => {
        let missing = AssigneeMissing(request, 'onAdminManualCompleted')
        if (!missing) {
            return {
                step: 'onAdminManualCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'MANUAL_COMPLETED',
                Assignee: request.Assignee,
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //11 //Assignee compulsory

    'onAdminDevAssigned': (request) => {
        let missing = DevAssigneeMissing(request, 'onAdminDevAssigned')
        if (!missing) {
            return {
                step: 'onAdminDevAssigned',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'DEV_ASSIGNED',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //8 //dev-Assignee compulsory

    'onNonAdminDevCompleted': (request) => {
        let missing = DevAssigneeMissing(request, 'onNonAdminDevCompleted')
        if (!missing) {
            return {
                step: 'onNonAdminDevCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'PENDING_FOR_APPROVAL',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, // 14 //dev-Assignee compulsory

    'onAdminDevCompleted': (request) => {
        let missing = DevAssigneeMissing(request, 'onAdminDevCompleted')
        if (!missing) {
            return {
                step: 'onAdminDevCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'DEV_APPROVED',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee ? request.AutoAssignee : 'ADMIN',
                DevAssignee: request.DevAssignee,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //10 //dev-Assignee compulsory



    'onAdminAutoAssigned': (request) => {
        let missing = AutoAssigneeMissing(request, 'onAdminAutoAssigned')
        if (!missing) {
            return {
                step: 'onAdminAutoAssigned',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'AUTO_ASSIGNED',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee,
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //7 //auto-Assignee compulsory

    'onNonAdminAutoCompleted': (request) => {
        let missing = AutoAssigneeMissing(request, 'onNonAdminAutoCompleted')
        if (!missing) {
            return {
                step: 'onNonAdminAutoCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'PENDING_FOR_APPROVAL',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee,
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, // 18 //auto-Assignee compulsory

    'onAdminAutoCompleted': (request) => {
        let missing = AutoAssigneeMissing(request, 'onAdminAutoCompleted')
        if (!missing) {
            return {
                step: 'onAdminAutoCompleted',
                PreviousWorkingStatus: request.step,
                WorkingStatus: 'AUTO_COMPLETED',
                Assignee: request.Assignee ? request.Assignee : 'ADMIN',
                AutoAssignee: request.AutoAssignee,
                DevAssignee: request.DevAssignee ? request.DevAssignee : null,
                InitialWorkingStatus: request.InitialWorkingStatus ? request.InitialWorkingStatus : 'FROM_MASTER'
            }
        }
        return missing
    }, //12 //auto-Assignee compulsory
}

export const ws = [
    'CREATED', 'UNASSIGNED', 'DEV_ASSIGNED', 'DEV_APPROVED', 'APPROVED', 'UNAPPROVED', 'MANUAL_ASSIGNED',
    'MANUAL_COMPLETED', 'AUTO_ASSIGNED', 'AUTO_COMPLETED', 'DELETED'
]
export const workingStatuses = {
    FROM_MASTER: { title: 'FROM_MASTER' },
    CREATED: { title: 'CREATED' },
    MY_PENDING_FOR_APPROVAL: { title: 'MY_PENDING_FOR_APPROVAL' },
    PENDING_FOR_APPROVAL: { title: 'PENDING_FOR_APPROVAL' },
    PENDING_FOR_ASSIGNMENT: { title: 'PENDING_FOR_ASSIGNMENT' },
    UNASSIGNED: { title: 'UNASSIGNED' },
    DEV_ASSIGNED: { title: 'DEV_ASSIGNED' },
    DEV_APPROVED: { title: 'DEV_APPROVED' },
    APPROVED: { title: 'APPROVED' },
    UNAPPROVED: { title: 'UNAPPROVED' },
    MANUAL_ASSIGNED: { title: 'MANUAL_ASSIGNED' },
    MANUAL_COMPLETED: { title: 'MANUAL_COMPLETED' },
    AUTO_ASSIGNED: { title: 'AUTO_ASSIGNED' },
    AUTO_COMPLETED: { title: 'AUTO_COMPLETED' },
    UPDATED: { title: 'UPDATED' },
    DELETED: { title: 'DELETED' },
}
export const roles = {
    ADMIN: {
        title: 'ADMIN', allowedWS: [
            workingStatuses.CREATED.title,
            workingStatuses.UNASSIGNED.title,
            workingStatuses.DEV_ASSIGNED.title,
            workingStatuses.DEV_APPROVED.title,
            workingStatuses.APPROVED.title,
            workingStatuses.UNAPPROVED.title,
            workingStatuses.MANUAL_ASSIGNED.title,
            workingStatuses.MANUAL_COMPLETED.title,
            workingStatuses.AUTO_ASSIGNED.title,
            workingStatuses.AUTO_COMPLETED.title,
            workingStatuses.DELETED.title,
        ]
    },
    QA: { title: 'QA', allowedWS: [] },
    DEVELOPER: { title: 'DEVELOPER', allowedWS: [] },
};

export const actionSteps = {
    'onAdminCreate': 'onAdminCreate',
    'onAdminMasterClone': 'onAdminMasterClone',
    'onAdminInit': 'onAdminInit',
    // 'onAdminPendingForRegression': 'onAdminPendingForRegression',
    // 'onAdminPendingForAuto': 'onAdminPendingForAuto',
    'onNonAdminCreateRequest': 'onNonAdminCreateRequest',
    'onAdminDelete': 'onAdminDelete',
    'onAdminCreateRequestUnApprove': 'onAdminCreateRequestUnApprove',
    'onAdminCreateRequestApprove': 'onAdminCreateRequestApprove',
    'onAdminManualAssigned': 'onAdminManualAssigned',
    'onNonAdminManualCompleted': 'onNonAdminManualCompleted',
    'onAdminManualCompleted': 'onAdminManualCompleted',
    'onAdminAutoAssigned': 'onAdminAutoAssigned',
    'onNonAdminAutoCompleted': 'onNonAdminAutoCompleted',
    'onAdminAutoCompleted': 'onAdminAutoCompleted',
    'onAdminDevAssigned': 'onAdminDevAssigned',
    'onNonAdminDevCompleted': 'onNonAdminDevCompleted',
    'onAdminDevCompleted': 'onAdminDevCompleted',
}
export const specialAdminWorkingStatuses = [
    'CREATED',
    'INIT',
    'FROM_MASTER'
];
export const AdminWorkingStatuses = [
    'APPROVE',
    'UNAPPROVE',
    'MANUAL_ASSIGNED',
    'AUTO_ASSIGNED',
    'DEV_ASSIGNED',
    'MANUAL_COMPLETED',
    'AUTO_COMPLETED',
    'DEV_COMPLETED',
    'DELETED',
]
export const tcFields = {
    'Assignee': 'Assignee','DevAssignee': 'DevAssignee','AutoAssignee':'AutoAssignee', 
    'WorkingStatus':'WorkingStatus','Priority': 'Priority', 
    'NewTcID':'NewTcID', 'Scenario':'Scenario', 
    'Description':'Description', 'Notes':'Notes', 'ExpectedBehaviour':'ExpectedBehaviour',
    'Steps':'Steps', 'Tag':'Tag', 'TcName':'TcName'
}
export const tcLifeCycleFields = {
    'PrevWorkStatus':'PreviousWorkingStatus',
    'InitWorkStatus': 'InitialWorkingStatus',
    'Step': 'step',
}
export const tcTypes = {
    'ALL': {
        type: 'ALL', title: 'Test Cases',
        roles: [roles.ADMIN.title, roles.QA.title, roles.DEVELOPER.title],
        whichTCActionStepsFiltered: () => [],
        whichTCActionStepsAllowed: () => [],
        isAddingStatusAllowed: () => true,
    },
    'PFAPPROVAL': {
        type: 'PFAPPROVAL', title: 'Pending for Approval',
        roles: [roles.ADMIN.title],

        whichTCActionStepsFiltered: (data) => {
            return data.filter(item => [actionSteps.onNonAdminCreateRequest, actionSteps.onNonAdminManualCompleted,
            actionSteps.onNonAdminAutoCompleted, actionSteps.onNonAdminDevCompleted].includes(item.step))
        },
        whichTCActionStepsAllowed: () => {
            return [workingStatuses.APPROVED.title, workingStatuses.UNAPPROVED.title,workingStatuses.MANUAL_ASSIGNED.title]
        },
        isAddingStatusAllowed: () => false,
        whichFieldsForDisplay: () => {return [
            tcFields.Assignee, tcFields.WorkingStatus, tcFields.Priority, tcFields.Scenario, tcFields.Description,
            tcFields.Notes, tcFields.ExpectedBehaviour, tcFields.Steps, tcFields.Tag, tcFields.TcName
        ] },
        whichFieldsForEdit: () => {return [ tcFields.Assignee, tcFields.WorkingStatus,] },
        isInValid: (request) => {
            let errors = null;
            let assignee = request[tcFields.Assignee];
            if(!(assignee && assignee !== 'ADMIN')) {
                errors = {[tcFields.Assignee]: 'Assignee cannot be ADMIN or empty'}
            }
            return errors;
        },
        processRequest: (request) => {
            let action = request[tcFields.WorkingStatus];
            let previousAction = request[tcLifeCycleFields.PrevWorkStatus];
            switch(action) {
                case workingStatuses.APPROVED.title:
                    if(previousAction === actionSteps.onNonAdminCreateRequest) {
                        return steps.onAdminManualAssigned(request);
                    }
                    break;
                case workingStatuses.UNAPPROVED.title:
                    
                    break;
            }
        }
    },
    'PFREGRESSION': {
        type: 'PFREGRESSION', title: 'Pending for Regression', roles: [roles.ADMIN.title],
        whichTCActionStepsFiltered: (data) => {
            let validSteps = [
                actionSteps.onAdminCreate, actionSteps.onAdminMasterClone, actionSteps.onAdminInit,
                actionSteps.onAdminCreateRequestApprove
            ];
            return data.filter(item => {
                if (validSteps.includes(item.step)) {
                    return true
                }
                if (!item.Assignee || (item.Assignee && item.Assignee === 'ADMIN')) {
                    return true;
                }
                return false;
            });
        },

        whichTCActionStepsAllowed: () => {
            return ['MANUAL_ASSIGNED', 'MANUAL_COMPLETED']
        },
        isAddingStatusAllowed: () => true,
        whichFieldsForDisplay: () => {return [
            tcFields.Assignee, tcFields.WorkingStatus, tcFields.Priority, tcFields.Scenario, tcFields.Description,
            tcFields.Notes, tcFields.ExpectedBehaviour, tcFields.Steps, tcFields.Tag, tcFields.TcName
        ] },
        whichFieldsForEdit: () => {return [ tcFields.Assignee, tcFields.WorkingStatus,] }
    },
    'PFAUTO': {
        type: 'PFAUTO', title: 'Pending for Automation', roles: [roles.ADMIN.title],
        whichTCActionStepsFiltered: (data) => {
            let validSteps = [
                actionSteps.onAdminCreate, actionSteps.onAdminMasterClone, actionSteps.onAdminInit,
                actionSteps.onAdminCreateRequestApprove
            ];
            return data.filter(item => {
                if (validSteps.includes(item.step)) {
                    return true
                }
                if (!item.AutoAssignee || (item.Assignee && item.AutoAssignee === 'ADMIN')) {
                    return true;
                }
                return false;
            });
        },
        whichTCActionStepsAllowed: () => {
            return ['AUTO_ASSIGNED', 'AUTO_COMPLETED']
        },
        isAddingStatusAllowed: () => false
    },
    'ASSIGNAUTO': { type: 'ASSIGNAUTO', title: 'Assign TCs for Automation', roles: [roles.ADMIN.title] },
    'ASSIGNREGRESSION': { type: 'ASSIGNREGRESSION', title: 'Assign TCs for Regression', roles: [roles.ADMIN.title] },
    'ASSIGNEDAUTO': { type: 'ASSIGNEDAUTO', title: 'My Assigned TCs for Automation', roles: [roles.ADMIN.title, roles.QA.title, roles.DEVELOPER.title] },
    'ASSIGNEDREGRESSION': { type: 'ASSIGNEDREGRESSION', title: 'My Assigned TCs for Regression', roles: [roles.ADMIN.title, roles.QA.title, roles.DEVELOPER.title] },
    'MPFAPPROVAL': { type: 'MPFAPPROVAL', title: 'My TCs Pending for Approval', roles: [roles.ADMIN.title, roles.QA.title, roles.DEVELOPER.title] },
}

