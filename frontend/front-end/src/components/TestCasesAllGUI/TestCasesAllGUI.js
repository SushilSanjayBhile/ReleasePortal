// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to

// TODO: list descending order: CUrretnStatus and statuslist
// ExpectedBehaviour and Steps not updating
//  Working Status: Deleted, and others
// User list from backend
// 73/deepak/deploy/crd
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { getCurrentRelease, getTCForStrategy } from '../../reducers/release.reducer';
import { saveSingleTestCase, saveTestCase, updateTCEdit, saveReleaseBasicInfo } from '../../actions';
import {Col,Row, Button,UncontrolledPopover, PopoverBody,Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './TestCasesAllGUI.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import MoodEditor from "./moodEditor";
import MoodRenderer from "./moodRenderer";
import NumericEditor from "./numericEditor";
import SelectionEditor from './selectionEditor';
import { getDatePicker } from './datepicker';
import DatePickerEditor from './datePickerEditor';
import EditTCGUI from '../../views/Release/ReleaseTestMetricsGUI/EditTCGUI';
import { roles, ws, tcTypes } from '../../constants';
import TcSummaryGUI from './TcSummaryGUI';
import  CheckBox  from '../TestCasesAll/CheckBox';


// import { data, domains, subDomains } from './constants';
// "Description": "Enable helm", "ExpectedBehaviour": "dctl feature list should display helm as enabled", "Notes": "NOTES NOT PROVIDED"
class TestCasesAllGUI extends Component {
    cntr = 0;
    pageNumber = 0;
    rows = 15;
    editedRows = {};
    isApiUnderProgress = false;
    isAnyChanged = false;
    isBlockedOrFailed = false;
    allTCsToShow = [];
    tcHolder = [];
    ApplicableTcs = [];
    platformList = [];
    constructor(props) {
        super(props);
        let columnDefDict = {
            'TcID' : {
              headerCheckboxSelection: (params) => {
                  if (this.gridApi) {
                      this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                  }
                  return true;
              },
              headerCheckboxSelectionFilteredOnly: true,
              checkboxSelection: true,
              headerName: "TcID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              editable: false,
              width: 180
          },
          'Scenario' : {
              headerName: "Scenario", field: "Scenario", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          
          'Description': {
              headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '520',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
        //   'CardType' : {
        //       headerName: "CardType", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
        //       cellEditor: 'selectionEditor',
        //       cellClass: 'cell-wrap-text',
        //       cellEditorParams: {
        //           values: ['BOS', 'NYNJ', 'COMMON'],
        //           multiple: true
        //       }
        //   },
        'CardType' : {
            headerName: "Platform", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '200',
      
            //cellEditor: 'selectionEditor',
            cellClass: 'cell-wrap-text',
            editable: false,
            // cellEditorParams: {
            //     values: ['BOS', 'NYNJ', 'COMMON'],
            //     multiple: true
            // }
          },
          'Build' :  {
              headerName: "Build", field: "CurrentStatus.Build", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
              cellEditor: 'selectionEditor',
              cellClass: 'cell-wrap-text',
              cellEditorParams: {
                  values: ['BOS', 'NYNJ', 'COMMON'],
                  multiple: true
              }
          },
          
          'Status' : {
              headerName: "Status", field: "CurrentStatus.Result", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
              cellEditor: 'selectionEditor',
              cellClass: 'cell-wrap-text',
              cellEditorParams: {
                  values: ['COMPLETED', 'NOT_COMPLETED']
              }
          },
          'Bug' : {
              headerName: "Bug", field: "CurrentStatus.Bugs", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text'
          },
          'OS' : {
            headerName: "OS", field: "OS", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            width: '80',
            editable: false,
            cellClass: 'cell-wrap-text',
        },
          'Priority' :  {
              headerName: "Priority", field: "Priority", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100', cellClass: 'cell-wrap-text',
          }, 
          'Assignee' : {
              headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text',
        
              cellEditor: 'selectionEditor',
              cellEditorParams: {
                  values: this.props.users.map(item => item.name)
              }
          },
          'WorkingStatus' : {
              headerName: "WorkingStatus", field: "WorkingStatus", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text',
          },
          'TcName' : {
              headerName: "TcName", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
          },
          'Domain' : {
              headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'SubDomain' : {
              headerName: "SubDomain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'Steps' : { 
              headerName: "Steps", field: "Steps", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'Notes' : { 
                headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'applicable' : {
                headerName: "applicable", field: "applicable", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            // 'Platform' : {
            //     headerName: "Platform", field: "Platform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            //     width: '180',
            //     editable: false,
            //     cellClass: 'cell-wrap-text',
            // },
            'ExpectedBehaviour' : {
                headerName: "ExpectedBehaviour", field: "ExpectedBehaviour", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }
        this.state = {
            updateCounter: 1,
            selectedRows: 0,
            totalRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table or Tc is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
            rowSelect: false,
            isEditing: false,
            delete: false,
            displayPlatforms : [],

            tableColumnsTcs: [
                {id: 1, value: "Show Skip", isChecked: false},
                {id: 2, value: "Show Not Applicable", isChecked: false},
                {id: 3, value: "Applicable", isChecked: true},
            ],

            applicableTCForStatus:[],
            statusColumn:[
                {id:1,value:'Pass', isChecked: false},
                {id:2,value:'Fail', isChecked: false},
                {id:3,value:'Block', isChecked: false},
                {id:4,value:'Not Tested', isChecked: false},
            ],
            tableColumns: [
                {id: 1, value: "TcID", isChecked: false},
                {id: 2, value: "Scenario", isChecked: false},
                {id: 3, value: "Description", isChecked: false},
                {id: 4, value: "Platform", isChecked: false},
                {id: 5, value: "Build", isChecked: false},
                {id: 6, value: "Status", isChecked: false},
                {id: 7, value: "Bug", isChecked: false},
                {id: 8, value: "Priority", isChecked: false},
                {id: 9, value: "Assignee", isChecked: false},
                {id: 10, value: "WorkingStatus", isChecked: false},
                {id: 11, value: "TcName", isChecked: false},
                {id: 12, value: "Domain", isChecked: false},
                {id: 13, value: "SubDomain", isChecked: false},
                {id: 14, value: "Steps", isChecked: false},
                {id: 15, value: "OS", isChecked: false},
                {id: 16, value: "applicable", isChecked: false},
                //{id: 17, value: "Platform", isChecked: false},
                {id: 18, value: "ExpectedBehaviour", isChecked: false},

              ],
              
            columnDefs: [
                columnDefDict['TcID'],
                columnDefDict['CardType'],
                columnDefDict['Scenario'],
                columnDefDict['Description'],
                columnDefDict['Steps'],
                columnDefDict['Status'],
                columnDefDict['Build'],
                columnDefDict['OS'],
                columnDefDict['Bug'],
                columnDefDict['Priority'],
                columnDefDict['Assignee'],
                columnDefDict['Notes'],
                //columnDefDict['Platform'],
                columnDefDict['ExpectedBehaviour'],
            ],
            
            defaultColDef: { resizable: true },

            e2eColumnDefs: [{
                // headerCheckboxSelection: true,
                checkboxSelection: true,
                headerName: "Build", field: "Build", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
            },
            {
                headerName: "Tested On", field: "TestedOn", sortable: true, filter: true, cellClass: 'cell-wrap-text',
            },
            {
                headerName: "Bugs", field: "Bugs", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
            },
            {
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            ],
            activityColumnDefs: [{
                headerName: "Date", field: "Timestamp", sortable: true, filter: true,
            },
            {
                headerName: "Log Data", field: "LogData", sortable: true, filter: true,
                autoHeight: true,
                width: 700,
                cellClass: 'cell-wrap-text'

            },
            {
                headerName: "User Name", field: "UserName", sortable: true, filter: true,
            },
            ],
            modules: AllCommunityModules,
            frameworkComponents: {
                moodRenderer: MoodRenderer,
                moodEditor: MoodEditor,
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },
        }
    }

    //Priority Based filter functions
    handleAllCheckedTCs = (event) => {
        let tableColumnsTcs = this.state.tableColumnsTcs
        tableColumnsTcs.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({tableColumnsTcs: tableColumnsTcs})
    }

    handleCheckChieldElementTcs = (event) => {
        let tableColumnsTcs = this.state.tableColumnsTcs
        tableColumnsTcs.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({tableColumnsTcs: tableColumnsTcs})
    }

    showSelectedTCs = () =>{
        if (!this.state.platform){
            this.getTcsToShow(this.props.selectedRelease.ReleaseNumber , true);
        }
        else{
            this.getTcsToShowMod(this.state.platform, this.state.domain, this.state.subDomain, this.state.Priority, this.props.selectedRelease.ReleaseNumber,true);
        }
        this.setState({ popoverOpen2: !this.state.popoverOpen2 });
    }


    //Status Based Filter functions
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

    //column based filter functions
    handleAllChecked = (event) => {
        let tableColumns = this.state.tableColumns
        tableColumns.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({tableColumns: tableColumns})
    }

    handleCheckChieldElement = (event) => {
        let tableColumns = this.state.tableColumns
        tableColumns.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({tableColumns: tableColumns})
    }

    setSelectedColumns = () => {

        let columnDefDict1 = {
            'TcID' : {
              headerCheckboxSelection: (params) => {
                  if (this.gridApi) {
                      this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                  }
                  return true;
              },
              headerCheckboxSelectionFilteredOnly: true,
              checkboxSelection: true,
              headerName: "TcID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              editable: false,
              width: 180
          },
          'Scenario' : {
              headerName: "Scenario", field: "Scenario", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          
          'Description': {
              headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '520',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
        //   'CardType' : {
        //       headerName: "CardType", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
        //       cellEditor: 'selectionEditor',
        //       cellClass: 'cell-wrap-text',
        //       cellEditorParams: {
        //           values: ['BOS', 'NYNJ', 'COMMON'],
        //           multiple: true
        //       }
          'CardType' : {
            headerName: "Platform", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '180',
      
            //cellEditor: 'selectionEditor',
            cellClass: 'cell-wrap-text',
            editable: false,
            // cellEditorParams: {
            //     values: ['BOS', 'NYNJ', 'COMMON'],
            //     multiple: true
            // }
          },
          'Build' :  {
              headerName: "Build", field: "CurrentStatus.Build", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
              cellEditor: 'selectionEditor',
              cellClass: 'cell-wrap-text',
              cellEditorParams: {
                  values: ['BOS', 'NYNJ', 'COMMON'],
                  multiple: true
              }
          },
          
          'Status' : {
              headerName: "Status", field: "CurrentStatus.Result", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
              cellEditor: 'selectionEditor',
              cellClass: 'cell-wrap-text',
              cellEditorParams: {
                  values: ['COMPLETED', 'NOT_COMPLETED']
              }
          },
          'OS' : {
            headerName: "OS", field: "OS", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            width: '80',
            editable: false,
            cellClass: 'cell-wrap-text',
        },
          'Bug' : {
              headerName: "Bug", field: "CurrentStatus.Bugs", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text'
          },
          'Priority' :  {
              headerName: "Priority", field: "Priority", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100', cellClass: 'cell-wrap-text',
          }, 
          'Assignee' : {
              headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text',
        
              cellEditor: 'selectionEditor',
              cellEditorParams: {
                  values: this.props.users.map(item => item.name)
              }
          },
          'WorkingStatus' : {
              headerName: "WorkingStatus", field: "WorkingStatus", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
              cellClass: 'cell-wrap-text',
          },
          'TcName' : {
              headerName: "TcName", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
          },
          'Domain' : {
              headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'SubDomain' : {
              headerName: "SubDomain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'Steps' : { 
              headerName: "Steps", field: "Steps", sortable: true, filter: true, cellStyle: this.renderEditedCell,
              width: '180',
              editable: false,
              cellClass: 'cell-wrap-text',
          },
          'Notes' : { 
                headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'applicable' : {
                headerName: "applicable", field: "applicable", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            // 'Platform' : {
            //     headerName: "Platform", field: "Platform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            //     width: '180',
            //     editable: false,
            //     cellClass: 'cell-wrap-text',
            // },
            'ExpectedBehaviour' : {
                headerName: "ExpectedBehaviour", field: "ExpectedBehaviour", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                width: '180',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }
        
        let tableColumns = this.state.tableColumns;
        let selectedColumns = []
        tableColumns.map(columnName => {
            if (columnName.value == "Platform"){
                columnName.value = "CardType"
            }
        })
        tableColumns.forEach(columnName => {
            if (columnName.isChecked == true){
                selectedColumns.push(columnDefDict1[columnName.value])
            }
        })

        this.setState({columnDefs:selectedColumns})
        this.setState({ popoverOpen1: !this.state.popoverOpen1 });
        tableColumns.map(columnName => {
            if (columnName.value == "CardType"){
                columnName.value = "Platform"
            }
        })

    }
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 2);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 28;
    }
    getActivityRowHeight = (params) => {
        if (params.data && params.data.LogData) {
            return 28 * (Math.floor(params.data.LogData.length / 60) + 1);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 28;
    }
    getTextAreaHeight = data => {
        if (data) {
            let rows = (Math.floor(data.length / 40) + 1);
            if (rows < 2) {
                return 2;
            } else {
                return rows;
            }
        }
        // assuming 50 characters per line, working how how many lines we need
        return 2;
    }
    toggleDelete = () => {
        this.setState({ delete: !this.state.delete })
    };
    toggleAll = () => {
        this.setState({ multipleChanges: !this.state.multipleChanges })
    };
    toggle = () => this.setState({ modal: !this.state.modal });
    popoverToggle = () => this.setState({ popoverOpen: !this.state.popoverOpen });
    popoverToggle1 = () => this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    popoverToggle2 = () => this.setState({ popoverOpen2: !this.state.popoverOpen2 });
    popoverToggle3 = () => this.setState({ popoverOpen3: !this.state.popoverOpen3 });
    confirmStatusDeleteToggle = () => this.setState({ deleteStatusModal: !this.state.deleteStatusModal });
    confirmToggle() {
        this.changeLog = {};
        this.changeLog = this.whichFieldsUpdated(this.props.tcDetails, this.props.testcaseEdit);
        this.toggle();
    }

    renderEditedCell = (params) => {
        let editedInRow = this.editedRows[`${params.data.TcID}_${params.data.CardType}`] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field].originalValue !== params.value;
        // let restored = this.editedRows[`${params.data.TcID}_${params.data.CardType}`] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field].originalValue === params.value;
        if (editedInRow) {
            this.editedRows[`${params.data.TcID}_${params.data.CardType}`].Changed = true;
            return {
                backgroundColor: 'rgb(209, 255, 82)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'rgb(255, 166, 0)'
            };
        }
        return { backgroundColor: '' };
    }
    onCellEditingStarted = params => {
        if (this.editedRows[`${params.data.TcID}_${params.data.CardType}`]) {
            if (this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field]) {
                this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] =
                    { ...this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field], oldValue: params.value }
            } else {
                this.editedRows[`${params.data.TcID}_${params.data.CardType}`] =
                    { ...this.editedRows[`${params.data.TcID}_${params.data.CardType}`], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        } else {
            this.editedRows[`${params.data.TcID}_${params.data.CardType}`] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
        }
    }
    onCellEditing = (params, field, value) => {
        if (this.editedRows[`${params.TcID}_${params.CardType}`]) {
            if (this.editedRows[`${params.TcID}_${params.CardType}`][field]) {
                this.editedRows[`${params.TcID}_${params.CardType}`][field] =
                    { ...this.editedRows[`${params.TcID}_${params.CardType}`][field], oldValue: params[field], newValue: value }
            } else {
                this.editedRows[`${params.TcID}_${params.CardType}`] =
                    { ...this.editedRows[`${params.TcID}_${params.CardType}`], [field]: { oldValue: params[field], originalValue: params[field], newValue: value } }
            }

        } else {
            this.editedRows[`${params.TcID}_${params.CardType}`] = {
                TcID: { oldValue: `${params.TcID}`, originalValue: `${params.TcID}`, newValue: `${params.TcID}` },
                CardType: { oldValue: `${params.CardType}`, originalValue: `${params.CardType}`, newValue: `${params.CardType}` },
                [field]: { oldValue: params[field], originalValue: params[field], newValue: value }
            }
        }
    }
   
    onRowSelected = (params) => {
        if (this.gridApi) {
            if (params.column && params.column.colId !== "TcID") {
                return false
            } else {
                return true
            }
        }
        return false;
    }
    paginate(index) {
        this.pageNumber += index;
        if (this.pageNumber < 0) {
            this.pageNumber = 0;
        }
        this.getTcs(true, this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain, this.state.priority);
    }
    onSelectionChanged = (event) => {
        this.setState({ selectedRows: event.api.getSelectedRows().length })
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onStatusGridReady = params => {
        this.statusGridApi = params.api;
        this.statusGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    }
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
        setTimeout(() => this.getTcs(true, this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain), 400);
        if (this.props.user &&
            (this.props.user.role === 'ADMIN' || this.props.user.role === 'QA' || this.props.user.role === 'DEV' ||
                this.props.user.role === 'ENGG')) {
            this.setState({ tcOpen: true })
        }
        axios.get('/api/userinfo/')
        .then(response=>{
            
        })
        .catch(err=>{
            console.log("error",err)
        })
    }
    componentWillReceiveProps(newProps) {
        if (this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.editedRows = {};
            this.isAnyChanged = false;
            this.isBlockedOrFailed = false;
            this.setState({
                rowSelect: false, CardType: '', platform: '',  domain: '', subDomain: '', Priority: '',
                isEditing: false
            })
            setTimeout(() => this.getTcs(true, null, null, null, null, null, null, newProps.selectedRelease.ReleaseNumber), 400);
        }
    }

    // FILTER
    onFilterTextBoxChanged(value) {
        this.setState({ rowSelect: false, filter: value });
        this.gridApi.setQuickFilter(value);
        this.resetRows();
    }
    onSelectPlatform(platform) {
        if (platform === '') {
            platform = null;
        } else {
            //this.getTcByPlatform(platform);
        }
        //this.getTcByPlatform(platform);

        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ platform: platform, domain: '', subDomain: ''});
        this.getTcs(false, this.state.CardType, platform, '', '', this.state.Priority);
    }

    // SELECTION BOX
    onSelectDomain(domain) {
        if (domain === '') {
            domain = null;
        } else {
            //this.getTcByDomain(domain);
        }
        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ domain: domain, subDomain: '' });
        //this.getTcs(this.state.CardType, this.state.platform, domain, '', this.state.Priority);
        this.getTcsToShowMod(this.state.platform, domain, '', this.state.Priority, this.props.selectedRelease.ReleaseNumber);
    }
    onSelectSubDomain(subDomain) {
        if (subDomain === '') {
            subDomain = null;
        }
        // let data = this.filterData({ Domain: this.state.domain, SubDomain: subDomain, CardType: this.state.CardType })
        this.setState({ subDomain: subDomain });
        //this.getTcs(this.state.CardType, this.state.platform, this.state.domain, subDomain, this.state.Priority);
        this.getTcsToShowMod(this.state.platform, this.state.domain, subDomain, this.state.Priority, this.props.selectedRelease.ReleaseNumber);
    }
    onSelectCardType(cardType) {
        if (cardType === '') {
            cardType = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ CardType: cardType });
        //this.getTcs(cardType, this.state.platform, this.state.domain, this.state.subDomain, this.state.Priority);
        this.getTcs(cardType, this.state.platform, this.state.domain, this.state.subDomain, this.state.Priority, this.props.selectedRelease.ReleaseNumber);
    }
    onSelectPriority(priority) {
        if (priority === '') {
            priority = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ Priority: priority });
        //this.getTcs(this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain, priority);
        this.getTcsToShowMod(this.state.platform, this.state.domain, this.state.subDomain, priority, this.props.selectedRelease.ReleaseNumber);
    }


    // // RELEASE
    // updateReleaseInfo() {
    //     axios.get(`/api/release/all`)
    //         .then(res => {
    //             res.data.forEach(item => {
    //                 this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
    //             });
    //         }, error => {
    //         });
    // }

    // 
     // // RELEASE
    updateReleaseInfo() {
        axios.get(`/api/release/` + this.props.selectedRelease.ReleaseNumber)
            .then(res => {
                this.props.saveReleaseBasicInfo({ id: res.ReleaseNumber, data: res });
            }, error => {
            });
    }

    // DELETE TC
    delete() {
        if (this.props.tcDetails.TcID) {
            axios.delete(`/api/${this.props.selectedRelease.ReleaseNumber}/wholeguitcinfo/id/${this.props.tcDetails.TcID}`)
                .then(data => {
                    this.getTcs(this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain);
                }, error => {
                    alert(`Error: ${error.message}`);
                })
        }
    }

    deleteStatus() {
        this.gridOperations(false);
        let selected = this.statusGridApi.getSelectedRows();
        if (selected && selected[0]) {
            let item = selected[0];
            axios.delete(`/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}/id/${item.TcID}/card/${item.CardType}`)
                .then(res => {
                    this.gridOperations(true);
                    this.onSuccessTcInfo(item);
                }, error => {
                    alert('failed to update tc')
                    this.gridOperations(true);
                });
        }
    }
    getTcName(name) {
        let tcName = name;
        if (!tcName || tcName === 'NOT AUTOMATED' || tcName === undefined || tcName === null) {
            tcName = 'TC NOT AUTOMATED';
        }
        return tcName;
    }
    // saveSingleTCStatus(data) {
    //     this.gridOperations(false);
    //     let status = {};
    //     status.Domain = this.props.tcDetails.Domain;
    //     status.SubDomain = this.props.tcDetails.SubDomain;
    //     status.Scenario = this.props.tcDetails.Scenario;
    //     status.TcName = this.getTcName(`${this.props.tcDetails.TcName}`);
    //     status.Build = this.props.testcaseEdit.Build;
    //     status.Result = this.props.testcaseEdit.CurrentStatus;
    //     status.CardType = this.props.tcDetails.CardType;
    //     status.TcID = this.props.tcDetails.TcID;
    //     // status.BrowserName = this.propsstatus.tcDetails.BrowserName;

    //     status.Activity = {
    //         Release: this.props.selectedRelease.ReleaseNumber,
    //         "TcID": this.props.tcDetails.TcID,
    //         "CardType": this.props.tcDetails.CardType,
    //         "UserName": this.props.user.email,
    //         "LogData": `Status Added: Build: ${this.props.testcaseEdit.Build}, Result: ${this.props.testcaseEdit.CurrentStatus}, CardType: ${this.props.testcaseEdit.CardType}`,
    //         "RequestType": 'POST',
    //         "URL": `/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`
    //     }
    //     axios.post(`/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`, { ...status })
    //         .then(res => {
    //             this.gridOperations(true);
    //             this.saveSingleTCInfo(data);
    //         }, error => {
    //             alert('failed to update tc')
    //             this.gridOperations(true);
    //         });
    // }

    // VIEW TC
    getTcByPlatform (platform) {
        this.gridOperations(false);
        axios.get('/api/applicable/platformwisetc/'+ platform)
        .then(response=>{
            console.log(response.data);
            this.saveLocalMultipleTC({ data:response.data.Data, id: this.props.selectedRelease.ReleaseNumber }, false)
            this.gridOperations(true);
            
        })
        .catch(error=>{
        })
    }
    getTcByDomain(domain) {
        this.gridOperations(false);
        // axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/wholeguitcinfo/domain/' + domain)
        //     .then(all => {
        //         if (all && all.data.length) {
        //             axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + domain)
        //                 .then(res => {
        //                     this.gridOperations(true);
        //                     this.setState({ doughnuts: getEachTCStatusScenario({ data: res.data, domain: domain, all: all.data }) })
        //                 }, error => {
        //                     this.gridOperations(true);
        //                 });
        //         }
        //     }, error => {
        //         this.gridOperations(true);
        //     })
    }
    getTC(row, updateRow, updateRelease) {
        this.currentSelectedRow = row;
        let data = row.data
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
       
        this.gridOperations(false);
        let url = `/api/tcinfogui/${this.props.selectedRelease.ReleaseNumber}/id/${data.TcID}/browsername/${data.BrowserName}/cardType/${data.CardType}`
        axios.get(url)
            .then(res => {
                if (updateRow) {
                    if (this.currentSelectedRow && this.currentSelectedRow.node) {
                        if (res.data.StatusList && res.data.StatusList.length) {
                            let stats = res.data.StatusList[res.data.StatusList.length - 1];
                            let CurrentStatus = {
                                Build: `${stats.Build}`,
                                Result: `${stats.Result}`,
                                TestedOn: `${stats.TestedOn}`,
                                Bugs: `${stats.Bugs}`
                            };
                            res.data.CurrentStatus = CurrentStatus;
                        }
                        this.currentSelectedRow.node.setData({ ...this.currentSelectedRow.data, ...res.data });
                    }
                }
                this.saveLocalTC(res.data);
                this.gridOperations(true);
                if (updateRelease) {
                    this.updateReleaseInfo();
                }
            })
            .catch(err => {
                this.saveLocalTC();
                this.gridOperations(true);
            })
    }
    getTcs(flag, CardType, platform, domain, subDomain, priority, all, selectedRelease, updateRelease) {
        let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
        if (!release) {
            return;
        }
        CardType = platform
        this.gridOperations(false);
        let startingIndex = this.pageNumber * this.rows;
        let url = `/api/wholeguitcinfo/${release}?index=${startingIndex}&count=${this.rows}`;
        if (all) {
            url = `/api/wholeguitcinfo/${release}?`;
        }
        if (platform || CardType || domain || subDomain || priority) {
            url = `/api/wholeguitcinfo/${release}?`;
            //if (platform) url += ('&Platform=' + platform);
            if (CardType) url += ('&CardType=' + CardType);
            if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        url += ('&WorkingStatus=' + 'Manual Assignee')
        
        let str1 = ''
        this.state.tableColumnsTcs.forEach(item=>{
            if(item.isChecked == true){
                str1 = str1 + item.value + ","
            } 
        })
        if(!all){
            url += ('&applicable=' + str1);

        }
        
        axios.get(url)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.allTCsToShow = all.data;
                //this.getTcsToShow(release,updateRelease)
                if(flag || !this.state.platform){
                    this.getTcsToShow(release,updateRelease)
                }
                if (this.state.platform){
                    this.getTcsToShowMod(this.state.platform, this.state.domain, this.state.subDomain, this.state.Priority, this.props.selectedRelease.ReleaseNumber);
                }
                
            }).catch(err => {
                this.saveLocalMultipleTC({ data: [], id: release }, true, updateRelease);
                this.gridOperations(true);
            })
    }
    getAlltcs() {
        this.setState({ loading: true, platform: '', domain: '', subDomain: '', CardType: '', Priority: '' })
        this.saveLocalMultipleTC({ data: [], id: this.props.selectedRelease.ReleaseNumber }, true);
        this.getTcs(true, null,null, null, null, null, true);
    }

    getTcsToShow(release,updateRelease){
        let showTc = []
        let skipTcs = []
        let NATcs = []
        //let ApplicableTcs = []
        this.ApplicableTcs = []
        for(let i = 0; i < this.allTCsToShow.length; i++){
            if(this.allTCsToShow[i].Priority == 'Skip' || this.allTCsToShow[i].Priority == 'Skp' ){
                skipTcs.push(this.allTCsToShow[i])
            }
            if(this.allTCsToShow[i].Priority == 'NA'){
                NATcs.push(this.allTCsToShow[i])
            }
            if(this.allTCsToShow[i].Priority != 'NA' && this.allTCsToShow[i].Priority != 'Skip' && this.allTCsToShow[i].Priority != 'Skp'){
                this.ApplicableTcs.push(this.allTCsToShow[i])
                //ApplicableTcs.push(this.allTCsToShow[i])
            }
        }
        showTc = []
        this.state.tableColumnsTcs.forEach(item=>{
            if(item.isChecked == true  && item.value == 'Show Skip'){
                skipTcs.forEach(skipTC=>{
                    showTc.push(skipTC)
                })
            } 
            if(item.isChecked == true && item.value == 'Show Not Applicable' ){
                NATcs.forEach(NATC=>{
                    showTc.push(NATC)
                })
            } 
            if(item.isChecked == true && item.value == 'Applicable' ){
                //ApplicableTcs.forEach(applicableTC=>{
                this.ApplicableTcs.forEach(applicableTC=>{
                    showTc.push(applicableTC)
                })
            }
        })
        let showTc1 = []
        let statusFlag = 0
        this.state.statusColumn.forEach(item=>{

            showTc.forEach(tcItem=>{
               
                if(item.isChecked == true && item.value == 'Pass' && tcItem.CurrentStatus.Result == 'Pass'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Fail' && tcItem.CurrentStatus.Result == 'Fail'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Block' && tcItem.CurrentStatus.Result == 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Not Tested' && tcItem.CurrentStatus.Result != 'Pass' && tcItem.CurrentStatus.Result != 'Fail' && tcItem.CurrentStatus.Result != 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }
            })
        })
        if(statusFlag == 0){
            showTc1 = showTc; 
            
        }
        this.saveLocalMultipleTC({ data:showTc1, id: release }, false, updateRelease)
        this.gridOperations(true);
    }
    getTcsToShowMod(platform, domain, subdomain, priority, release, updateRelease){
        //console.log("release,updateRelease in cli",release,updateRelease)
        //this.gridOperations(false);
        this.tcHolder = []
            if(platform) {
              this.tcHolder = [...this.allTCsToShow]
            }
            if(domain){
                let TcByDomain = []
                for (let i = 0 ; i < this.tcHolder.length; i++) {
                    if(this.tcHolder[i].Domain === domain ){
                        TcByDomain.push(this.tcHolder[i])
                    }
                }
                this.tcHolder = [...TcByDomain]
            }
            if(subdomain){
                let TcBySubdomain = []
                for (let i = 0 ; i < this.tcHolder.length; i++) {
                    if(this.tcHolder[i].SubDomain === subdomain ){
                        TcBySubdomain.push(this.tcHolder[i])
                    }
                }
                this.tcHolder = [...TcBySubdomain]
            }
            if(priority){
                let tem = []
                for (let i = 0 ; i < this.tcHolder.length; i++) {
                    if(this.tcHolder[i].Priority === priority ){
                        tem.push(this.tcHolder[i])
                    }
                }
                this.tcHolder = [...tem]
            }
        let showTc = []
        let skipTcs = []
        let NATcs = []
        //let ApplicableTcs = []
        this.ApplicableTcs = []
        for(let i = 0; i < this.tcHolder.length; i++){
            if(this.tcHolder[i].Priority == 'Skip' || this.tcHolder[i].Priority == 'Skp' ){
                skipTcs.push(this.tcHolder[i])
            }
            if(this.tcHolder[i].Priority == 'NA'){
                NATcs.push(this.tcHolder[i])
            }
            if(this.tcHolder[i].Priority != 'NA' && this.tcHolder[i].Priority != 'Skip' && this.tcHolder[i].Priority != 'Skp'){
                this.ApplicableTcs.push(this.tcHolder[i])
                //ApplicableTcs.push(this.allTCsToShow[i])
            }
        }
        showTc = []
        this.state.tableColumnsTcs.forEach(item=>{
            if(item.isChecked == true  && item.value == 'Skip'){
                skipTcs.forEach(skipTC=>{
                    showTc.push(skipTC)
                })
            }
            if(item.isChecked == true && item.value == 'NA' ){
                NATcs.forEach(NATC=>{
                    showTc.push(NATC)
                })
            } 
            if(item.isChecked == true && item.value == 'Applicable' ){
                //ApplicableTcs.forEach(applicableTC=>{
                this.ApplicableTcs.forEach(applicableTC=>{
                    showTc.push(applicableTC)
                })
            }
        })
        let showTc1 = []
        let statusFlag = 0
        this.state.statusColumn.forEach(item=>{

            showTc.forEach(tcItem=>{
               
                if(item.isChecked == true && item.value == 'Pass' && tcItem.CurrentStatus.Result == 'Pass'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Fail' && tcItem.CurrentStatus.Result == 'Fail'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Block' && tcItem.CurrentStatus.Result == 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Not Tested' && tcItem.CurrentStatus.Result != 'Pass' && tcItem.CurrentStatus.Result != 'Fail' && tcItem.CurrentStatus.Result != 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }
            })
        })
        if(statusFlag == 0){
            showTc1 = showTc; 
            
        }
        //console.log("showtc1",showTc1)
        this.saveLocalMultipleTC({ data:showTc1, id: release }, false, updateRelease)
        // if (this.state.isApiUnderProgress) {
        //     this.setState({ isApiUnderProgress: false, loading: false });
        // }
        this.gridOperations(true);
    }
    getTcsToShow1(release,updateRelease){
       
        let showTc = []
        let skipTcs = []
        let NATcs = []
        //let ApplicableTcs = []
        this.ApplicableTcs = []
        let skipCount = 0;
        let NACount = 0;
        let applicableCount = 0;
       
        for(let i = 0; i < this.allTCsToShow.length; i++){
            if(this.allTCsToShow[i].Priority == 'Skip' ){
                skipCount+=1
                skipTcs.push(this.allTCsToShow[i])
            }
            if(this.allTCsToShow[i].Priority == 'NA'){
                NACount += 1
                NATcs.push(this.allTCsToShow[i])
            }
            if(this.allTCsToShow[i].Priority != 'NA' && this.allTCsToShow[i].Priority != 'Skip'){
                applicableCount+=1
                //ApplicableTcs.push(this.allTCsToShow[i])
                this.ApplicableTcs.push(this.allTCsToShow[i])
            }
        }
        
        showTc = []
        this.state.tableColumnsTcs.forEach(item=>{
           
            if(item.isChecked == true  && item.value == 'Show Skip'){
                skipTcs.forEach(skipTC=>{
                    showTc.push(skipTC)
                })
            } 
            if(item.isChecked == true && item.value == 'Show Not Applicable' ){
                NATcs.forEach(NATC=>{
                    showTc.push(NATC)
                })
            } 
            if(item.isChecked == true && item.value == 'Applicable' ){
                //ApplicableTcs.forEach(applicableTC=>{
                this.ApplicableTcs.forEach(applicableTC=>{
                    showTc.push(applicableTC)
                })
            }
        })
        let showTc1 = []
        let statusFlag = 0
        this.state.statusColumn.forEach(item=>{

            showTc.forEach(tcItem=>{
               
                if(item.isChecked == true && item.value == 'Pass' && tcItem.CurrentStatus.Result == 'Pass'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Fail' && tcItem.CurrentStatus.Result == 'Fail'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Block' && tcItem.CurrentStatus.Result == 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }

                if(item.isChecked == true && item.value == 'Not Tested' && tcItem.CurrentStatus.Result != 'Pass' && tcItem.CurrentStatus.Result != 'Fail' && tcItem.CurrentStatus.Result != 'Blocked'){
                    statusFlag = 1
                    showTc1.push(tcItem)
                }
            })
        })
        if(statusFlag == 0){
            showTc1 = showTc; 
        }
        this.saveLocalMultipleTC({ data:showTc1, id: release }, false, updateRelease)
        this.gridOperations(true);
    }

    //RESET TC
    resetRows(resetCount) {
        this.editedRows = {};
        this.isAnyChanged = false;
        this.isBlockedOrFailed = false;
        if (this.gridApi) {
            this.gridApi.deselectAll();
        }
        this.saveLocalTC();
        if (!resetCount) {
            this.setState({ multi: {}, totalRows: this.gridApi.getModel().rowsToDisplay.length, selectedRows: this.gridApi.getSelectedRows().length })
        } else {
            this.setState({ multi: {}, selectedRows: 0, totalRows: 0 })
        }
    }
    resetSingle() {
        this.saveLocalTC(this.props.tcDetails);
        this.setState({ isEditing: false });
    }

    //SAVE TC
    saveAll() {
        this.gridOperations(false);
        let items = [];
        let statusItems = [];
        let auto_assignee = ''
        let auto_workingState = ''
        let selectedRows = this.gridApi.getSelectedRows();
        selectedRows.forEach(item => {
            let pushable = {
                TcID: item.TcID,
                CardType: item.CardType,
                BrowserName:item.BrowserName,
                Activity: { //TCINFONUM , url, username ,current data, request type
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "TcID": item.TcID,
                    CardType: item.CardType,
                    BrowserName:item.BrowserName,
                    "tcInfoNum":item.id,
                    "UserName":this.props.user.email,
                    LogData: ``,
                    "RequestType": 'PUT',
                    "URL": `/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`,
                   
                }
            };
            ['Priority', 'Assignee', 'WorkingStatus','applicable','OS'].map(each => {
                let Manual_Assignee = item.stateUserMapping["Manual Assignee"]
                if (item[each]) {
                    pushable[each] = item[each]
                    let old = item[each];
                    if (this.editedRows[`${item.TcID}_${item.CardType}`] && this.editedRows[`${item.TcID}_${item.CardType}`][each]) {
                        old = `${this.editedRows[`${item.TcID}_${item.CardType}`][each].originalValue}`
                    }
                    pushable.Activity.LogData += `${each}:{old: ${old}, new: ${item[each]}}, `
                    if(each ==  'Assignee'){
                        auto_assignee = item[each]
                        auto_workingState = "AUTO_ASSIGNED"
                        pushable["Automation Assignee"] = item[each]
                        pushable["Automation WorkingStatus"] = auto_workingState

                    }
                    // if(each == 'WorkingStatus'){
                    //     auto_workingState = item[each]
                    //     pushable["Automation WorkingStatus"] = item[each]
                    // }


                    pushable.stateUserMapping =  {"Manual Assignee" : Manual_Assignee,"Manual WorkingStatus" : "Inprogress","Automation Assignee" : auto_assignee ,"Automation WorkingStatus":auto_workingState}
                    pushable["Manual WorkingStatus"] = "Inprogress"
                    pushable["Manual Assignee"] = Manual_Assignee
                }
            })
            if (this.state.multi && this.state.multi.Build) {
                let status = {};
                //console.log("this.state.multi",this.state.multi)
                if(!this.state.multi.TestedOn) this.state.multi.TestedOn = "";
                status.Domain = item.Domain;
                status.SubDomain = item.SubDomain;
                status.Steps = item.Steps;
                status.ExpectedBehaviour = item.ExpectedBehaviour;
                status.Scenario = this.props.tcDetails.Scenario;
                status.Notes = item.Notes;
                status.TcName = this.getTcName(`${item.TcName}`);
                status.Build = this.state.multi.Build;
                status.TestedOn = this.state.multi.TestedOn;
                status.Result = this.state.multi.Result;
                status.Bugs = this.state.multi.Bugs;
                status.CardType = item.CardType;
                status.TcID = item.TcID;
                status.BrowserName = item.BrowserName;
                status.OS = item.OS;
                status.Activity = {
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "tcInfoNum":item.id,
                    "TcID": item.TcID,
                    "CardType": item.CardType,  
                    "UserName": this.props.user.email,
                    "LogData": `Status Added: Build: ${this.state.multi.Build}, Result: ${this.state.multi.Result}, TestedOn: ${this.state.multi.TestedOn}, CardType: ${item.CardType}`,
                    "RequestType": 'POST',
                    "URL": `/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`
                }
                statusItems.push(status)
            }
            items.push(pushable);

        })
       
        if (items.length === 0 && statusItems.length === 0) {
            return;
        }
        if (statusItems.length > 0) {
            this.saveMultipleTcStatus(statusItems, items);
        } else {
            this.saveMultipleTcInfo(items)
        }
    }
    saveMultipleTcStatus(statusItems, items) {
        let flag = 0;
        this.gridOperations(false);
            axios.post(`/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`, statusItems)
            .then(res => {
                this.gridOperations(true);
                flag = 1
                if (items.length > 0) {
                    this.saveMultipleTcInfo(items)
                } else {
                    //this.getTcs(this.state.CardType,this.state.platform, this.state.domain, this.state.subDomain, false, false, false, true);
                    this.getTcs(false, this.state.CardType, this.state.platform, null, null, false, false, false, true) 
                }
            }, error => {
                this.gridOperations(true);
                flag = 2
                // alert('Failed To Update TC Status');
            });
       
        if(flag == 1){
            alert('Tc Status updated Successfully');
        }

        if(flag == 2){
            alert('Failed To Update TC Status');
        }
       
    }


    saveMultipleTcInfo(items) {
        this.gridOperations(false);
        axios.put(`/api/tcinfogui/${this.props.selectedRelease.ReleaseNumber}`, items)
            .then(res => {
                this.gridOperations(true);
                //this.getTcs(this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain, false, false, false, true)
                this.getTcs(false, this.state.CardType, this.state.platform, null, null, false, false, false, true)
                alert('Tc Info Updated Successfully');
            }, error => {
                this.gridOperations(true);
                alert('Failed To Update TC Info');
            });
    }

    saveLocalTC(data) {
        if (data) {
            this.props.saveSingleTestCase(data);
            this.props.updateTCEdit({ ...data, errors: {}, original: data });
            this.setState({ isEditing: false, rowSelect: true, selectedRows: this.gridApi ? this.gridApi.getSelectedRows().length : 0 });
        } else {
            this.props.saveSingleTestCase({});
            this.props.updateTCEdit({ Master: true, errors: {}, original: null });
            this.setState({ isEditing: false, rowSelect: false, selectedRows: this.gridApi ? this.gridApi.getSelectedRows().length : 0 });
            this.currentSelectedRow = null;
        }
    }
    saveLocalMultipleTC(data, resetCount, updateRelease) {
        this.resetRows(resetCount);
        this.props.saveTestCase(data);
        if (updateRelease) {
            this.updateReleaseInfo();
        }
        setTimeout(this.gridApi.redrawRows(), 0)
    }

    textFields = [
        'TcID', 'TcName', 'Scenario', 'Tag', 'Assignee', 'Tag', 'Priority',
        'Description', 'Steps', 'ExpectedBehaviour', 'Notes', 'WorkingStatus','BrowserName','CardType','OS','applicable'
    ];
    whichFieldsUpdated(old, latest) {
        let changes = {};
        this.textFields.forEach(item => {
            if (old[item] !== latest[item]) {
                changes[item] = { old: old[item], new: latest[item] }
            }
        });
        return changes;
    }
    joinArrays(array) {
        if (!array) {
            array = [];
        }
        if (array && !Array.isArray(array)) {
            array = array.split(',');
        }
        return array;
    }
    save() {
        let data = {};
        // tc info meta fields
        // tc info fields
        this.textFields.map(item => data[item] = this.props.testcaseEdit[item]);
        // this.arrayFields.forEach(item => data[item] = this.joinArrays(this.props.testcaseEdit[item]));
        data.Activity = {
            Release: this.props.selectedRelease.ReleaseNumber,
            "tcInfoNum":this.props.tcDetails.id,
            "TcID": this.props.tcDetails.TcID,
            "CardType": this.props.tcDetails.CardType,
            "UserName": this.props.user.email,
            "LogData": `${JSON.stringify(this.changeLog)}`,
            "RequestType": 'PUT',
            "URL": `/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${this.props.tcDetails.TcID}/card/${this.props.tcDetails.CardType}`
        };

        if (this.props.testcaseEdit.CurrentStatus === 'Pass' || this.props.testcaseEdit.CurrentStatus === 'Fail' || this.props.testcaseEdit.CurrentStatus == 'Blocked' || this.props.testcaseEdit.CurrentStatus == 'Unblocked'||  this.props.testcaseEdit.Bugs) {
            this.saveSingleTCStatus(data);
            
        } else {
            this.saveSingleTCInfo(data);
            
        }
    }
    saveSingleTCStatus(data) {
        this.gridOperations(false);
        let status = {};
        status.Domain = this.props.tcDetails.Domain;
        status.SubDomain = this.props.tcDetails.SubDomain;
        status.Steps = this.props.tcDetails.Steps;
        status.ExpectedBehaviour = this.props.tcDetails.ExpectedBehaviour;
        status.Notes = this.props.tcDetails.Notes;
        status.Scenario = this.props.tcDetails.Scenario;
        status.TcName = this.getTcName(`${this.props.tcDetails.TcName}`);
        // status.AutomatedTcName = this.getTcName(`${this.props.tcDetails.AutomatedTcName}`);
        status.Build = this.props.testcaseEdit.Build;
        status.Result = this.props.testcaseEdit.CurrentStatus;
        status.CardType = this.props.tcDetails.CardType;
        status.TcID = this.props.tcDetails.TcID;
        status.BrowserName = this.props.tcDetails.BrowserName;
        if (this.props.testcaseEdit.CurrentStatus !== 'Fail' && this.props.testcaseEdit.CurrentStatus !== 'Pass'  && this.props.testcaseEdit.CurrentStatus !== 'Blocked'  && this.props.testcaseEdit.CurrentStatus !== 'Unblocked') {
            
            let statusList = this.props.testcaseEdit.StatusList;
            if(statusList && statusList.length>0) {
                statusList = statusList[statusList.length-1];
                status.Build = statusList.Build+'';
                status.Result = statusList.Result+'';
                status.Bugs = this.props.testcaseEdit.Bugs+'';
                status.id=statusList.id+'';
                status.Activity = {
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "tcInfoNum":this.props.tcDetails.id,
                    "TcID": this.props.tcDetails.TcID,
                    "CardType": this.props.tcDetails.CardType,
                    "UserName": this.props.user.email,
                    "LogData": `Bug Updated: Build: ${statusList.Build}, Result: ${statusList.Result}, CardType: ${statusList.CardType}`,
                    "RequestType": 'PUT',
                    "URL": `/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}/${statusList.id}`
                }
                axios.put(`/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`, [{ ...status }])
                    .then(res => {
                        this.gridOperations(true);
                        this.saveSingleTCInfo(data);
                    }, error => {
                        alert('Failed To Update TC')
                        this.gridOperations(true);
                    });
            } else {
                statusList = null;
                this.saveSingleTCInfo(data);
            }
        } else {
            status.Build = this.props.testcaseEdit.Build;
            status.Result = this.props.testcaseEdit.CurrentStatus;
            status.Bugs = this.props.testcaseEdit.Bugs;
            status.Activity = {
                Release: this.props.selectedRelease.ReleaseNumber,
                "tcInfoNum":this.props.tcDetails.id,
                "TcID": this.props.tcDetails.TcID,
                "CardType": this.props.tcDetails.CardType,
                "UserName": this.props.user.email,
                "LogData": `Status Added: Build: ${this.props.testcaseEdit.Build}, Result: ${this.props.testcaseEdit.CurrentStatus}, CardType: ${this.props.testcaseEdit.CardType}`,
                "RequestType": 'POST',
                "URL": `/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`
            }
            axios.post(`/api/tcstatusgui/${this.props.selectedRelease.ReleaseNumber}`, [{ ...status }])
                .then(res => {
                    this.gridOperations(true);
                    this.saveSingleTCInfo(data);
                }, error => {
                    alert('failed to update tc')
                    this.gridOperations(true);
                });
        }
    }
    saveSingleTCInfo(data) {
        if (this.props.testcaseEdit.NewTcID) {
            data.NewTcID = this.props.testcaseEdit.NewTcID
            if (data.Activity.LogData.length < 5) {
                data.Activity.LogData = `NewTcId: ${this.props.testcaseEdit.NewTcID} updated`
            } else {
                data.Activity.LogData += `NewTcId: ${this.props.testcaseEdit.NewTcID} updated`
            }
        }
        if (data.Activity.LogData.length < 5) {
            this.onSuccessTcInfo(data);
        } else {
            this.gridOperations(false);
            setTimeout(() => axios.put(`/api/tcinfogui/${this.props.selectedRelease.ReleaseNumber}`, [{ ...data }])
                .then(res => {
                    this.gridOperations(true);
                    this.onSuccessTcInfo(data);
                }, error => {
                    alert('Failed To Update TC')
                    this.gridOperations(true);
                }, 400));
        }
    }
    onSuccessTcInfo(data) {
        alert(`TC ${data.TcID} Updated Successfully`);
        if (data.NewTcID && this.currentSelectedRow) {
            this.currentSelectedRow.data.TcID = data.NewTcID;
        }
        setTimeout(() => {
            this.getTC(this.currentSelectedRow, true, true);
        }, 400);
    }

    render() {
        //let domains = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate["domain-gui"] && Object.keys(this.props.selectedRelease.TcAggregate["domain-gui"]);
        //let subdomains = this.state.domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.domain];
        //let platforms = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainGui && Object.keys(this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainGui);
        let platforms =this.props.selectedRelease && this.props.selectedRelease.PlatformsGui ? this.props.selectedRelease.PlatformsGui : []
        let domains = this.state.platform && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainGui && Object.keys(this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainGui[this.state.platform]);
        let subdomains = this.state.domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainGui[this.state.platform][this.state.domain];
        let priority = this.state.platform ? ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'] : []
        if (platforms) {
            platforms.sort();
        } else {
            platforms = [];
        }
        if (domains) {
            domains.sort();
        } else {
            domains = [];
        }
        if (subdomains) {
            subdomains.sort();
        } else {
            subdomains = [];
        }
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {
                this.gridApi.showLoadingOverlay();
            } else if (this.props.data && this.props.data.length === 0) {
                this.gridApi.showNoRowsOverlay();
            } else {
                this.gridApi.hideOverlay();
            }
        }
        let manualFilter = this.state.domain || this.state.subdomain || this.state.CardType || this.state.Priority || this.state.filterValue
        let pass = 0, fail = 0, notTested = 0, prioritySkip = 0, priorityNA = 0, prioritySkipAndTested = 0, automated = 0, total = 0;
        if (manualFilter && this.gridApi) {
            let rows = this.gridApi.getModel().rowsToDisplay;
            rows.forEach(row => {
                if (row.data.TcName !== 'TC NOT AUTOMATED' && row.data.TcName !== 'NOT AUTOMATED' && row.data.TcName !== 'undefined') {
                    automated += 1;
                }
                let tested = false;
                if (row.data.CurrentStatus.Result === 'Pass') {
                    pass += 1;
                    tested = true;
                } else if (row.data.CurrentStatus.Result === 'Fail') {
                    fail += 1;
                    tested = true;
                } else {
                    notTested += 1;
                }
                if (row.data.Priority === 'Skip' || row.data.Priority === 'Skp') {
                    prioritySkip += 1;
                }
                if (row.data.Priority === 'NA') {
                    priorityNA += 1;
                }

                if ((row.data.Priority === 'Skip' || row.data.Priority === 'Skip') && tested) {
                    prioritySkipAndTested += 1;
                }
            })
            total = this.gridApi.getModel().rowsToDisplay.length;
            // if (this.state.CardType) {
            //     let card = this.state.doughnuts.filter(d => d.CardType === this.state.CardType)[0];
            //     if (card) {
            //         if (this.state.subDomain && card.SubDomains[this.state.subDomain]) {
            //             pass = card.SubDomains[this.state.subDomain].Pass;
            //             fail = card.SubDomains[this.state.subDomain].Fail;
            //             total = card.SubDomains[this.state.subDomain].Total;
            //         } else {
            //             Object.keys(card.SubDomains).forEach(subdomain => {
            //                 pass += card.SubDomains[subdomain].Pass;
            //                 fail += card.SubDomains[subdomain].Fail;
            //                 total += card.SubDomains[subdomain].Total;
            //             })
            //         }
            //     }
            // } else {
            //     this.state.doughnuts.forEach(card => {
            //         if (this.state.subDomain && card.SubDomains[this.state.subDomain]) {
            //             pass += card.SubDomains[this.state.subDomain].Pass;
            //             fail += card.SubDomains[this.state.subDomain].Fail;
            //             total += card.SubDomains[this.state.subDomain].Total;
            //         } else {
            //             Object.keys(card.SubDomains).forEach(subdomain => {
            //                 pass += card.SubDomains[subdomain].Pass;
            //                 fail += card.SubDomains[subdomain].Fail;
            //                 total += card.SubDomains[subdomain].Total;
            //             })
            //         }
            //     });
            // }
        } 
        let pass1 = 0, fail1 = 0, notTested1 = 0, automated1 = 0, total1 = 0;
        if (this.gridApi && this.gridApi.getSelectedRows().length > 0) {
            let rows = this.gridApi.getSelectedRows();
            rows.forEach(row => {
               if (row.TcName !== 'TC NOT AUTOMATED' && row.TcName !== 'NOT AUTOMATED' && row.TcName !== 'undefined') {
                    automated1 += 1;
                }
                let tested = false;
                if (row.CurrentStatus.Result === 'Pass') {
                    pass1 += 1;
                    tested = true;
                } else if (row.CurrentStatus.Result === 'Fail') {
                    fail1 += 1;
                    tested = true;
                } else {
                    notTested1 += 1;
                }
            })
            total1 = this.gridApi.getSelectedRows().length;
        }
         if (this.props.selectedRelease && !manualFilter) {
            pass = 0; fail = 0; automated = 0;
            for(let i = 0; i < this.ApplicableTcs.length; i++){
                if(this.ApplicableTcs[i].CurrentStatus.Result ==='Pass'){
                    pass+=1;
                }
                if(this.ApplicableTcs[i].CurrentStatus.Result === 'Fail'){
                    fail+=1;
                }
                if(this.ApplicableTcs[i].TcName !== 'TC NOT AUTOMATED' && this.ApplicableTcs[i].TcName !== 'NOT AUTOMATED' && this.ApplicableTcs[i].TcName !== 'undefined'){
                    automated+=1;
                }
            }
            total = this.ApplicableTcs.length
        
        }
        
        /*else {
            if (this.props.selectedRelease && this.props.selectedRelease.TcAggregate) {
                let tcAggr = this.props.selectedRelease.TcAggregate.all;
                pass = tcAggr.Tested.manual.Pass + tcAggr.Tested.auto.Pass;
                automated = tcAggr.Automated;
                fail = tcAggr.Tested.manual.Fail + tcAggr.Tested.auto.Fail;
                total = pass + fail + tcAggr.Tested.manual.Skip + tcAggr.Tested.auto.Skip + tcAggr.NotTested + tcAggr.NotApplicable
            }
        }*/
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
                                            <span className='rp-app-table-title'>{this.props.title}</span>
                                            <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red'  }}>Table Showing Only Applicable TC's. To see Skip Or NA TC's Use Filter [<i class="fa fa-filter" aria-hidden="true"></i>] Below</span>

                                            {/* {
                                                this.state.loading && <span style={{ 'marginLeft': '2rem' }}>Please Wait for approx 3 mins to load complete table...</span>
                                            }
                                            {
                                                !this.state.loading && <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red' }}>TcName is Automated TC Name. It should contain '.' in its name. Please dont add description/scenario in TcName.</span>
                                            } */}
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
                                {/* <div style={{ width: '100%', height: ((window.screen.height * (1 - 0.248)) - 20) + 'px', marginBottom: '6rem' }}> */}
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            {
                                                [
                                                    { style: { width: '8rem', marginLeft: '1.0rem' }, field: 'platform', onChange: (e) => this.onSelectPlatform(e), values: [{ value: '', text: 'Select Platform' }, ...(platforms && platforms.map(each => ({ value: each, text: each })))] },
                                                    { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'domain', onChange: (e) => this.onSelectDomain(e), values: [{ value: '', text: 'Select Domain' }, ...(domains && domains.map(each => ({ value: each, text: each })))] },
                                                    { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'subDomain', onChange: (e) => this.onSelectSubDomain(e), values: [{ value: '', text: 'Select SubDomain' }, ...(subdomains && subdomains.map(each => ({ value: each, text: each })))] },
                                                    //{ style: { width: '8rem', marginLeft: '0.5rem' }, field: 'CardType', onChange: (e) => this.onSelectCardType(e), values: [{ value: '', text: 'Select CardType' }, ...(['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(each => ({ value: each, text: each })))] },
                                                    //{ style: { width: '7rem', marginLeft: '0.5rem' }, field: 'Priority', onChange: (e) => this.onSelectPriority(e), values: [{ value: '', text: 'Select Priority' }, ...(['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(each => ({ value: each, text: each })))] }
                                                    { style: { width: '7rem', marginLeft: '0.5rem' }, field: 'Priority', onChange: (e) => this.onSelectPriority(e), values: [{ value: '', text: 'Select Priority' }, ...(priority && priority.map(each => ({ value: each, text: each })))] }
                                                ].map(item => (
                                                    this.props.data &&
                                                    <div style={item.style}>
                                                        <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state[item.field]} onChange={(e) => item.onChange(e.target.value)} type="select" name={`select${item.field}`} id={`select${item.field}`}>
                                                            {
                                                                item.values.map(each => <option value={each.value}>{each.text}</option>)
                                                            }
                                                        </Input>
                                                    </div>
                                                ))
                                            }
                                            <div style={{ width: '5rem', marginLeft: '0.5rem' }}>
                                                <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} type="text" id="filter-text-box" placeholder="Search..." onChange={(e) => this.onFilterTextBoxChanged(e.target.value)} />
                                            </div>
                                            <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} id="getall" onClick={() => this.getAlltcs()} type="button">All</Button>
                                            </div>
                                            <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button id="PopoverAssign2" type="button"><i class="fa fa-filter" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign2" id="PopoverAssignButton2" toggle={() => this.popoverToggle2()} isOpen={this.state.popoverOpen2}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllCheckedTCs}  value="checkedall" /> Check / Uncheck All

                                                                <ul>
                                                                {
                                                                this.state.tableColumnsTcs.map((columnName) => {
                                                                    return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementTcs}  {...columnName} />)
                                                                })
                                                                }
                                                                </ul>
                                                                <input type="checkbox" onClick={this.handleAllCheckedStatusTCs}  value="checkedall" /> Check / Uncheck All

                                                                <ul>
                                                                {
                                                                this.state.statusColumn.map((columnName) => {
                                                                    return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementStatusTcs}  {...columnName} />)
                                                                })
                                                                }
                                                                </ul>
                                                            <Button onClick={() => this.showSelectedTCs()}>Show Selected TC</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div>
                                            <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button id="PopoverAssign1" type="button"><i class="fa fa-columns" aria-hidden="true"></i>
                                                    </Button>
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
                                            </div>
                                            {
                                                this.props.user &&
                                                <div style={{ width: '8rem', marginLeft: '0.5rem' }}>
                                                    <span>
                                                        <Button disabled={this.state.isApiUnderProgress} id="PopoverAssign" type="button">Apply Multiple</Button>
                                                        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign" id="PopoverAssignButton" toggle={() => this.popoverToggle()} isOpen={this.state.popoverOpen}>
                                                            <PopoverBody>
                                                                {
                                                                    [
                                                                        // { labels: 'Priority', values: [{ value: '', text: 'Select Priority' }, ...(['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(each => ({ value: each, text: each })))] },
                                                                        { labels: 'Assignee', values: [{ value: '', text: 'Select Assignee' }, ...(this.props.users.map(each => ({ value: each, text: each })))] },
                                                                        // { labels: 'WorkingStatus', values: [{ value: '', text: 'Select Working Status' }, ...(ws.map(each => ({ value: each, text: each })))] },
                                                                    ].map(each => <FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {

                                                                                    this.onCellEditing(item, each.labels, e.target.value)
                                                                                    item[each.labels] = e.target.value;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_${each.labels}`}>
                                                                            {
                                                                                each.values.map(item => <option value={item.value}>{item.text}</option>)
                                                                            }
                                                                        </Input>
                                                                    </FormGroup>)
                                                                }
                                                                <Row>
                                                                <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Priority} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'Priority', e.target.value)
                                                                                        item['Priority'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, Priority: e.target.value } })
                                                                                
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="select" id={`select_Priority`} >
                                                                            {
                                                                                ['Priority','P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(item => <option value={item}>{item}</option>)
                                                                            }
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.OS} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'OS', e.target.value)
                                                                                        item['OS'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, OS: e.target.value } })
                                                                                
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="select" id={`select_OS`} >
                                                                            {
                                                                                ['Operating System','CentOS', 'RHEL'].map(item => <option value={item}>{item}</option>)
                                                                            }
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            <Input required disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Build} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'applicable', e.target.value)
                                                                                        item['applicable'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, applicable: e.target.value } })
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="select" id={`select_Status`} >
                                                                                {
                                                                                    ["Applicability","Applicable","NA","Skip"].map(item => <option value={item}>{item}</option>)
                                                                                }
                                                                            </Input> 
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            {/* <Label className='rp-app-table-label' htmlFor='Result'>
                                                                                Result
                                                                            </Label> */}
                                                                            <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Result} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'CurrentStatus.Result', e.target.value)
                                                                                        item['CurrentStatus.Result'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, Result: e.target.value } })
                                                                                if(e.target.value == 'Blocked' || e.target.value == 'Fail' ){
                                                                                    this.isBlockedOrFailed = true
                                                                                }
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="select" id={`select_Result`}>
                                                                                {
                                                                                    [{ value: '', text: 'Select Result...' }, { value: 'Pass', text: 'Pass' }, { value: 'Fail', text: 'Fail' }, { value: 'Blocked', text: 'Blocked' },{ value: 'Unblocked', text: 'Unblocked' }].map(item => <option value={item.value}>{item.text}</option>)
                                                                                }
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            {/* <Label className='rp-app-table-label' htmlFor='Build'>
                                                                                Build
                                                                            </Label> */}
                                                                            <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Build} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'CurrentStatus.Build', e.target.value)
                                                                                        item['CurrentStatus.Build'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, Build: e.target.value } })
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="text" id={`select_Build`} placeholder = 'Build No'>
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="6">
                                                                        <FormGroup className='rp-app-table-value'>
                                                                            <Input required disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.TestedOn} onChange={(e) => {
                                                                                this.isAnyChanged = true;
                                                                                let selectedRows = this.gridApi.getSelectedRows();
                                                                                if (e.target.value && e.target.value !== '') {
                                                                                    selectedRows.forEach(item => {
                                                                                        this.onCellEditing(item, 'CurrentStatus.TestedOn', e.target.value)
                                                                                        item['CurrentStatus.TestedOn'] = e.target.value;
                                                                                    })
                                                                                }
                                                                                this.setState({ multi: { ...this.state.multi, TestedOn: e.target.value } })
                                                                                setTimeout(this.gridApi.redrawRows(), 0);
                                                                            }} type="select" id={`select_TestedOn`} >
                                                                                {
                                                                                    //["Tested on","BOS","NYNJ","Software solution"].map(item => <option value={item}>{item}</option>)
                                                                                    [{ value: '', text: 'Tested On' }, { value: 'Linux-Chrome', text: 'Linux-Chrome' }, { value: 'Linux-Firefox', text: 'Linux-Firefox' }, { value: 'Windows-IE11', text: 'Windows-IE11' }, { value: 'Windows-Chrome', text: 'Windows-Chrome' }, { value: 'Windows-Firefox', text: 'Windows-Firefox' }, { value: 'Mac-Safari', text: 'Mac-Safari' }].map(item => <option value={item.value}>{item.text}</option>)
                                                                                }
                                                                            </Input> 
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>

                                                                {
                                                                    this.isBlockedOrFailed &&
                                                                    <Row>
                                                                        <Col md="12">
                                                                                <FormGroup className='rp-app-table-value'>
                                                                                    {/* <Label className='rp-app-table-label' htmlFor='Bugs'>
                                                                                        Bug No
                                                                                    </Label> */}
                                                                                    <Input required disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Bugs} onChange={(e) => {
                                                                                        this.isAnyChanged = true;
                                                                                        
                                                                                        let selectedRows = this.gridApi.getSelectedRows();
                                                                                        if (e.target.value && e.target.value !== '') {
                                                                                            selectedRows.forEach(item => {
                                                                                                this.onCellEditing(item, 'CurrentStatus.Bugs', e.target.value)
                                                                                                item['CurrentStatus.Bugs'] = e.target.value;
                                                                                            })
                                                                                        }
                                                                                        this.setState({ multi: { ...this.state.multi, Bugs: e.target.value } })
                                                                                        setTimeout(this.gridApi.redrawRows(), 0);
                                                                                    }} type="text" id={`select_Bugs`} placeholder = 'Bug Number DWS-000/SPEK-000'>
                                                                                    </Input>
                                                                                </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                }

                                                                <div style={{ float: 'right', marginBottom: '0.5rem' }}>
                                                                    <span>
                                                                        {
                                                                            this.isAnyChanged &&
                                                                            <Button disabled={this.state.isApiUnderProgress} title="Undo" size="md" className="rp-rb-save-btn" onClick={() => /*this.getTcs(this.state.CardType, this.state.platform, this.state.domain, this.state.subDomain)*/this.getTcs(true, this.state.CardType, this.state.platform, null, null)} >
                                                                                Undo
                                                                            </Button>
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            this.isAnyChanged &&
                                                                            <Button disabled={this.state.isApiUnderProgress} title="Save" size="md" className="rp-rb-save-btn" onClick={() => { this.popoverToggle(); this.toggleAll() }} >
                                                                                Save
                                                                            </Button>
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </PopoverBody>
                                                        </UncontrolledPopover>
                                                    </span>

                                                </div>
                                            }
                                            <div style={{ width: '6rem', marginLeft: '0.5rem' }}>
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
                                                onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                rowData={this.props.data}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                onCellEditingStarted={this.onCellEditingStarted}
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
                                        this.gridApi && this.gridApi.getSelectedRows().length > 0 ?
                                            <div style={{ display: 'inline' }}>
                                            <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Pass: {pass1}</span>
                                            <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Fail: {fail1}</span>
                                            <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Automated: {automated1}</span>
                                            <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {total1}</span>
                                            {/* <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>notTested: {notTested}</span>
                                            <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>prioritySkip: {prioritySkip}</span>
                                            <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>priorityNA: {priorityNA}</span>
                                            <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>prioritySkipAndTested: {prioritySkipAndTested}</span> */}
                                            {/* notTested = 0, prioritySkip=0,priorityNA=0,prioritySkipAndTested=0, */}
                                            </div> :
                                             <div style={{ display: 'inline' }}>
                                             <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Pass: {pass}</span>
                                             <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Fail: {fail}</span>
                                             <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Automated: {automated}</span>
                                             <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {total}</span>
                                         </div>
                                         }
                                        <div style={{
                                            float: 'right', display: this.state.isApiUnderProgress || this.state.CardType || this.state.platform || this.state.domain || this.state.subDomain ||
                                                (this.props.tcStrategy && this.gridApi && this.props.tcStrategy.totalTests === this.gridApi.getModel().rowsToDisplay.length)
                                                ? 'none' : ''
                                        }}>
                                            <Button onClick={() => this.paginate(-1)}>Previous</Button>
                                            <span  >{`   Page: ${this.pageNumber}   `}</span>

                                            <Button onClick={() => this.paginate(1)}>Next</Button>

                                        </div>
                                    </div>



                                </div>
                                <div>

                                </div>
                                <Collapse isOpen={this.state.rowSelect}>
                                    {
                                        this.props.user && this.props.user.email && this.props.tcDetails && this.props.tcDetails.TcID &&
                                        <React.Fragment>
                                            {
                                                !this.state.isApiUnderProgress && this.state.isEditing &&
                                                <Fragment>
                                                    <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                                        <i className="fa fa-save"></i>
                                                    </Button>
                                                    <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.resetSingle()} >
                                                        <i className="fa fa-undo"></i>
                                                    </Button>
                                                </Fragment>
                                            }
                                            {!this.state.isApiUnderProgress && !this.state.isEditing &&
                                                <Fragment>
                                                    <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.setState({ isEditing: true })} >
                                                        <i className="fa fa-pencil-square-o"></i>
                                                    </Button>
                                                </Fragment>

                                            }
                                        </React.Fragment>
                                    }
                                    {
                                        this.props.tcDetails && this.props.tcDetails.TcID &&
                                        <React.Fragment>
                                            <TcSummaryGUI tcDetails={this.props.tcDetails}></TcSummaryGUI>
                                            <FormGroup row className="my-0">
                                                {
                                                    [
                                                        { field: 'Description', header: 'Description', type: 'text' },
                                                        { field: 'Steps', header: 'Steps', type: 'text' },
                                                        { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                                        { field: 'Notes', header: 'Notes', type: 'text' },

                                                    ].map((item, index) => (
                                                        <Col xs="12" md="6" lg="6">
                                                            <FormGroup className='rp-app-table-value'>
                                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                                                    this.props.testcaseEdit.errors.Master &&
                                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Master}</i>
                                                                }</Label>
                                                                {
                                                                    !this.state.isEditing ?
                                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '', backgroundColor: 'white' }} className='rp-app-table-value' type='textarea' rows={this.getTextAreaHeight(this.props.tcDetails && this.props.tcDetails[item.field])} value={this.props.tcDetails && this.props.tcDetails[item.field]}></Input>
                                                                        :
                                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows={this.getTextAreaHeight(this.props.tcDetails && this.props.tcDetails[item.field])} id={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]}
                                                                            onChange={(e) => this.props.updateTCEdit({
                                                                                ...this.props.testcaseEdit, [item.field]: e.target.value,
                                                                                errors: { ...this.props.testcaseEdit.errors, [item.field]: null }
                                                                            })} >
                                                                        </Input>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
                                            <Row>
                                                <Col lg="6">
                                                    <div class='row'>
                                                        <div class='col-md-10'>
                                                            <span className='rp-app-table-title'>Test Status</span>
                                                        </div>
                                                        {/* <div class='col-md-2'>
                                                    <Button style={{float:'right'}} onClick={() => {
                                                        if(this.statusGridApi) {
                                                            let selected = this.statusGridApi.getSelectedRows();
                                                            if(selected && selected[0]) {
                                                                this.confirmStatusDeleteToggle()
                                                            } else {
                                                                alert('Please select atleast a status')
                                                            }
                                                        }
                                                    }}>Delete</Button>
                                                    </div> */}
                                                    </div>


                                                    <div style={{ width: '100%', height: '300px', marginBottom: '3rem' }}>
                                                        <div style={{ width: "100%", height: "100%" }}>
                                                            <div
                                                                id="e2eGrid"
                                                                style={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                }}
                                                                className="ag-theme-balham"
                                                            >
                                                                <AgGridReact
                                                                    modules={this.state.modules}
                                                                    columnDefs={this.state.e2eColumnDefs}
                                                                    defaultColDef={this.state.defaultColDef}
                                                                    rowData={this.props.tcDetails ? this.props.tcDetails.StatusList : []}
                                                                    onGridReady={(params) => this.onStatusGridReady(params)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col lg="6">
                                                    <EditTCGUI isEditing={this.state.isEditing}></EditTCGUI>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg="12">
                                                    <div className='rp-app-table-title'>Test Case History</div>
                                                    {/* <div style={{ width: (window.screen.width * ((1 - 0.418) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}> */}
                                                    <div style={{ width: '100%', height: '250px', marginBottom: '3rem' }}>
                                                        <div style={{ width: "100%", height: "100%" }}>
                                                            <div
                                                                id="activityGrid"
                                                                style={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                }}
                                                                className="ag-theme-balham"
                                                            >
                                                                <AgGridReact
                                                                    onRowClicked={(e) => this.setState({ activity: e.data })}
                                                                    modules={this.state.modules}
                                                                    getRowHeight={this.getActivityRowHeight}
                                                                    columnDefs={this.state.activityColumnDefs}
                                                                    defaultColDef={this.state.defaultColDef}
                                                                    rowData={this.props.tcDetails ? this.props.tcDetails.Activity : []}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </React.Fragment>
                                    }
                                </Collapse>
                            </div >
                        </Collapse>

                    </Col>
                </Row>

                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    {
                        <ModalHeader toggle={() => this.toggle()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to make the changes?`
                        }
                        {
                            < React.Fragment >
                                <Row>
                                    <Col xs="11" md="11" lg="11">

                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggle(); this.save() }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.delete} toggle={() => this.toggleDelete()}>
                    {
                        <ModalHeader toggle={() => this.toggleDelete()}>{
                            'Delete Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to delete ${this.props.testcaseEdit.TcID} ?`
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggleDelete(); this.delete(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleDelete()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.multipleChanges} toggle={() => this.toggleAll()}>
                    {
                        <ModalHeader toggle={() => this.toggleAll()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to update multiple changes ?`
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggleAll(); this.saveAll(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleAll()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.deleteStatusModal} toggle={() => this.confirmStatusDeleteToggle()}>
                    {
                        <ModalHeader toggle={() => this.confirmStatusDeleteToggle()}>{
                            'Delete Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to delete ?`
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.confirmStatusDeleteToggle(); this.deleteStatus(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.confirmStatusDeleteToggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div >

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user && state.user.users ? state.user.users.map(item => item.name) : [],
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.testcase.all[state.release.current.id],
    tcDetails: state.testcase.testcaseDetail,
    tcStrategy: getTCForStrategy(state, state.release.current.id),
    testcaseEdit: state.testcase.testcaseEdit
})
export default connect(mapStateToProps, { saveTestCase, getCurrentRelease, saveSingleTestCase, updateTCEdit, saveReleaseBasicInfo })(TestCasesAllGUI);
