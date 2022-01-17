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
import { element } from 'prop-types';
import { CSVLink } from 'react-csv';
class NewClosedInQaTickets extends Component {
    isApiUnderProgress = false;
    disableShowButton = true;
    allTCsToShow = [];
    allClosedDefectsToShow = [];
    allPendingDefectsToShow = [];
    TicketsBySeverity = [];
    TicketsByCustomer = [];
    TicketsByProduct = [];
    cusDateStart = '';
    cusDateEnd = '';
    DateStart = '';
    DateEnd= '';
    dflag = false;
    custList = {};
    today = new Date()
    lastWeek = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)
    constructor(props) {
        super(props);
        this.csvLink = React.createRef();
        let self = this
        let columnDefDict = {
            'Defects' : {
                headerName: "Defects", field: "Defects", sortable: true, filter: true,
                width: '250',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: function(params) {
                    let keyData = params.data.Total;
                    let defect = params.data.Defects;
                    let cusKeys = Object.keys(self.custList)
                    let label = `"Customer", "eap3.0-customer-bug", `;
                    if(cusKeys.length == 0){
                        label = `"Customer", "eap3.0-customer-bug"`;
                    }
                    else{
                        for(let i = 0; i < cusKeys.length - 1; i++){
                            label = label + `"customer-${cusKeys[i]}", `;
                        }
                        label = label + `"customer-${cusKeys[cusKeys.length -1]}"`;
                    }
                    label = encodeURIComponent(label);
                    if(defect == "New Defects"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20labels%20in%20(Customer)%20AND%20createdDate%20%3E%3D%20${self.cusDateStart}%20AND%20createdDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20labels%20in%20(${label})%20AND%20createdDate%20%3E%3D%20${self.cusDateStart}%20AND%20createdDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(defect == "Defects Closed"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20labels%20in%20(Customer)%20AND%20updatedDate%20%3E%3D%20${self.cusDateStart}%20AND%20updatedDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20labels%20in%20(${label})%20AND%20updatedDate%20%3E%3D%20${self.cusDateStart}%20AND%20updatedDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else {
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Resolved%2C%20%22IN%20QA%22)%20AND%20labels%20in%20(Customer)%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Resolved%2C%20%22IN%20QA%22)%20AND%20labels%20in%20(${label})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                },
            },
        }
        let cusColumnDefDict = {
            'Defects' : {
                headerName: "Defects", field: "Defects", sortable: true, filter: true,
                width: '250',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: function(params) {
                    let keyData = params.data.Total;
                    let defect = params.data.Defects;
                    if(defect == "New Defects"){
                        let newLink = `<a href=  https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20createdDate%20%3E%3D%20${self.cusDateStart}%20AND%20createdDate%20%3C%3D%20${self.cusDateEnd}%20AND%20priority%20in%20(Highest)%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(defect == "Defects Closed"){
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20priority%20in%20(Highest)%20AND%20updatedDate%20%3E%3D%20${self.cusDateStart}%20AND%20updatedDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else {
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Resolved%2C%20%22IN%20QA%22)%20AND%20priority%20in%20(Highest)%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                },
            },
        }
        let proColumnDefDict = {
            'Defects' : {
                headerName: "Defects", field: "Defects", sortable: true, filter: true,
                width: '250',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: function(params) {
                    let keyData = params.data.Total;
                    let defect = params.data.Defects;
                    if(defect == "New Defects"){
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20createdDate%20%3E%3D%20${self.cusDateStart}%20AND%20createdDate%20%3C%3D%20${self.cusDateEnd}%20%20AND%20priority%20not%20in%20(Highest)%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(defect == "Defects Closed"){
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Closed)%20AND%20priority%20not%20in%20(Highest)%20AND%20updatedDate%20%3E%3D%20${self.cusDateStart}%20AND%20updatedDate%20%3C%3D%20${self.cusDateEnd}%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else {
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(DWS%2C%20SPEK)%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(Resolved%2C%20%22IN%20QA%22)%20AND%20priority%20not%20in%20(Highest)%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                },
            },
        }
        this.state = {
            selectedRows: 0,
            custSelectedRows: 0,
            proSelectedRows: 0,
            sevstr: '',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',

            columnDefs: [
                columnDefDict['Defects'],
                columnDefDict['Total'],
            ],
            cusColumnDefs: [
                cusColumnDefDict['Defects'],
                cusColumnDefDict['Total'],
            ],
            proColumnDefs: [
                proColumnDefDict['Defects'],
                proColumnDefDict['Total'],
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
        this.today.setDate(this.today.getDate());
        this.today = this.today.toISOString().split("T")[0];
        this.lastWeek.setDate(this.lastWeek.getDate());
        this.lastWeek = this.lastWeek.toISOString().split("T")[0];
        this.cusDateStart = this.lastWeek;
        this.cusDateEnd = this.today;
    }
    popoverToggle2CR = () => this.setState({ popoverOpen2CR: !this.state.popoverOpen2CR });
    popoverToggle1CR = () => this.setState({ popoverOpen1CR: !this.state.popoverOpen1CR });
    popoverToggle1 = () => this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    popoverToggle2 = () => this.setState({ popoverOpen2: !this.state.popoverOpen2 });
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
    onCustSelectionChanged = (event) => {
        this.setState({ custSelectedRows: event.api.getSelectedRows().length })
    }
    onProSelectionChanged = (event) => {
        this.setState({ proSelectedRows: event.api.getSelectedRows().length })
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onCustGridReady = params => {
        this.custGridApi = params.api;
        this.custGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onProGridReady = params => {
        this.proGridApi = params.api;
        this.proGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    cusgridOperations(enable) {
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
    getTcs(sdate, edate, callPDefect) {
        this.state.disableShowButton = true;
        this.cusgridOperations(false);
        let promises1 = [];
        this.allTCsToShow = [];
        this.allClosedDefectsToShow = [];
        this.allPendingDefectsToShow = [];
        axios.get(`/rest/NewDefectsCount`,{params: {"sdate": sdate,"edate": edate,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises1.push(axios.get(`/rest/NewDefects`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                    }
                }).then(all => {
                    this.allTCsToShow = [...this.allTCsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cusgridOperations(true);
                }))
            }
            Promise.all(promises1).then(result => {
                this.getClosedDefects(sdate, edate, callPDefect)
                })
        }).catch(err => {
            //this.cusgridOperations(true);
        })
    }
    getClosedDefects(sdate, edate, callPDefect){
        let promises2 = []
        axios.get(`/rest/ClosedDefectsCount`,{params: {"sdate": sdate,"edate": edate,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises2.push(axios.get(`/rest/ClosedDefects`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                    }
                }).then(all => {
                    this.allClosedDefectsToShow = [...this.allClosedDefectsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cgridOperations(true);
                }))
            }
            Promise.all(promises2).then(result => {
                if(callPDefect == true){
                    this.getPendingDefects(callPDefect);
                }
                else{
                    this.getDefectsToShow(callPDefect);
                }
        })
        }).catch(err => {
            //this.cgridOperations(true);
        })
    }
    getPendingDefects(callPDefect){
        let promises3 = []
        axios.get(`/rest/PendingDefectsCount`).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises3.push(axios.get(`/rest/PendingDefects`,{
                    params: {
                        "startAt": i,
                    }
                }).then(all => {
                    this.allPendingDefectsToShow = [...this.allPendingDefectsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.pgridOperations(true);
                }))
            }
            Promise.all(promises3).then(result => {
                this.getDefectsToShow(callPDefect);
                })
        }).catch(err => {
            //this.pgridOperations(true);
        })
    }
    getDefectsToShow(callPDefect){
        let custDefectCount = {"New Defects": 0, "Defects Closed": 0, "Defects Pending Verification by SDET": 0};
        let pendingMDefectCount = {"New Defects": 0, "Defects Closed": 0, "Defects Pending Verification by SDET": 0};
        let pendingPDefectCount = {"New Defects": 0, "Defects Closed": 0, "Defects Pending Verification by SDET": 0};
        if(callPDefect == false) {
            custDefectCount["Defects Pending Verification by SDET"] = this.TicketsBySeverity[2]["Total"]
            pendingMDefectCount["Defects Pending Verification by SDET"] = this.TicketsByCustomer[2]["Total"]
            pendingPDefectCount["Defects Pending Verification by SDET"] = this.TicketsByProduct[2]["Total"]
        }
        this.TicketsBySeverity = [];
        this.TicketsByCustomer = [];
        this.TicketsByProduct = [];
        for(let i = 0; i < this.allTCsToShow.length; i++){
            let increaseCusDCount = true
            this.allTCsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        custDefectCount["New Defects"] = custDefectCount["New Defects"] + 1
                        increaseCusDCount = false
                    }
                    let cusName = label.split("-")
                    if(cusName.length > 1) {
                        if(!(this.custList[cusName[1]]))
                        this.custList[cusName[1]] = true
                        return true;
                    }
                }
            })
            if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                pendingMDefectCount["New Defects"] = pendingMDefectCount["New Defects"] + 1
            }
            else if(this.allTCsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                pendingPDefectCount["New Defects"] = pendingPDefectCount["New Defects"] + 1
            }
        }
        for(let i = 0; i < this.allClosedDefectsToShow.length; i++){
            let increaseCusDCount = true
            this.allClosedDefectsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        custDefectCount["Defects Closed"] = custDefectCount["Defects Closed"] + 1
                        increaseCusDCount = false
                    }
                    let cusName = label.split("-")
                    if(cusName.length > 1) {
                        if(!(this.custList[cusName[1]]))
                        this.custList[cusName[1]] = true
                        return true;
                    }
                }
            })
            if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                pendingMDefectCount["Defects Closed"] = pendingMDefectCount["Defects Closed"] + 1
            }
            else if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                pendingPDefectCount["Defects Closed"] = pendingPDefectCount["Defects Closed"] + 1
            }
        }
        for(let i = 0; i < this.allPendingDefectsToShow.length; i++){
            let increaseCusDCount = true
            this.allPendingDefectsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        custDefectCount["Defects Pending Verification by SDET"] = custDefectCount["Defects Pending Verification by SDET"] + 1
                        increaseCusDCount = false
                    }
                    let cusName = label.split("-")
                    if(cusName.length > 1) {
                        if(!(this.custList[cusName[1]]))
                        this.custList[cusName[1]] = true
                        return true;
                    }
                }
            })
            if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                pendingMDefectCount["Defects Pending Verification by SDET"] = pendingMDefectCount["Defects Pending Verification by SDET"] + 1
            }
            else if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                pendingPDefectCount["Defects Pending Verification by SDET"] = pendingPDefectCount["Defects Pending Verification by SDET"] + 1
            }
        }
        Object.keys(custDefectCount).forEach(key => {
            this.TicketsBySeverity.push({Defects: key, Total: custDefectCount[key]})
        });
        Object.keys(pendingMDefectCount).forEach(key => {
            this.TicketsByCustomer.push({Defects: key, Total: pendingMDefectCount[key]})
        });
        Object.keys(pendingPDefectCount).forEach(key => {
            this.TicketsByProduct.push({Defects: key, Total: pendingPDefectCount[key]})
        });
        this.cusgridOperations(true);
    }
getData(){
    let temp = ''
    if(this.gridApi){
        temp = temp + "Customer-Weekly-JIRA-Report\n" + this.gridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.custGridApi){
        temp = temp + "SEV_P1_Weekly-JIRA-Report\n" + this.custGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.proGridApi){
        temp = temp + "SEV_P2+_Weekly-JIRA-Report\n" + this.proGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    this.setState({sevstr: temp}, () => {
        setTimeout(() => {
            this.csvLink.current.link.click();
        });
    })
}
cusStartDate = (startDate) =>{
    this.cusDateStart = startDate['StartDate']
        this.setState({
            cusStartDate : this.cusDateStart
        })
}
cusEndDate = (endDate) =>{
    this.cusDateEnd = endDate['EndDate']
    if(!this.state.cusStartDate){
        this.state.cusStartDate = this.cusDateStart
    }
    this.setState({
        cusEndDate : this.cusDateEnd
    }, () => {
        this.setState({disableShowButton : false})
    })
}
    render() {
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {
                this.gridApi.showLoadingOverlay();
            } else if (this.TicketsBySeverity.length === 0) {
                this.gridApi.showNoRowsOverlay();
            } else {
                this.gridApi.hideOverlay();
            }
        }
        if (this.custGridApi) {
            if (this.state.isApiUnderProgress) {
                this.custGridApi.showLoadingOverlay();
            } else if (this.TicketsByCustomer.length === 0) {
                this.custGridApi.showNoRowsOverlay();
            } else {
                this.custGridApi.hideOverlay();
            }
        }
        if (this.proGridApi) {
            if (this.state.isApiUnderProgress) {
                this.proGridApi.showLoadingOverlay();
            } else if (this.TicketsByProduct.length === 0) {
                this.proGridApi.showNoRowsOverlay();
            } else {
                this.proGridApi.hideOverlay();
            }
        }
        let CUSDATE1 = this.cusDateStart;
        let CUSDATE2 = this.cusDateEnd;
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                    <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = []; this.allClosedDefectsToShow = []; this.allPendingDefectsToShow = []; this.cusDateStart = this.lastWeek; this.cusDateEnd = this.today; this.getTcs(this.cusDateEnd, this.cusDateStart, true); /*this.getClosedBug(this.DateStart, this.DateEnd, null); this.getPendingBug(this.DateStart, this.DateEnd, null);*/}})}}>
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
                                            <span className='rp-app-table-title'>Weekly JIRA Activity</span>
                                            <br></br>
                                            <br></br>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div class="row">
                                <div class="col-md-3">
                                        From Date<Input disabled={this.state.isApiUnderProgress} type="date" id="cusStartDate" value={CUSDATE1} onChange={(e) => this.cusStartDate({ StartDate: e.target.value })} ></Input>
                                </div>
                                <div class="col-md-3">
                                        To Date<Input  disabled={this.state.isApiUnderProgress} type="date" id="cusEndDate" value={CUSDATE2} onChange={(e) => this.cusEndDate({ EndDate: e.target.value })} />
                                </div>
                                <div class="col-md-3" style={{marginTop: '1rem'}}>
                                        <Button disabled={ this.state.disableShowButton } size="md" className="rp-rb-save-btn" onClick={(e) => {this.allTCsToShow = []; this.allClosedDefectsToShow = []; this.allPendingDefectsToShow = []; this.getTcs(this.state.cusEndDate, this.state.cusStartDate, false);}} >
                                            Show
                                        </Button>
                                </div>
                                <div class="col-md-3" style={{marginTop: '1rem'}}>
                                <CSVLink style={{ textDecoration: 'none' }} data={this.state.sevstr} ref={this.csvLink} filename={'Weekly_JIRA_Report.csv'} target="_blank"/>
                                        <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={(e) => {this.getData()}} >
                                            Download All
                                        </Button>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '10rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Customer</span>
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
                                                rowData={this.TicketsBySeverity}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                //rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsBySeverity.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>SEV P1</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="custGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onCustSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.cusColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsByCustomer}
                                                onGridReady={(params) => this.onCustGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                //rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsByCustomer.length}</span>
                                                </div>
                                            }
                                        </div>
                                </div>
                            </div >
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>SEV P2+</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="proGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onProSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.proColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsByProduct}
                                                onGridReady={(params) => this.onProGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                //rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsByProduct.length}</span>
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
export default (NewClosedInQaTickets);