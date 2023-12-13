// JIRA ATLASSIAN TOKEN: cemD1yQmrI20xSBId0QOC880
// generated: YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw
/**
 * mock server for serving sunburst data to angular client
 */
// while passing information send only those TCS which are not CREATED,UPDATED,DELETED OR NON-APPROVED
const express = require('express');
const jsonfile = require('jsonfile');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const { spawnSync} = require('child_process');
let releases = jsonfile.readFileSync('./releases.json');
let assignedTCs = jsonfile.readFileSync('./currentAssigned.json');
let users = jsonfile.readFileSync('./users.json');
let allTcs = jsonfile.readFileSync('./tcCompleteSort.json');
let initTC = jsonfile.readFileSync('./initTC.json');
let selectedTC = jsonfile.readFileSync('./initSelect.json');
const projects = encodeURIComponent("DWS\, SPEK\, OPS\, GROUNDWORK\, UA\, UE")
const projectQA = encodeURIComponent("DWS\, SPEK\, OPS\, GROUNDWORK\, UA\, UE\, \"Automation and Validation\"")
const status = encodeURIComponent("Duplicate\, \"In Progress\"\, Info\, Open\, \"To Do\"\, Backlog")

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


var Client = require('node-rest-client').Client;
//const { resolve } = require('node:path');
client = new Client();

//Authorization key is the PAT(personal access token) used for authentication of JIRA
//To generate new token follow the steps on the link- https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/
var searchArgs = {
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic c3ViaGFzaC5rdW1hckBkaWFtYW50aS5jb206QVRBVFQzeEZmR0YwbTA2aWpyTURra3dGZEVSVGVsNi1zdkVDa0pEZVQzV1JCbVhXR3FXTTF0MW1iaHJVMlVpbzFSN210RjVienp1SThXTTN3N0llV0N6Nks2anZiaUlKdnVKNC1hci1RMkFUQjN5aWZFME5vaWVRT2tPNjB2ZGpZajJuWGo5aUg1di0yV0NQRTNPbHRvMEMzbThlWFplNHZrN2N4Q0YzSlMxbTZqXzQ1ZXZsTFRrPTBBRkI0RjUz"

    }
}

// var JIRA_URL = 'http://dwsjira1.eng.diamanti.com:8080';
var JIRA_URL = 'https://diamanti.atlassian.net'
const app = express();
const responseDelayQuick = 10;
const responseDelayModerate = 100;
const responseDelaySlow = 300;
var featureArray = []
app.use(express.json());
app.use(express.static('public')); //to access the files in public folder
app.use(cors()); // it enables all cors requests
app.use(fileUpload());
app.options('/executee',cors());
app.use('/rest/features/:id', (req, res) => {
    var str = `?jql=type%20in%20("New%20Feature")%20AND%20fixVersion%20in%20(${req.params.id})&fields=key,summary,status&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult2, response2) {
                    console.log("calling this function",searchResult2)
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

app.use('/rest/epic/:id', (req, res) => {
    var str = `?jql=issuetype%20%3D%20Epic%20AND%20project%20%3D%20SPEK%20order%20by%20created%20&fields=key,summary,status&maxResults=2000`

    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult2, response2) {
                    console.log("calling this function",searchResult2)
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

// app.use('/rest/DSSepic/:id', (req, res) => {
//     // var str = `?jql=project%20in%20(SPEK%2C%20DWS)%20AND%20issuetype%20in%20(Bug%2C%20Epic%2C%20Improvement%2C%20Task)%20AND%20%22Epic%20Link%22%20%3D%20DWS-6707%20ORDER%20BY%20summary%20ASC%2C%20created%20DESC&fields=key,summary,status&maxResults=2000`
//     var str = `?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20%3D%20Bug%20AND%20%22Epic%20Link%22%20%3D%20DWS-6707%20order%20by%20created%20&fields=key,summary,status&maxResults=2000`


//     var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult, response) {
//         if (response.statusCode === 401) {
//             loginJIRA().then(function () {
//                 client.get(JIRA_URL + '/rest/api/3/search' + str, searchArgs, function (searchResult2, response2) {
//                     console.log("calling this function",searchResult2)
//                     res.send(searchResult2);
//                 }, err => { console.log(err) });
//             }).catch(err => { console.log('rpomise failed'); console.log(err) })
//         } else {
//             res.send(searchResult);
//         }
//     }, err => {
//         console.log('caught error in primitive')
//     });
//     jiraReq.on('error', function (err) {
//         console.log('cannot get features due to error in fetching JIRA')
//     })
// }, err => { })


app.use('/rest/DMCfeaturedetail/:id', (req, res) => {
    var str = `?jql=project%3D%20SPEK%20and%20%22Epic%20Link%22%20%3D%20${req.params.id}%20order%20by%20created%20DESC&fields=key,summary,subtasks,created,progress,status,updated,priority&maxResults=2000`
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

app.use('/rest/bugs/total/:id', (req, res) => {
    //var totalBugsStr = `?jql=fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug")&fields=key,status,priority,summary&maxResults=2000`
    var totalBugsStr = `?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20affectedVersion%20in%20(${req.params.id})%20ORDER%20BY%20created%20DESC&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/bugs/totalCount/:id/:startAt', (req, res) => {
    //var totalBugsStr = `?jql=fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug")&fields=key,status,priority,summary&maxResults=2000&startAt=${req.params.startAt}`
    var totalBugsStr = `?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20affectedVersion%20in%20(${req.params.id})%20ORDER%20BY%20created%20DESC&maxResults=2000&startAt=${req.params.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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
    //var openBugsStr = `?jql=status%20in%20("Open","In Progress","To Do","Done")%20AND%20fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug")%20AND%20(Component!=Automation%20OR%20Component=EMPTY)&fields=key,status,priority,summary&maxResults=2000`
    var openBugsStr = `?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Open%2C%20%22To%20Do%22%2C%20Info%2C%20%22In%20Progress%22)%20AND%20affectedVersion%20in%20(${req.params.id})%20ORDER%20BY%20created%20DESC&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + openBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + openBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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
    //var resolvedBugsStr = `?jql=status%20in%20("Done","Resolved","Closed","Duplicate")%20AND%20fixVersion%20in%20(${req.params.id})%20AND%20type%20in%20("Bug","Sub-task")%20AND%20(Component!=Automation%20OR%20Component=EMPTY)&fields=key,status,priority,summary&maxResults=2000`
    var resolvedBugsStr = `?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(%22IN%20QA%22%2C%20Closed%2C%20Resolved)%20AND%20affectedVersion%20in%20(${req.params.id})%20ORDER%20BY%20created%20DESC&maxResults=2000`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + resolvedBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + resolvedBugsStr, searchArgs, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/unReleasedVersions',(req,res) => {
    //Used Jira dashbord link: https://diamanti.atlassian.net/jira/dashboards/12860?maximized=13904
    var dashboardUrl = `/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-13860&xstattype=allFixfor&ystattype=assignees&sortDirection=asc&sortBy=natural&numberToShow=1000`
    var jiraReq = client.get(JIRA_URL + dashboardUrl, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
                loginJIRA().then(function () {
                    client.get(JIRA_URL + dashboardUrl, function (searchResultTotal2, responseTotal) {
                        res.send(searchResultTotal2);
                    }, err1 => { console.log('cannot get jira') });
                }).catch(err => { console.log('promise failed'); console.log(err) })
            } else {
               res.send({searchResultTotal})
            }
        }, err => {
            console.log('caught error in primitive')
        });
        jiraReq.on('error', function (err) {
            console.log('cannot get features due to error in fetching JIRA', err)
        })
},err => { });

app.use('/rest/cbug',(req,res) => {
    var cusBugsStr = `/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-13703&xstattype=statuses&ystattype=allVersion&sortDirection=desc&sortBy=total&numberToShow=1000`
    var jiraReq = client.get(JIRA_URL + cusBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
                loginJIRA().then(function () {
                    client.get(JIRA_URL + totalBugsStr, function (searchResultTotal2, responseTotal) {
                        res.send(searchResultTotal2);
                    }, err1 => { console.log('cannot get jira') });
                }).catch(err => { console.log('promise failed'); console.log(err) })
            } else {
               res.send({searchResultTotal})
            }
        }, err => {
            console.log('caught error in primitive')
        });
        jiraReq.on('error', function (err) {
            console.log('cannot get features due to error in fetching JIRA')
        })
},err => { });

app.use('/rest/jira/bugdata', (req, res) => {
    var totalBugsStr = `/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-13644&xstattype=statuses&ystattype=allVersion&sortDirection=desc&sortBy=total&numberToShow=1000`
    var jiraReq = client.get(JIRA_URL + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/CustomerBugDatewise', (req, res) => {
    var totalBugsStr = `?jql=project%20in%20(SPEK%2C%20DWS)%20AND%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20status%20in%20(Closed%2C%20Duplicate%2C%20%22In%20Progress%22%2C%20%22IN%20QA%22%2C%20Info%2C%20Open%2C%20Resolved%2C%20%22To%20Do%22%2C%20Unreproducible)%20AND%20((created%20%3E%3D%20${req.query.sdate}%20AND%20created%20%3C%3D%20${req.query.edate})%20OR%20((statusCategory%20%3D%20Done)%20AND%20(statusCategoryChangedDate%20%3E%3D%20${req.query.sdate}%20AND%20statusCategoryChangedDate%20%3C%3D%20${req.query.edate})))%20order%20by%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerBugCount', (req, res) => {
    var totalBugsStr = `/?jql=project+in+%28DWS%2C+SPEK%29+AND+issuetype+in+%28Bug%2C+Improvement%29+AND+status+in+%28%22In+Progress%22%2C+Info%2C+Open%2C+%22To+Do%22%29+AND+labels+%3D+customer+ORDER+BY+created+DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerBugs', (req, res) => {
    var totalBugsStr = `/?jql=project+in+%28DWS%2C+SPEK%29+AND+issuetype+in+%28Bug%2C+Improvement%29+AND+status+in+%28%22In+Progress%22%2C+Info%2C+Open%2C+%22To+Do%22%29+AND+labels+%3D+customer+ORDER+BY+created+DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerBugCountNoImprovement', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20labels%20%3D%20active%20ORDER%20BY%20created%20DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerBugsNoImprovement', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20labels%20%3D%20active%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerClosedBugCountNoImprovement', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%222022-01-01%22%2C%20%22${req.query.edate}%22)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllCustomerClosedBugsNoImprovement', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%222022-01-01%22%2C%20%22${req.query.edate}%22)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllOpenBugCount', (req, res) => {
    var totalBugsStr = `/?jql=project+in+%28DWS%2C+SPEK%29+AND+issuetype+in+%28Bug%2C+Improvement%29+AND+status+in+%28Duplicate%2C+%22In+Progress%22%2C+Info%2C+Open%2C+%22To+Do%22%29+ORDER+BY+created+DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllOpenBugs', (req, res) => {
    var totalBugsStr = `/?jql=project+in+%28DWS%2C+SPEK%29+AND+issuetype+in+%28Bug%2C+Improvement%29+AND+status+in+%28Duplicate%2C+%22In+Progress%22%2C+Info%2C+Open%2C+%22To+Do%22%29+ORDER+BY+created+DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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
app.use('/rest/AllOpenBugCountNoImprovement', (req, res) => {
    if(req.query.flag == "P1"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20in%20(Highest)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "P1ByRelease"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "P2"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20not%20in%20(Highest)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "P2ByRelease"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20not%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "pie"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "R") {
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else {
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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
app.use('/rest/AllOpenBugsNoImprovement', (req, res) => {
    if(req.query.flag == "P1"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20in%20(Highest)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else if(req.query.flag == "P1ByRelease"){
        //var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else if(req.query.flag == "P2"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20not%20in%20(Highest)%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else if(req.query.flag == "P2ByRelease"){
        //var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20not%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20priority%20not%20in%20(Highest)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`

    }
    else if(req.query.flag == "pie"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else if(req.query.flag == "R") {
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else {
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllClosedBugCount', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(DWS,%20SPEK)%20AND%20issuetype%20in%20(Bug,%20Improvement)%20AND%20status%20=%20Closed%20ORDER%20BY%20created%20DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/AllClosedBugs', (req, res) => {
    var totalBugsStr = `/?jql=project%20in%20(DWS,%20SPEK)%20AND%20issuetype%20in%20(Bug,%20Improvement)%20AND%20status%20=%20Closed%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/NewDefectsCount', (req, res) => {
    if (req.query.flag == "graph"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if (req.query.flag == "graphR"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else{
            var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%3D%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/NewDefects', (req, res) => {
    if(req.query.flag == "graph"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    if(req.query.flag == "graphR"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else {
            var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20%3D%20Bug%20AND%20created%20%3E%3D%20${req.query.edate}%20AND%20created%20%3C%3D%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/NewDefectsCountByRelease', (req, res) => {
    var buStr = ''
    if (req.query.bu.length ==  1) {
        buStr = req.query.bu[0]
    }
    else {
        for(let i = 0; i < req.query.bu.length - 1; i++){
            buStr = buStr + req.query.bu[i] + ", ";
        }
        buStr = buStr + req.query.bu[req.query.bu.length - 1]
    }
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20labels%20in%20(${buStr})%20AND%20(affectedVersion%20in%20(%22${req.query.fixVersion}%22))%20AND%20(createdDate%20%3E%3D%20${req.query.edate}%20AND%20createdDate%20%3C%20${req.query.sdate})%20ORDER%20BY%20created%20DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/NewDefectsByRelease', (req, res) => {
    var buStr = ''
    if (req.query.bu.length ==  1) {
        buStr = req.query.bu[0]
    }
    else {
        for(let i = 0; i < req.query.bu.length - 1; i++){
            buStr = buStr + req.query.bu[i] + ", ";
        }
        buStr = buStr + req.query.bu[req.query.bu.length - 1]
    }
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20labels%20in%20(${buStr})%20AND%20affectedVersion%20in%20(%22${req.query.fixVersion}%22)%20AND%20(createdDate%20%3E%3D%20${req.query.edate}%20AND%20createdDate%20%3C%20${req.query.sdate})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/ClosedDefectsCount', (req, res) => {
    if(req.query.flag == "graph"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else if(req.query.flag == "graphR"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else{
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20updatedDate%20%3E%3D%20${req.query.edate}%20AND%20updatedDate%20%3C%3D%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/ClosedDefects', (req, res) => {
    if(req.query.flag == "graph"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else if(req.query.flag == "graphR"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else{
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20updatedDate%20%3E%3D%20${req.query.edate}%20AND%20updatedDate%20%3C%3D%20${req.query.sdate}%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/ClosedDefectsCountByRelease', (req, res) => {
    var buStr = ''
    if (req.query.bu.length ==  1) {
        buStr = req.query.bu[0]
    }
    else {
        for(let i = 0; i < req.query.bu.length - 1; i++){
            buStr = buStr + req.query.bu[i] + ", ";
        }
        buStr = buStr + req.query.bu[req.query.bu.length - 1]
    }
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20labels%20in%20(${buStr})%20AND%20fixVersion%20in%20(%22${req.query.fixVersion}%22)%20ORDER%20BY%20created%20DESC&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/ClosedDefectsByRelease', (req, res) => {
    var buStr = ''
    if (req.query.bu.length ==  1) {
        buStr = req.query.bu[0]
    }
    else {
        for(let i = 0; i < req.query.bu.length - 1; i++){
            buStr = buStr + req.query.bu[i] + ", ";
        }
        buStr = buStr + req.query.bu[req.query.bu.length - 1]
    }
    var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20changed%20from%20%22In%20Progress%22%20to%20%22In%20QA%22%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20labels%20in%20(${buStr})%20AND%20fixVersion%20in%20(%22${req.query.fixVersion}%22)%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/PendingDefectsCount', (req, res) => {
    if(req.query.flag == "R"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20was%20in%20(%22In%20QA%22)%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else{
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20was%20in%20(%22In%20QA%22)%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/PendingDefects', (req, res) => {
    if(req.query.flag == "R"){
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20was%20in%20(%22In%20QA%22)%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20AND%20fixVersion%20in%20(${req.query.fixVersions})%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    else{
        var totalBugsStr = `/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20was%20in%20(%22In%20QA%22)%20during%20(%22${req.query.edate}%22%2C%20%22${req.query.sdate}%22)%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/bugsByQA', (req, res) => {
    //var totalBugsStr = `?jql=project%20in%20(${projectQA})%20AND%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20createdDate%20%3E%3D%20${req.query.sdate}%20AND%20createdDate%20%3C%3D%20${req.query.edate}%20AND%20creator%20%3D%20%22${req.query.qaMail}%22%20%20ORDER%20BY%20created%20DESC&maxResults=0`
    var totalBugsStr = `?jql=project%20not%20in%20(%22Product%20Management%22%2C%20%22Automation%20and%20Validation%22%2C%20Stevedore%2C%20%22Diamanti%20Software%22)%20and%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20createdDate%20%3E%3D%20${req.query.sdate}%20AND%20createdDate%20%3C%3D%20${req.query.edate}%20and%20creator%20%3D%20%22${req.query.qaMail}%22%20%20ORDER%20BY%20created%20DESC&maxResults=0`
    //project%20not%20in%20(%22Product%20Management%22%2C%20%22Automation%20and%20Validation%22%2C%20Stevedore%2C%20%22Diamanti%20Software%22)%20and%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20createdDate%20%3E%3D%20${req.query.sdate}%20AND%20createdDate%20%3C%3D%20${req.query.edate}%20and%20creator%20%3D%20%22${req.query.qaMail}%22%20%20ORDER%20BY%20created%20DESC
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/Other_TaskByQA', (req, res) => {
    var totalBugsStr = `?jql=`+ encodeURIComponent(`updatedDate >= ${req.query.sdate} and updatedDate <= ${req.query.edate} AND status in (Blocked, Closed, Done, Duplicate,"NOT A BUG",Unreproducible) AND (assignee="${req.query.qaMail}" or creator="${req.query.qaMail}") and type in(Bug,Improvement,"New Feature") and project not in("Product Management", "Automation and Validation", Stevedore, "Diamanti Software")`)+`&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
        console.log(jiraReq)
        if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/Automation_Failures_Fixed', (req, res) => {
    if(req.query.flag == "count"){
        var totalBugsStr = `?jql=`+encodeURIComponent(`project in( "Automation and Validation") and status changed to (Done) during (${req.query.sdate}, ${req.query.edate}) AND status in (Blocked, Closed, Done, Duplicate) AND assignee="${req.query.qaMail}"`)+`&maxResults=0`
    }
    else{
        var totalBugsStr = `?jql=`+encodeURIComponent(`project in( "Automation and Validation") and status changed to (Done) during (${req.query.sdate}, ${req.query.edate}) AND status in (Blocked, Closed, Done, Duplicate) AND assignee="${req.query.qaMail}"`)+`&maxResults=1000&startAt=${req.query.startAt}`
    }
    console.log(jiraReq)
    //var totalBugsStr = `?jql=`+encodeURIComponent(`project in( "Automation and Validation") and status changed to (Done) during (${req.query.sdate}, ${req.query.edate}) AND status in (Blocked, Closed, Done, Duplicate) AND assignee="${req.query.qaMail}"`)+`&maxResults=0`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/tasksByQAClosed', (req, res) => {
    // if(req.query.flag == "count"){
    //     var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing%2C%20Automation%2C%20Testplan)%20AND%20status%20changed%20to%20(Done%2C%20Closed%2C%20%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20order%20by%20created%20DESC&maxResults=0`
    // }
    // else{
    //     var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing)%20AND%20status%20changed%20to%20(Done%2C%20Closed%2C%20%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20order%20by%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    // }
    if(req.query.flag == "count"){
        var totalBugsStr = `?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2c%22New%20Feature%22)%20and%20assignee%20%3D%20%22${req.query.qaMail}%22%20AND%20status%20changed%20to%20(Done%2C%20Closed)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else{
        var totalBugsStr = `?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2c%22New%20Feature%22)%20and%20assignee%20%3D%20%22${req.query.qaMail}%22%20AND%20status%20changed%20to%20(Done%2C%20Closed)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/tasksByQAInprogress', (req, res) => {
    // if(req.query.flag == "count"){
    //     var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing%2C%20Automation%2C%20Testplan)%20AND%20status%20changed%20to%20(Done%2C%20Closed%2C%20%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20order%20by%20created%20DESC&maxResults=0`
    // }
    // else{
    //     var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing)%20AND%20status%20changed%20to%20(Done%2C%20Closed%2C%20%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20order%20by%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    // }
    if(req.query.flag == "count"){
        var totalBugsStr = `?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2c%22New%20Feature%22)%20and%20assignee%20%3D%20%22${req.query.qaMail}%22%20AND%20status%20changed%20to%20(%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20ORDER%20BY%20created%20DESC&maxResults=0`
    }
    else{
        var totalBugsStr = `?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2c%22New%20Feature%22)%20and%20assignee%20%3D%20%22${req.query.qaMail}%22%20AND%20status%20changed%20to%20(%22In%20Progress%22)%20during%20(%22${req.query.sdate}%22%2C%20%22${req.query.edate}%22)%20ORDER%20BY%20created%20DESC&maxResults=1000&startAt=${req.query.startAt}`
    }
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/tasks', (req, res) => {
    var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task)%20AND%20status%20in%20(Done%2C%20%22In%20Progress%22%2C%20ToDo)%20AND%20fixVersion%20in%20(${req.query.fixVerStr})%20ORDER%20BY%20created%20DESC`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log(err)
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { });

app.use('/rest/allTasks', (req, res) => {
    var totalBugsStr = `?jql=assignee%20in%20(%22${req.query.qaMail}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task)%20AND%20status%20in%20(Done%2C%20%22In%20Progress%22%2C%20ToDo)%20AND%20fixVersion%20in%20(${req.query.fixVerStr})%20ORDER%20BY%20created%20DESC`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
        } else {
            res.send(searchResultTotal);
        }
    }, err => {
        console.log('caught error in primitive')
    });
    jiraReq.on('error', function (err) {
        console.log(err)
        console.log('cannot get features due to error in fetching JIRA')
    })
}, err => { });

app.use('/rest/getBugDetails', (req, res) => {
    var totalBugsStr = `?jql=key%20%3D%20${req.query.key}`
    var jiraReq = client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, searchArgs, function (searchResultTotal, response) {
    if (response.statusCode === 401) {
            loginJIRA().then(function () {
                client.get(JIRA_URL + '/rest/api/3/search' + totalBugsStr, function (searchResultTotal2, responseTotal) {
                    res.send(searchResultTotal2);
                }, err1 => { console.log('cannot get jira') });
            }).catch(err => { console.log('promise failed'); console.log(err) })
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

app.use('/rest/TicketsBySeverity',(req,res) => {
    var cusBugsStr = `/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-13708&xstattype=statuses&ystattype=priorities&sortDirection=asc&sortBy=natural&numberToShow=1000`
    var jiraReq = client.get(JIRA_URL + cusBugsStr, searchArgs, function (searchResultTotal, response) {
        if (response.statusCode === 401) {
                loginJIRA().then(function () {
                    client.get(JIRA_URL + totalBugsStr, function (searchResultTotal2, responseTotal) {
                        res.send(searchResultTotal2);
                    }, err1 => { console.log('cannot get jira') });
                }).catch(err => { console.log('promise failed'); console.log(err) })
            } else {
               res.send({searchResultTotal})
            }
        }, err => {
            console.log('caught error in primitive')
        });
        jiraReq.on('error', function (err) {
            console.log('cannot get features due to error in fetching JIRA')
        })
},err => { });
app.use('/api/release/all', (req, res) => {
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

app.use('/rest/bldservBuildCount/:id', (req, res) => {
    var searchArgs1 = {
        headers: {
            "Content-Type": "application/json",
            // "Authorization": "Basic YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw"
        }
    }
    var bldserver = `http://bldserv1:8080/job/${req.params.id}/api/json?tree=builds[number,result,duration,url]&pretty=true`
    var Req = client.get(bldserver, searchArgs1, function (searchResultTotal, response) {
        console.log("app-server",searchResultTotal)
        res.send({response:searchResultTotal});
    }, err => {
        console.log(err,'caught error in primitive')
    });
}, err => { })

app.use('/rest/bldservBuildData/:id', (req, res) => {
    var searchArgs1 = {
        headers: {
            "Content-Type": "application/json",
            // "Authorization": "Basic YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw"
        }
    }
    var bldserver = `http://bldserv1:8080/job/${req.params.id}/lastBuild/api/json?&pretty=true/`
    var Req = client.get(bldserver, searchArgs1, function (searchResultTotal, response) {
        res.send({response:searchResultTotal});
    }, err => {
        console.log(err,'caught error in primitive')
    });
}, err => { })


app.get('/users', (req, res) => {
    res.send(users);
})
app.post('/executee',cors(), (req, res) => {
    const {release, platform} = req.query;
    let stdout, consol, statusCode, error;
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" });
    }
        // accessing the file
    const myFile = req.files.file;

    //  mv() method places the file inside public directory
    myFile.name = String(Date.now()).concat(myFile.name);
    move = () => {
        return new Promise(resolv => {
            myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: "Error occured" });
            }
            resolv();
            // returing the response with file path and name
            });
        });
    };
    move().then( () => {
    const child = spawnSync('/home/diamanti/finalapp/non_jenkins_user_update_sheets.sh', ['-f', `${__dirname}/public/${myFile.name}`, '-d', `${release}`, '-s', `${platform}`]);
    child.stdout ? stdout = child.stdout.toString() : stdout = '';
    child.stderr ? consol = child.stderr.toString() : consol = '';
    statusCode = `${ child.status }`
    child.error ? error = child.error.toString() : error = '';

    // delete a file
    fs.unlink(`${__dirname}/public/${myFile.name}`, (err) => {
        if (err) {
            console.error('Something bad happened:', err.toString());
        }
        console.log('File is deleted');
    });
    return res.send({output:{stdout, consol, statusCode, error, length:4}});
    }).catch((error) => {
        console.error('Something bad happened:', error.toString());
        fs.unlink(`${__dirname}/public/${myFile.name}`, (err) => {
            if (err) {
                console.error('Something bad happened:', err.toString());
            }
            console.log('File is Deleted');

        });
        return res.send({output:{stdout, consol, statusCode, error, length:4}});
      });
})



// // GET ALL TCs of this release
// app.get('/api/tcinfo/:release', (req, res) => {
//     console.log('called')
//     if (allTcs && allTcs[req.params.release]) {
//         let data = Object.keys(allTcs[req.params.release]).map(item => allTcs[req.params.release][item]);

//         res.send(data.filter(item => item ? true : false));
//     } else {
//         res.send([]);
//     }
// });

// app.post('/api/tcinfo/:release', (req, res) => {
//     if (allTcs && allTcs[req.params.release]) {
//         if (allTcs[req.params.release][req.body.TcID]) {
//             res.status(401).send({ 'message': 'Duplicate TcID' });
//             return;
//         } else {
//             allTcs[req.params.release][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [] };
//             allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
//         }
//     } else {
//         allTcs[req.params.release] = { [req.body.TcID]: { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [] } };
//         allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
//     }
//     // addAssignee(allTcs[req.params.release][req.body.TcID], req.params.release)
//     res.send({ message: 'ok' });
// });

// app.put('/api/:release/tcinfo/id/:id', (req, res) => {
//     if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
//         allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
//         allTcs[req.params.release][req.body.TcID] = {
//             ...req.body,
//             Activity: [...allTcs[req.params.release][req.body.TcID].Activity, req.body.Activity],
//             LatestE2EBuilds: [...allTcs[req.params.release][req.body.TcID].LatestE2EBuilds, req.body.LatestE2EBuilds]
//         };
//         allTcs['master'][req.body.TcID] = { ...req.body, Activity: [req.body.Activity], LatestE2EBuilds: [], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', CurrentStatus: 'NotTested', Build: '' };
//         res.send({ message: 'ok' });
//     } else {
//         res.status(404).send({ 'message': 'TC not found' })
//     }
// });

// app.delete('/api/:release/tcinfo/id/:id', (req, res) => {
//     if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
//         allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
//         allTcs[req.params.release][req.body.TcID] = null;
//         allTcs['master'][req.body.TcID] = null;
//         res.send({ message: 'ok' });
//     } else {
//         res.status(404).send({ 'message': 'TC not found' })
//     }
// });




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
// app.get('/user/:release/pendingApproval/user/:email', (req, res) => {
//     let tcs = [];
//     if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
//         assignedTCs[req.params.release][req.params.email].forEach(item => {
//             if ((allTcs[req.params.release][item].WorkingStatus === 'UPDATED') || (allTcs[req.params.release][item].WorkingStatus === 'DELETED') || allTcs[req.params.release][item].WorkingStatus === 'CREATED') {
//                 tcs.push(allTcs[req.params.release][item]);
//             }
//         })
//     }
//     res.send(tcs);
// });

// // UPDATE PENDING TC WITH APPROVED/NONAPPROVED FROM ADMIN
// app.put('/user/:release/pendingApproval/tcinfo/:id', (req, res) => {
//     if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
//         if (req.body.WorkingStatus === 'APPROVED') {
//             switch (req.body.OldWorkingStatus) {
//                 case 'CREATED':
//                 case 'UPDATED':
//                     allTcs['master'][req.params.id] = { ...req.body, WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN', LatestE2EBuilds: [] };
//                     if (allTcs[req.params.release][req.params.id].Assignee && allTcs[req.params.release][req.params.id].Assignee !== 'ADMIN') {
//                         allTcs[req.params.release][req.params.id] = { ...req.body, LatestE2EBuilds: [], Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], WorkingStatus: 'MANUAL_ASSIGNED' };
//                     } else {
//                         allTcs[req.params.release][req.params.id] = { ...req.body, LatestE2EBuilds: [], Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], WorkingStatus: 'UNASSIGNED', Assignee: 'ADMIN' };
//                     }
//                     res.send({ message: 'ok' });
//                     break;
//                 case 'DELETED':
//                     if (allTcs[req.params.release][req.params.id].TcID === req.params.id) {
//                         removeAssignee(allTcs[req.params.release][req.params.id], req.params.release);
//                         allTcs[req.params.release][req.params.id] = null;
//                     }
//                     res.send({ message: 'ok' });
//                     break;
//                 default:
//                     res.status(404).send({ 'message': 'Invalid Working Status' });
//                     break;

//             }
//         } else if (req.body.WorkingStatus === 'UNAPPROVED') {
//             allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
//         }
//         res.send('ok');
//     } else {
//         //error
//         res.status(404).send({ 'message': 'TC Not found' });
//     }
// });

// // GET ALL PENDING TCS FOR USER TO GET APPROVED BY ADMIN
// app.get('/user/:release/myPendingApproval/user/:email', (req, res) => {
//     let tcs = [];
//     if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
//         assignedTCs[req.params.release][req.params.email].forEach(item => {
//             if ((allTcs[req.params.release][item].WorkingStatus === 'UNAPPROVED') || (allTcs[req.params.release][item].WorkingStatus === 'UPDATED') || (allTcs[req.params.release][item].WorkingStatus === 'DELETED') || allTcs[req.params.release][item].WorkingStatus === 'CREATED') {
//                 tcs.push(allTcs[req.params.release][item]);
//             }
//         })
//     }
//     res.send(tcs);
// });

// // UPDATE MY PENDING APPROVAL TCS
// app.put('/user/:release/myPendingApproval/tcinfo/:id', (req, res) => {
//     if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
//         allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
//         res.send('ok');
//     } else {
//         //error
//         res.status(404).send({ 'message': 'TC Not found' });
//     }
// });

// //  GET REGRESSION TCS  FOR ASSIGNINING
// app.get('/user/:release/assignTcs/user/:email', (req, res) => {
//     let tcs = [];
//     if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
//         assignedTCs[req.params.release][req.params.email].forEach(item => {
//             if ((allTcs[req.params.release][item].WorkingStatus === 'UNASSIGNED')) {
//                 tcs.push(allTcs[req.params.release][item]);
//             }
//         })
//     }
//     res.send(tcs);
// })
// //  UPDATE SINGLE REGRESSION TC  FOR ASSIGNINING
// app.put('/user/:release/assignTcs/tcinfo/:id', (req, res) => {
//     if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
//         allTcs[req.params.release][req.params.id] = { ...req.body, Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity], LatestE2EBuilds: [] };
//         res.send('ok');
//     } else {
//         //error
//         res.status(404).send({ 'message': 'TC Not found' });
//     }
// })
// //  UPDATE ALL REGRESSION TCS  FOR ASSIGNINING
// app.put('/user/:release/assignTcs/alltcinfo', (req, res) => {
//     if (req.body.data) {
//         req.body.data.forEach(data => {
//             removeAssignee(allTcs[req.params.release][data.TcID], req.params.release);
//             allTcs[req.params.release][data.TcID].Assignee = data.Assignee;
//             allTcs[req.params.release][data.TcID].WorkingStatus = data.WorkingStatus;
//             allTcs[req.params.release][data.TcID].Activity = [...allTcs[req.params.release][data.TcID].Activity, data.Activity]
//             addAssignee(allTcs[req.params.release][data.TcID], req.params.release)
//         })
//         res.send({ message: 'ok' });
//     } else {
//         res.status(401).send({ 'message': 'Failed to update TCs' });
//     }
// })

// app.get('/user/:release/myRegression/:email', (req, res) => {
//     let tcs = [];
//     if (assignedTCs[req.params.release] && assignedTCs[req.params.release][req.params.email]) {
//         assignedTCs[req.params.release][req.params.email].forEach(item => {
//             if ((allTcs[req.params.release][item].WorkingStatus === 'MANUAL_ASSIGNED')) {
//                 tcs.push(allTcs[req.params.release][item]);
//             }
//         })
//     }
//     res.send(tcs);
// })
// // UPDATE MY REGRESSION TC
// app.put('/user/:release/myRegression/tcinfo/:id', (req, res) => {
//     if (allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
//         if (req.body.WorkingStatus === 'MANUAL_COMPLETED') {
//             allTcs[req.params.release][req.params.id] = {
//                 ...req.body,
//                 Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity],
//                 LatestE2EBuilds: [...allTcs[req.params.release][req.params.id].LatestE2EBuilds, req.body.LatestE2EBuilds],
//             };
//             console.log(allTcs[req.params.release][req.params.id]);
//         } else {
//             allTcs[req.params.release][req.params.id] = {
//                 ...req.body,
//                 Activity: [...allTcs[req.params.release][req.params.id].Activity, req.body.Activity],
//             };
//         }
//         res.send('ok');
//     } else {
//         //error
//         res.status(404).send({ 'message': 'TC Not found' });
//     }
// })
// app.get('/test/:release/tcinfo/details/id/:id', (req, res) => {
//     if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id]) {
//         res.send(allTcs[req.params.release][req.params.id])
//     } else {
//         res.send({})
//     }
// });
// function addAssignee(tc, release) {
//     if (!assignedTCs[release]) {
//         assignedTCs[release] = { 'ADMIN': [] };
//     }
//     if (!tc.Assignee || tc.WorkingStatus.search('COMPLETED') >= 0) {
//         tc.Assignee = 'ADMIN';
//     }
//     if (assignedTCs[release][tc.Assignee] && !assignedTCs[release][tc.Assignee].includes(tc.TcID)) {
//         assignedTCs[release][tc.Assignee].push(tc.TcID);
//     }
//     if (!assignedTCs[release][tc.Assignee]) {
//         assignedTCs[release][tc.Assignee] = [tc.TcID];
//     }
// }
// function removeAssignee(tc, release) {
//     if (!assignedTCs[release]) {
//         return;
//     }
//     if (!tc.Assignee || tc.WorkingStatus.search('COMPLETED') >= 0) {
//         tc.Assignee = 'ADMIN';
//     }
//     if (assignedTCs[release] && assignedTCs[release][tc.Assignee]) {
//         let index = assignedTCs[release][tc.Assignee].indexOf(tc.TcID);
//         assignedTCs[release][tc.Assignee].splice(index, 1);
//     }
// }
// app.put('/test/:release/tcinfo/details/all', (req, res) => {
//     if (req.body.data) {
//         req.body.data.forEach(data => {
//             removeAssignee(allTcs[req.params.release][data.TcID], req.params.release);
//             allTcs[req.params.release][data.TcID].Assignee = data.Assignee;
//             allTcs[req.params.release][data.TcID].WorkingStatus = data.WorkingStatus;
//             addAssignee(allTcs[req.params.release][data.TcID], req.params.release)
//         })
//         res.send({ message: 'ok' });
//     } else {
//         res.status(401).send({ 'message': 'Failed to update TCs' });
//     }
// });
// app.put('/test/:release/tcinfo/details/id/:id', (req, res) => {
//     if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
//         allTcs[req.params.release][req.params.id].TcID === req.body.TcID) {
//         removeAssignee(allTcs[req.params.release][req.body.TcID], req.params.release);
//         allTcs[req.params.release][req.body.TcID] = {
//             ...req.body,
//             LatestE2EBuilds: [...allTcs[req.params.release][req.body.TcID].LatestE2EBuilds, ...req.body.ManualBuilds, ...req.body.AutoBuilds],
//             Activity: [...allTcs[req.params.release][req.body.TcID].Activity, req.body.Activity],
//             ManualBuilds: [...allTcs[req.params.release][req.body.TcID].ManualBuilds, ...req.body.ManualBuilds],
//             AutoBuilds: [...allTcs[req.params.release][req.body.TcID].AutoBuilds, ...req.body.AutoBuilds],
//         };
//         if (allTcs[req.params.release][req.body.TcID].LatestE2EBuilds.length > 0) {
//             let e2e = allTcs[req.params.release][req.body.TcID].LatestE2EBuilds;
//             allTcs[req.params.release][req.body.TcID].CurrentStatus = e2e[e2e.length - 1].Result;
//         } else {
//             allTcs[req.params.release][req.body.TcID].CurrentStatus = 'NotTested';
//         }
//         if (allTcs[req.params.release][req.body.TcID].TcName === '') {
//             allTcs[req.params.release][req.body.TcID].TcName = 'TC NOT AUTOMATED'
//         }
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
//         addAssignee(allTcs[req.params.release][req.body.TcID], req.params.release)
//         // jsonfile.writeFileSync('./tcDetails.json', allTcs);
//         res.send({ message: 'ok' });
//     } else {
//         res.status(401).send({ 'message': 'Failed to update ' + req.params.id });
//     }
// });
// app.delete('/test/:release/tcinfo/details/id/:id', (req, res) => {
//     if (allTcs && allTcs[req.params.release] && allTcs[req.params.release][req.params.id] &&
//         allTcs[req.params.release][req.params.id].TcID === req.params.id) {
//         removeAssignee(allTcs[req.params.release][req.params.id], req.params.release);
//         allTcs[req.params.release][req.params.id] = null;
//         // jsonfile.writeFileSync('./tcDetails.json', allTcs);
//         res.send({ message: 'ok' });
//     } else {
//         res.status(401).send({ 'message': 'Failed to delete ' + req.params.id });
//     }
// });

// app.post('/api/release', (req, res) => {
//     console.log(req.body)
//     let found = releases.filter(item => item.ReleaseNumber === req.body.ReleaseNumber)[0];
//     if (found && found.ReleaseNumber) {
//         res.status(401).send({ message: 'Release already exsiting' });
//         return;
//     }
//     let master = releases.filter(item => item.ReleaseNumber === 'master')[0];
//     let release = { ...master, ...req.body, };
//     allTcs[req.body.ReleaseNumber] = { ...allTcs.master };
//     assignedTCs[req.body.ReleaseNumber] = { "ADMIN": Object.keys(allTcs.master) }
//     releases.push(release);
//     assignPriority(req.body.Priority, req.body.ReleaseNumber);
//     res.send('ok');
// })
// app.put('/api/release/:release', (req, res) => {
//     let found = releases.filter(item => item.ReleaseNumber === req.body.ReleaseNumber)[0];
//     if (!found) {
//         res.status(401).send({ message: 'Release not existing' });
//         return;
//     }
//     releases.forEach((item, index) => {
//         if (item.ReleaseNumber === req.body.ReleaseNumber) {
//             if (item.Priority !== req.body.Priority) {
//                 assignPriority(req.body.Priority, item.ReleaseNumber);
//             }
//             releases[index] = { ...item, ...req.body };
//             console.log(releases[index]);
//         }
//     })

//     res.send('ok');
// })
// app.delete('/api/release/:release', (req, res) => {
//     let index = null;
//     releases.forEach((item, i) => {
//         if (item.ReleaseNumber === req.params.release) {
//             index = i;
//         }
//     });
//     if (index) {
//         releases.splice(index, 1);
//         allTcs[req.params.release] = null;
//         assignedTCs[req.params.release] = null;
//         res.send('ok');
//     } else {
//         res.status(404).send({ message: 'release not found' })
//     }

// });
// app.post('/dummy/api/sanity/e2e/:release', (req, res) => {
//     console.log(req.body);
//     res.send(200);
// })
// let data = [{
//     Date: new Date().toISOString(), Result: 'Pass', id: 1, NoOfTCsPassed: 200, User: 'achavan@diamanti.com',
//     Bug: 'dws-101',
//     Notes: `
//     asdasd
//     asdasda
//     asdadsasd
//     asdasdad
//     `,
//     E2EFocus: 'Daily',
//     CardType: ['BOS', 'NYNJ'],
//     Type: 'E2E'
// }]
// app.get('/dummy/api/sanity/e2e/:release', (req, res) => {
//     res.send(data);
// })
// app.get('/dummy/api/sanity/longevity/:release', (req, res) => {
//     res.send(data);
// })
// app.get('/dummy/api/sanity/stress/:release', (req, res) => {
//     res.send(data);
// })
// app.put('/dummy/api/sanity/e2e/:release', (req, res) => {
//     console.log(req.body)
//     data = req.body
//     res.status(200).send({})
// })
// app.get('/dummy/api/wholetcinfo/:release', (req, res) => {
//     res.status(200).send(initTC);
// })
// app.get('/dummy/api/tcinfo/:release/id/:tcid/card/:card', (req, res) => {
//     console.log(req.params)
//     initTC.forEach(each => {
//         if (each.CardType === req.params.card && each.TcID === req.params.tcid) {
//             console.log('found')
//             each.Activity = selectedTC.Activty;
//             each.StatusList = selectedTC.StatusList;
//             res.send({ ...selectedTC, ...each });
//         }
//     })
    // res.send({});
// })
// app.post('/dummy/api/tcinfo/:release', (req, res) => {
//     console.log(req.body);
//     req.body.CardType = req.body.CardType[0];
//     initTC.push(req.body);
//     res.send({})
// })

// FOR PRODUCTION: 
// app.use('/', express.static('./build'));
// app.use('*', express.static('./build'));
// for development: comment above lines

console.log('Mock Invar listening on port 5051');
const server = app.listen('5051');

var gracefulShutdown = function () {
    console.log("Shutting down....");
    // jsonfile.writeFileSync('./users.json', users);
    // console.log('updated users')
    // jsonfile.writeFileSync('./currentAssigned.json', assignedTCs);
    // console.log('updated assigned')
    // jsonfile.writeFileSync('./releases.json', releases);
    // console.log('updated releases')
    // jsonfile.writeFileSync('./tcCompleteSort.json', allTcs);
    // console.log('updated initTC')
    // jsonfile.writeFileSync('./initTC.json', initTC);

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
