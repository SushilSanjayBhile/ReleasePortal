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

class CustomerReport extends Component {
    pageNumber = 0;
    startAt = 0;
    isApiUnderProgressCR = false;
    allTCsToShowCR = [];
    ApplicableTcsCR = [];
    cusReportListCR = [];
    bugsToShowCR = [];
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
    dayInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
    DateStart = '';
    DateEnd= '';
    maxResultCR= 0;
    constructor(props) {
        super(props);
        let columnDefDictCR = {
            'BugNo' : {
                headerName: "BugNo", field: "BugNo", sortable: true, filter: true,
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
                    if (this.gridApiCR) {
                        this.setState({ selectedRowsCR: this.gridApiCR.getSelectedRows().length })
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
                headerName: "QAName", field: "QAName", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'ReportedBy' : {
                headerName: "ReportedBy", field: "ReportedBy", sortable: true, filter: true,
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
                headerName: "DevManager", field: "DevManager", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'BuManager' :  {
                headerName: "BuManager", field: "BuManager", sortable: true, filter: true,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ReportedDate' : {
                headerName: "ReportedDate", field: "ReportedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenDays' : {
                headerName: "OpenDays", field: "OpenDays", sortable: true, filter: true,
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
                headerName: "QAValidatedDate", field: "QAValidatedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }
        let cusReportColumnDefDictCR = {
            'BU' : {
                headerCheckboxSelection: (params) => {
                    if (this.reportGridApiCR) {
                        this.setState({ selectedRowsCR: this.reportGridApiCR.getSelectedRows().length })
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

        this.state = {
            selectedRowsCR: 0,
            reportSelectedRowsCR: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            startDate: null,
            endDate: null,
            buisnessUnitCR: null,

            statusColumnCR:[
                {id:1,value:'P1', isChecked: true},
                {id:2,value:'P2', isChecked: true},
                {id:3,value:'P3', isChecked: false},
                {id:4,value:'P4', isChecked: false},
                {id:4,value:'P5', isChecked: false},
            ],
            columnDefsCR: [
                columnDefDictCR['BU'],
                columnDefDictCR['BuManager'],
                columnDefDictCR['Customer'],
                columnDefDictCR['Developer'],
                columnDefDictCR['DevManager'],
                columnDefDictCR['ReportedDate'],
                columnDefDictCR['OpenDays'],
                columnDefDictCR['Severity'],
                columnDefDictCR['BugNo'],
                columnDefDictCR['Summary'],
                columnDefDictCR['ETA'], 
                columnDefDictCR['ReportedBy'],
                columnDefDictCR['QAName'],
                columnDefDictCR['QAValidatedDate'],
            ],
            cusReportColumnDefsCR: [
                cusReportColumnDefDictCR['BU'],
                cusReportColumnDefDictCR['Manager'],
                cusReportColumnDefDictCR['OpenBugs'],
                //managercolumnDefDict['ClosedBugs'],
                cusReportColumnDefDictCR['AvgDays'],
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
    handleAllCheckedStatusTCsCR = (event) => {
        let statusColumnCR = this.state.statusColumnCR
        statusColumnCR.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({statusColumnCR: statusColumnCR})
    }

    handleCheckChieldElementStatusTcsCR = (event) => {
        let statusColumnCR = this.state.statusColumnCR
        statusColumnCR.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({statusColumnCR: statusColumnCR})
    }
    popoverToggle2CR = () => this.setState({ popoverOpen2CR: !this.state.popoverOpen2CR });
    popoverToggle1CR = () => this.setState({ popoverOpen1CR: !this.state.popoverOpen1CR });
    getRowHeightCR = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 2);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 100;
    }
    // onRowSelected = (params) => {
    //     if (this.gridApiCR) {
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
        this.setState({startDate:this.DateStart, endDate:this.DateEnd},() => {this.getTcsCR(this.state.startDate, this.state.endDate, this.startAt);})
    }
    onSelectionChangedCR = (event) => {
        this.setState({ selectedRowsCR: event.api.getSelectedRows().length })
    }
    onReportSelectionChangedCR = (event) => {
        this.setState({ reportSelectedRowsCR: event.api.getSelectedRows().length })
    }
    onGridReadyCR = params => {
        this.gridApiCR = params.api;
        this.gridColumnApiCR = params.columnApi;
        const sortModelCR = [
            {colId: 'ReportedDate', sort: 'desc'}
        ];
        this.gridApiCR.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    onReportGridReadyCR = params => {
        this.reportGridApiCR = params.api;
        this.reportGridColumnApiCR = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    gridOperationsCR(enable) {
        if (enable) {
            if (this.state.isApiUnderProgressCR) {
                this.setState({ isApiUnderProgressCR: false, loading: false });
            }
        } else {
            if (!this.state.isApiUnderProgressCR) {
                this.setState({ isApiUnderProgressCR: true });
            }
        }
    }
    componentDidMount() {
        this.ApplicableTcsCR = []
        //setTimeout(() => this.getTcsCR(this.startAt), 400);
    }
    onSelectBUCR(bu) {
        if (bu === '') {
            bu = null;
        }
        this.setState({buisnessUnitCR:bu})
        this.filterBugsCR(bu);
    }
    showSelectedTCsCR = () =>{
        this.filterBugsCR(this.state.buisnessUnitCR)
        this.setState({ popoverOpen2CR: !this.state.popoverOpen2CR });
    }

    getTcsCR() {
        this.gridOperationsCR(false);
        let promises = []
        axios.get(`/rest/AllCustomerBugCount`).then(all => {
            this.maxResultCR = all.data.total
            for(let i = 0; i <= this.maxResultCR; i=i+100){
                promises.push(axios.get(`/rest/AllCustomerBugs`,{
                    params: {
                        "startAt": i,
                    }
                }).then(all => {
                    this.allTCsToShowCR = [...this.allTCsToShowCR, ...all.data.issues];
                }).catch(err => {
                    this.gridOperationsCR(true);
                }))
            }
            Promise.all(promises).then(result => {
                this.getTcsToShowCR();
                })
        }).catch(err => {
            this.gridOperationsCR(true);
        })
    }
    getTcsToShowCR(){
        this.ApplicableTcsCR = []
        this.cusReportListCR = []
        this.bugsToShowCR = []
        let severity = {"Highest":"P1","High":"P2","Medium":"P3","Low":"P4", "Lowest":"P5"}
        let devManager = {"Abhay Singh":["Abhay Singh", "Nikhil Temgire", "Samiksha Bagmar", "Sunil Barhate"],
                          "Kshitij Gunjikar":["Kshitij Gunjikar","Kiran Zarekar", "Sushil Bhile", "Sourabh Shukla", "Joel Wu"],
                          "Rahul Soman":["Rahul Soman", "Vinod Lohar", "Atirek Goyal", "Rajesh Borundia", "Mayur Shinde", "Swapnil Shende", "Sandeep Zende"],
                          "Sourabh Shukla":["Abhijeet Chavan", "Narendra Raigar"],
                          "Naveen Seth":["Naveen Seth","Tanya Singh"],
                          "Vinod Lohar":["Diksha Tambe"],
                          "Arvind Krishnan":["Arvind Krishnan"]
                           }
        let spektraBugCount = 0, ultimaBugCount = 0, ultimaSoftBugCount = 0, NAcount = 0, spektraBugOpenDays = 0, ultimaBugOpenDays = 0, ultimaSoftBugOpenDays = 0 , NAopenDays = 0;
        let today = new Date()
        today.setDate(today.getDate())
        today = today.toISOString().split("T")[0]
        const MS_PER_DAY = 1000 * 60 * 60 * 24
        for(let i = 0; i < this.allTCsToShowCR.length; i++){
            let temp = {
                BugNo: this.allTCsToShowCR[i].key,
                ReportedBy: "QA",
                BU: "NA",
                BuManager: "NA",
                Customer: "NA",
                Summary: this.allTCsToShowCR[i]["fields"]["summary"],
                Severity: severity[this.allTCsToShowCR[i]["fields"]["priority"]["name"]],
                QAName: this.allTCsToShowCR[i]["fields"]["creator"]["displayName"],
                Developer: this.allTCsToShowCR[i]["fields"].assignee ? this.allTCsToShowCR[i]["fields"]["assignee"]["displayName"] : "NA",
                OpenDays: 0,
                ETA: today,
                ReportedDate: this.allTCsToShowCR[i]["fields"]["created"].split("T")[0],
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
            this.allTCsToShowCR[i]["fields"]["labels"].forEach(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    temp.ReportedBy = "Support"
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
                    ultimaSoftBugCount = ultimaSoftBugCount + 1
                }
                else if(loLabel.includes("ultima")) {
                    temp.BU = "Ultima Accelerator"
                    temp.BuManager = "Naveen Seth"
                    ultimaBugCount = ultimaBugCount + 1
                }
                else if(loLabel.includes("spektra")) {
                    temp.BU = "Spektra"
                    temp.BuManager = "Kshitij Gunjikar"
                    spektraBugCount = spektraBugCount + 1
                }
            })
            if(this.allTCsToShowCR[i]["fields"]["duedate"]) {
                temp.ETA = this.allTCsToShowCR[i]["fields"]["duedate"].split("T")[0]
            }
            if(this.allTCsToShowCR[i]["fields"]["status"]["name"] === "Closed") {
                let date1 = this.allTCsToShowCR[i]["fields"]["statuscategorychangedate"]
                let date2 = this.allTCsToShowCR[i]["fields"]["created"]
                temp.QAValidatedDate = this.allTCsToShowCR[i]["fields"]["statuscategorychangedate"].split("T")[0]
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
                let date2 = this.allTCsToShowCR[i]["fields"]["created"]
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
            this.bugsToShowCR.push(temp)
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
        this.cusReportListCR = cusReport
        this.filterBugsCR(this.state.buisnessUnitCR)
    }
    filterBugsCR(bu){
        if(bu == null){
            this.ApplicableTcsCR = []
             this.ApplicableTcsCR = this.bugsToShowCR
        }
        else{
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        let temp = []
        let priority = {}
        this.state.statusColumnCR.forEach(item => {
            if(item.isChecked == true){
                priority[item.value] = true
            }
        })
        this.ApplicableTcsCR.forEach(bug => {
            if(priority[bug["Severity"]] == true) {
                temp.push(bug)
            }
        })
        this.ApplicableTcsCR = temp
        this.gridOperationsCR(true);
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
            this.getTcsCR(this.state.startDate, this.state.endDate, this.startAt);
        })
    }
    render() {
        let DATE1 = this.DateStart
        let DATE2 = this.DateEnd
        if (this.gridApiCR) {
            if (this.state.isApiUnderProgressCR) {
                this.gridApiCR.showLoadingOverlay();
            } else if (this.ApplicableTcsCR.length === 0) {
                this.gridApiCR.showNoRowsOverlay();
            } else {
                this.gridApiCR.hideOverlay();
            }
        }
        if (this.reportGridApiCR) {
            if (this.state.isApiUnderProgressCR) {
                this.reportGridApiCR.showLoadingOverlay();
            } else if (this.cusReportListCR.length === 0) {
                this.reportGridApiCR.showNoRowsOverlay();
            } else {
                this.reportGridApiCR.hideOverlay();
            }
        }
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ tcOpenCR: !this.state.tcOpenCR }, () => {if(this.state.tcOpenCR){this.allTCsToShowCR = []; this.getTcsCR();}})}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.tcOpenCR &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.tcOpenCR &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>CUSTOMER BUG REPORT</span>
                                            <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red'  }}>Table Showing Only P1 and P2 Severity bugs. To see rest of the bugs Use Filter [<i class="fa fa-filter" aria-hidden="true"></i>] Below</span>
                                            {
                                                this.state.tcOpenCR &&
                                                <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                    <span className='rp-app-table-value'>Selected: {this.state.selectedRowsCR}</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpenCR}>
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            {
                                                [
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'BU', onChange: (e) => this.onSelectBUCR(e), values: [{ value: '', text: 'Select Buisness Unit' }, ...(['Spektra', 'Ultima Accelerator', 'Ultima Enterprise', 'NA'].map(each => ({ value: each, text: each })))] },
                                                ].map(item => (
                                                    <div style={item.style}>
                                                        <Input /*disabled={this.state.isApiUnderProgressCR}*/ style={{ fontSize: '12px' }} value={this.state[item.field]} onChange={(e) => item.onChange(e.target.value)} type="select" name={`select${item.field}`} id={`select${item.field}`}>
                                                            {
                                                                item.values.map(each => <option value={each.value}>{each.text}</option>)
                                                            }
                                                        </Input>
                                                    </div>
                                                ))
                                            }
                                            <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button /*disabled={this.state.isApiUnderProgressCR}*/ id="PopoverAssign2CR" type="button"><i class="fa fa-filter" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign2CR" id="PopoverAssignButton2CR" toggle={() => this.popoverToggle2CR()} isOpen={this.state.popoverOpen2CR}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllCheckedStatusTCsCR}  value="checkedall" /> Check / Uncheck All
                                                            <ul>
                                                            {
                                                            this.state.statusColumnCR.map((columnName) => {
                                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementStatusTcsCR}  {...columnName} />)
                                                            })
                                                            }
                                                            </ul>
                                                            <Button onClick={() => this.showSelectedTCsCR()}>Show Selected Bugs</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div>
                                            <div style={{ width: '5rem', marginLeft: '2rem' }}>
                                                <Button disabled={this.state.isApiUnderProgressCR} title="Only selected Bugs will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApiCR) {
                                                        let selected = this.gridApiCR.getSelectedRows().length;
                                                        if (!selected) {
                                                            alert('Only selected Bugs will be downloaded');
                                                            return
                                                        }
                                                        this.gridApiCR.exportDataAsCsv({ allColumns: true, onlySelected: true });
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
                                                onSelectionChanged={(e) => this.onSelectionChangedCR(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefsCR}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeightCR}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.ApplicableTcsCR}
                                                onGridReady={(params) => this.onGridReadyCR(params)}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.ApplicableTcsCR.length}/{this.maxResultCR}</span>
                                                </div>
                                            }
                                            {/* <div style={{
                                                float: 'right', display: this.state.isApiUnderProgressCR
                                                }}>
                                                <Button onClick={() => this.paginate(-1)}>Previous</Button>
                                                <span  >{`   Page: ${this.pageNumber}   `}</span>

                                                <Button onClick={() => this.paginate(1)}>Next</Button>

                                            </div> */}
                                    </div>
                                </div>
                            </div >
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '5rem', marginLeft: '2rem' }}>
                                                <Button disabled={this.state.isApiUnderProgressCR} title="Only selected Bugs will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.reportGridApiCR) {
                                                        let selected = this.reportGridApiCR.getSelectedRows().length;
                                                        if (!selected) {
                                                            alert('Only selected Bugs will be downloaded');
                                                            return
                                                        }
                                                        this.reportGridApiCR.exportDataAsCsv({ allColumns: true, onlySelected: true });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                            <div style={{ width: '10rem', position: 'absolute', marginTop: '0.5rem', right: '1.5rem'}}>
                                                <span className='rp-app-table-value'>Selected: {this.state.reportSelectedRowsCR}</span>
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
                                                onSelectionChanged={(e) => this.onReportSelectionChangedCR(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.cusReportColumnDefsCR}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeightCR}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.cusReportListCR}
                                                onGridReady={(params) => this.onReportGridReadyCR(params)}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.cusReportListCR.length}</span>
                                                </div>
                                            }
                                            {/* <div style={{
                                                float: 'right', display: this.state.isApiUnderProgressCR
                                                }}>
                                                <Button onClick={() => this.paginate(-1)}>Previous</Button>
                                                <span  >{`   Page: ${this.pageNumber}   `}</span>

                                                <Button onClick={() => this.paginate(1)}>Next</Button>

                                            </div> */}
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
export default (CustomerReport);