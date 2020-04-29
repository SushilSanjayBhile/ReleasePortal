// JIRA ATLASSIAN TOKEN: cemD1yQmrI20xSBId0QOC880
// generated: YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw
/**
 * mock server for serving sunburst data to angular client
 */
// while passing information send only those TCS which are not CREATED,UPDATED,DELETED OR NON-APPROVED
const express = require('express');
const jsonfile = require('jsonfile')
let releases = jsonfile.readFileSync('./releases.json');
let assignedTCs = jsonfile.readFileSync('./currentAssigned.json');
let users = jsonfile.readFileSync('./users.json');
let allTcs = jsonfile.readFileSync('./tcCompleteSort.json');
let initTC = jsonfile.readFileSync('./initTC.json');
let selectedTC = jsonfile.readFileSync('./initSelect.json');

// assignedTCs['2.3.0'] = { "ADMIN": Object.keys(allTcs['2.3.0']) }
let statusOptions = jsonfile.readFileSync('./constants.json');
let tcs = {};
let updatedReleases = {};

var jiraHeaders = null;
var searchArgs = null;

function assignPriority(priority, release) {
    Object.keys(allTcs[`${release}`]).forEach(item => {
        if (allTcs[`${release}`][`${item}`] && (allTcs[`${release}`][`${item}`].Priority === '' || !allTcs[`${release}`][`${item}`].Priority)) {
            allTcs[`${release}`][`${item}`].Priority = priority;
        }
    })
}

// function assign() {
//     Object.keys(allTcs).forEach(release => {
//         Object.keys(allTcs[release]).forEach(item => {
//             if (allTcs[release][item]) {
//                 allTcs[release][item]['WorkingStatus'] = 'UNASSIGNED';
//             }
//         })
//     })
// }
// assign();

// function assignMasterPriority() {
//     Object.keys(allTcs).forEach(release => {
//         if (allTcs[release]) {
//             Object.keys(allTcs[release]).forEach(item => {
//                 if (allTcs[release][item]) {
//                     allTcs[release][item]['Priority'] = '';
//                 }
//             })
//         }
//     })
// }
// assignMasterPriority();

// function assignMasterNotTested() {
//     Object.keys(allTcs).forEach(release => {
//         Object.keys(allTcs[release]).forEach(item => {
//             if (allTcs[release][item]) {
//                 allTcs[release][item]['CurrentStatus'] = 'NotTested';
//             }
//         })
//     })
// }
// assignMasterNotTested();


// function sortInfo() {
//     updatedReleases = jsonfile.readFileSync('./releases.json');
//     let TCMaster = jsonfile.readFileSync('./masterTC.json');
//     let TC230 = jsonfile.readFileSync('./230TC.json');
//     let status = jsonfile.readFileSync('./tcstatus.json');

//     let tcs230 = {};
//     let tcsMaster = {};
//     let domainsMaster = {};
//     let domains230 = {};
//     let total = 0;
//     let masterAggr = { domain: {}, all: { "Tested": { "auto": { "Pass": 0, "Fail": 0, "Skip": 0 }, "manual": { "Pass": 0, "Fail": 0, "Skip": 0 } }, "NotTested": 0, "NotApplicable": 0, "Block": 0, "Skip": 0 } }
//     TC230.forEach(item => {
//         if (domains230[item.Domain]) {
//             if (!domains230[item.Domain].includes(item.SubDomain)) {
//                 domains230[item.Domain].push(item.SubDomain);
//             }
//         } else {
//             domains230[item.Domain] = [];
//         }
//         item.WorkingStatus = 'RESOLVED';
//         item.Activity = [{
//             "Date": "2019-12-30T00:00:00.000Z",
//             "Header": "RESOLVED: master, REPORTER:",
//             "Details": {},
//             "StatusChangeComments": "RESOLVED"
//         }];
//         item.AutoBuilds = [];
//         item.Tag = 'DAILY';
//         item.ManualBuilds = [];
//         item.LatestE2EBuilds = [];
//         item.Master = true;
//         item.Date = '2019-12-30T00:00:00.000Z';
//         item.Assignee = 'ADMIN';
//         item.Priority = '';
//         item.Steps = '';
//         item.CurrentStatus = 'NotTested';
//         tcs230[item.TcID] = item;
//     });
//     TCMaster.forEach(item => {
//         if (domainsMaster[item.Domain]) {
//             if (!domainsMaster[item.Domain].includes(item.SubDomain)) {
//                 domainsMaster[item.Domain].push(item.SubDomain);
//             }
//             masterAggr.domain[item.Domain].NotTested += item.CardType.length;
//             total += item.CardType.length;
//         } else {
//             total += item.CardType.length;
//             masterAggr.domain[item.Domain] = { "Tested": { "auto": { "Pass": 0, "Fail": 0, "Skip": 0 }, "manual": { "Pass": 0, "Fail": 0, "Skip": 0 } }, "NotTested": item.CardType.length, "NotApplicable": 0, "Block": 0, "Skip": 0 };
//             domainsMaster[item.Domain] = [];
//         }
//         item.WorkingStatus = 'CREATED';
//         item.Activity = [{
//             "Date": "2019-12-30T00:00:00.000Z",
//             "Header": "CREATED: master, REPORTER:",
//             "Details": {},
//             "StatusChangeComments": ""
//         }];
//         item.AutoBuilds = [];
//         item.Tag = 'DAILY';
//         item.ManualBuilds = [];
//         item.LatestE2EBuilds = [];
//         item.Master = true;
//         item.Date = '2019-12-30T00:00:00.000Z';
//         item.Assignee = 'ADMIN';
//         item.Steps = '';
//         item.Priority = '';
//         item.CurrentStatus = 'NotTested';
//         tcsMaster[item.TcID] = item;

//     });
//     masterAggr.all.NotTested = total;

//     status.forEach(item => {
//         let e2eBuild = {
//             "e2eBuild": item.Build,
//             "Result": item.Result,
//             "Date": new Date(item.Date).toISOString(),
//             CardType: item.CardType,
//             "log": "",
//             "logUrl": ""
//         }
//         tcs230[item.TcID].CurrentStatus = item.Result;
//         tcs230[item.TcID].CardType = item.CardType;
//         tcs230[item.TcID].Build = item.Build;
//         tcs230[item.TcID].LatestE2EBuilds.push(e2eBuild);
//     });
//     tcs = {
//         master: tcsMaster,
//         '2.3.0': tcs230,
//         '3.0.0': tcsMaster,
//         '2.3.1': tcsMaster
//     }

// updatedReleases.forEach(item => {
//     if (item.ReleaseNumber === 'master') {
//         item.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions = domainsMaster;
//         item.StatusOptions = statusOptions;
//         item.TagOptions = ["DAILY", "WEEKLY", "MONTHLY"]
//         item.TcAggregate = masterAggr;
//     }
//     if (item.ReleaseNumber === '2.3.0') {
//         item.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions = domains230;
//         item.StatusOptions = statusOptions;
//         item.TagOptions = ["DAILY", "WEEKLY", "MONTHLY"]
//     }
// });
// }
// sortInfo();

var Client = require('node-rest-client').Client;
client = new Client();
// Provide user credentials, which will be used to log in to JIRA.
// var loginArgs = {
//     // data: {
//     //     "username": "achavan@diamanti.com",
//     //     "password": "indiandreams"
//     // },
//     headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Basic YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw"
//     }
// };
var searchArgs = {
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw"
    }
}
// loginJIRA()
//     .then(function (res) {
//         console.log('logged in')
//     }).catch(err => {

//     });
// var jiraReq = client.post("http://dwsjira1.eng.diamanti.com:8080/rest/auth/1/session", loginArgs, function (data, response) {
//     if (response.statusCode == 200) {
//         console.log('succesfully logged in, session:', data.session);
//         var session = data.session;
//         jiraHeaders = {
//             cookie: session.name + '=' + session.value,
//             "Content-Type": "application/json"
//         }
//         // Get the session information and store it in a cookie in the header
//         searchArgs = {
//             headers: {
//                 // Set the cookie from the session information
//                 cookie: session.name + '=' + session.value,
//                 "Content-Type": "application/json"
//             },
//             // data: {
//             //     // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
//             //     jql: "type=Bug AND status=Closed"
//             // }
//         };
//         // Make the request return the search results, passing the header information including the cookie.
//         // client.post("http://localhost:8090/jira/rest/api/2/search", searchArgs, function (searchResult, response) {
//         //     console.log('status code:', response.statusCode);
//         //     console.log('search result:', searchResult);
//         // });
//     } else {
//         console.log('jira logging failed')
//         // throw "Login failed :(";
//     }
// }, function (err) {
//     console.log('cannot get jira')
// });

// function loginJIRA() {
//     return new Promise(function (resolve, reject) {
//         // var jiraReq = client.post("http://dwsjira1.eng.diamanti.com:8080/rest/auth/1/session", loginArgs, function (data, response) {
//         var jiraReq = client.post("https://diamanti.atlassian.net/rest/auth", loginArgs, function (data, response) {
//             console.log(response.error);
//             console.log("")
//             console.log("asdassssssssssssssssssssssssssssssssssssssssssssssss")
//             console.log(response.statusCode)
//             if (response.statusCode == 200) {
//                 console.log('succesfully logged in, session:', data.session);
//                 var session = data.session;
//                 jiraHeaders = {
//                     cookie: session.name + '=' + session.value,
//                     "Content-Type": "application/json"
//                 }
//                 // Get the session information and store it in a cookie in the header
//                 // searchArgs = {
//                 //     headers: {
//                 //         // Set the cookie from the session information
//                 //         cookie: session.name + '=' + session.value,
//                 //         "Content-Type": "application/json"
//                 //     },
//                 //     // data: {
//                 //     //     // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
//                 //     //     jql: "type=Bug AND status=Closed"
//                 //     // }
//                 // };
//                 resolve();
//                 // Make the request return the search results, passing the header information including the cookie.
//                 // client.post("http://localhost:8090/jira/rest/api/2/search", searchArgs, function (searchResult, response) {
//                 //     console.log('status code:', response.statusCode);
//                 //     console.log('search result:', searchResult);
//                 // });
//             } else {
//                 console.log('jira logging failed')
//                 reject();
//             }
//         }, function (err) {
//             console.log('cannot get jira')
//             reject();
//         });

//         jiraReq.on('requestTimeout', function (err) {
//             console.log('cannot get jira due to timeout')
//             reject();
//         })
//         jiraReq.on('responseTimeout', function (err) {
//             console.log('cannot get jira due to response timeout')
//             reject();
//         })
//         jiraReq.on('error', function (err) {
//             console.log('cannot get jira due to error')
//             reject();
//         })
//     });
// }


// var JIRA_URL = 'http://dwsjira1.eng.diamanti.com:8080';
var JIRA_URL = 'https://diamanti.atlassian.net'
const app = express();
const responseDelayQuick = 10;
const responseDelayModerate = 100;
const responseDelaySlow = 300;

app.use(express.json());
app.use('/rest/features/:id', (req, res) => {
    var str = `?jql=type%20in%20("New%20Feature")%20AND%20fixVersion%20in%20(${req.params.id})&fields=key,summary,status&maxResults=2000`
    // /rest/api/2/search?jql=type%20in%20("New%20Feature")%20AND%20fixVersion%20in%20(2.3.0)&fields=key,summary
    console.log(jiraHeaders);
    // var searchArgs = {
    //     headers: jiraHeaders,
    //     data: {
    //         // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
    //         jql: "type=Bug AND status=Closed"
    //     }
    // };
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult2, response2) {
                    res.send(searchResult2);
                }, err => { console.log(err) });
            }).catch(err => { console.log('rpomise failed'); console.log(err) })
        } else {
            res.send(searchResult);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { })
// app.use('/rest/bugs/:id', (req, res) => {
//     var str = `?jql=type%20in%20("Bug")%20AND%20fixVersion%20in%20(${req.params.id})&fields=key,status,priority,summary&maxResults=2000`
//     // /rest/api/2/search?jql=type%20in%20("New%20Feature")%20AND%20fixVersion%20in%20(2.3.0)&fields=key,summary
//     console.log(jiraHeaders);
//     // var searchArgs = {
//     //     headers: jiraHeaders,
//     //     data: {
//     //         // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
//     //         jql: "type=Bug AND status=Closed"
//     //     }
//     // };
//     client.get(JIRA_URL + '/rest/api/2/search' + str, searchArgs, function (searchResult, response) {
//         console.log('status code:', response.statusCode);
//         console.log('search result:', searchResult);
//         res.send(searchResult);
//     }, err => { console.log('cannot get jira') });
// }, err => { })
app.use('/rest/bugs/total/:id', (req, res) => {
    var totalBugsStr = `?jql=fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug")&fields=key,status,priority,summary&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('rpomise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { });
app.use('/rest/bugs/open/:id', (req, res) => {
    var openBugsStr = `?jql=status%20in%20("Open","In Progress","To Do","Done")%20AND%20fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug")%20AND%20(Component!=Automation%20OR%20Component=EMPTY)&fields=key,status,priority,summary&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + openBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + openBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('rpomise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { })
app.use('/rest/bugs/resolved/:id', (req, res) => {
    var resolvedBugsStr = `?jql=status%20in%20("Done","Resolved","Closed","Duplicate")%20AND%20fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug","Sub-task")%20AND%20(Component!=Automation%20OR%20Component=EMPTY)&fields=key,status,priority,summary&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + resolvedBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + resolvedBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('rpomise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { })
app.use('/rest/featuredetail', (req, res) => {
    var str = '?fields=key,summary,subtasks,created,progress,status,updated,priority'
    var jiraReq = client.get(req.body.data + str, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(req.body.data + str, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('rpomise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log('cannot get features due to error in fetching JIRA')
    })

}, err => {

})
app.use('/api/release/all', (req, res) => {
    // for (let i = 0; i < releases.length; i++) {
    // ['P1', 'P2', 'P3'].map(each => {
    //     releases[i][each] = 0;

    //     console.log(Object.keys(allTcs[releases[i].ReleaseNumber]))
    //     Object.keys(allTcs[releases[i].ReleaseNumber]).forEach(item => {
    //         if (allTcs[releases[i].ReleaseNumber] && allTcs[releases[i].ReleaseNumber][item] && allTcs[releases[i].ReleaseNumber][item].Priority === each) {
    //             releases[i][each] += 1
    //         }
    //     })
    // })

    // releases[i].P0 = Object.keys(allTcs[releases[i].ReleaseNumber]).filter(item => allTcs[releases[i].ReleaseNumber][item] && allTcs[releases[i].ReleaseNumber][item].Priority === 'P0').length;
    // releases[i].P1 = Object.keys(allTcs[releases[i].ReleaseNumber]).filter(item => allTcs[releases[i].ReleaseNumber][item] && allTcs[releases[i].ReleaseNumber][item].Priority === 'P1').length;
    // releases[i].P2 = Object.keys(allTcs[releases[i].ReleaseNumber]).filter(item => allTcs[releases[i].ReleaseNumber][item] && allTcs[releases[i].ReleaseNumber][item].Priority === 'P2').length;
    // }
    res.send(releases);
}, err => { })
app.use('/user/login', (req, res) => {
    if (req.body.email === '') {
        res.status(401).send({ message: 'Please enter email' })
    }
    let user = users.filter(item => item.email === req.body.email)[0];
    if (user && user.email) {
        res.send(user)
    } else {
        users.push({ email: req.body.email, role: 'QA', name: req.body.name });
        res.send({ email: req.body.email, role: 'QA', name: req.body.name });
        // res.status(404).send({ message: 'User not found' });
    }
    // if (req.body.email === 'yatish@diamanti.com' || req.body.email === 'bharati@diamanti.com' || req.body.email === 'deepak@diamanti.com' || req.body.email === 'rahul@diamanti.com') {
    //     res.send({ role: 'ADMIN', loginTime: new Date() })
    // } else {
    //     res.send({ role: 'ENGG', loginTime: new Date() })
    // }
}, err => { })
app.get('/users', (req, res) => {
    res.send(users);
})

// GET ALL TCs of this release
app.get('/api/tcinfo/:release', (req, res) => {
    console.log('called')
    if (allTcs && allTcs[req.params.release]) {
        let data = Object.keys(allTcs[req.params.release]).map(item => allTcs[req.params.release][item]);

        res.send(data.filter(item => item ? true : false));
    } else {
        res.send([]);
    }
});

app.post('/api/tcinfo/:release', (req, res) => {
    if (allTcs && allTcs[req.params.release]) {
        if (allTcs[req.params.release][req.body.TcID]) {
            res.status(401).send({ 'message': 'Duplicate TcID' });
            return;
        } else {
            allTcs[req.params.release][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [] };
            allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
        }
    } else {
        allTcs[req.params.release] = { [req.body.TcID]: { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [] } };
        allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
    }
    // addAssignee(allTcs[req.params.release][req.body.TcID], req.params.release)
    res.send({ message: 'ok' });
});

app.put('/api/:release/tcinfo/id/:id', (req, res) => {
    if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
        allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
        allTcs[req.params.release][req.body.TcID] = {
            ...req.body,
            Activity: [...allTcs[req.params.release][req.body.TcID].Activity, req.body.Activity],
            LatestE2EBuilds: [...allTcs[req.params.release][req.body.TcID].LatestE2EBuilds, req.body.LatestE2EBuilds]
        };
        allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
        res.send({ message: 'ok' });
    } else {
        res.status(404).send({ 'message': 'TC not found' })
    }
});

app.delete('/api/:release/tcinfo/id/:id', (req, res) => {
    if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
        allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
        allTcs[req.params.release][req.body.TcID] = null;
        allTcs['master'][req.body.TcID] = null;
        res.send({ message: 'ok' });
    } else {
        res.status(404).send({ 'message': 'TC not found' })
    }
});




// only create TC will use this api
// Status: CREATED -> /pendingForApproval
// Test cases:
// TcID: role,assignee: workingstatus,assignee
// D10: QA,NULL : CREATED,ADMIN  /pendingForApproval /myPendingApproval
// D11: QA,achavan: CREATED,achavan /pendingForApproval /myPendingApproval
// D12: ADMIN,NULL: UNASSIGNED,ADMIN /assignTcs
// D13: ADMIN,achavan: MANUAL_ASSIGNED,achavan /myRegression
// D14: ADMIN,ADMIN: UNASSIGNED,ADMIN /assignTcs
// ACTUAL
// app.post('/api/tcinfo/:release', (req, res) => {
//     if (allTcs && allTcs[req.params.release]) {
//         if (allTcs[req.params.release][req.body.TcID]) {
//             res.status(401).send({ 'message': 'Duplicate TcID' });
//             return;
//         } else {
//             allTcs[req.params.release][req.body.TcID] = {...req.body, Activity: [req.body.Activity], LatestE2EBuilds: []};
//         }
//     } else {
//         allTcs[req.params.release] = { [req.body.TcID]: {...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [] } };
//     }
//     if(req.body.Role === 'ADMIN') {
//         allTcs['master'][req.body.TcID] = {...req.body, WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN'};
//     }
//     addAssignee(allTcs[req.params.release][req.body.TcID], req.params.release)
//     res.send({ message: 'ok' });
// });


// GET ALL PENDING TCS FOR APPROVAL TO ADMIN FROM OTHER USERS
app.get('/user/:release/pendingApproval/user/:email', (req, res) => {
    let tcs = [];
    if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
        assignedTCs[req.params.release][req.params.email].forEach(item => {
            if ((allTcs[req.params.release][item].WorkingStatus === 'UPDATED') || (allTcs[req.params.release][item].WorkingStatus === 'DELETED') || allTcs[req.params.release][item].WorkingStatus === 'CREATED') {
                tcs.push(allTcs[req.params.release][item]);
            }
        })
    }
    res.send(tcs);
});

// UPDATE PENDING TC WITH APPROVED/NONAPPROVED FROM ADMIN
app.put('/user/:release/pendingApproval/tcinfo/:id', (req, res) => {
    if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
        if (req.body.WorkingStatus === 'APPROVED') {
            switch (req.body.OldWorkingStatus) {
                case 'CREATED':
                case 'UPDATED':
                    allTcs['master'][req.params.id] = { ...req.body, WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', LatestE2EBuilds: [] };
                    if (allTcs[req.params.release][req.params.id].Assignee && allTcs[req.params.release][req.params.id].Assignee !== 'ADMIN') {
                        allTcs[req.params.release][req.params.id] = { ...req.body, LatestE2EBuilds: [], Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], WorkingStatus: 'MANUAL_ASSIGNED' };
                    } else {
                        allTcs[req.params.release][req.params.id] = { ...req.body, LatestE2EBuilds: [], Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN' };
                    }
                    res.send({ message: 'ok' });
                    break;
                case 'DELETED':
                    if (allTcs[req.params.release][req.params.id].TcID === req.params.id) {
                        removeAssignee(allTcs[req.params.release][req.params.id], req.params.release);
                        allTcs[req.params.release][req.params.id] = null;
                    }
                    res.send({ message: 'ok' });
                    break;
                default:
                    res.status(404).send({ 'message': 'Invalid Working Status' });
                    break;

            }
        } else if (req.body.WorkingStatus === 'UNAPPROVED') {
            allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
        }
        res.send('ok');
    } else {
        //error
        res.status(404).send({ 'message': 'TC Not found' });
    }
});

// GET ALL PENDING TCS FOR USER TO GET APPROVED BY ADMIN
app.get('/user/:release/myPendingApproval/user/:email', (req, res) => {
    let tcs = [];
    if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
        assignedTCs[req.params.release][req.params.email].forEach(item => {
            if ((allTcs[req.params.release][item].WorkingStatus === 'UNAPPROVED') || (allTcs[req.params.release][item].WorkingStatus === 'UPDATED') || (allTcs[req.params.release][item].WorkingStatus === 'DELETED') || allTcs[req.params.release][item].WorkingStatus === 'CREATED') {
                tcs.push(allTcs[req.params.release][item]);
            }
        })
    }
    res.send(tcs);
});

// UPDATE MY PENDING APPROVAL TCS
app.put('/user/:release/myPendingApproval/tcinfo/:id', (req, res) => {
    if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
        allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
        res.send('ok');
    } else {
        //error
        res.status(404).send({ 'message': 'TC Not found' });
    }
});

//  GET REGRESSION TCS  FOR ASSIGNINING
app.get('/user/:release/assignTcs/user/:email', (req, res) => {
    let tcs = [];
    if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
        assignedTCs[req.params.release][req.params.email].forEach(item => {
            if ((allTcs[req.params.release][item].WorkingStatus === 'UNASSIGNED')) {
                tcs.push(allTcs[req.params.release][item]);
            }
        })
    }
    res.send(tcs);
})
//  UPDATE SINGLE REGRESSION TC  FOR ASSIGNINING
app.put('/user/:release/assignTcs/tcinfo/:id', (req, res) => {
    if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
        allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
        res.send('ok');
    } else {
        //error
        res.status(404).send({ 'message': 'TC Not found' });
    }
})
//  UPDATE ALL REGRESSION TCS  FOR ASSIGNINING
app.put('/user/:release/assignTcs/alltcinfo', (req, res) => {
    if (req.body.data) {
        req.body.data.forEach(data => {
            removeAssignee(allTcs[req.params.release][data.TcID], req.params.release);
            allTcs[req.params.release][data.TcID].Assignee = data.Assignee;
            allTcs[req.params.release][data.TcID].WorkingStatus = data.WorkingStatus;
            allTcs[req.params.release][data.TcID].Activity = [...allTcs[req.params.release][data.TcID].Activity, data.Activity]
            addAssignee(allTcs[req.params.release][data.TcID], req.params.release)
        })
        res.send({ message: 'ok' });
    } else {
        res.status(401).send({ 'message': 'Failed to update TCs' });
    }
})

app.get('/user/:release/myRegression/:email', (req, res) => {
    let tcs = [];
    if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
        assignedTCs[req.params.release][req.params.email].forEach(item => {
            if ((allTcs[req.params.release][item].WorkingStatus === 'MANUAL_ASSIGNED')) {
                tcs.push(allTcs[req.params.release][item]);
            }
        })
    }
    res.send(tcs);
})
// UPDATE MY REGRESSION TC
app.put('/user/:release/myRegression/tcinfo/:id', (req, res) => {
    if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
        if (req.body.WorkingStatus === 'MANUAL_COMPLETED') {
            allTcs[req.params.release][req.params.id] = {
                ...req.body,
                Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity],
                LatestE2EBuilds: [...allTcs[req.params.release][req.params.id].LatestE2EBuilds, req.body.LatestE2EBuilds],
            };
            console.log(allTcs[req.params.release][req.params.id]);
        } else {
            allTcs[req.params.release][req.params.id] = {
                ...req.body,
                Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity],
            };
        }
        res.send('ok');
    } else {
        //error
        res.status(404).send({ 'message': 'TC Not found' });
    }
})
app.get('/test/:release/tcinfo/details/id/:id', (req, res) => {
    if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
        res.send(allTcs[req.params.release][req.params.id])
    } else {
        res.send({})
    }
});
function addAssignee(tc, release) {
    if (!assignedTCs[release]) {
        assignedTCs[release] = { 'ADMIN': [] };
    }
    if (!tc.Assignee || tc.WorkingStatus.search('COMPLETED') >= 0) {
        tc.Assignee = 'ADMIN';
    }
    if (assignedTCs[release][tc.Assignee] && !assignedTCs[release][tc.Assignee].includes(tc.TcID)) {
        assignedTCs[release][tc.Assignee].push(tc.TcID);
    }
    if (!assignedTCs[release][tc.Assignee]) {
        assignedTCs[release][tc.Assignee] = [tc.TcID];
    }
}
function removeAssignee(tc, release) {
    if (!assignedTCs[release]) {
        return;
    }
    if (!tc.Assignee || tc.WorkingStatus.search('COMPLETED') >= 0) {
        tc.Assignee = 'ADMIN';
    }
    if (assignedTCs[release] && assignedTCs[release][tc.Assignee]) {
        let index = assignedTCs[release][tc.Assignee].indexOf(tc.TcID);
        assignedTCs[release][tc.Assignee].splice(index, 1);
    }
}
app.put('/test/:release/tcinfo/details/all', (req, res) => {
    if (req.body.data) {
        req.body.data.forEach(data => {
            removeAssignee(allTcs[req.params.release][data.TcID], req.params.release);
            allTcs[req.params.release][data.TcID].Assignee = data.Assignee;
            allTcs[req.params.release][data.TcID].WorkingStatus = data.WorkingStatus;
            addAssignee(allTcs[req.params.release][data.TcID], req.params.release)
        })
        res.send({ message: 'ok' });
    } else {
        res.status(401).send({ 'message': 'Failed to update TCs' });
    }
});
app.put('/test/:release/tcinfo/details/id/:id', (req, res) => {
    if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
        allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
        removeAssignee(allTcs[req.params.release][req.body.TcID], req.params.release);
        allTcs[req.params.release][req.body.TcID] = {
            ...req.body,
            LatestE2EBuilds: [...allTcs[req.params.release][req.body.TcID].LatestE2EBuilds, ...req.body.ManualBuilds, ...req.body.AutoBuilds],
            Activity: [...allTcs[req.params.release][req.body.TcID].Activity, req.body.Activity],
            ManualBuilds: [...allTcs[req.params.release][req.body.TcID].ManualBuilds, ...req.body.ManualBuilds],
            AutoBuilds: [...allTcs[req.params.release][req.body.TcID].AutoBuilds, ...req.body.AutoBuilds],
        };
        if (allTcs[req.params.release][req.body.TcID].LatestE2EBuilds.length > 0) {
            let e2e = allTcs[req.params.release][req.body.TcID].LatestE2EBuilds;
            allTcs[req.params.release][req.body.TcID].CurrentStatus = e2e[e2e.length - 1].Result;
        } else {
            allTcs[req.params.release][req.body.TcID].CurrentStatus = 'NotTested';
        }
        if (allTcs[req.params.release][req.body.TcID].TcName === '') {
            allTcs[req.params.release][req.body.TcID].TcName = 'TC NOT AUTOMATED'
        }
        // if (req.body.ManualBuilds) {
        //     if (!Array.isArray(allTcs[req.params.release][req.body.TcID].ManualBuilds)) {
        //         allTcs[req.params.release][req.body.TcID].ManualBuilds = [];
        //     }
        //     allTcs[req.params.release][req.body.TcID] = {
        //         ...allTcs[req.params.release][req.body.TcID], ManualBuilds:
        //             [...allTcs[req.params.release][req.body.TcID].ManualBuilds, req.body.ManualBuilds]
        //     };
        // }
        // if (req.body.AutoBuilds) {
        //     if (!Array.isArray(allTcs[req.params.release][req.body.TcID].AutoBuilds)) {
        //         allTcs[req.params.release][req.body.TcID].AutoBuilds = [];
        //     }
        //     allTcs[req.params.release][req.body.TcID] = {
        //         ...allTcs[req.params.release][req.body.TcID], AutoBuilds:
        //             [...allTcs[req.params.release][req.body.TcID].AutoBuilds, req.body.AutoBuilds]
        //     };
        // }
        addAssignee(allTcs[req.params.release][req.body.TcID], req.params.release)
        // jsonfile.writeFileSync('./tcDetails.json', allTcs);
        res.send({ message: 'ok' });
    } else {
        res.status(401).send({ 'message': 'Failed to update ' + req.params.id });
    }
});
app.delete('/test/:release/tcinfo/details/id/:id', (req, res) => {
    if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
        allTcs[req.params.release][req.params.id].TcID === req.params.id) {
        removeAssignee(allTcs[req.params.release][req.params.id], req.params.release);
        allTcs[req.params.release][req.params.id] = null;
        // jsonfile.writeFileSync('./tcDetails.json', allTcs);
        res.send({ message: 'ok' });
    } else {
        res.status(401).send({ 'message': 'Failed to delete ' + req.params.id });
    }
});

app.post('/api/release', (req, res) => {
    console.log(req.body)
    let found = releases.filter(item => item.ReleaseNumber === req.body.ReleaseNumber)[0];
    if (found && found.ReleaseNumber) {
        res.status(401).send({ message: 'Release already exsiting' });
        return;
    }
    let master = releases.filter(item => item.ReleaseNumber === 'master')[0];
    let release = { ...master, ...req.body, };
    allTcs[req.body.ReleaseNumber] = { ...allTcs.master };
    assignedTCs[req.body.ReleaseNumber] = { "ADMIN": Object.keys(allTcs.master) }
    releases.push(release);
    assignPriority(req.body.Priority, req.body.ReleaseNumber);
    res.send('ok');
})
app.put('/api/release/:release', (req, res) => {
    let found = releases.filter(item => item.ReleaseNumber === req.body.ReleaseNumber)[0];
    if (!found) {
        res.status(401).send({ message: 'Release not existing' });
        return;
    }
    releases.forEach((item, index) => {
        if (item.ReleaseNumber === req.body.ReleaseNumber) {
            if (item.Priority !== req.body.Priority) {
                assignPriority(req.body.Priority, item.ReleaseNumber);
            }
            releases[index] = { ...item, ...req.body };
            console.log(releases[index]);
        }
    })

    res.send('ok');
})
app.delete('/api/release/:release', (req, res) => {
    let index = null;
    releases.forEach((item, i) => {
        if (item.ReleaseNumber === req.params.release) {
            index = i;
        }
    });
    if (index) {
        releases.splice(index, 1);
        allTcs[req.params.release] = null;
        assignedTCs[req.params.release] = null;
        res.send('ok');
    } else {
        res.status(404).send({ message: 'release not found' })
    }

});
app.post('/dummy/api/sanity/e2e/:release', (req, res) => {
    console.log(req.body);
    res.send(200);
})
let data = [{
    Date: new Date().toISOString(), Result: 'Pass', id: 1, NoOfTCsPassed: 200, User: 'achavan@diamanti.com',
    Bug: 'dws-101',
    Notes: `
    asdasd
    asdasda
    asdadsasd
    asdasdad
    `,
    E2EFocus: 'Daily',
    CardType: ['BOS', 'NYNJ'],
    Type: 'E2E'
}]
app.get('/dummy/api/sanity/e2e/:release', (req, res) => {
    res.send(data);
})
app.get('/dummy/api/sanity/longevity/:release', (req, res) => {
    res.send(data);
})
app.get('/dummy/api/sanity/stress/:release', (req, res) => {
    res.send(data);
})
app.put('/dummy/api/sanity/e2e/:release', (req, res) => {
    console.log(req.body)
    data = req.body
    res.status(200).send({})
})
app.get('/dummy/api/wholetcinfo/:release', (req, res) => {
    res.status(200).send(initTC);
})
app.get('/dummy/api/tcinfo/:release/id/:tcid/card/:card', (req, res) => {
    console.log(req.params)
    initTC.forEach(each => {
        if (each.CardType === req.params.card && each.TcID === req.params.tcid) {
            console.log('found')
            each.Activity = selectedTC.Activty;
            each.StatusList = selectedTC.StatusList;
            res.send({ ...selectedTC, ...each });
        }
    })
    // res.send({});
})
app.post('/dummy/api/tcinfo/:release', (req, res) => {
    console.log(req.body);
    req.body.CardType = req.body.CardType[0];
    initTC.push(req.body);
    res.send({})
})

// FOR PRODUCTION: 
// app.use('/', express.static('./build'));
// app.use('*', express.static('./build'));
// for development: comment above lines

console.log('Mock Invar listening on port 5051');
const server = app.listen('5051');

var gracefulShutdown = function () {
    console.log("Shutting down....");
    jsonfile.writeFileSync('./users.json', users);
    console.log('updated users')
    jsonfile.writeFileSync('./currentAssigned.json', assignedTCs);
    console.log('updated assigned')
    jsonfile.writeFileSync('./releases.json', releases);
    console.log('updated releases')
    jsonfile.writeFileSync('./tcCompleteSort.json', allTcs);
    console.log('updated initTC')
    jsonfile.writeFileSync('./initTC.json', initTC);

    // jsonfile.writeFileSync('./releases.json', updatedReleases);
    // jsonfile.writeFileSync('./tcCompleteSort.json', tcs);
    server.close(function () {
        setTimeout(function () {
            console.log("Terminated");
            process.exit(0);
        }, 100);
    });
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);


// TODO:
// 1) tc add/edit/delete confirmation dialog
// 2) tc delete
// 3) tc add css
// 4) tc view/edit on multibox change
// 5) user remove notifications 
// 6) user assigned work 

// 8) qa strategy: update
// 9) icons for cards
// 10) custom sunburst over readymade

// 7) user completed work
// 11) add select options for releases
// 12)  sanity tester for everything
// 13) approve/unapprove

// FEatures:
// 1) if TC is created and in Created status, then only admin will be able to change the status of TC
