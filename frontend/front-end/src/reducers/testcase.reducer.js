// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';

import {
    DELETE_TEST_CASE,
    SAVE_TEST_CASE,
    SAVE_TEST_CASE_STATUS,
    SAVE_SINGLE_TEST_CASE,
    UPDATE_TC_EDIT,

    SAVE_E2E,
    SAVE_SINGLE_E2E,
    UPDATE_E2E_EDIT,

    UPDATE_SANITY_EDIT,
    SAVE_LONGEVITY,
    SAVE_STRESS
} from '../actions';

const initialState = {
    testcases: {},
    testcaseStatus: {},
    testcaseDetail: {},
    testcaseEdit: { Master: true, errors: {} },
    e2e: [],
    e2eDetails: {},
    e2eEdit: {},
    sanityEdit: {},
    stress: [],
    longevity: []
};

// TO BE REMOVEED
// const types = [
//     { key: 'PVC_Remote', Domain: 'Storage PVC', SubDomain: 'Remote' },
//     { key: 'PVC_Local', Domain: 'Storage PVC', SubDomain: 'Local' },
//     { key: 'PVC_Mirrored', Domain: 'Storage PVC', SubDomain: 'Mirrored' },
//     { key: 'SR', Domain: 'Storage Remote', SubDomain: 'Remote' },
//     { key: 'SS', Domain: 'Storage Snapshot', SubDomain: 'Snapshot' },
//     { key: 'N_HostNetwork', Domain: 'Network', SubDomain: 'Host Network' },
//     { key: 'N_Endpoint', Domain: 'Network', SubDomain: 'Endpoint' },
//     { key: 'AT_Qos', Domain: 'Qos', tag: 'Additional Test' },
//     { key: 'M_Migration', Domain: 'Management', SubDomain: 'Master Migration' },
//     { key: 'MZ_ZoneCapability', Domain: 'Multizone Cluster', SubDomain: 'Zone Capability' },
//     { key: 'MZ_BasicNW', Domain: 'Multizone Cluster', SubDomain: 'Basic Networking' },
// ]
// const sortTestCaseByDomain = (tc) => {
//     types.forEach(item => {
//         if (!tc.Domain) {
//             if (tc.TcID.search(item.key) !== -1) {
//                 tc = { ...tc, Domain: item.Domain, SubDomain: item.SubDomain, tag: item.tag, Setup: item.Setup ? item.Setup : 'Common' }
//             }
//         }
//     });
//     return tc;
// }
// ////////////////////
// Modifiers //////////
// //////////////////

// ////////////////////
// Reducers //////////
// //////////////////
function all(state = initialState.testcases, action) {
    switch (action.type) {
        case SAVE_TEST_CASE:
            state[action.payload.id] = action.payload.data;
            return { ...state };


        case DELETE_TEST_CASE:
            let found = null;
            state.forEach((item, index) => {
                if (item.ReleaseNumber === action.payload.id) {
                    found = index;
                }
            });
            if (found !== null) {
                state.splice(found, 1);
            }
            return { ...state };

        default:
            return state;
    }
}
function status(state = initialState.testcaseStatus, action) {
    switch (action.type) {
        case SAVE_TEST_CASE_STATUS:
            state[action.payload.id] = action.payload.data;
            return { ...state };
        default:
            return state;
    }
}
function testcaseDetail(state = initialState.testcaseDetail, action) {
    switch (action.type) {
        case SAVE_SINGLE_TEST_CASE:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function testcaseEdit(state = initialState.testcaseEdit, action) {
    switch (action.type) {
        case UPDATE_TC_EDIT:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function e2e(state = initialState.e2e, action) {
    switch (action.type) {
        case SAVE_E2E:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function stress(state = initialState.stress, action) {
    switch (action.type) {
        case SAVE_STRESS:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function longevity(state = initialState.longevity, action) {
    switch (action.type) {
        case SAVE_LONGEVITY:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function e2eDetails(state = initialState.e2eDetails, action) {
    switch (action.type) {
        case SAVE_SINGLE_E2E:
            state = action.payload
            return state;
        default:
            return state;
    }
}
function e2eEdit(state = initialState.e2eEdit, action) {
    switch (action.type) {
        case UPDATE_E2E_EDIT:
            state = action.payload
            return state;
        default:
            return state;
    }
}

function sanityEdit(state = initialState.sanityEdit, action) {
    switch (action.type) {
        case UPDATE_SANITY_EDIT:
            state = action.payload
            return state;
        default:
            return state;
    }
}

export const testcaseReducer = combineReducers({
    all,
    status,
    testcaseDetail,
    testcaseEdit,
    e2e,
    e2eDetails,
    e2eEdit,
    sanityEdit,
    longevity,
    stress
});

// ////////////////////
// Selectors //////////
// //////////////////
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
export const getEachTCStatusScenario = ({ data, domain, all }) => {
    if (!data) {
        return;
    }
    let doughnuts = [];
    let cardTypes = {};
    data.forEach(item => {
        if (cardTypes[item.CardType]) {
            cardTypes[item.CardType].push(item);
        } else {
            cardTypes[item.CardType] = [item];
        }
    });
    let totalPass = 0;
    let totalFail = 0;
    let totalSkip = 0;
    let totalNA = 0;
    let totalNT = 0;
    let cardSubdomains = 0;
    Object.keys(cardTypes).forEach(cardType => {
        let scenarios = {};
        data.forEach(item => {
            if (scenarios[item.SubDomain]) {
                scenarios[item.SubDomain].Total += 1;
            } else {
                scenarios[item.SubDomain] = { Pass: 0, Fail: 0, Skip: 0, Total: 1, Tested: 0, NotTested: 0, NotApplicable:0 }
            }
        })
        cardTypes[cardType].forEach(item => {
            if (scenarios[item.SubDomain]) {
                // if (scenarios[item.SubDomain].Result === 'Pass') {
                //     scenarios[item.SubDomain].Pass += 1
                // } else if (scenarios[item.SubDomain].Result === 'Fail') {
                //     scenarios[item.SubDomain].Fail += 1
                // } else {
                //     scenarios[item.SubDomain].Skip += 1
                // }
                // scenarios[item.SubDomain].Tested += 1;
                if (item.Result === 'Pass') {
                    scenarios[item.SubDomain].Pass += 1
                    totalPass += 1;
                }
                if (item.Result === 'Fail') {
                    scenarios[item.SubDomain].Fail += 1
                    totalFail += 1;
                }
                if (item.Result === 'Skip') {
                    scenarios[item.SubDomain].Skip += 1;
                    totalSkip += 1;
                }
                if (item.Result === 'NotApplicable') {
                    scenarios[item.SubDomain].NotApplicable += 1;
                    totalNA += 1;
                }
                if (item.Result === 'Not Tested') {
                    scenarios[item.SubDomain].NotTested += 1;
                    totalNT += 1;
                }
            } else {
                console.log('DATA IS INVALID');
            }
        });
        // {
        //     "id": 8, "TcName": "RbacStaticProvision.PodWithLSAndValidateIOPSWithMultipleQosforLocalNRemoteAuth",
        //         "Build": "2.3.0-48", "Result": "Pass", "Bugs": "-1",
        //             "Date": "2019-12-21", "Domain": "StoragePVC", "SubDomain": "PVC_Rbac", "TcID": "PVC_Rbac_S-1.0"
        // },
        let doughnut = { data: { labels: [], datasets: [] }, title: cardType, CardType: cardType, SubDomains:{} };
        let labels = [];
        let datasets = [
            {
                label: 'Pass (' + totalPass + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            },
            {
                label: 'Blocked (' + totalSkip + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            },
            {
                label: 'Fail (' + totalFail + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            },
            {
                label: 'Not Tested (' + totalNT + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }
        ];
        for (let i = 0; i < datasets.length; i++) {
            Object.keys(scenarios).forEach((item, index) => {
                datasets[i].backgroundColor.push(colors[i]);
                datasets[i].hoverBackgroundColor.push(colors[i]);
            })
        }

        Object.keys(scenarios).forEach((item, index) => {
            let pass = scenarios[item].Pass;
            let skip = scenarios[item].Skip;
            let fail = scenarios[item].Fail;
            let nottested = scenarios[item].NotTested;
            let total = pass+fail+skip+nottested+scenarios[item].NotApplicable;
            labels.push(item + ' (' + total + ')');
            doughnut.SubDomains[item] ={Pass: pass, Fail: fail, Total: total}
            datasets[0].data.push(pass);
            datasets[1].data.push(skip);
            datasets[2].data.push(fail);
            datasets[3].data.push(nottested);
        });
        doughnut.data.labels = labels;
        doughnut.data.datasets = datasets;
        doughnuts.push(doughnut);

    });
    return doughnuts;
}



export const getEachTCStrategyScenario = ({ data, domain, release }) => {
    if (!data) {
        return;
    }
    let doughnuts = [];
    let cardTypes = {};
    let totalAuto = 0, totalManual = 0, totalNA = 0;
    data.forEach(item => {
        if (cardTypes[item.CardType]) {
            cardTypes[item.CardType].push(item);
        } else {
            cardTypes[item.CardType] = [item];
        }
    });
    Object.keys(cardTypes).forEach(cardType => {
        let scenarios = {};
        data.forEach(item => {
            if (item.CardType === cardType) {
                if (scenarios[item.SubDomain]) {
                    scenarios[item.SubDomain].Total += 1;
                } else {
                    scenarios[item.SubDomain] = { auto: 0, manual: 0, Total: 1, NotTested: 0 }
                }
            }
        })
        cardTypes[cardType].forEach(item => {
            if (scenarios[item.SubDomain]) {
                if ((item.Result === 'Pass' || item.Result === 'Fail') && item.TcName !== 'TC NOT AUTOMATED') {
                    scenarios[item.SubDomain].auto += 1
                    totalAuto += 1;
                }
                if ((item.Result === 'Pass' || item.Result === 'Fail') && item.TcName === 'TC NOT AUTOMATED') {
                    scenarios[item.SubDomain].manual += 1
                    totalManual += 1;
                }
                if (item.Result === 'Not Tested') {
                    scenarios[item.SubDomain].NotTested += 1;
                    totalNA += 1;
                }
            } else {
                console.log('DATA IS INVALID');
            }
        });
        // Object.keys(scenarios).forEach(item => {
        //     scenarios[item].NotTested = scenarios[item].Total - (scenarios[item].auto + scenarios[item].manual)
        // })
        // {
        //     "id": 8, "TcName": "RbacStaticProvision.PodWithLSAndValidateIOPSWithMultipleQosforLocalNRemoteAuth",
        //         "Build": "2.3.0-48", "Result": "Pass", "Bugs": "-1",
        //             "Date": "2019-12-21", "Domain": "StoragePVC", "SubDomain": "PVC_Rbac", "TcID": "PVC_Rbac_S-1.0"
        // },
        let doughnut = { data: { labels: [], datasets: [] }, title: cardType };
        let labels = [];
        let datasets = [
            {
                label: 'Auto (' + totalAuto + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            },
            {
                label: 'Manual (' + totalManual + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            },
            // {
            //     label: 'Fail',
            //     data: [],
            //     backgroundColor: [],
            //     hoverBackgroundColor: []
            // },
            {
                label: 'Not Tested (' + totalNA + ')',
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }
        ];
        for (let i = 0; i < datasets.length; i++) {
            Object.keys(scenarios).forEach((item, index) => {
                datasets[i].backgroundColor.push(colors[i]);
                datasets[i].hoverBackgroundColor.push(colors[i]);
            })
        }

        Object.keys(scenarios).forEach((item, index) => {
            let auto = scenarios[item].auto;
            let manual = scenarios[item].manual;
            // let fail = scenarios[item].Fail;
            // let nottested = scenarios[item].Total - scenarios[item].Tested;
            let na = scenarios[item].NotTested;
            let total = scenarios[item].auto + scenarios[item].manual + scenarios[item].NotTested;
            labels.push(item + ' (' + total + ')');
            datasets[0].data.push(auto);
            datasets[1].data.push(manual);
            datasets[2].data.push(na);
        });
        doughnut.data.labels = labels;
        doughnut.data.datasets = datasets;
        if (datasets[0].backgroundColor.length === 0) {
            doughnut.hide = true
        }
        doughnuts.push(doughnut);

    });
    return doughnuts;
}

// export const getEachTCStrategyScenario = ({ data, domain, release }) => {
//     if (!data) {
//         return;
//     }
//     let doughnuts = [];
//     let cardTypes = {};
//     let totalAuto = 0, totalManual = 0, totalNA = 0;
//     data.forEach(item => {
//         if (cardTypes[item.CardType]) {
//             cardTypes[item.CardType].push(item);
//         } else {
//             cardTypes[item.CardType] = [item];
//         }
//     });
//     Object.keys(cardTypes).forEach(cardType => {
//         let scenarios = {};
//         data.forEach(item => {
//             if (item.CardType === cardType) {
//                 if (scenarios[item.SubDomain]) {
//                     scenarios[item.SubDomain].Total += 1;
//                 } else {
//                     scenarios[item.SubDomain] = { auto: 0, manual: 0, Total: 1, NotApplicable: 0 }
//                 }
//             }
//         })
//         cardTypes[cardType].forEach(item => {
//             if (scenarios[item.SubDomain]) {
//                 if ((item.Result === 'Pass' || item.Result === 'Fail') && item.TcName !== 'TC NOT AUTOMATED') {
//                     scenarios[item.SubDomain].auto += 1
//                     totalAuto += 1;
//                 }
//                 if ((item.Result === 'Pass' || item.Result === 'Fail') && item.TcName === 'TC NOT AUTOMATED') {
//                     scenarios[item.SubDomain].manual += 1
//                     totalManual += 1;
//                 }
//                 if (item.Result === 'Not Applicable') {
//                     scenarios[item.SubDomain].NotApplicable += 1;
//                     totalNA += 1;
//                 }
//             } else {
//                 console.log('DATA IS INVALID');
//             }
//         });
//         // Object.keys(scenarios).forEach(item => {
//         //     scenarios[item].NotTested = scenarios[item].Total - (scenarios[item].auto + scenarios[item].manual)
//         // })
//         // {
//         //     "id": 8, "TcName": "RbacStaticProvision.PodWithLSAndValidateIOPSWithMultipleQosforLocalNRemoteAuth",
//         //         "Build": "2.3.0-48", "Result": "Pass", "Bugs": "-1",
//         //             "Date": "2019-12-21", "Domain": "StoragePVC", "SubDomain": "PVC_Rbac", "TcID": "PVC_Rbac_S-1.0"
//         // },
//         let doughnut = { data: { labels: [], datasets: [] }, title: cardType };
//         let labels = [];
//         let datasets = [
//             {
//                 label: 'Auto (' + totalAuto + ')',
//                 data: [],
//                 backgroundColor: [],
//                 hoverBackgroundColor: []
//             },
//             {
//                 label: 'Manual (' + totalManual + ')',
//                 data: [],
//                 backgroundColor: [],
//                 hoverBackgroundColor: []
//             },
//             // {
//             //     label: 'Fail',
//             //     data: [],
//             //     backgroundColor: [],
//             //     hoverBackgroundColor: []
//             // },
//             {
//                 label: 'Not Applicable (' + totalNA + ')',
//                 data: [],
//                 backgroundColor: [],
//                 hoverBackgroundColor: []
//             }
//         ];
//         for (let i = 0; i < datasets.length; i++) {
//             Object.keys(scenarios).forEach((item, index) => {
//                 datasets[i].backgroundColor.push(colors[i]);
//                 datasets[i].hoverBackgroundColor.push(colors[i]);
//             })
//         }

//         Object.keys(scenarios).forEach((item, index) => {
//             let auto = scenarios[item].auto;
//             let manual = scenarios[item].manual;
//             // let fail = scenarios[item].Fail;
//             // let nottested = scenarios[item].Total - scenarios[item].Tested;
//             let na = scenarios[item].NotApplicable;
//             let total = scenarios[item].auto + scenarios[item].manual + scenarios[item].NotApplicable;
//             labels.push(item + ' (' + total + ')');
//             datasets[0].data.push(auto);
//             datasets[1].data.push(manual);
//             datasets[2].data.push(na);
//         });
//         doughnut.data.labels = labels;
//         doughnut.data.datasets = datasets;
//         if (datasets[0].backgroundColor.length === 0) {
//             doughnut.hide = true
//         }
//         doughnuts.push(doughnut);

//     });
//     return doughnuts;
// }
const colors = [

    '#36A2EB',
    '#FFCE56',
    '#B5801D',
    '#FF6384',
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
// doughnut = {
//     labels: [
//         'Red',
//         'Green',
//         'Yellow',
//     ],
//     datasets: [
//         {
//             data: [300, 50, 100],
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