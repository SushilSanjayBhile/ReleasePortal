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
//import  CheckBox  from '../TestCasesAll/CheckBox';

class CustomerBugs extends Component {
    pageNumber = 0;
    startAt = 0;
    isApiUnderProgress = false;
    allTCsToShow = [];
    ApplicableTcs = [];
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
                headerCheckboxSelection: (params) => {
                  if (this.gridApi) {
                      this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                  }
                  return true;
                },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "BugNo", field: "BugNo", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                editable: false,
                width: '130',
                cellRenderer: function(params) {
                    let keyData = params.data.BugNo;
                    let newLink = `<a href= https://diamanti.atlassian.net/browse/${keyData} target= "_blank">${keyData}</a>`;
                    return newLink;
                },
            },
            'BU' : {
                headerName: "BU", field: "BU", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '60',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Summary': {
                headerName: "Summary", field: "Summary", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Severity' : {
                headerName: "Severity", field: "Severity", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '50',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Customer' :  {
                headerName: "Customer", field: "Customer", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '100',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'QAName' : {
                headerName: "QAName", field: "QAName", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'ReportedBy' : {
                headerName: "ReportedBy", field: "ReportedBy", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Developer' : {
                headerName: "Assigned To", field: "Developer", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Manager' :  {
                headerName: "Manager", field: "Manager", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ReportedDate' : {
                headerName: "ReportedDate", field: "ReportedDate", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenDays' : {
                headerName: "OpenDays", field: "OpenDays", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '80',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ETA' : {
                headerName: "ETA", field: "ETA", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'QAValidatedDate' : {
                headerName: "QAValidatedDate", field: "QAValidatedDate", sortable: true, filter: true, //cellStyle: this.renderEditedCell,
                width: '100',
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
            // tableColumns: [
            //     {id: 1, value: "BugNo", isChecked: false},
            //     {id: 2, value: "BU", isChecked: false},
            //     {id: 3, value: "Summary", isChecked: false},
            //     {id: 4, value: "Severity", isChecked: false},
            //     {id: 5, value: "Customer", isChecked: false},
            //     {id: 6, value: "QAName", isChecked: false},
            //     {id: 7, value: "ReportedBy", isChecked: false},
            //     {id: 8, value: "Developer", isChecked: false},
            //     {id: 9, value: "Manager", isChecked: false},
            //     {id: 10, value: "ReportedDate", isChecked: false},
            //     {id: 11, value: "OpenDays", isChecked: false},
            //     {id: 12, value: "ETA", isChecked: false},
            //     {id: 13, value: "QAValidatedDate", isChecked: false},
            //   ],
            columnDefs: [
                columnDefDict['BugNo'],
                columnDefDict['Customer'],
                columnDefDict['Summary'],
                columnDefDict['BU'],
                columnDefDict['Severity'],
                columnDefDict['Developer'],
                columnDefDict['Manager'],
                columnDefDict['ReportedDate'],
                columnDefDict['ETA'],
                columnDefDict['OpenDays'],
                columnDefDict['ReportedBy'],
                columnDefDict['QAName'],
                columnDefDict['QAValidatedDate'],
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
    //column based filter functions
    // handleAllChecked = (event) => {
    //     let tableColumns = this.state.tableColumns
    //     tableColumns.forEach(columnName => columnName.isChecked = event.target.checked) 
    //     this.setState({tableColumns: tableColumns})

    // }

    // handleCheckChieldElement = (event) => {
    //     let tableColumns = this.state.tableColumns
    //     tableColumns.forEach(columnName => {
    //         if (columnName.value === event.target.value)
    //             columnName.isChecked =  event.target.checked
    //     })
    //     this.setState({tableColumns: tableColumns})
    // }

    //setSelectedColumns = () => {
        // let columnDefDict1 = {
        //     'BugNo' : {
        //       headerCheckboxSelection: (params) => {
        //           if (this.gridApi) {
        //               this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
        //           }
        //           return true;
        //       },
        //       headerCheckboxSelectionFilteredOnly: true,
        //       checkboxSelection: true,
        //       headerName: "BugNo", field: "BugNo", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //       editable: false,
        //       width: '130',
        //       cellRenderer: function(params) {
        //           let keyData = params.data.BugNo;
        //           let newLink = `<a href= https://diamanti.atlassian.net/browse/${keyData} target= "_blank">${keyData}</a>`;
        //           return newLink;
        //         },
        //     },
        //     'BU' : {
        //         headerName: "BU", field: "BU", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //         width: '60',
        //         editable: false,
        //         cellClass: 'cell-wrap-text',
        //     },
        //   'Summary': {
        //       headerName: "Summary", field: "Summary", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //       width: '250',
        //       editable: false,
        //       cellClass: 'cell-wrap-text',
        //   },
        //   'Severity' :  {
        //       headerName: "Severity", field: "Severity", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '50',
        //       cellClass: 'cell-wrap-text',
        //       editable: false,
        //   },
        //   'Customer' : {
        //       headerName: "Customer", field: "Customer", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100', 
        //       cellClass: 'cell-wrap-text',
        //       editable: false,
        //   },
        //   'QAName' : {
        //     headerName: "QAName", field: "QAName", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //     width: '90',
        //     editable: false,
        //     cellClass: 'cell-wrap-text',
        //   },
        //   'ReportedBy' : {
        //       headerName: "ReportedBy", field: "ReportedBy", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //       width: '90',
        //       editable: false,
        //       cellClass: 'cell-wrap-text',
        //   },
        //   'Developer' : {
        //       headerName: "Developer", field: "Developer", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //       width: '90',
        //       editable: false,
        //       cellClass: 'cell-wrap-text',
        //   },
        //   'Manager' : {
        //       headerName: "Manager", field: "Manager", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //       width: '90',
        //       editable: false,
        //       cellClass: 'cell-wrap-text',
        //   },
        //   'ReportedDate' : {
        //     headerName: "ReportedDate", field: "ReportedDate", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //     width: '100',
        //     editable: false,
        //     cellClass: 'cell-wrap-text',
        // },
        // 'OpenDays' : {
        //     headerName: "OpenDays", field: "OpenDays", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //     width: '80',
        //     editable: false,
        //     cellClass: 'cell-wrap-text',
        // },
        // 'ETA' : {
        //     headerName: "ETA", field: "ETA", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //     width: '100',
        //     editable: false,
        //     cellClass: 'cell-wrap-text',
        // },
        // 'QAValidatedDate' : {
        //     headerName: "QAValidatedDate", field: "QAValidatedDate", sortable: true, filter: true, cellStyle: this.renderEditedCell,
        //     width: '100',
        //     editable: false,
        //     cellClass: 'cell-wrap-text',
        // },
        // }
        // let tableColumns = this.state.tableColumns;
        // let selectedColumns = []
        // tableColumns.forEach(columnName => {
        //     if (columnName.isChecked == true){
        //         selectedColumns.push(columnDefDict1[columnName.value])
        //     }
        // })

    //     this.setState({columnDefs:selectedColumns});
    //     this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    // }
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
        this.ApplicableTcs = []
        setTimeout(() => this.getTcs(this.DateStart, this.DateEnd, this.startAt), 400);
    }
    getTcs(startDate, endDate, startAt) {
        this.gridOperations(false);
        let tomorrow = new Date(endDate)
        tomorrow.setDate(tomorrow.getDate()+1)
        tomorrow = tomorrow.toISOString().split("T")[0]
        axios.get(`/rest/CustomerBugDatewise`,{
            params: {
                "sdate": startDate,
                "edate": tomorrow,
                "startAt": startAt,
            }
        }).then(all => {
            this.maxResult = all.data.total
            this.allTCsToShow = all.data.issues;
            this.getTcsToShow()
        }).catch(err => {
            this.gridOperations(true);
        })
    }
    getTcsToShow(){
        this.ApplicableTcs = []
        let severity = {"Highest":"P1","High":"P2","Medium":"P3"}
        let today = new Date()
        today.setDate(today.getDate())
        today = today.toISOString().split("T")[0]
        const MS_PER_DAY = 1000 * 60 * 60 * 24
        for(let i = 0; i < this.allTCsToShow.length; i++){
            let temp = {
                BugNo: this.allTCsToShow[i].key,
                ReportedBy: "QA",
                BU: "NA",
                Manager: "NA",
                Customer: "NA",
                Severity: "P4",
                Summary: this.allTCsToShow[i]["fields"]["summary"],
                Severity: severity[this.allTCsToShow[i]["fields"]["priority"]["name"]],
                QAName: this.allTCsToShow[i]["fields"]["creator"]["displayName"],
                Developer: this.allTCsToShow[i]["fields"]["assignee"]["displayName"],
                OpenDays: "0",
                ETA: today,
                ReportedDate: this.allTCsToShow[i]["fields"]["created"].split("T")[0],
                QAValidatedDate: "NA",
            }
            this.allTCsToShow[i]["fields"]["labels"].forEach(label => {
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
                    temp.BU = "Ultima-Software"
                    temp.Manager = "Abhay Singh"
                }
                else if(loLabel.includes("ultima")) {
                    temp.BU = "Ultima"
                    temp.Manager = "Naveen Seth"
                }
                else if(loLabel.includes("spektra")) {
                    temp.BU = "Spektra"
                    temp.Manager = "Kshitij Gunjikar"
                }
            })
            if(this.allTCsToShow[i]["fields"]["duedate"]) {
                temp.ETA = this.allTCsToShow[i]["fields"]["duedate"].split("T")[0]
            }
            if(this.allTCsToShow[i]["fields"]["status"]["name"] === "Closed") {
                let date1 = this.allTCsToShow[i]["fields"]["statuscategorychangedate"]
                let date2 = this.allTCsToShow[i]["fields"]["created"]
                temp.QAValidatedDate = this.allTCsToShow[i]["fields"]["statuscategorychangedate"].split("T")[0]
                let diff = new Date(date1).getTime() - new Date(date2).getTime()
                let res = Math.round(diff / MS_PER_DAY)
                temp.OpenDays = res.toString()
                temp.ETA = temp.QAValidatedDate
                if(temp.OpenDays === "0"){
                    temp.OpenDays = "1"
                }
            }
            if(temp.OpenDays === "0") {
                let date1 = new Date()
                let date2 = this.allTCsToShow[i]["fields"]["created"]
                let diff = date1.getTime() - new Date(date2).getTime()
                let res = Math.round(diff / MS_PER_DAY)
                temp.OpenDays = res.toString()
                if(temp.OpenDays === "0"){
                    temp.OpenDays = "1"
                }
            }
            this.ApplicableTcs.push(temp)
        }
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
                                            <span className='rp-app-table-title'>JIRA REPORT</span>
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
                                            {/* <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button id="PopoverAssign1" type="button"><i class="fa fa-columns" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign1" id="PopoverAssignButton1" toggle={() => this.popoverToggle1()} isOpen={this.state.popoverOpen1}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
                                                                <ul>
                                                                {
                                                                this.state.tableColumns.map((columnName) => {
                                                                    return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElement}  {...columnName} />)
                                                                })
                                                                }
                                                                </ul>
                                                            <Button onClick={() => this.setSelectedColumns()}>Change Column View</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div> */}
                                            <div style={{ width: '5rem', marginLeft: '1rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} title="Only selected TCS will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApi) {
                                                        let selected = this.gridApi.getSelectedRows().length;
                                                        if (!selected) {
                                                            alert('Only selected TCs will be downloaded');
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.ApplicableTcs.length}/{this.maxResult} (Use Next or Previous Button)</span>
                                                </div>
                                            }
                                            <div style={{
                                                float: 'right', display: this.state.isApiUnderProgress
                                                }}>
                                                <Button onClick={() => this.paginate(-1)}>Previous</Button>
                                                <span  >{`   Page: ${this.pageNumber}   `}</span>

                                                <Button onClick={() => this.paginate(1)}>Next</Button>

                                            </div>
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
export default (CustomerBugs);