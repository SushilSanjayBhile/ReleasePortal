// Issues faced on customer side and reported by QA (jira - list)
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Col,Row, Table, Button,
    UncontrolledPopover, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './CustomerBugs.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import MoodEditor from "../TestCasesAll/moodEditor";
import MoodRenderer from "../TestCasesAll/moodRenderer";
import NumericEditor from "../TestCasesAll/numericEditor";
import SelectionEditor from '../TestCasesAll/selectionEditor';
import DatePickerEditor from '../TestCasesAll/datePickerEditor';
import  CheckBox  from '../TestCasesAll/CheckBox';
import { timeMondays } from 'd3-time';

class ManagerReport extends Component {
    pageNumber = 0;
    startAt = 0;
    isApiUnderProgress = false;
    allTCsToShow = [];
    ApplicableTcs = [];
    defaultBugs = [];
    cusReportList = [];
    devReportList = [];
    devList = [];
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
    dayInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
    DateStart = '';
    DateEnd= '';
    maxResult= 0;
    constructor(props) {
        super(props);
        let columnDefDict = {
            'BugNo' : {
                headerName: "Bug No", field: "BugNo", sortable: true, filter: true,
                editable: false,
                width: '130',
                cellRenderer: function(params) {
                    let keyData = params.data.BugNo;
                    let newLink = `<a href= https://diamanti.atlassian.net/browse/${keyData} target= "_blank">${keyData}</a>`;
                    return newLink;
                },
            },
            'BU' : {
                headerCheckboxSelection: (params) => {
                    if (this.gridApi) {
                        this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                    }
                    return true;
                  },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "BU", field: "BU", sortable: true, filter: true,
                width: '130',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Summary': {
                headerName: "Summary", field: "Summary", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Severity' : {
                headerName: "Severity", field: "Severity", sortable: true, filter: true,
                width: '50',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Customer' :  {
                headerName: "Customer", field: "Customer", sortable: true, filter: true,
                width: '100',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'QAName' : {
                headerName: "QA Name", field: "QAName", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'ReportedBy' : {
                headerName: "Reported By", field: "ReportedBy", sortable: true, filter: true,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Developer' : {
                headerName: "Assigned To", field: "Developer", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'DevManager' : {
                headerName: "Dev Manager", field: "DevManager", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'BuManager' :  {
                headerName: "Bu Manager", field: "BuManager", sortable: true, filter: true,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ReportedDate' : {
                headerName: "Reported Date", field: "ReportedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenDays' : {
                headerName: "Open Days", field: "OpenDays", sortable: true, filter: true,
                width: '80',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ETA' : {
                headerName: "ETA", field: "ETA", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'QAValidatedDate' : {
                headerName: "QA Validated Date", field: "QAValidatedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }
        let cusReportColumnDefDict = {
            'BU' : {
                headerCheckboxSelection: (params) => {
                    if (this.reportGridApi) {
                        this.setState({ selectedRows: this.reportGridApi.getSelectedRows().length })
                    }
                    return true;
                  },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "BU", field: "BU", sortable: true, filter: true,
                width: '130',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Manager': {
                headerName: "Manager", field: "Manager", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenBugs' : {
                headerName: "Open Bugs", field: "OpenBugs", sortable: true, filter: true,
                width: '130',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            // 'ClosedBugs' : {
            //     headerName: "Closed Bugs", field: "ClosedBugs", sortable: true, filter: true,
            //     width: '50',
            //     cellClass: 'cell-wrap-text',
            //     editable: false,
            // },
            'AvgDays' : {
                headerName: "Avg Days Bugs Open", field: "AvgDays", sortable: true, filter: true,
                width: '130',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
        }
        let devReportColumnDefDict = {
            'BU' : {
                headerCheckboxSelection: (params) => {
                    if (this.reportGridApi) {
                        this.setState({ selectedRows: this.reportGridApi.getSelectedRows().length })
                    }
                    return true;
                  },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "BU", field: "BU", sortable: true, filter: true,
                width: '130',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Developer': {
                headerName: "Developer", field: "Developer", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Manager': {
                headerName: "Manager", field: "Manager", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenBugs' : {
                headerName: "Open Bugs", field: "OpenBugs", sortable: true, filter: true,
                width: '130',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'AvgDays' : {
                headerName: "Avg Days Bugs Open", field: "AvgDays", sortable: true, filter: true,
                width: '130',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'UE': {
                headerName: "Ultima Enterprise Bugs", field: "UE", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'UA': {
                headerName: "Ultima Accelerator Bugs", field: "UA", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'SP': {
                headerName: "Spektra Bugs", field: "SP", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'NA': {
                headerName: "NA Bugs", field: "NA", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }

        this.state = {
            selectedRows: 0,
            reportSelectedRows: 0,
            devReportSelectedRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            startDate: null,
            endDate: null,
            buisnessUnit: null,
            developer: null,

            statusColumn:[
                {id:1,value:'P1', isChecked: true},
                {id:2,value:'P2', isChecked: true},
                {id:3,value:'P3', isChecked: false},
                {id:4,value:'P4', isChecked: false},
                {id:5,value:'P5', isChecked: false},
                {id:5,value:'P6', isChecked: false},
            ],
            columnDefs: [
                columnDefDict['BU'],
                columnDefDict['BuManager'],
                columnDefDict['Customer'],
                columnDefDict['Developer'],
                columnDefDict['DevManager'],
                columnDefDict['ReportedDate'],
                columnDefDict['OpenDays'],
                columnDefDict['Severity'],
                columnDefDict['BugNo'],
                columnDefDict['Summary'],
                columnDefDict['ETA'], 
                columnDefDict['ReportedBy'],
                columnDefDict['QAName'],
                columnDefDict['QAValidatedDate'],
            ],
            cusReportColumnDefs: [
                cusReportColumnDefDict['BU'],
                cusReportColumnDefDict['Manager'],
                cusReportColumnDefDict['OpenBugs'],
                cusReportColumnDefDict['AvgDays'],
            ],
            devReportColumnDefs: [
                devReportColumnDefDict['BU'],
                devReportColumnDefDict['Developer'],
                devReportColumnDefDict['Manager'],
                devReportColumnDefDict['OpenBugs'],
                devReportColumnDefDict['AvgDays'],
                devReportColumnDefDict['UE'],
                devReportColumnDefDict['UA'],
                devReportColumnDefDict['SP'],
                devReportColumnDefDict['NA'],
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
    handleAllCheckedStatusTCs = (event) => {
        let statusColumn = this.state.statusColumn
        statusColumn.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({statusColumn: statusColumn})
    }

    handleCheckChieldElementStatusTcs = (event) => {
        let statusColumn = this.state.statusColumn
        statusColumn.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({statusColumn: statusColumn})
    }
    popoverToggle2 = () => this.setState({ popoverOpen2: !this.state.popoverOpen2 });
    popoverToggle1 = () => this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 2);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 100;
    }
    // onRowSelected = (params) => {
    //     if (this.gridApi) {
    //         if (params.column && params.column.colId !== "BugNo") {
    //             return false
    //         } else {
    //             return true
    //         }
    //     }
    //     return false;
    // }
    paginate(index) {
        let page = this.pageNumber
        this.pageNumber += index;
        if (this.pageNumber < 0) {
            this.pageNumber = 0;
            this.startAt = 0
        }
        else {
            if (this.pageNumber > page) {
                this.startAt = this.startAt + 100
            }
            else if (this.pageNumber < page) {
                this.startAt = this.startAt - 100
            }
        }
        this.setState({startDate:this.DateStart, endDate:this.DateEnd},() => {this.getTcs(this.state.startDate, this.state.endDate, this.startAt);})
    }
    onSelectionChanged = (event) => {
        this.setState({ selectedRows: event.api.getSelectedRows().length })
    }
    onReportSelectionChanged = (event) => {
        this.setState({ reportSelectedRows: event.api.getSelectedRows().length })
    }
    onDevReportSelectionChanged = (event) => {
        this.setState({ devReportSelectedRows: event.api.getSelectedRows().length })
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        const sortModel = [
            {colId: 'ReportedDate', sort: 'desc'}
        ];
        this.gridApi.setSortModel(sortModel);
        params.api.sizeColumnsToFit();
    };
    onReportGridReady = params => {
        this.reportGridApi = params.api;
        this.reportGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onDevReportGridReady = params => {
        this.devReportGridApi = params.api;
        this.devReportGridColumnApi = params.columnApi;
        const sortModel = [
            {colId: 'Developer', sort: 'asc'}
        ];
        this.devReportGridApi.setSortModel(sortModel);
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
        this.ApplicableTcs = []
        this.cusReportList = []
        this.devReportList = []
        //setTimeout(() => this.getTcs(this.startAt), 400);
    }
    onSelectBU(bu) {
        if (bu === '') {
            bu = null;
        }
        this.setState({buisnessUnit:bu})
        this.filterBugs(bu, this.state.developer);
    }
    onSelectDeveloper(dev) {
        if (dev === '') {
            dev = null;
        }
        this.setState({developer: dev})
        this.filterBugs(this.state.buisnessUnit, dev);
    }
    showSelectedTCs = () =>{
        this.filterBugs(this.state.buisnessUnit, this.state.developer)
        this.setState({ popoverOpen2: !this.state.popoverOpen2 });
    }

    getTcs(startAt) {
        this.gridOperations(false);
        let promises = []
        axios.get(`/rest/AllOpenBugCount`).then(all => {
            this.maxResult = all.data.total
            for(let i = 0; i <= this.maxResult; i=i+100){
                promises.push(axios.get(`/rest/AllOpenBugs`,{
                    params: {
                        "startAt": i,
                    }
                }).then(all => {
                    this.allTCsToShow = [...this.allTCsToShow, ...all.data.issues];
                }).catch(err => {
                    this.gridOperations(true);
                }))
            }
            Promise.all(promises).then(result => {
                this.getTcsToShow();
                })
        }).catch(err => {
            this.gridOperations(true);
        })
    }
    getTcsToShow(){
        this.ApplicableTcs = []
        this.cusReportList = []
        this.devReportList = []
        this.bugsToShow = []
        let devDict = {}
        let severity = {"Highest":"P2","High":"P3","Medium":"P4","Low":"P5", "Lowest":"P6"}
        let devManager = {"Abhay Singh":["Abhay Singh", "Nikhil Temgire", "Samiksha Bagmar", "Sunil Barhate"],
                          "Kshitij Gunjikar":["Kshitij Gunjikar","Kiran Zarekar", "Sushil Bhile", "Sourabh Shukla", "Joel Wu"],
                          "Rahul Soman":["Rahul Soman", "Vinod Lohar", "Atirek Goyal", "Rajesh Borundia", "Mayur Shinde", "Swapnil Shende", "Sandeep Zende"],
                          "Sourabh Shukla":["Abhijeet Chavan", "Narendra Raigar"],
                          "Naveen Seth":["Naveen Seth","Tanya Singh"],
                          "Vinod Lohar":["Diksha Tambe"],
                          "Arvind Krishnan":["Arvind Krishnan"]
                           };
        let buMap = {"Ultima Enterprise":["Abhay Singh", "Nikhil Temgire", "Samiksha Bagmar", "Sunil Barhate","Madhav Buddhi","Mayur Shinde"],
                    "Spektra":["Kshitij Gunjikar","Kiran Zarekar", "Sushil Bhile", "Sourabh Shukla", "Joel Wu","Abhijeet Chavan", "Narendra Raigar","Swapnil Shende"],
                    "Ultima Accelerator":["Naveen Seth","Tanya Singh","Vinod Lohar","Diksha Tambe"],
                        }
        let QAs = {"Prachee Ahire":'', "Mukesh Shinde":'', "Chetan Noginahal":'', "Dinesh":'', "Rajat Gupta":'',
                    "Shweta Burte":'', "Aditya Nilkanthwar":'', "Arati Jadhav":'', "Varsha Suryawanshi":'', "Priyanka Birajdar":'',
                    "Ashutosh Das":'', "Yatish Devadiga":'', "Ketan Divekar":'', "Bharati Bhole":'', "Kiran Kothule":'', "Swapnil Sonawane":''}
        let spektraBugCount = 0, ultimaBugCount = 0, ultimaSoftBugCount = 0, NAcount = 0, spektraBugOpenDays = 0, ultimaBugOpenDays = 0, ultimaSoftBugOpenDays = 0 , NAopenDays = 0;
        let today = new Date()
        today.setDate(today.getDate())
        today = today.toISOString().split("T")[0]
        const MS_PER_DAY = 1000 * 60 * 60 * 24
        for(let i = 0; i < this.allTCsToShow.length; i++){
            let temp = {
                BugNo: this.allTCsToShow[i].key,
                ReportedBy: "QA",
                BU: "NA",
                BuManager: "NA",
                Customer: "NA",
                Summary: this.allTCsToShow[i]["fields"]["summary"],
                Severity: severity[this.allTCsToShow[i]["fields"]["priority"]["name"]],
                QAName: this.allTCsToShow[i]["fields"]["creator"]["displayName"],
                Developer: this.allTCsToShow[i]["fields"].assignee ? this.allTCsToShow[i]["fields"]["assignee"]["displayName"] : "NA",
                OpenDays: 0,
                ETA: this.allTCsToShow[i]["fields"]["duedate"] ? this.allTCsToShow[i]["fields"]["duedate"].split("T")[0] : "NA",
                ReportedDate: this.allTCsToShow[i]["fields"]["created"].split("T")[0],
                QAValidatedDate: "NA",
                DevManager: "NA",
            }
            let devKeys = Object.keys(devManager)
            devKeys.map(key => {
                devManager[key].map(value => {
                    if(temp.Developer === value){
                        temp.DevManager = key
                    }
                });
            })
            let ue = false, ua = false, sp = false;
            this.allTCsToShow[i]["fields"]["labels"].forEach(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    temp.ReportedBy = "Support"
                    temp.Severity = "P1"
                    let cusName = loLabel.split("-")
                    if(cusName.length > 1) {
                        temp.Customer = cusName[1]
                    }
                    else {
                        temp.Customer = "NA"
                    }
                }
                else if(loLabel.includes("ultima-software")) {
                    temp.BU = "Ultima Enterprise"
                    temp.BuManager = "Abhay Singh"
                    if(ue == false){
                        ultimaSoftBugCount = ultimaSoftBugCount + 1
                        ue = true
                    }
                    else{
                        console.log(this.allTCsToShow[i].key)
                    }
                }
                else if(loLabel.includes("ultima")) {
                    temp.BU = "Ultima Accelerator"
                    temp.BuManager = "Naveen Seth"
                    if(ua == false){
                        ultimaBugCount = ultimaBugCount + 1
                        ua = true
                    }
                    else{
                        console.log(this.allTCsToShow[i].key)
                    }
                    
                }
                else if(loLabel.includes("spektra")) {
                    temp.BU = "Spektra"
                    temp.BuManager = "Kshitij Gunjikar"
                    if(sp == false){
                        spektraBugCount = spektraBugCount + 1
                        sp = true
                    }
                    else{
                        console.log(this.allTCsToShow[i].key)
                    }
                    
                }
            })
            if(this.allTCsToShow[i]["fields"]["status"]["name"] === "Closed") {
                let date1 = this.allTCsToShow[i]["fields"]["statuscategorychangedate"]
                let date2 = this.allTCsToShow[i]["fields"]["created"]
                temp.QAValidatedDate = this.allTCsToShow[i]["fields"]["statuscategorychangedate"].split("T")[0]
                let diff = new Date(date1).getTime() - new Date(date2).getTime()
                let res = Math.round(diff / MS_PER_DAY)
                temp.OpenDays = res
                temp.ETA = temp.QAValidatedDate
                if(temp.OpenDays == 0){
                    temp.OpenDays = 1
                }
            }
            if(temp.OpenDays == 0) {
                let date1 = new Date()
                let date2 = this.allTCsToShow[i]["fields"]["created"]
                let diff = date1.getTime() - new Date(date2).getTime()
                let res = Math.round(diff / MS_PER_DAY)
                temp.OpenDays = res
                if(temp.OpenDays == 0){
                    temp.OpenDays = 1
                }
            }
            if(temp.BU === "Ultima Enterprise"){
                ultimaSoftBugOpenDays = ultimaSoftBugOpenDays + temp.OpenDays
            }
            else if(temp.BU === "Ultima Accelerator"){
                ultimaBugOpenDays = ultimaBugOpenDays + temp.OpenDays
            }
            else if(temp.BU === "Spektra"){
                spektraBugOpenDays = spektraBugOpenDays + temp.OpenDays
            }
            else if(temp.BU === "NA"){
                NAcount = NAcount + 1
                NAopenDays = NAopenDays + temp.OpenDays
            }
            else{}

            if(devDict[temp.Developer]){
                devDict[temp.Developer]["OpenBugs"] = devDict[temp.Developer]["OpenBugs"] + 1
                devDict[temp.Developer]["OpenDays"] = devDict[temp.Developer]["OpenDays"] + temp.OpenDays
                if(temp.BU === "Ultima Enterprise"){
                    devDict[temp.Developer]["UEcount"] = devDict[temp.Developer]["UEcount"] + 1
                }
                else if(temp.BU === "Ultima Accelerator"){
                    devDict[temp.Developer]["UAcount"] = devDict[temp.Developer]["UAcount"] + 1
                }
                else if(temp.BU === "Spektra"){
                    devDict[temp.Developer]["Spcount"] = devDict[temp.Developer]["Spcount"] + 1
                }
                else{
                    devDict[temp.Developer]["NA"] = devDict[temp.Developer]["NA"] + 1
                }
            }
            else{
                devDict[temp.Developer] = {
                    BU: "NA",
                    Manager: temp.DevManager,
                    OpenBugs: 1,
                    OpenDays: temp.OpenDays,
                    AvgDays: 0,
                    UAcount: 0,
                    Spcount: 0,
                    UEcount: 0,
                    NA: 0,
                }
                let buKeys = Object.keys(buMap)
                    buKeys.some(key => {
                        buMap[key].some(value => {
                            if(temp.Developer === value){
                                devDict[temp.Developer]["BU"] = key
                            }
                        });
                })
                if(temp.BU === "Ultima Enterprise"){
                    devDict[temp.Developer]["UEcount"] = devDict[temp.Developer]["UEcount"] + 1
                }
                else if(temp.BU === "Ultima Accelerator"){
                    devDict[temp.Developer]["UAcount"] = devDict[temp.Developer]["UAcount"] + 1
                }
                else if(temp.BU === "Spektra"){
                    devDict[temp.Developer]["Spcount"] = devDict[temp.Developer]["Spcount"] + 1
                }
                else{
                    devDict[temp.Developer]["NA"] = devDict[temp.Developer]["NA"] + 1
                }
            }
            this.bugsToShow.push(temp)
        }
        let cusReport = [
            {
                BU: "Ultima Accelerator",
                Manager: "Naveen Seth",
                OpenBugs: ultimaBugCount,
                AvgDays: ultimaBugCount > 0 ? Math.round(ultimaBugOpenDays / ultimaBugCount) : 0,
            },
            {
                BU: "Ultima Enterprise",
                Manager: "Abhay Singh",
                OpenBugs: ultimaSoftBugCount,
                AvgDays: ultimaSoftBugCount > 0 ? Math.round(ultimaSoftBugOpenDays / ultimaSoftBugCount): 0,
            },
            {
                BU: "Spektra",
                Manager: "Kshitij Gunjikar",
                OpenBugs: spektraBugCount,
                AvgDays: spektraBugCount > 0 ? Math.round(spektraBugOpenDays / spektraBugCount) : 0,
            },
            {
                BU: "NA",
                Manager: "NA",
                OpenBugs: NAcount,
                AvgDays: NAcount > 0 ? Math.round(NAopenDays / NAcount) : 0,
            }
        ]
        let devReport = []
        Object.keys(devDict).forEach(key => {
            if(!(QAs[key] === '')){
                this.devList.push(key)
                devReport.push({Developer: key, BU: devDict[key]["BU"], Manager: devDict[key]["Manager"], OpenBugs: devDict[key]["OpenBugs"],
                AvgDays: devDict[key]["OpenBugs"] > 0 ? Math.round(devDict[key]["OpenDays"]/devDict[key]["OpenBugs"]) : 0 ,
                UE: devDict[key]["UEcount"], UA: devDict[key]["UAcount"], SP: devDict[key]["Spcount"], NA: devDict[key]["NA"]})
            }
        })
        this.devList.sort()
        this.cusReportList = cusReport
        this.devReportList = devReport
        this.filterBugs(this.state.buisnessUnit, this.state.developer)
    }
    filterBugs(bu, dev){
        if(bu == null && dev == null){
            this.ApplicableTcs = []
             this.ApplicableTcs = this.bugsToShow
        }
        else if(bu == null && dev != null){
            this.ApplicableTcs = []
            for(let i = 0; i < this.bugsToShow.length; i++){
                if(this.bugsToShow[i]["Developer"] === dev){
                    this.ApplicableTcs.push(this.bugsToShow[i])
                }
            }
        }
        else if(bu != null && dev == null){
            this.ApplicableTcs = []
            for(let i = 0; i < this.bugsToShow.length; i++){
                if(this.bugsToShow[i]["BU"] === bu){
                    this.ApplicableTcs.push(this.bugsToShow[i])
                }
            }
        }
        else{
            this.ApplicableTcs = []
            for(let i = 0; i < this.bugsToShow.length; i++){
                if(this.bugsToShow[i]["BU"] === bu && this.bugsToShow[i]["Developer"] === dev){
                    this.ApplicableTcs.push(this.bugsToShow[i])
                }
            }
        }
        let temp = []
        let priority = {}
        this.state.statusColumn.forEach(item => {
            if(item.isChecked == true){
                priority[item.value] = true
            }
        })
        this.ApplicableTcs.forEach(bug => {
            if(priority[bug["Severity"]] == true) {
                temp.push(bug)
            }
        })
        this.ApplicableTcs = temp
        this.gridOperations(true);
    }
    startDate = (startDate) =>{
        this.DateStart = startDate['StartDate']
        this.setState({
            startDate : this.DateStart
        })
    }
    endDate = (endDate) =>{
        this.DateEnd = endDate['EndDate']
        this.pageNumber = 0
        this.startAt = 0
        if(!this.state.startDate){
            this.state.startDate = this.DateStart
        }
        this.setState({
            endDate : this.DateEnd
        },()=>{
            this.getTcs(this.state.startDate, this.state.endDate, this.startAt);
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
        if (this.reportGridApi) {
            if (this.state.isApiUnderProgress) {
                this.reportGridApi.showLoadingOverlay();
            } else if (this.cusReportList.length === 0) {
                this.reportGridApi.showNoRowsOverlay();
            } else {
                this.reportGridApi.hideOverlay();
            }
        }
        if (this.devReportGridApi) {
            if (this.state.isApiUnderProgress) {
                this.devReportGridApi.showLoadingOverlay();
            } else if (this.devReportList.length === 0) {
                this.devReportGridApi.showNoRowsOverlay();
            } else {
                this.devReportGridApi.hideOverlay();
            }
        }
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = [];this.getTcs();}})}}>
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
                                            <span className='rp-app-table-title'>MANAGER REPORT</span>
                                            <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red'  }}>Table Showing Only P1 and P2 Severity bugs. To see rest of the bugs Use Filter [<i class="fa fa-filter" aria-hidden="true"></i>] Below</span>
                                            {
                                                this.state.tcOpen &&
                                                <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                    <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                                </div>
                                            }
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
                                            <div style={{ width: '8rem', marginLeft: '1rem' }}>
                                                <span className='rp-app-table-title'>BUG LIST</span>
                                            </div>
                                            {
                                                [
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'BU', onChange: (e) => this.onSelectBU(e), values: [{ value: '', text: 'Select Buisness Unit' }, ...(['Spektra', 'Ultima Accelerator', 'Ultima Enterprise', 'NA'].map(each => ({ value: each, text: each })))] },
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'Developer', onChange: (e) => this.onSelectDeveloper(e), values: [{ value: '', text: 'Select Developer' }, ...(this.devList.map(each => ({ value: each, text: each })))] },
                                                ].map(item => (
                                                    <div style={item.style}>
                                                        <Input /*disabled={this.state.isApiUnderProgress}*/ style={{ fontSize: '12px' }} value={this.state[item.field]} onChange={(e) => item.onChange(e.target.value)} type="select" name={`select${item.field}`} id={`select${item.field}`}>
                                                            {
                                                                item.values.map(each => <option value={each.value}>{each.text}</option>)
                                                            }
                                                        </Input>
                                                    </div>
                                                ))
                                            }
                                             <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button /*disabled={this.state.isApiUnderProgress}*/ id="PopoverAssign2MR" type="button"><i class="fa fa-filter" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign2MR" id="PopoverAssignButton2MR" toggle={() => this.popoverToggle2()} isOpen={this.state.popoverOpen2}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllCheckedStatusTCs}  value="checkedall" /> Check / Uncheck All
                                                            <ul>
                                                            {
                                                            this.state.statusColumn.map((columnName) => {
                                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementStatusTcs}  {...columnName} />)
                                                            })
                                                            }
                                                            </ul>
                                                            <Button onClick={() => this.showSelectedTCs()}>Show Selected Bugs</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div>
                                            <div style={{ width: '5rem', marginLeft: '2rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} title="Only selected Bugs will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApi) {
                                                        this.gridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: 'ManagerReport_Bug_List.csv', });
                                                    }
                                                    if(this.reportGridApi)
                                                    {
                                                        this.reportGridApi.exportDataAsCsv({allColumns: true, onlySelected: false, fileName: 'ManagerReport_Summary.csv'});
                                                    }
                                                    if(this.devReportGridApi)
                                                    {
                                                        this.devReportGridApi.exportDataAsCsv({allColumns: true, onlySelected: false, fileName: 'DeveloperReport_Summary.csv'});
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.ApplicableTcs.length}/{this.maxResult}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginLeft: '1rem' }}>
                                                <span className='rp-app-table-title'>Manager Report Summary</span>
                                            </div>
                                            <div style={{ width: '10rem', position: 'absolute', right: '1.5rem'}}>
                                                <span className='rp-app-table-value'>Selected: {this.state.reportSelectedRows}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="reportGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onReportSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.cusReportColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.cusReportList}
                                                onGridReady={(params) => this.onReportGridReady(params)}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.cusReportList.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginLeft: '1rem' }}>
                                                <span className='rp-app-table-title'>Developer Report Summary</span>
                                            </div>
                                            <div style={{ width: '10rem', position: 'absolute', right: '1.5rem'}}>
                                                <span className='rp-app-table-value'>Selected: {this.state.devReportSelectedRows}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="devReportGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onDevReportSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.devReportColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.devReportList}
                                                onGridReady={(params) => this.onDevReportGridReady(params)}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.devReportList.length}</span>
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
export default (ManagerReport);