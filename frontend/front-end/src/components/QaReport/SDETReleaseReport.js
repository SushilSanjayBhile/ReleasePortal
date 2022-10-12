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
import  CheckBox  from '../TestCasesAll/CheckBox'
import './popover.scss';
class SDETReleaseReport extends Component {
    isApiUnderProgress = false;
    sdetData = {};
    userInfo = [];
    releaseInfo = {};
    fixVerStr = '';

    constructor(props) {
        super(props);
        let columnDefDict = {
            'name' : {
                headerName: "Name", field: "name", sortable: true, filter: true,
                editable: false,
                width: '150',
            },
            'assigned' : {
                headerName: "Assigned", field: "assigned", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'executed': {
                headerName: "Executed", field: "executed", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'exeTime': {
                headerName: "Execution Time", field: "exeTime", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'remained': {
                headerName: "Remaining", field: "remained", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'automated': {
                headerName: "Automated", field: "automated", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'inProg': {
                headerName: "In Progress", field: "inProg", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
                cellRenderer: (params) => {
                    let sdet = params.data.name
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Sub-task)%20AND%20status%20in%20(%22In%20Progress%22)%20AND%20fixVersion%20in%20(${this.fixVerStr})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.inProg}</a>`;
                },
            },
            'inProgSp': {
                headerName: "Story Points(In Prog)", field: "inProgSp", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'done': {
                headerName: "Done", field: "done", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
                cellRenderer: (params) => {
                    let sdet = params.data.name
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Sub-task)%20AND%20status%20in%20(Done)%20AND%20fixVersion%20in%20(${this.fixVerStr})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.done}</a>`;
                },
            },
            'doneSp': {
                headerName: "story Points(Done)", field: "doneSp", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'todo': {
                headerName: "To Do", field: "todo", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
                cellRenderer: (params) => {
                    let sdet = params.data.name
                    sdet = encodeURIComponent(sdet)
                    return `<a href= https://diamanti.atlassian.net/issues/?jql=assignee%20in%20(%22${sdet}%22)%20AND%20issuetype%20in%20(Sub-task)%20AND%20status%20in%20(ToDo)%20AND%20fixVersion%20in%20(${this.fixVerStr})%20ORDER%20BY%20created%20DESC target= "_blank">${params.data.todo}</a>`;
                },
            },
            'todoSp': {
                headerName: "Story Points(to do)", field: "todoSp", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }

        this.state = {
            selectedRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            startDate: null,
            endDate: null,
            tcOpen: false,
            unRelVer: [],
            ApplicableTcs: undefined,

            columnDefs: [
                columnDefDict['name'],
                columnDefDict['assigned'],
                columnDefDict['executed'],
                columnDefDict['exeTime'],
                columnDefDict['remained'],
                columnDefDict['automated'],
                columnDefDict['inProg'],
                columnDefDict['inProgSp'],
                columnDefDict['done'],
                columnDefDict['doneSp'],
                columnDefDict['todo'],
                columnDefDict['todoSp'],
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
            {colId: 'name', sort: 'asc'}
        ];
        this.gridApi.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    gridOperations(enable) {
        if (enable) {
            if (this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: false});
            }
        } else {
            if (!this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: true});
            }
        }
    }

    componentDidMount() {
        this.gridOperations(false);
        let temp = []
        let promise = []
        promise.push(axios.get('/rest/unReleasedVersions').then(res => {
            let data = res.data.searchResultTotal.firstRow
            if(data){
                if(data.cells.length > 1){
                    data.cells.forEach(cell => {
                        //code to get all releases.
                        if(cell.markup != "T:"){
                            temp.push({value: cell.markup, isChecked: true})
                        }
                    })
                }
            }
        }).catch(err => {
            console.log("Error in fetching unReleasedVersions /rest/unReleasedVersions", err)
            this.gridOperations(true);
        }));
        Promise.all(promise).then(result => {
            this.state.unRelVer = temp
            this.makeFixvVerString()
            axios.get(`/api/release/cdate`).then(res => {
                    res.data.forEach(item => {
                    this.releaseInfo[item.ReleaseNumber] = item.RelNum
                });
                    this.state.targetRel =  this.findMatchingRel()
                    this.getAllData()
                }).catch(err => {
                    console.log("Error in fetching release /api/release/cdate", err)
                    this.gridOperations(true);
                });
        })
    }

    makeFixvVerString(){
        let temp = []
        this.state.unRelVer.forEach(ver => {
            if(ver.isChecked == true){
                temp.push(ver.value)
            }
        })

        let fixVerStr = ''
        if(temp.length == 0){
            fixVerStr = ''
        }
        else if(temp.length ==1){
            fixVerStr = encodeURIComponent("\""+temp[0]+"\"")
        }
        else{
            for(let i = 0; i < temp.length - 1; i++){
                fixVerStr = fixVerStr + "\"" + temp[i] + "\"" + ", "
            }
            fixVerStr = fixVerStr + "\"" + temp[temp.length - 1] + "\""
            fixVerStr = encodeURIComponent(fixVerStr)
        }
        this.fixVerStr = fixVerStr;
    }

    findMatchingRel(){
        let rel = []
        this.state.unRelVer.forEach(ver => {
            if(ver.isChecked){
                if(ver.value in this.releaseInfo || ver.value.toLowerCase() in this.releaseInfo){
                    rel.push(ver.value)
                }
                else {
                    Object.keys(this.releaseInfo).forEach(key => {
                        if(ver.value.toLowerCase() == this.releaseInfo[key].toLowerCase()){
                            rel.push(key)
                            return;
                        }
                    })
                }
            }
        })
        return rel;
    }

    getDataForSelectedFixVersion(){
        this.gridOperations(false);
        this.makeFixvVerString()
        this.state.targetRel = this.findMatchingRel()
        let qaList = {}
        let promises = []
        Object.keys(this.sdetData).forEach(key => {
            if(key != "Automated"){
                Object.keys(this.sdetData[key]).forEach(rel => {
                    if(this.state.targetRel.includes(rel)){
                        Object.keys(this.sdetData[key][rel]).forEach(qa => {
                            if(qaList[qa]){
                                if(key.toLocaleLowerCase().includes("assigned")){
                                    qaList[qa]["assigned"] = qaList[qa]["assigned"] + this.sdetData[key][rel][qa]["assigned"]
                                    qaList[qa]["time"] = qaList[qa]["time"] + this.sdetData[key][rel][qa]["time"]
                                }
                                else{
                                    qaList[qa]["executed"] = qaList[qa]["executed"] + this.sdetData[key][rel][qa]
                                }
                            }
                            else{
                                if(key.toLocaleLowerCase().includes("assigned")){
                                    qaList[qa] = {"assigned": this.sdetData[key][rel][qa]["assigned"], "time": this.sdetData[key][rel][qa]["time"], "executed": 0}
                                }
                                else{
                                    qaList[qa] = {"assigned": 0, "time": 0.0, "executed": this.sdetData[key][rel][qa]}
                                }
                            }
                        })
                    }
                })
            }
        })
        this.userlist.forEach(user => {
            user.assigned = 0
            user.executed = 0
            user.exeTime = 0
            user.remained = 0
            user.inProg = 0
            user.inProgSp = 0
            user.done = 0
            user.doneSp = 0
            user.todo = 0
            user.todoSp = 0
            if(user.email in qaList){
                user.assigned = user.assigned + qaList[user.email]["assigned"]
                user.executed = user.executed + qaList[user.email]["executed"]
                user.exeTime = user.exeTime + qaList[user.email]["time"]
            }
            if(user.name in qaList){
                user.assigned = user.assigned + qaList[user.name]["assigned"]
                user.executed = user.executed + qaList[user.name]["executed"]
                user.exeTime = user.exeTime + qaList[user.name]["time"]
            }
            promises.push(axios.get(`/rest/tasks`,{
                params: {
                    "qaMail": user["email"],
                    "fixVerStr": this.fixVerStr,
                }}).then(resp => {
                    resp.data.issues.forEach(issue => {
                        if(issue.fields.status.name == "Done"){
                            user.done = user.done + 1
                            user.doneSp = user.doneSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                        }
                        else if(issue.fields.status.name == "ToDo" || issue.fields.status.name == "To Do"){
                            user.todo = user.todo + 1
                            user.todoSp = user.todoSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                        }
                        else if(issue.fields.status.name == "In Progress"){
                            user.inProg = user.inProg + 1
                            user.inProgSp = user.inProgSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                        }
                    })
                }).catch(err => {
                    console.log("Error in fetching user tasks /rest/tasks , err, qaMail", err, user["email"])
                    this.gridOperations(true);
                })
            );
        })
        Promise.all(promises).then(result => {
            this.setState({ApplicableTcs: undefined})
            this.setState({ApplicableTcs: this.userlist}, (() => {this.gridOperations(true);}))
        })
    }

    getAllData() {
        axios.get('/api/sdetReleaseReport/',{
            params: {
                releases: this.state.targetRel
            },
        }).then(all => {
            this.sdetData = all.data.SDETRelReport
            let qaList = {}
            Object.keys(this.sdetData).forEach(key => {
                if(key != "Automated"){
                    Object.keys(this.sdetData[key]).forEach(rel => {
                        Object.keys(this.sdetData[key][rel]).forEach(qa => {
                            if(qaList[qa]){
                                if(key.toLocaleLowerCase().includes("assigned")){
                                    qaList[qa]["assigned"] = qaList[qa]["assigned"] + this.sdetData[key][rel][qa]["assigned"]
                                    qaList[qa]["time"] = qaList[qa]["time"] + this.sdetData[key][rel][qa]["time"]
                                }
                                else{
                                    qaList[qa]["executed"] = qaList[qa]["executed"] + this.sdetData[key][rel][qa]
                                }
                            }
                            else{
                                if(key.toLocaleLowerCase().includes("assigned")){
                                    qaList[qa] = {"assigned": this.sdetData[key][rel][qa]["assigned"], "time": this.sdetData[key][rel][qa]["time"], "executed": 0}
                                }
                                else{
                                    qaList[qa] = {"assigned": 0, "time": 0.0, "executed": this.sdetData[key][rel][qa]}
                                }
                            }
                        })
                    })
                }
            })
            this.userlist = []
            let promises = []
            axios.get(`/api/userinfo`).then(res => {
                res.data.forEach(user => {
                    if (user["role"] == "QA" || ((user["role"] == "ADMIN") && (user["email"] == "yatish@diamanti.com" || user["email"] == "bharati@diamanti.com" || user["email"] == "kdivekar@diamanti.com" || user["email"] == "ajadhav@diamanti.com"))) {
                        let temp = {email: user["email"], name:user["name"], assigned: 0, executed:0, exeTime: 0, remained: 0, automated: this.sdetData["Automated"][user["email"]] ? this.sdetData["Automated"][user["email"]]["auto"] : 0, inProg: 0, inProgSp: 0, done: 0, doneSp: 0, todo: 0, todoSp: 0}
                        if(user.email in qaList){
                            temp.assigned = temp.assigned + qaList[user.email]["assigned"]
                            temp.executed = temp.executed + qaList[user.email]["executed"]
                            temp.exeTime = temp.exeTime + qaList[user.email]["time"]
                        }
                        if(user.name in qaList){
                            temp.assigned = temp.assigned + qaList[user.name]["assigned"]
                            temp.executed = temp.executed + qaList[user.name]["executed"]
                            temp.exeTime = temp.exeTime + qaList[user.name]["time"]
                        }
                        this.userlist.push(temp);
                    }
                })
                this.userlist.forEach(user => {
                    promises.push(axios.get(`/rest/tasks`,{
                        params: {
                            "qaMail": user["email"],
                            "fixVerStr": this.fixVerStr,
                        }}).then(resp => {
                            resp.data.issues.forEach(issue => {
                                if(issue.fields.status.name == "Done"){
                                    user.done = user.done + 1
                                    user.doneSp = user.doneSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                }
                                else if(issue.fields.status.name == "ToDo" || issue.fields.status.name == "To Do"){
                                    user.todo = user.todo + 1
                                    user.todoSp = user.todoSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                }
                                else if(issue.fields.status.name == "In Progress"){
                                    user.inProg = user.inProg + 1
                                    user.inProgSp = user.inProgSp + (issue.fields.customfield_10002 != null ? issue.fields.customfield_10002 : 0)
                                }
                            })
                        }).catch(err => {
                            console.log("Error in fetching user tasks /rest/tasks , err, qaMail", err, user["email"])
                            this.gridOperations(true);
                        })
                    );
                })
                Promise.all(promises).then(result => {
                    this.setState({ApplicableTcs: this.userlist}, (() => {this.gridOperations(true);}));
                })
            })
        }).catch(err => {
            console.log("Error in fetching sdet release report /api/sdetReleaseReport/", err)
            this.gridOperations(true);
        })
    }
    popoverToggleFixVer = () => this.setState({ popoverOpenFixVer: !this.state.popoverOpenFixVer });
    handleAllChecked = (event) => {
        let fixVersions = this.state.unRelVer
        fixVersions.forEach(columnName => columnName.isChecked = event.target.checked)
        this.setState({unRelVer: fixVersions})

    }
    handleCheckChieldElement = (event) => {
        let fixVersions = this.state.unRelVer
        fixVersions.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({unRelVer: fixVersions})
    }
    disable(){
        if(this.state.isApiUnderProgress){
             return true;
         }
         else return false;
     }
    render() {
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {
                this.gridApi.showLoadingOverlay();
            }
            else if (this.state.ApplicableTcs != undefined && this.state.ApplicableTcs.length == 0) {
                this.gridApi.showNoRowsOverlay();
            }
            else {
                this.gridApi.hideOverlay();
            }
        }
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){/*this.getAllData()*/}});}}>
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
                                            <span className='rp-app-table-title'>SDET RELEASE REPORT</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div>
                                <div style={{ width: '100%', height: '500px', marginBottom: '6rem' }}>
                                <div class="test-header">
                                        <div class="row">
                                            <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '20rem' }}>
                                                <Button disabled={this.disable()} id="PopoverAssignFixVer" type="button"><i class="fa fa-check-square-o" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover className="popover-container" trigger="legacy" placement="bottom" target="PopoverAssignFixVer" id="PopoverAssignButtonFixVer" toggle={() => this.popoverToggleFixVer()} isOpen={this.state.popoverOpenFixVer}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
                                                            <ul style={{columns: 5, width: '700px'}}>
                                                            {
                                                            this.state.unRelVer.map((columnName) => {
                                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElement}  {...columnName} />)
                                                            })
                                                            }
                                                            </ul>
                                                            <Button disabled={ this.disable() } size="md" className="rp-rb-set-btn" onClick={(e) => {this.setState({ popoverOpenFixVer: !this.state.popoverOpenFixVer});this.getDataForSelectedFixVersion();}} >Set</Button>
                                                            {/* <Button onClick={() => {this.setState({ popoverOpenFixVer: !this.state.popoverOpenFixVer});this.getDataForSelectedFixVersion();}}>Set</Button> */}
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
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
                                            id="sdetRelReportGrid"
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
                                                rowData={this.state.ApplicableTcs}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.state.ApplicableTcs != null && this.state.ApplicableTcs != undefined ? this.state.ApplicableTcs.length : 0}</span>
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
export default (SDETReleaseReport);