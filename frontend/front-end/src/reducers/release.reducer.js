// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';

import {
    SAVE_RELEASE_BASIC_INFO,
    DELETE_RELEASE,
    RELEASE_CHANGE,
    SAVE_OPTIONS,
    UPDATE_PRIORITY_DASHBOARD
} from '../actions';

const initialState = {
    releases: [
    ],
    current: {},
    options: { selectedPriority: ['P0', 'P1'] }
};
// {'Storage-DrivesetTCs':'Storage-Driveset','StoragePVC':'Storage-PVC','VagrantCluster':'Vagrant Cluster','
// SoftwareSolution':'Software Solution','ManagementTestcases': "Management", "MultizoneCluster":"Multizone Cluster",  
// "NetworkTestCases":"Network", "Rbac    ":"RBAC","StorageMirrored-Tests":"Storage-Mirrored","Additionaltests":"Additional",
//  "HelmTestCases":"Helm","Interfacetestcases":"Interface"    ,"Kubernetes-tests": "Kubernetes",
//   "ManagementTestcases":"Management", "MultizoneCluster":"Multizone Cluster", "NetworkTestCases":"Network"    
//   ,"QOSTestcases":"QOS","StorageMirrored-Tests":"Storage-Mirrored","StorageRemote-Tests":"Storage-Remote",
// "StorageSnapshot-Tests":"Storage-Snapshot","Upgradetests":"Upgrade", "Storage-Tests":"Storage"}
export const alldomains = ['Storage', 'Network', 'Management', 'Others'];
const domainDetail = {
    'Storage': { name: 'Storage', index: 0 },
    'Storage-Remote': { name: 'Storage', index: 0 },
    'Storage-PVC': { name: 'Storage', index: 0 },
    'Storage-Mirrored': { name: 'Storage', index: 0 },
    'Storage-Snapshot': { name: 'Storage', index: 0 },
    'Storage-Driveset': { name: 'Storage', index: 0 },
    'Network': { name: 'Network', index: 1 },
    'Management': { name: 'Management', index: 2 },
    'RBAC': { name: 'Management', index: 2 },
}

// ////////////////////
// Modifiers //////////
// //////////////////
function getAggregate(release) {
    if (!release.TcAggregate) {
        release.TcAggregate = {
            all: {
                "Tested": {
                    "auto": {
                        "Pass": 0,
                        "Fail": 0,
                        "Skip": 0
                    },
                    "manual": {
                        "Pass": 0,
                        "Fail": 0,
                        "Skip": 0
                    },
                },
                "NotTested": 0,
                "NotApplicable": 0
            },
            domain: {}
        }
    }
    if (!release.TcAggregate.domain) {
        release.TcAggregate.domain = {};
    }
    if (!release.TcAggregate.all) {
        release.TcAggregate.all = {
            "Tested": {
                "auto": {
                    "Pass": 0,
                    "Fail": 0,
                    "Skip": 0
                },
                "manual": {
                    "Pass": 0,
                    "Fail": 0,
                    "Skip": 0
                },
            },
            "NotTested": 0,
            "NotApplicable": 0,
            "Skip": 0
        };
    }
    release.TcAggregate.all.TotalTested = release.TcAggregate.all.Tested.auto.Pass + release.TcAggregate.all.Tested.auto.Fail +
        release.TcAggregate.all.Tested.manual.Pass + release.TcAggregate.all.Tested.manual.Fail;
    release.TcAggregate.all.SkipAndTested = release.TcAggregate.all.Tested.auto.Skip + release.TcAggregate.all.Tested.manual.Skip;
    release.TcAggregate.all.Skip = release.TcAggregate.all.Skip;
    release.TcAggregate.all.Blocked = 0;

    release.TcAggregate.uidomain = {};
    alldomains.forEach((item, index) => {
        release.TcAggregate.uidomain[item] = {
            "Tested": {
                "auto": {
                    "Pass": 0,
                    "Fail": 0,
                    "Skip": 0
                },
                "manual": {
                    "Pass": 0,
                    "Fail": 0,
                    "Skip": 0
                },
            },
            "NotTested": 0,
            "NotApplicable": 0
        }
    });

    let relDomain = release.TcAggregate.domain
    Object.keys(relDomain).forEach((item, index) => {
        if (domainDetail[item]) {
            release.TcAggregate.domain[item].tag = domainDetail[item].name;
            release.TcAggregate.uidomain[domainDetail[item].name].Tested.auto.Pass += relDomain[item].Tested.auto.Pass;
            release.TcAggregate.uidomain[domainDetail[item].name].Tested.auto.Fail += relDomain[item].Tested.auto.Fail;
            release.TcAggregate.uidomain[domainDetail[item].name].Tested.auto.Skip += relDomain[item].Tested.auto.Skip;

            release.TcAggregate.uidomain[domainDetail[item].name].Tested.manual.Pass += relDomain[item].Tested.manual.Pass;
            release.TcAggregate.uidomain[domainDetail[item].name].Tested.manual.Fail += relDomain[item].Tested.manual.Fail;
            release.TcAggregate.uidomain[domainDetail[item].name].Tested.manual.Skip += relDomain[item].Tested.manual.Skip;


            release.TcAggregate.uidomain[domainDetail[item].name].Tested.total =
                release.TcAggregate.uidomain[domainDetail[item].name].NotTested += relDomain[item].NotTested;
            release.TcAggregate.uidomain[domainDetail[item].name].NotApplicable += relDomain[item].NotApplicable;
        } else {
            release.TcAggregate.domain[item].tag = "Others";
            release.TcAggregate.uidomain["Others"].Tested.auto.Pass += relDomain[item].Tested.auto.Pass;
            release.TcAggregate.uidomain["Others"].Tested.auto.Fail += relDomain[item].Tested.auto.Fail;
            release.TcAggregate.uidomain["Others"].Tested.auto.Skip += relDomain[item].Tested.auto.Skip;

            release.TcAggregate.uidomain["Others"].Tested.manual.Pass += relDomain[item].Tested.manual.Pass;
            release.TcAggregate.uidomain["Others"].Tested.manual.Fail += relDomain[item].Tested.manual.Fail;
            release.TcAggregate.uidomain["Others"].Tested.manual.Skip += relDomain[item].Tested.manual.Skip;

            release.TcAggregate.uidomain["Others"].NotTested += relDomain[item].NotTested;
            release.TcAggregate.uidomain["Others"].NotApplicable += relDomain[item].NotApplicable;
        }
    })
    return release;
}
// ////////////////////
// Reducers //////////
// //////////////////
function all(state = initialState.releases, action) {
    switch (action.type) {
        case SAVE_RELEASE_BASIC_INFO:
            let found = false;
            let dates = [
                'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
                'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
            ]
            let formattedDates = {};
            dates.forEach(item => {
                if (action.payload.data[item]) {
                    let date = new Date(action.payload.data[item]);
                    let month = `${(date.getMonth() + 1)}`.length === 1 ? `0${(date.getMonth() + 1)}` : `${(date.getMonth() + 1)}`
                    let day = `${date.getDate()}`.length === 1 ? `0${date.getDate()}` : `${date.getDate()}`
                    formattedDates[item] = `${date.getFullYear()}-${month}-${day}`
                }
            })
            action.payload.data = {
                ...action.payload.data,
                ...formattedDates
            }

            let release = getAggregate(action.payload.data);
            action.payload.data = { ...action.payload.data, ...release }
            state.forEach((item, index) => {
                if (item.ReleaseNumber === action.payload.id) {
                    found = true;
                    state[index] = { ...item, ...action.payload.data }
                }
            });
            if (!found) {
                state.push(action.payload.data);
            }
            return [...state];

        case DELETE_RELEASE:
            found = null;
            state.forEach((item, index) => {
                if (item.ReleaseNumber === action.payload.id) {
                    found = index;
                }
            });
            if (found !== null) {
                state.splice(found, 1);
            }
            return [...state];
        default:
            return state;
    }
}
function current(state = initialState.current, action) {
    switch (action.type) {
        case RELEASE_CHANGE:
            return { ...state, id: action.payload.id }
        default:
            return state;
    }
}
function options(state = initialState.options, action) {
    switch (action.type) {
        case SAVE_OPTIONS:
            return { ...state, ...action, ReleaseSpecific: { ...state.ReleaseSpecific, ...action.ReleaseSpecific } }
        case UPDATE_PRIORITY_DASHBOARD:
            return { ...state, selectedPriority: action.payload.selectedPriority }
        default:
            return state;
    }
}

export const releaseReducer = combineReducers({
    all,
    current,
    options
});

// ////////////////////
// Selectors //////////
// //////////////////

export const optionSelector = (state) => {
    return {
    }
}
export const getCurrentRelease = (state) => {
    let current = state.release.all.filter(item => item.ReleaseNumber === state.release.current.id)[0];
    return current ? current : {}
}

export const getTCForStatus = (state, id) => {
    let release = state.release.all.filter(item => item.ReleaseNumber === id)[0];
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let p = {};
    ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(item => p[item] = { Pass: 0, Skip: 0, Fail: 0, NotTested: 0 });
    let visibleP = { Pass: 0, Skip: 0, Fail: 0, NotTested: 0 };
    if (release.Priority) {
        p = { ...p, ...release.Priority }
    }
    //TODO: get from backend release site
    // p.P0={...p.P0, Pass: 100, Fail: 200};
    // p.P1 = {...p.P1, Pass:23, Fail:43};

    if (state.release.options.selectedPriority) {
        state.release.options.selectedPriority.forEach(item => {
            visibleP.Pass += p[item].Pass;
            visibleP.Skip += p[item].Skip;
            visibleP.Fail += p[item].Fail;
            visibleP.NotTested += p[item].NotTested;
        })
    }
    let data = [{
        labels: ['', ''],
        datasets: [{
            label: 'Pass',
            backgroundColor: '#01D251',
            borderColor: 'white',
            borderWidth: 1,
            data: [(release.TcAggregate.all.Tested.auto.Pass + release.TcAggregate.all.Tested.manual.Pass), visibleP.Pass]
        },
        {
            label: 'Skipped (Testing)',
            backgroundColor: '#FFCE56',
            borderColor: 'white',
            borderWidth: 1,
            data: [(release.TcAggregate.all.Tested.auto.Skip + release.TcAggregate.all.Tested.manual.Skip), visibleP.Skip]
        },
        {
            label: 'Fail',
            backgroundColor: '#d9534f',
            borderColor: 'white',
            borderWidth: 1,
            data: [(release.TcAggregate.all.Tested.auto.Fail + release.TcAggregate.all.Tested.manual.Fail), visibleP.Fail]
        },
        {
            label: 'Not Tested',
            backgroundColor: 'rgba(128,128,128,0.3)',
            borderColor: 'white',
            borderWidth: 1,
            data: [release.TcAggregate.all.NotTested, visibleP.NotTested]
        },
        ]
    }];
    // {
    // "GUI": { "Tested": { "auto": { "Pass": 199, "Fail": 11, "Skip": 0 }, "manual": { "Pass": 3444, "Fail": 394, "Skip": 0 } }, "NotApplicable": 0, "NotTested": 0 }
    if (release.ReleaseNumber === '2.3.0') {
        data.push({
            labels: [''],
            datasets: [{
                label: 'Pass',
                backgroundColor: '#01D251',
                borderColor: 'white',
                borderWidth: 1,
                data: [3643]
            },
            {
                label: 'Skipped (Testing)',
                backgroundColor: '#FFCE56',
                borderColor: 'white',
                borderWidth: 1,
                data: [0]
            },
            {
                label: 'Fail',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [189]
            },
            {
                label: 'Not Tested',
                backgroundColor: 'rgba(128,128,128,0.3)',
                borderColor: 'white',
                borderWidth: 1,
                data: [0]
            },
            ]
        })
    } else {
        data.push({
            labels: [''],
            datasets: [{
                label: 'Pass',
                backgroundColor: '#01D251',
                borderColor: 'white',
                borderWidth: 1,
                data: [0]
            },
            {
                label: 'Skipped (Testing)',
                backgroundColor: '#FFCE56',
                borderColor: 'white',
                borderWidth: 1,
                data: [0]
            },
            {
                label: 'Fail',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [0]
            },
            {
                label: 'Not Tested',
                backgroundColor: 'rgba(128,128,128,0.3)',
                borderColor: 'white',
                borderWidth: 1,
                data: [release.TcAggregate.all.GUI]
                // data: [0]
            },
            ]
        })
    }

    const options = {
        legend: {
            position: 'right',
            display: true,
            labels: {
                fontColor: '#003168',
                fontFamily: 'Open Sans, sans-serif',
            }
        },
    }
    // let total = [(release.TcAggregate.all.Tested.auto.Fail + release.TcAggregate.all.Tested.manual.Fail) +
    //     (release.TcAggregate.all.Tested.auto.Pass + release.TcAggregate.all.Tested.manual.Pass) +
    //     (release.TcAggregate.all.Tested.auto.Skip + release.TcAggregate.all.Tested.manual.Skip) +
    //     release.TcAggregate.all.NotTested - release.TcAggregate.all.Skip];
    let total = [release.TcAggregate.all.All - (release.TcAggregate.all.NotApplicable + release.TcAggregate.all.Skip)];
    if (release.ReleaseNumber === '2.3.0') {
        total.push(3876)
    } else {
        total.push(release.TcAggregate.all.GUI);
        // total.push(0);
    }
    return {
        data,
        total,
        options
    }
}

export const getTCForStrategy = (state, id) => {
    let release = state.release.all.filter(item => item.ReleaseNumber === id)[0];
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    // let data = {
    //     labels: [
    //         'Total Test (' + release.TcAggregate.all.TotalTested + ')',
    //         'Skipped (' + release.TcAggregate.all.Skip + ')',
    //         'Not Applicable (' + release.TcAggregate.all.NotApplicable + ')'
    //     ],
    //     datasets: [
    //         {
    //             data: [
    //                 release.TcAggregate.all.TotalTested,
    //                 release.TcAggregate.all.Skip,
    //                 release.TcAggregate.all.NotApplicable,
    //             ],
    //             backgroundColor: [
    //                 '#FF6384',
    //                 '#36A2EB',
    //                 '#FFCE56',
    //             ],
    //             hoverBackgroundColor: [
    //                 '#FF6384',
    //                 '#36A2EB',
    //                 '#FFCE56',
    //             ],
    //         }],
    // };
    return {
        GUISkip: release.TcAggregate.all.GUISkip ? release.TcAggregate.all.GUISkip : 0,
        GUIAutomated: release.TcAggregate.all.GUIAutomated ? release.TcAggregate.all.GUIAutomated : 0,
        GUINotApplicable: release.TcAggregate.all.GUINotApplicable ? release.TcAggregate.all.GUINotApplicable : 0,
        totalGUI: release.TcAggregate.all.GUI ? release.TcAggregate.all.GUI : 0,
        totalAutomated: release.TcAggregate.all.Automated ? release.TcAggregate.all.Automated : 0,
        totalNonAutomated: release.TcAggregate.all.NonAutomated ? release.TcAggregate.all.NonAutomated : 0,
        // totalTests: release.TcAggregate.all.TotalTested + release.TcAggregate.all.NotTested + release.TcAggregate.all.Skip + release.TcAggregate.all.NotApplicable,
        totalTests: release.TcAggregate.all.All,
        skipped: release.TcAggregate.all.Skip ? release.TcAggregate.all.Skip : 0,
        SkipAndTested: release.TcAggregate.all.SkipAndTested ? release.TcAggregate.all.SkipAndTested : 0,
        notApplicable: release.TcAggregate.all.NotApplicable,
        needToRun: release.TcAggregate.all.Tested.auto.Fail + release.TcAggregate.all.Tested.manual.Fail + release.TcAggregate.all.NotTested
    };
}
export const getTCForTestMetrics = (state, id) => {
    let release = state.release.all.filter(item => item.ReleaseNumber === id)[0];
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let storage = release.TcAggregate.uidomain['Storage'].Tested.auto.Pass + release.TcAggregate.uidomain['Storage'].Tested.manual.Pass
        + release.TcAggregate.uidomain['Storage'].Tested.auto.Fail + release.TcAggregate.uidomain['Storage'].Tested.manual.Fail
        + release.TcAggregate.uidomain['Storage'].Tested.auto.Skip + release.TcAggregate.uidomain['Storage'].Tested.manual.Skip
        + release.TcAggregate.uidomain['Storage'].NotTested;
    let network = release.TcAggregate.uidomain['Network'].Tested.auto.Pass + release.TcAggregate.uidomain['Network'].Tested.manual.Pass
        + release.TcAggregate.uidomain['Network'].Tested.auto.Fail + release.TcAggregate.uidomain['Network'].Tested.manual.Fail
        + release.TcAggregate.uidomain['Network'].Tested.auto.Skip + release.TcAggregate.uidomain['Network'].Tested.manual.Skip
        + release.TcAggregate.uidomain['Network'].NotTested;
    let management = release.TcAggregate.uidomain['Management'].Tested.auto.Pass + release.TcAggregate.uidomain['Management'].Tested.manual.Pass
        + release.TcAggregate.uidomain['Management'].Tested.auto.Fail + release.TcAggregate.uidomain['Management'].Tested.manual.Fail
        + release.TcAggregate.uidomain['Management'].Tested.auto.Skip + release.TcAggregate.uidomain['Management'].Tested.manual.Skip
        + release.TcAggregate.uidomain['Management'].NotTested;
    let others = release.TcAggregate.uidomain['Others'].Tested.auto.Pass + release.TcAggregate.uidomain['Others'].Tested.manual.Pass
        + release.TcAggregate.uidomain['Others'].Tested.auto.Fail + release.TcAggregate.uidomain['Others'].Tested.manual.Fail
        + release.TcAggregate.uidomain['Others'].Tested.auto.Skip + release.TcAggregate.uidomain['Others'].Tested.manual.Skip
        + release.TcAggregate.uidomain['Others'].NotTested;
    let data = {
        labels: [
            'Storage (' + storage + ')',
            'Network (' + network + ')',
            'Management (' + management + ')',
            'Others (' + others + ')',
        ],
        datasets: [
            {
                data: [
                    storage,
                    network,
                    management,
                    others
                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#B5801D',
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#B5801D',
                ],
            }],
    };
    let total = storage + network + management + others;
    console.log('data for tc strategy');
    console.log(data);
    return { data, total };
}

export const getTCStatusForUIDomains = (release) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [];
    let storagePass = release.TcAggregate.uidomain['Storage'].Tested.auto.Pass + release.TcAggregate.uidomain['Storage'].Tested.manual.Pass;
    let storageFail = release.TcAggregate.uidomain['Storage'].Tested.auto.Fail + release.TcAggregate.uidomain['Storage'].Tested.manual.Fail;
    let storageSkipped = release.TcAggregate.uidomain['Storage'].Tested.auto.Skip + release.TcAggregate.uidomain['Storage'].Tested.manual.Skip
    let storageNotTested = release.TcAggregate.uidomain['Storage'].NotTested;
    let networkPass = release.TcAggregate.uidomain['Network'].Tested.auto.Pass + release.TcAggregate.uidomain['Network'].Tested.manual.Pass
    let networkFail = release.TcAggregate.uidomain['Network'].Tested.auto.Fail + release.TcAggregate.uidomain['Network'].Tested.manual.Fail
    let networkSkipped = release.TcAggregate.uidomain['Network'].Tested.auto.Skip + release.TcAggregate.uidomain['Network'].Tested.manual.Skip
    let networkNotTested = release.TcAggregate.uidomain['Network'].NotTested;
    let managementPass = release.TcAggregate.uidomain['Management'].Tested.auto.Pass + release.TcAggregate.uidomain['Management'].Tested.manual.Pass
    let managementFail = release.TcAggregate.uidomain['Management'].Tested.auto.Fail + release.TcAggregate.uidomain['Management'].Tested.manual.Fail
    let managementSkipped = release.TcAggregate.uidomain['Management'].Tested.auto.Skip + release.TcAggregate.uidomain['Management'].Tested.manual.Skip
    let managementNotTested = release.TcAggregate.uidomain['Management'].NotTested;
    let othersPass = release.TcAggregate.uidomain['Others'].Tested.auto.Pass + release.TcAggregate.uidomain['Others'].Tested.manual.Pass
    let othersFail = release.TcAggregate.uidomain['Others'].Tested.auto.Fail + release.TcAggregate.uidomain['Others'].Tested.manual.Fail
    let othersSkipped = release.TcAggregate.uidomain['Others'].Tested.auto.Skip + release.TcAggregate.uidomain['Others'].Tested.manual.Skip
    let othersNotTested = release.TcAggregate.uidomain['Others'].NotTested;
    let each = [
        { Fail: storageFail, Pass: storagePass, Skip: storageSkipped, NotTested: storageNotTested },
        { Fail: networkFail, Pass: networkPass, Skip: networkSkipped, NotTested: networkNotTested },
        { Fail: managementFail, Pass: managementPass, Skip: managementSkipped, NotTested: managementNotTested },
        { Fail: othersFail, Pass: othersPass, Skip: othersSkipped, NotTested: othersNotTested },
    ]

    alldomains.forEach((item, index) => {
        doughnuts.push({
            data: {
                labels: [
                    'Fail(' + each[index].Fail + ')',
                    'Pass(' + each[index].Pass + ')',
                    'Block(' + each[index].Skip + ')',
                    'Not Tested(' + each[index].NotTested + ')',
                ],
                datasets: [
                    {
                        data: [
                            each[index].Fail,
                            each[index].Pass,
                            each[index].Skip,
                            each[index].NotTested
                        ],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#B5801D',
                        ],
                        hoverBackgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#B5801D',
                        ],
                    }],
            }, title: item
        })
    })
    return doughnuts;

}

export const getTCStatusForUISubDomains = (release, domain) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [];
    Object.keys(release.TcAggregate.domain).forEach((item, index) => {
        if (domain === release.TcAggregate.domain[item].tag) {
            let pass = release.TcAggregate.domain[item].Tested.auto.Pass + release.TcAggregate.domain[item].Tested.manual.Pass
            let fail = release.TcAggregate.domain[item].Tested.auto.Fail + release.TcAggregate.domain[item].Tested.manual.Fail
            let Skip = release.TcAggregate.domain[item].Tested.auto.Skip + release.TcAggregate.domain[item].Tested.manual.Skip
            let nottested = release.TcAggregate.domain[item].NotTested
            doughnuts.push({
                data: {
                    labels: [
                        'Fail(' + fail + ')',
                        'Pass(' + pass + ')',
                        'Block(' + Skip + ')',
                        'Not Tested(' + nottested + ')',
                    ],
                    datasets: [
                        {
                            data: [
                                fail,
                                pass,
                                Skip,
                                nottested
                            ],
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#B5801D',
                            ],
                            hoverBackgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#B5801D',
                            ],
                        }],
                }, title: item
            })
        }
    });
    if (doughnuts.length) {
        doughnuts.sort(function (a, b) {
            if (b.data.datasets[0].data[0] !== a.data.datasets[0].data[0]) return b.data.datasets[0].data[0] - a.data.datasets[0].data[0];
            if (b.data.datasets[0].data[1] !== a.data.datasets[0].data[1]) return b.data.datasets[0].data[1] - a.data.datasets[0].data[1];
            if (b.data.datasets[0].data[2] !== a.data.datasets[0].data[2]) return b.data.datasets[0].data[2] - a.data.datasets[0].data[2];
            if (b.data.datasets[0].data[3] !== a.data.datasets[0].data[3]) return b.data.datasets[0].data[3] - a.data.datasets[0].data[3];

        });
    }

    return doughnuts;
}

export const getTCStatusForSunburst = (release) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    if (!release.TcAggregate.domain) {
        return;
    }
    let domains = {
        name: 'domains', children: [
            {
                name: 'Storage', children: []
            },
            {
                name: 'Network', children: []
            },
            {
                name: 'Management', children: []
            },
            {
                name: 'Others', children: []
            },
        ]
    };
    Object.keys(release.TcAggregate.domain).forEach(item => {
        let domain = release.TcAggregate.domain[item];
        let total = domain.Tested.auto.Pass + domain.Tested.manual.Pass
            + domain.Tested.auto.Fail + domain.Tested.manual.Fail
            + domain.Tested.auto.Skip + domain.Tested.manual.Skip
            + domain.NotTested;
        if (domainDetail[item]) {
            domains.children[domainDetail[item].index].children.push({ name: item, size: total })
        } else {
            domains.children[3].children.push({ name: item, size: total })
        }
    });
    return domains;
}

export const getDomainStatus = (state, id) => {
    let doughnuts = [];
    let release = state.release.all.filter(item => item.ReleaseNumber === id)[0];
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    alldomains.forEach((item, index) => {
        doughnuts.push({
            data: {
                labels: [
                    'Fail (' + (release.TcAggregate.uidomain['Storage'].automated.Fail) + ')',
                    'Pass (' + (release.TcAggregate.uidomain['Network'].automated.Pass) + ')',
                    'Not Tested (' + (release.TcAggregate.uidomain['Management'].total.nonautomated) + ')',
                ],
                datasets: [
                    {
                        data: [
                            (release.TcAggregate.uidomain['Storage'].automated.Fail),
                            (release.TcAggregate.uidomain['Network'].total.automated + release.TcAggregate.uidomain['Network'].total.nonautomated),
                            (release.TcAggregate.uidomain['Management'].total.automated + release.TcAggregate.uidomain['Management'].total.nonautomated)
                        ],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                        ],
                        hoverBackgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                        ],
                    }],
            }, title: item
        })
    })
    console.log('data for tc status for domains');
    console.log(doughnuts);
    return doughnuts;

}
export const getTCStrategyForUISubDomainsDistribution = (release, domain) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [{ data: { labels: [], datasets: [] }, title: domain + ' (as per Sub-Domains)' }];
    let labels = [];
    let datasets = [
        {
            label: 'Total',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        },
        // {
        //     label: 'Manual',
        //     data: [],
        //     backgroundColor: [],
        //     hoverBackgroundColor: []
        // },
        // {
        //     label: 'Not Tested',
        //     data: [],
        //     backgroundColor: [],
        //     hoverBackgroundColor: []
        // }
    ];
    for (let i = 0; i < datasets.length; i++) {
        Object.keys(release.TcAggregate.domain).forEach((item, index) => {
            if (domain === release.TcAggregate.domain[item].tag) {
                datasets[i].backgroundColor.push(colors[index]);
                datasets[i].hoverBackgroundColor.push(colors[index]);
            }
        })
    }
    let allTotal = 0;
    Object.keys(release.TcAggregate.domain).forEach((item, index) => {
        if (domain === release.TcAggregate.domain[item].tag) {
            let auto = release.TcAggregate.domain[item].Tested.auto.Pass + release.TcAggregate.domain[item].Tested.auto.Fail + release.TcAggregate.domain[item].Tested.auto.Skip;
            let manual = release.TcAggregate.domain[item].Tested.manual.Pass + release.TcAggregate.domain[item].Tested.manual.Fail + release.TcAggregate.domain[item].Tested.manual.Skip;
            let nottested = release.TcAggregate.domain[item].NotTested
            let total = auto + manual + nottested;
            labels.push(item + ' (' + total + ')');
            datasets[0].data.push(total);
            allTotal += total;
            // datasets[1].data.push(manual);
            // datasets[2].data.push(nottested);
        }
    });
    datasets[0].label = 'Total (' + allTotal + ')';
    doughnuts[0].data.labels = labels;
    doughnuts[0].data.datasets = datasets;
    return doughnuts;
}

export const getTCStrategyForUIDomainsDistribution = (release) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [];
    let storageAuto = release.TcAggregate.uidomain['Storage'].Tested.auto.Pass + release.TcAggregate.uidomain['Storage'].Tested.auto.Fail + release.TcAggregate.uidomain['Storage'].Tested.auto.Skip;
    let storageManual = release.TcAggregate.uidomain['Storage'].Tested.manual.Pass + release.TcAggregate.uidomain['Storage'].Tested.manual.Fail + release.TcAggregate.uidomain['Storage'].Tested.manual.Skip;
    let storageNotTested = release.TcAggregate.uidomain['Storage'].NotTested;

    let networkAuto = release.TcAggregate.uidomain['Network'].Tested.auto.Pass + release.TcAggregate.uidomain['Network'].Tested.auto.Fail + release.TcAggregate.uidomain['Network'].Tested.auto.Skip;
    let networkManual = release.TcAggregate.uidomain['Network'].Tested.manual.Pass + release.TcAggregate.uidomain['Network'].Tested.manual.Fail + release.TcAggregate.uidomain['Network'].Tested.manual.Skip;
    let networkNotTested = release.TcAggregate.uidomain['Network'].NotTested;


    let managementAuto = release.TcAggregate.uidomain['Management'].Tested.auto.Pass + release.TcAggregate.uidomain['Management'].Tested.auto.Fail + release.TcAggregate.uidomain['Management'].Tested.auto.Skip;
    let managementManual = release.TcAggregate.uidomain['Management'].Tested.manual.Pass + release.TcAggregate.uidomain['Management'].Tested.manual.Fail + release.TcAggregate.uidomain['Management'].Tested.manual.Skip;
    let managementNotTested = release.TcAggregate.uidomain['Management'].NotTested;

    let othersAuto = release.TcAggregate.uidomain['Others'].Tested.auto.Pass + release.TcAggregate.uidomain['Others'].Tested.auto.Fail + release.TcAggregate.uidomain['Others'].Tested.auto.Skip;
    let othersManual = release.TcAggregate.uidomain['Others'].Tested.manual.Pass + release.TcAggregate.uidomain['Others'].Tested.manual.Fail + release.TcAggregate.uidomain['Others'].Tested.manual.Skip;
    let othersNotTested = release.TcAggregate.uidomain['Others'].NotTested;

    let each = [
        {
            auto: storageAuto, manual: storageManual, NotTested: storageNotTested,
            total: storageAuto + storageManual + storageNotTested
        },
        {
            auto: networkAuto, manual: networkManual, NotTested: networkNotTested,
            total: networkAuto + networkManual + networkNotTested
        },
        {
            auto: managementAuto, manual: managementManual, NotTested: managementNotTested,
            total: managementAuto + managementManual + managementNotTested
        },
        {
            auto: othersAuto, manual: othersManual, NotTested: othersNotTested,
            total: othersAuto + othersManual + othersNotTested
        },
    ]

    // alldomains.forEach((item, index) => {
    doughnuts.push({
        data: {
            labels: [
                // 'Not Tested (' + each[index].NotTested + ')',
                // 'Auto (' + each[index].auto + ')',
                // 'Manual (' + each[index].manual + ')',
                'Storage (' + each[0].total + ')',
                'Network (' + each[1].total + ')',
                'Management (' + each[2].total + ')',
                'Others (' + each[3].total + ')',
            ],
            datasets: [
                {
                    label: 'Total (' + (each[0].total + each[1].total + each[2].total + each[3].total) + ')',
                    data: [
                        each[0].total,
                        each[1].total,
                        each[2].total,
                        each[3].total
                        // each[index].NotTested,
                        // each[index].auto,
                        // each[index].manual,
                    ],
                    backgroundColor: [
                        // '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#FF6384',
                        '#B5801D',
                        // '#FFCE56',
                        // '#B5801D',
                    ],
                    hoverBackgroundColor: [
                        // '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#FF6384',
                        '#B5801D',
                        // '#FFCE56',
                        // '#B5801D',
                    ],
                },
                // {
                //     label: 'Manual',
                //     data: [
                //         each[0].manual,
                //         each[1].manual,
                //         each[2].manual,
                //         each[3].manual
                //         // each[index].NotTested,
                //         // each[index].auto,
                //         // each[index].manual,
                //     ],
                //     backgroundColor: [
                //         '#FFCE56',
                //         '#FFCE56',
                //         '#FFCE56',
                //         '#FFCE56',
                //         // '#910727',
                //         // '#F1E956',
                //         // '#821F49',
                //         // '#B5801D',
                //     ],
                //     hoverBackgroundColor: [
                //         '#FFCE56',
                //         '#FFCE56',
                //         '#FFCE56',
                //         '#FFCE56',
                //         // '#910727',
                //         // '#F1E956',
                //         // '#821F49',
                //         // '#B5801D',
                //     ],
                // },
                // {
                //     label: 'Not Tested',
                //     data: [
                //         each[0].NotTested,
                //         each[1].NotTested,
                //         each[2].NotTested,
                //         each[3].NotTested
                //         // each[index].NotTested,
                //         // each[index].auto,
                //         // each[index].manual,
                //     ],
                //     backgroundColor: [
                //         '#FF6384',
                //         '#FF6384',
                //         '#FF6384',
                //         '#FF6384',
                //         // '#910727',
                //         // '#F1E956',
                //         // '#821F49',
                //         // '#B5801D',
                //     ],
                //     hoverBackgroundColor: [
                //         '#FF6384',
                //         '#FF6384',
                //         '#FF6384',
                //         '#FF6384',
                //         // '#910727',
                //         // '#F1E956',
                //         // '#821F49',
                //         // '#B5801D',
                //     ],
                // },
            ],
        }, title: 'as per Domains'
    })

    // })
    return doughnuts;
}
export const getTCStrategyForUISubDomains = (release, domain) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [{ data: { labels: [], datasets: [] }, title: domain + ' (as per Work)' }];
    let labels = [];
    let datasets = [
        {
            label: 'Auto',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        },
        {
            label: 'Manual',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        },
        {
            label: 'Not Tested',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        }
    ];
    for (let i = 0; i < datasets.length; i++) {
        Object.keys(release.TcAggregate.domain).forEach((item, index) => {
            if (domain === release.TcAggregate.domain[item].tag) {
                datasets[i].backgroundColor.push(colors[i]);
                datasets[i].hoverBackgroundColor.push(colors[i]);
            }
        })
    }
    let autoTotal = 0;
    let manualTotal = 0;
    let notTestedTotal = 0;
    Object.keys(release.TcAggregate.domain).forEach((item, index) => {
        if (domain === release.TcAggregate.domain[item].tag) {
            let auto = release.TcAggregate.domain[item].Tested.auto.Pass + release.TcAggregate.domain[item].Tested.auto.Fail + release.TcAggregate.domain[item].Tested.auto.Skip;
            let manual = release.TcAggregate.domain[item].Tested.manual.Pass + release.TcAggregate.domain[item].Tested.manual.Fail + release.TcAggregate.domain[item].Tested.manual.Skip;
            let nottested = release.TcAggregate.domain[item].NotTested
            let total = auto + manual + nottested;
            labels.push(item + ' (' + total + ')');
            datasets[0].data.push(auto);
            autoTotal += auto;
            datasets[1].data.push(manual);
            manualTotal += manual;
            datasets[2].data.push(nottested);
            notTestedTotal += nottested;
        }
    });
    datasets[0].label = 'Auto (' + autoTotal + ')';
    datasets[1].label = 'Manual (' + manualTotal + ')'
    datasets[2].label = 'Not Tested (' + notTestedTotal + ')'
    doughnuts[0].data.labels = labels;
    doughnuts[0].data.datasets = datasets;
    return doughnuts;
}
// export const getTCStrategyForUISubDomains = (release, domain) => {
//     if (!release) {
//         return;
//     }
//     if (!release.TcAggregate) {
//         return;
//     }
//     let doughnuts = [{ data: { labels: [], datasets: [] }, title: domain + ' (as per Work)' }];
//     let labels = [];
//     let datasets = [
//         {
//             label: 'Auto',
//             data: [],
//             backgroundColor: [],
//             hoverBackgroundColor: []
//         },
//         {
//             label: 'Manual',
//             data: [],
//             backgroundColor: [],
//             hoverBackgroundColor: []
//         },
//         {
//             label: 'Not Applicable',
//             data: [],
//             backgroundColor: [],
//             hoverBackgroundColor: []
//         }
//     ];
//     for (let i = 0; i < datasets.length; i++) {
//         Object.keys(release.TcAggregate.domain).forEach((item, index) => {
//             if (domain === release.TcAggregate.domain[item].tag) {
//                 datasets[i].backgroundColor.push(colors[i]);
//                 datasets[i].hoverBackgroundColor.push(colors[i]);
//             }
//         })
//     }
//     let autoTotal = 0;
//     let manualTotal = 0;
//     let notTestedTotal = 0;
//     Object.keys(release.TcAggregate.domain).forEach((item, index) => {
//         if (domain === release.TcAggregate.domain[item].tag) {
//             let auto = release.TcAggregate.domain[item].Tested.auto.Pass + release.TcAggregate.domain[item].Tested.auto.Fail + release.TcAggregate.domain[item].Tested.auto.Skip;
//             let manual = release.TcAggregate.domain[item].Tested.manual.Pass + release.TcAggregate.domain[item].Tested.manual.Fail + release.TcAggregate.domain[item].Tested.manual.Skip;
//             let nottested = release.TcAggregate.domain[item].NotApplicable
//             let total = auto + manual + nottested;
//             labels.push(item + ' (' + total + ')');
//             datasets[0].data.push(auto);
//             autoTotal += auto;
//             datasets[1].data.push(manual);
//             manualTotal += manual;
//             datasets[2].data.push(nottested);
//             notTestedTotal += nottested;
//         }
//     });
//     datasets[0].label = 'Auto (' + autoTotal + ')';
//     datasets[1].label = 'Manual (' + manualTotal + ')'
//     datasets[2].label = 'Not Applicable (' + notTestedTotal + ')'
//     doughnuts[0].data.labels = labels;
//     doughnuts[0].data.datasets = datasets;
//     return doughnuts;
// }
export const getTCStrategyForUISubDomainsScenario = (release, domain, scenario, all) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [{ data: { labels: [], datasets: [] }, title: domain + ' (as per Work)' }];
    let labels = [];
    let datasets = [
        {
            label: 'Auto',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        },
        {
            label: 'Manual',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        },
        {
            label: 'Not Applicable',
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        }
    ];
    for (let i = 0; i < datasets.length; i++) {
        Object.keys(release.TcAggregate.domain).forEach((item, index) => {
            if (domain === release.TcAggregate.domain[item].tag && release.TcAggregate.domain[item].Domain === scenario) {
                datasets[i].backgroundColor.push(colors[i]);
                datasets[i].hoverBackgroundColor.push(colors[i]);
            }
        })
    }
    let autoTotal = 0;
    let manualTotal = 0;
    let notTestedTotal = 0;
    Object.keys(release.TcAggregate.domain).forEach((item, index) => {
        if (domain === release.TcAggregate.domain[item].tag && item === scenario) {
            let auto = release.TcAggregate.domain[item].Tested.auto.Pass + release.TcAggregate.domain[item].Tested.auto.Fail + release.TcAggregate.domain[item].Tested.auto.Skip;
            let manual = release.TcAggregate.domain[item].Tested.manual.Pass + release.TcAggregate.domain[item].Tested.manual.Fail + release.TcAggregate.domain[item].Tested.manual.Skip;
            let nottested = release.TcAggregate.domain[item].NotApplicable
            let total = auto + manual + nottested;
            labels.push(item + ' (' + total + ')');
            datasets[0].data.push(auto);
            autoTotal += auto;
            datasets[1].data.push(manual);
            manualTotal += manual;
            datasets[2].data.push(nottested);
            notTestedTotal += nottested;
        }
    });
    datasets[0].label = 'Auto (' + autoTotal + ')';
    datasets[1].label = 'Manual (' + manualTotal + ')'
    datasets[2].label = 'Not Applicable (' + notTestedTotal + ')'
    doughnuts[0].data.labels = labels;
    doughnuts[0].data.datasets = datasets;
    return doughnuts;
}

export const getTCStrategyForUIDomains = (release) => {
    if (!release) {
        return;
    }
    if (!release.TcAggregate) {
        return;
    }
    let doughnuts = [];
    let storageAuto = release.TcAggregate.uidomain['Storage'].Tested.auto.Pass + release.TcAggregate.uidomain['Storage'].Tested.auto.Fail + release.TcAggregate.uidomain['Storage'].Tested.auto.Skip;
    let storageManual = release.TcAggregate.uidomain['Storage'].Tested.manual.Pass + release.TcAggregate.uidomain['Storage'].Tested.manual.Fail + release.TcAggregate.uidomain['Storage'].Tested.manual.Skip;
    let storageNotTested = release.TcAggregate.uidomain['Storage'].NotApplicable;

    let networkAuto = release.TcAggregate.uidomain['Network'].Tested.auto.Pass + release.TcAggregate.uidomain['Network'].Tested.auto.Fail + release.TcAggregate.uidomain['Network'].Tested.auto.Skip;
    let networkManual = release.TcAggregate.uidomain['Network'].Tested.manual.Pass + release.TcAggregate.uidomain['Network'].Tested.manual.Fail + release.TcAggregate.uidomain['Network'].Tested.manual.Skip;
    let networkNotTested = release.TcAggregate.uidomain['Network'].NotApplicable;


    let managementAuto = release.TcAggregate.uidomain['Management'].Tested.auto.Pass + release.TcAggregate.uidomain['Management'].Tested.auto.Fail + release.TcAggregate.uidomain['Management'].Tested.auto.Skip;
    let managementManual = release.TcAggregate.uidomain['Management'].Tested.manual.Pass + release.TcAggregate.uidomain['Management'].Tested.manual.Fail + release.TcAggregate.uidomain['Management'].Tested.manual.Skip;
    let managementNotTested = release.TcAggregate.uidomain['Management'].NotApplicable;

    let othersAuto = release.TcAggregate.uidomain['Others'].Tested.auto.Pass + release.TcAggregate.uidomain['Others'].Tested.auto.Fail + release.TcAggregate.uidomain['Others'].Tested.auto.Skip;
    let othersManual = release.TcAggregate.uidomain['Others'].Tested.manual.Pass + release.TcAggregate.uidomain['Others'].Tested.manual.Fail + release.TcAggregate.uidomain['Others'].Tested.manual.Skip;
    let othersNotTested = release.TcAggregate.uidomain['Others'].NotApplicable;

    let each = [
        {
            auto: storageAuto, manual: storageManual, NotTested: storageNotTested,
            total: storageAuto + storageManual + storageNotTested
        },
        {
            auto: networkAuto, manual: networkManual, NotTested: networkNotTested,
            total: networkAuto + networkManual + networkNotTested
        },
        {
            auto: managementAuto, manual: managementManual, NotTested: managementNotTested,
            total: managementAuto + managementManual + managementNotTested
        },
        {
            auto: othersAuto, manual: othersManual, NotTested: othersNotTested,
            total: othersAuto + othersManual + othersNotTested
        },
    ]

    // alldomains.forEach((item, index) => {
    doughnuts.push({
        data: {
            labels: [
                // 'Not Tested (' + each[index].NotTested + ')',
                // 'Auto (' + each[index].auto + ')',
                // 'Manual (' + each[index].manual + ')',
                'Storage (' + each[0].total + ')',
                'Network (' + each[1].total + ')',
                'Management (' + each[2].total + ')',
                'Others (' + each[3].total + ')',
            ],
            datasets: [
                {
                    label: 'Auto (' + (each[0].auto + each[1].auto + each[2].auto + each[3].auto) + ')',
                    data: [
                        each[0].auto,
                        each[1].auto,
                        each[2].auto,
                        each[3].auto
                        // each[index].NotTested,
                        // each[index].auto,
                        // each[index].manual,
                    ],
                    backgroundColor: [
                        // '#FF6384',
                        '#36A2EB',
                        '#36A2EB',
                        '#36A2EB',
                        '#36A2EB',
                        // '#FFCE56',
                        // '#B5801D',
                    ],
                    hoverBackgroundColor: [
                        // '#FF6384',
                        '#36A2EB',
                        '#36A2EB',
                        '#36A2EB',
                        '#36A2EB',
                        // '#FFCE56',
                        // '#B5801D',
                    ],
                },
                {
                    label: 'Manual (' + (each[0].manual + each[1].manual + each[2].manual + each[3].manual) + ')',
                    data: [
                        each[0].manual,
                        each[1].manual,
                        each[2].manual,
                        each[3].manual
                        // each[index].NotTested,
                        // each[index].auto,
                        // each[index].manual,
                    ],
                    backgroundColor: [
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56',
                        // '#910727',
                        // '#F1E956',
                        // '#821F49',
                        // '#B5801D',
                    ],
                    hoverBackgroundColor: [
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56',
                        // '#910727',
                        // '#F1E956',
                        // '#821F49',
                        // '#B5801D',
                    ],
                },
                {
                    label: 'Not Applicable (' + (each[0].NotTested + each[1].NotTested + each[2].NotTested + each[3].NotTested) + ')',
                    data: [
                        each[0].NotTested,
                        each[1].NotTested,
                        each[2].NotTested,
                        each[3].NotTested
                        // each[index].NotTested,
                        // each[index].auto,
                        // each[index].manual,
                    ],
                    backgroundColor: [
                        '#FF6384',
                        '#FF6384',
                        '#FF6384',
                        '#FF6384',
                        // '#910727',
                        // '#F1E956',
                        // '#821F49',
                        // '#B5801D',
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#FF6384',
                        '#FF6384',
                        '#FF6384',
                        // '#910727',
                        // '#F1E956',
                        // '#821F49',
                        // '#B5801D',
                    ],
                },
            ],
        }, title: 'as per Work'
    })
    // })
    return doughnuts;

}


const colors = [
    '#B5801D',
    '#B959E9',
    '#6A58E6',
    '#EEF3E6',
    '#D1EF67',
    '#BACEAB',
    '#A2AC6A',
    '#05ED9D',
    '#1AABCD',
    '#99812E',
    '#60C3DF',
    '#C7CC4D',
    '#910727',
    '#F1E956',
    '#821F49',
    '#069D8B',
    '#9BE914',
    '#2E270D',
    '#07A345',
    '#FE3D1D',
    '#BB00F1',
    '#3DFD87',
    '#AF31CA',
    '#96568A',
    '#5B5013',
    '#A660F8',
    '#549609',
    '#29CBB4',
    '#7E31BB',
    '#01C5AF',
    '#4786E1',
    '#D04616',
    '#CA5B9F',
    '#F07444',
    '#292FAB',
    '#CD50B2',
    '#EFACF6',
    '#B6BCD4',
    '#D8285A',
    '#474AD7',
    '#910E7E',
    '#ADED5A',
    '#77CE6E',
    '#E8C05C',
    '#F04B07',
    '#2E06D7',
    '#70469D',
    '#1F1E7D',
    '#278A44',
    '#7A6BA2',
    '#EA981D',
    '#24C5D5',
    '#781BC3',
    '#1ECD0D',
    '#AE4854',
    '#4F5783',
    '#77765B',
    '#7AC913',
    '#716C1C',
    '#E73582',
    '#D2713F',
    '#33B5E6',
    '#61981E',
    '#D182FA',
    '#D278F3',
    '#ED594F',
    '#B5C841',
    '#23EA2A',
    '#09EBF8',
    '#9A5815',
    '#688DF9',
    '#12A11D',
    '#A1F43F',
    '#4807C2',
    '#DC5D83',
    '#2D0AEE',
    '#101463',
    '#3E47E6',
    '#AE93BF',
    '#DF1BF0',
    '#EFAE92',
    '#C8EEEF',
    '#B310F4',
    '#F69351',
    '#24E9FF',
    '#3C878E',
    '#D7CAD6',
    '#A30A3D',
    '#827A4E',
    '#FA9128',
    '#0F34A6',
    '#92C7DE',
    '#0CA169',
    '#F8E5D8',
    '#135CCC',
    '#56FB95',
    '#25E867',
    '#83626A',
    '#6093D0',
    '#ED5C5E'
]
