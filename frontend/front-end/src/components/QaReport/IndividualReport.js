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
class IndividualReport extends Component {
    isApiUnderProgress = false;
    ApplicableTcs = [];
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
    dayInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
    DateStart = '';
    DateEnd= '';
    constructor(props) {
        super(props);
        let columnDefDict = {
            'Name' : {
                headerCheckboxSelection: (params) => {
                  if (this.gridApi) {
                      this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                  }
                  return true;
                },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "Name", field: "Name", sortable: true, filter: true,
                editable: false,
                width: '500',
            },
            'Executed' : {
                headerName: "TCs Executed", field: "Executed", sortable: true, filter: true,
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
            },
        }

        this.state = {
            selectedRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            startDate: null,
            endDate: null,
            tcOpen: false,

            columnDefs: [
                columnDefDict['Name'],
                columnDefDict['Executed'],
                columnDefDict['Automated'],
                columnDefDict['Filed'],
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
        setTimeout(() => this.getTcs(this.DateStart, this.DateEnd), 400);
    }
    getTcs(startDate, endDate) {
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
            axios.get(`/api/userinfo`).then(res => {
                res.data.forEach(user => {
                    if ((user["role"] === "QA" || user["role"] === "ADMIN") && user["email"] !== "sshukla@diamanti.com" && user["email"] !== "sshende@diamanti.com" && user["email"] !== "sushil@diamanti.com" && user["email"] !== "rahul@diamanti.com") {
                        QAs[user["email"]] ? list.push({email: user["email"],Name:user["name"], Executed: QAs[user["email"]].exec, Automated: QAs[user["email"]].auto, Filed: 0}) :
                        list.push({email: user["email"],Name:user["name"], Executed:0, Automated:0, Filed: 0});
                    }
                })
                list.forEach(user => {
                    promises.push(axios.get(`/rest/bugsByQA`,{
                        params: {
                            "sdate": startDate,
                            "edate": endDate,
                            "qaMail": user["email"], 
                            "startAt": this.startAt,
                        }}).then(resp => {
                            user["Filed"] = resp.data.total
                        })
                    );
                })
                Promise.all(promises).then(result => {
                    this.ApplicableTcs = list;this.gridOperations(true);
                    })
            })
        }).catch(err => {
            this.gridOperations(true);
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
            this.getTcs(this.state.startDate, this.state.endDate);
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
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ tcOpen: !this.state.tcOpen })}>
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
                                            <span className='rp-app-table-title'>INDIVIDUAL REPORT</span>
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
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="StartDate" value={DATE1} onChange={(e) => this.startDate({ StartDate: e.target.value })} ></Input>
                                            </div>
                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="EndDate" value={DATE2} onChange={(e) => this.endDate({ EndDate: e.target.value })} />
                                            </div>
                                            <div style={{ width: '5rem', marginLeft: '1rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} title="Only selected records will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApi) {
                                                        let selected = this.gridApi.getSelectedRows().length;
                                                        if (!selected) {
                                                            alert('Only selected records will be downloaded');
                                                            return
                                                        }
                                                        this.gridApi.exportDataAsCsv({ allColumns: true, onlySelected: true });
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