// TCs tested, automated, bug filed by individual QA
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Col,Row, Table, Button,
    UncontrolledPopover, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import '../TestCasesAll/TestCasesAll.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import MoodEditor from "../TestCasesAll/moodEditor";
import MoodRenderer from "../TestCasesAll/moodRenderer";
import NumericEditor from "../TestCasesAll/numericEditor";
import SelectionEditor from '../TestCasesAll/selectionEditor';
import DatePickerEditor from '../TestCasesAll/datePickerEditor';
import { projectQA } from '../../constants';
class IndividualReport extends Component {
    isApiUnderProgress = false;
    ApplicableTcs = [];
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
    dayInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
    DateStart = '';
    DateEnd= '';
    //status= encodeURIComponent(`"To Do",ToDo,Backlog,"Selected for Development", Demo, Documentation, "IN QA", Info, Resolved, Unreproducible,"Won't Fix", "Wont Fix", Duplicate, "NOT A BUG"`)
    constructor(props) {
        super(props);
        let columnDefDict = {
            'Name' : {
                headerName: "Name", field: "Name", sortable: true, filter: true,
                editable: false,
                width: '250',
            },
            'Releases' : {
                headerName: "Executed In", field: "Releases", sortable: true, filter: true,
                editable: false,
                width: '250',
            },
            'Executed' : {
                headerName: "Manually Executed", field: "Executed", sortable: true, filter: true,
                width: '200',
                editable: false,
                cellClass: 'cell-wrap-text',
            },

            'AExecuted' : {
                headerName: "Automated Executed", field: "AExecuted", sortable: true, filter: true,
                width: '200',
                editable: false,
                cellClass: 'cell-wrap-text',
            },

            'Automated': {
                headerName: "TCs Automated", field: "Automated", sortable: true, filter: true,
                width: '200',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Filed' : {
                headerName: "Bug Filed", field: "Filed", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let sdet = params.data.email
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(%22Product%20Management%22%2C%20%22Automation%20and%20Validation%22%2C%20Stevedore%2C%20%22Diamanti%20Software%22)%20and%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20createdDate%20%3E%3D%20${this.DateStart}%20AND%20createdDate%20%3C%3D%20${this.DateEnd}%20and%20creator%20%3D%20%22${sdet}%22%20%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.Filed}</a>`;
                    //project%20in%20(${projectQA})%20AND%20issuetype%20in%20(Bug%2C%20Improvement)%20AND%20createdDate%20%3E%3D%20${this.DateStart}%20AND%20createdDate%20%3C%3D%20${this.DateEnd}%20AND%20creator%20%3D%20%22${sdet}%22%20%20ORDER%20BY%20created%20DESC
                },
            },
            'taskp' : {
                headerName: "Tasks In Progress", field: "taskp", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let sdet = params.data.email
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2C%22New%20Feature%22)%20%20AND%20assignee%20%3D%20%22${sdet}%22%20AND%20status%20changed%20to%20(%22In%20Progress%22)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.taskp}</a>`;
                    //assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing%2C%20Automation%2C%20Testplan)%20AND%20status%20changed%20to%20(%22In%20Progress%22)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20ORDER%20BY%20created%20DESC
                    //project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2C%22New%20Feature%22)%20%20AND%20assignee%20%3D%20(%22${sdet}%22)%20AND%20status%20changed%20to%20(%22In%20Progress%22)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20ORDER%20BY%20created%20DESC
                },
            },
            'taskps' : {
                headerName: "Story Points(In Prog)", field: "taskps", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                width: '200',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'taskc' : {
                headerName: "Tasks Completed", field: "taskc", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let sdet = params.data.email
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement%2c%22New%20Feature%22)%20and%20assignee%20%3D%20%22${sdet}%22%20AND%20status%20changed%20to%20(Done%2C%20Closed)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.taskc  }</a>`;
                    //assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task%2C%20Testing%2C%20Automation%2C%20Testplan)%20AND%20status%20changed%20to%20(Done%2C%20Closed)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20AND%20status%20in%20(Done%2C%20Closed)%20ORDER%20BY%20created%20DESC
                    //project%20not%20in(%22Automation%20and%20Validation%22)%20AND%20issuetype%20not%20in(Bug%2CImprovement)%20and%20assignee%20%3D%20%22${sdet}%22%20AND%20status%20changed%20to%20(Done%2C%20Closed)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)
                },
            },
            'taskcs' : {
                headerName: "Story Points(Done)", field: "taskcs", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                width: '200',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            // 'tasko' : {
            //     headerName: "Other Tasks", field: "tasko", sortable: true, filter: true,
            //     cellClass: 'cell-wrap-text',
            //     editable: false,
            //     cellRenderer: (params) => {
            //         let sdet = params.data.email
            //         sdet = encodeURIComponent(sdet)
            //         return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task)%20AND%20status%20changed%20to%20(${this.status})%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20AND%20status%20in%20(${this.status})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.tasko}</a>`;
            //     },
            // },
            // 'taskos' : {
            //     headerName: "Story Points(Other)", field: "taskos", sortable: true, filter: true,
            //     cellClass: 'cell-wrap-text',
            //     width: '200',
            //     editable: false,
            //     cellClass: 'cell-wrap-text',
            // },
            'autoFailureFix' : {
                headerName: "Automation Failure Fix", field: "autoFailureFix", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let sdet = params.data.email
                    console.log("para",params.data.autoFailureFix)
                    //let query = `project in( "Automation and Validation") and status changed to (Done) during (${this.DateStart}, ${this.DateEnd}) AND status in (Blocked, Closed, Done, Duplicate) AND assignee="${sdet}"`
                    //return `<a https://diamanti.atlassian.net/issues/?jql=`+encodeURIComponent(query)+`target= "_blank">${params.data.autoFailureFix}</a>`
                    //return encodeURIComponent(query)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in(%20%22Automation%20and%20Validation%22)%20and%20status%20changed%20to%20(Done)%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20AND%20status%20in%20(Blocked%2C%20Closed%2C%20Done%2C%20Duplicate)%20AND%20assignee%3D%22${sdet}%22%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.autoFailureFix}</a>`;
                   //return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task)%20AND%20status%20changed%20to%20(${this.status})%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20AND%20status%20in%20(${this.status})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.autoFailureFix}</a>`;

                },
            },
            'Other_TaskByQA' : {
                headerName: "Bug Closed", field: "Other_TaskByQA", sortable: true, filter: true,
                cellClass: 'cell-wrap-text',
                width: '200',
                editable: false,
                cellRenderer: (params) => {
                    let sdet = params.data.email
                    console.log("para",params.data.Other_TaskByQA)
                    //let query = `updatedDate >= ${this.DateStart} and updatedDate <= ${this.DateEnd} AND status in (Blocked, Closed, Done, Duplicate,"NOT A BUG",Unreproducible) AND assignee="${this.sdet}" or creator="${sdet}" and type in(Bug,Improvement,"New Feature") and project not in("Product Management", "Automation and Validation", Stevedore, "Diamanti Software")`
                    //return `<a href= https://diamanti.atlassian.net/issues/?jql=`+encodeURIComponent(query)+`target= "_blank">${params.data.Other_TaskByQA}</a>`
                    //console.log("q",query)
                    //return encodeURIComponent(query)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=updatedDate%20%3E%3D%20%22${this.DateStart}%22%20and%20updatedDate%20%3C%3D%22${this.DateEnd}%22%20AND%20status%20in%20(Blocked%2C%20Closed%2C%20Done%2C%20Duplicate%2C"NOT%20A%20BUG"%2CUnreproducible)%20AND%20(assignee%3D%22${sdet}%22%20or%20creator%3D%22${sdet}%22)%20and%20type%20in(Bug%2CImprovement%2C"New%20Feature")%20and%20project%20not%20in("Product%20Management"%2C%20"Automation%20and%20Validation"%2C%20Stevedore%2C%20"Diamanti%20Software")%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.Other_TaskByQA}</a>`;
                   //return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Story%2C%20Sub-task)%20AND%20status%20changed%20to%20(${this.status})%20during%20(%22${this.DateStart}%22%2C%20%22${this.DateEnd}%22)%20AND%20status%20in%20(${this.status})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.Other_TaskByQA}</a>`;
                   //return `updatedDate%20%3E%3D%20%222023-10-01%22%20and%20updatedDate%20%3C%3D%222023-10-31%22%20AND%20status%20in%20(Blocked%2C%20Closed%2C%20Done%2C%20Duplicate%2C%22NOT%20A%20BUG%22%2CUnreproducible)%20AND%20assignee%3D%22pjain%40diamanti.com%22%20or%20creator%3D%22pjain%40diamanti.com%22%20and%20type%20in(Bug%2CImprovement%2C%22New%20Feature%22)%20and%20project%20not%20in(%22Product%20Management%22%2C%20%22Automation%20and%20Validation%22%2C%20Stevedore%2C%20%22Diamanti%20Software%22)%20ORDER%20BY%20created%20DESC`
                },
            },
        }

        this.state = {
            selectedRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            startDate: null,
            endDate: null,
            tcOpen: false,
            //ApplicableTcs: [],

            columnDefs: [
                columnDefDict['Name'],
                columnDefDict['Executed'],
                columnDefDict['AExecuted'],
                columnDefDict['Releases'],
                columnDefDict['Automated'],
                columnDefDict['Filed'],
                columnDefDict['Other_TaskByQA'],
                columnDefDict['taskp'],
                columnDefDict['taskps'],
                columnDefDict['taskc'],
                columnDefDict['taskcs'],
                columnDefDict['autoFailureFix'],
            ],
            defaultColDef: { resizable: true },
            modules: AllCommunityModules,
            frameworkComponents: {
                moodRenderer: MoodRenderer,
                moodEditor: MoodEditor,
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },
        }
        if(this.month >= '10'){

            this.DateStart = this.year +"-"+ this.month +"-"+ "01"
            this.DateEnd = this.year +"-"+ this.month +"-"+ this.dayInCurrentMonth
        }
        else{

            this.DateStart = this.year + "-" + "0" + this.month + "-" + "01"
            this.DateEnd = this.year + "-" + "0" + this.month + "-" + this.dayInCurrentMonth
        }
    }
    popoverToggle1 = () => this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 2);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 100;
    }
    onSelectionChanged = (event) => {
        this.setState({ selectedRows: event.api.getSelectedRows().length })
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
         const sortModelCR = [
            {colId: 'Name', sort: 'asc'}
        ];
        this.gridApi.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    gridOperations(enable) {
        if (enable) {
            if (this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: false, loading: false });
            }
        } else {
            if (!this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: true });
            }
        }
    }
    componentDidMount() {
        //this.gridOperations(false);
        //this.getTcs(this.DateStart,this.DateEnd);
        //setTimeout(() => this.getTcs(this.DateStart, this.DateEnd), 400);
    }
    getTcsold(startDate, endDate) {
        this.state.disableShowButton = true;
        this.gridOperations(false);
        axios.get('/api/qaReport/',{
            params: {
                startdate:startDate,
                enddate :endDate
            },
        }).then(all => {
            let QAs = all.data.qaReport
            let list = []
            let promises = []
            let promises2 = []
            axios.get(`/api/userinfo`).then(res => {
                res.data.forEach(user => {
                    if (user["role"] == "QA" || ((user["role"] == "ADMIN") && (user["email"] == "yatish@diamanti.com" || user["email"] == "bharati@diamanti.com" || user["email"] == "sshende@diamanti.com" || user["email"] == "ajadhav@diamanti.com"))) {
                        QAs[user["email"]] ? list.push({email: user["email"],Name:user["name"], Executed: QAs[user["email"]].exec, Releases: QAs[user["email"]].execIn, Automated: QAs[user["email"]].auto, Filed: 0}) :
                        list.push({email: user["email"],Name:user["name"], Executed:0, Releases: "", Automated:0, Filed: 0, taskc:0, taskcs:0, taskp:0, taskps:0, tasko:0, taskos:0});
                    }
                })
                list.forEach(user => {
                    promises.push(axios.get(`/rest/bugsByQA`,{
                        params: {
                            "sdate": startDate,
                            "edate": endDate,
                            "qaMail": user["email"],
                        }}).then(resp => {
                            user["Filed"] = resp.data.total
                        })
                    );
                    promises.push(axios.get(`/rest/tasksByQA`,{
                        params: {
                            "sdate": startDate,
                            "edate": endDate,
                            "flag": "count",
                            "qaMail": user["email"],
                            //"nonTCTask": "false",
                        }}).then(resp => {
                            for(let i = 0; i <= resp.data.total; i=i+100){
                                promises2.push(axios.get(`/rest/tasksByQA`,{
                                    params: {
                                        "startAt": i,
                                        "sdate": startDate,
                                        "edate": endDate,
                                        "flag": "",
                                        "qaMail": user["email"],
                                    }
                                }).then(result => {
                                    result.data.issues.forEach(issue => {
                                        if (issue.fields.status.name == "Done" || issue.fields.status.name == "Closed" ) {
                                            user["taskc"] = user["taskc"] + 1
                                            user["taskcs"] = user["taskcs"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                        }
                                        else if (issue.fields.status.name == "In Progress") {
                                            user["taskp"] = user["taskp"] + 1
                                            user["taskps"] = user["taskps"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                        }
                                        // else {
                                        //     user["tasko"] = user["tasko"] + 1
                                        //     user["taskos"] = user["taskos"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                        // }
                                    })
                                }).catch(err => {
                                    //this.pgridOperations(true);
                                }))
                            }
                            Promise.all(promises2).then(result => {
                            })
                        })
                    );
                    // promises.push(axios.get(`/rest/tasksByQA`,{
                    //     params: {
                    //         "sdate": startDate,
                    //         "edate": endDate,
                    //         "qaMail": user["email"],
                    //         "nonTCTask": "true",
                    //     }}).then(resp => {
                    //         user["NonTCTasks"] = resp.data.total
                    //     })
                    // );
                }
                )
                Promise.all(promises).then(result => {
                    Promise.all(promises2).then(result => {
                        this.ApplicableTcs = list
                        console.log(this.ApplicableTcs, list)
                        this.gridOperations(true)
                    })
                })
            })
        }).catch(err => {
            this.gridOperations(true);
        })
    }

    getTcs(startDate, endDate) {
        this.state.disableShowButton = true;
        this.gridOperations(false);
        let outerPromise = []
        let innerPromise = []
        let list = []
        outerPromise.push(axios.get('/api/qaReport/',{
            params: {
                startdate:startDate,
                enddate :endDate
            },
        }).then(all => {
            let QAs = all.data.qaReport
            innerPromise.push(axios.get(`/api/userinfo`).then(res => {
                res.data.forEach(user => {
                    if (user["role"] == "QA" || ((user["role"] == "ADMIN") && (user["email"] == "cnoginahal@diamanti.com" || user["email"] == "slonkar@diamanti.com" || user["email"] == "bharati@diamanti.com" || user["email"] == "sshende@diamanti.com" || user["email"] == "ajadhav@diamanti.com"))) {
                        QAs[user["email"]] ? list.push({email: user["email"],Name:user["name"], Executed: QAs[user["email"]].exec, AExecuted: QAs[user["email"]].aexec, Releases: QAs[user["email"]].execIn, Automated: QAs[user["email"]].auto, Filed: 0,taskc:0, taskcs:0, taskp:0, taskps:0, tasko:0, taskos:0, autoFailureFix: 0, Other_TaskByQA: 0}) :
                        list.push({email: user["email"],Name:user["name"], Executed:0, Releases: "", Automated:0, AExecuted:0, Filed: 0, taskc:0, taskcs:0, taskp:0, taskps:0, tasko:0, taskos:0, autoFailureFix: 0, Other_TaskByQA: 0});
                    }
                })
            }))
        }))
        Promise.all(outerPromise).then(result => {
            Promise.all(innerPromise).then(output => {
                this.getBugsByQA(list, startDate, endDate)
            })
        })
    }

    getBugsByQA(list, startDate, endDate){
        let promise = []
        list.forEach(user => {
            promise.push(axios.get(`/rest/bugsByQA`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "qaMail": user["email"],
                }}).then(resp => {
                    user["Filed"] = resp.data.total
                })
            );
        })
        Promise.all(promise).then(resolve => {
            this.getAutomationFailuresFixed(list, startDate, endDate)
            //this.getTasksbyQA(list, startDate, endDate)
        })
    }

    ggetAutomationFailuresFixed(list, startDate, endDate){
        let promise = []
        list.forEach(user => {
            promise.push(axios.get(`/rest/Automation_Failures_Fixed`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "qaMail": user["email"],
                }}).then(resp => {
                    user["autoFailureFix"] = resp.data.total
                })
            );
        })
        Promise.all(promise).then(resolve => {
            this.getOtherTaskByQA(list, startDate, endDate)
        })
    }

    getOtherTaskByQA(list, startDate, endDate){
        let promise = []
        list.forEach(user => {
            promise.push(axios.get(`/rest/Other_TaskByQA`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "qaMail": user["email"],
                }}).then(resp => {
                    user["Other_TaskByQA"] = resp.data.total
                })
            );
        })
        Promise.all(promise).then(resolve => {
            this.getTasksbyQAInP(list, startDate, endDate)
        })
    }

    getAutomationFailuresFixed(list, startDate, endDate){
        let outerPromise = []
        let innerPromise = []
        list.forEach(user => {
            outerPromise.push(axios.get(`/rest/Automation_Failures_Fixed`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "flag": "count",
                    "qaMail": user["email"],
                }}).then(resp => {
                    for(let i = 0; i <= resp.data.total; i=i+100){
                        innerPromise.push(axios.get(`/rest/Automation_Failures_Fixed`,{
                            params: {
                                "startAt": i,
                                "sdate": startDate,
                                "edate": endDate,
                                "flag": "",
                                "qaMail": user["email"],
                            }
                        }).then(result => {
                            result.data.issues.forEach(issue => {
                                    user["autoFailureFix"] = user["autoFailureFix"] + (issue.fields.customfield_10671 != null ? issue.fields.customfield_10671 : 0)
                            })
                        }).catch(err => {
                            //this.pgridOperations(true);
                        }))
                    }
                })
            );
        })
        Promise.all(outerPromise).then(result => {
            Promise.all(innerPromise).then(output => {
               this.getOtherTaskByQA(list, startDate, endDate)
            })
        })
    }

    getTasksbyQAInP(list, startDate, endDate){
        let outerPromise = []
        let innerPromise = []
        list.forEach(user => {
            outerPromise.push(axios.get(`/rest/tasksByQAInprogress`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "flag": "count",
                    "qaMail": user["email"],
                }}).then(resp => {
                    for(let i = 0; i <= resp.data.total; i=i+100){
                        innerPromise.push(axios.get(`/rest/tasksByQAInprogress`,{
                            params: {
                                "startAt": i,
                                "sdate": startDate,
                                "edate": endDate,
                                "flag": "",
                                "qaMail": user["email"],
                            }
                        }).then(result => {
                            result.data.issues.forEach(issue => {
                               // if (issue.fields.status.name == "Done" || issue.fields.status.name == "Closed" ) {
                            //         user["taskc"] = user["taskc"] + 1
                            //         user["taskcs"] = user["taskcs"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                            //    // }
                                // else if (issue.fields.status.name == "In Progress") {
                                    user["taskp"] = user["taskp"] + 1
                                    user["taskps"] = user["taskps"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                // }
                                // else {
                                //     user["tasko"] = user["tasko"] + 1
                                //     user["taskos"] = user["taskos"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                // }
                            })
                        }).catch(err => {
                            //this.pgridOperations(true);
                        }))
                    }
                })
            );
        })
        Promise.all(outerPromise).then(result => {
            Promise.all(innerPromise).then(output => {
               this.getTasksbyQAClosed(list, startDate, endDate)
            })
        })
    }

    getTasksbyQAClosed(list, startDate, endDate){
        let outerPromise = []
        let innerPromise = []
        list.forEach(user => {
            outerPromise.push(axios.get(`/rest/tasksByQAClosed`,{
                params: {
                    "sdate": startDate,
                    "edate": endDate,
                    "flag": "count",
                    "qaMail": user["email"],
                }}).then(resp => {
                    for(let i = 0; i <= resp.data.total; i=i+100){
                        innerPromise.push(axios.get(`/rest/tasksByQAClosed`,{
                            params: {
                                "startAt": i,
                                "sdate": startDate,
                                "edate": endDate,
                                "flag": "",
                                "qaMail": user["email"],
                            }
                        }).then(result => {
                            result.data.issues.forEach(issue => {
                               // if (issue.fields.status.name == "Done" || issue.fields.status.name == "Closed" ) {
                                    user["taskc"] = user["taskc"] + 1
                                    user["taskcs"] = user["taskcs"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                               // }
                                // else if (issue.fields.status.name == "In Progress") {
                                //     user["taskp"] = user["taskp"] + 1
                                //     user["taskps"] = user["taskps"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                // }
                                // else {
                                //     user["tasko"] = user["tasko"] + 1
                                //     user["taskos"] = user["taskos"] + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                // }
                            })
                        }).catch(err => {
                            //this.pgridOperations(true);
                        }))
                    }
                })
            );
        })
        Promise.all(outerPromise).then(result => {
            Promise.all(innerPromise).then(output => {
                this.ApplicableTcs = list
                this.gridOperations(true)
            })
        })
    }

    startDate = (startDate) =>{
        this.DateStart = startDate['StartDate']
        this.setState({
            startDate : this.DateStart
        })
    }
    endDate = (endDate) =>{
        this.DateEnd = endDate['EndDate']
        if(!this.state.startDate){
            this.state.startDate = this.DateStart
        }
        this.setState({
            endDate : this.DateEnd
        },()=>{
            this.setState({disableShowButton : false})
            //this.getTcs(this.state.startDate, this.state.endDate);
        })
    }
    render() {
        let DATE1 = this.DateStart
        let DATE2 = this.DateEnd
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {
                this.gridApi.showLoadingOverlay();
            } else if (this.ApplicableTcs.length === 0) {
                this.gridApi.showNoRowsOverlay();
            } else {
                this.gridApi.hideOverlay();
            }
        }
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.getTcs(this.DateStart, this.DateEnd)}});}}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.tcOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.tcOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>SDET REPORT</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="StartDate" value={DATE1} onChange={(e) => this.startDate({ StartDate: e.target.value })} ></Input>
                                            </div>
                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="EndDate" value={DATE2} onChange={(e) => this.endDate({ EndDate: e.target.value })} />
                                            </div>
                                            <div class="col-md-3" style={{marginTop: '1rem'}}>
                                                <Button disabled={ this.state.disableShowButton } size="md" className="rp-rb-save-btn" onClick={(e) => {this.getTcs(this.DateStart, this.DateEnd);}} >
                                                    Show
                                                </Button>
                                            </div>
                                            <div style={{ width: '5rem', marginLeft: '1rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApi) {
                                                        this.gridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "SDET Report.csv"});
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="myAllGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.ApplicableTcs}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.ApplicableTcs.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                        </Collapse>
                    </Col>
                </Row>
            </div >
        )
    }
}
export default (IndividualReport);