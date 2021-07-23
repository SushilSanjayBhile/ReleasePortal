import React, { Component , Fragment } from 'react';
import axios from 'axios';
import {
    Button,Col,Input,Row,Modal, ModalHeader, ModalBody, ModalFooter,Table,FormGroup,Label,UncontrolledPopover, PopoverBody,Collapse
} from 'reactstrap';
import { connect } from 'react-redux';
import { getEachTCStatusScenario } from '../../reducers/testcase.reducer';
import { getCurrentRelease, getTCForStrategy } from '../../reducers/release.reducer';
import { saveReleaseBasicInfo, deleteRelease, releaseChange, saveTestCase} from '../../actions';
import BasicReleaseInfo from './components/BasicReleaseInfo';
import './ManageRelease.scss';
import { api } from '../../utils/API.utils';
import  CheckBox  from '../../components/TestCasesAll/CheckBox';
import { element } from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import MoodEditor from "../../components/TestCasesAll/moodEditor";
import MoodRenderer from "../../components/TestCasesAll/moodRenderer";
import NumericEditor from "../../components/TestCasesAll/numericEditor";
import SelectionEditor from '../../components/TestCasesAll/selectionEditor';
import DatePickerEditor from '../../components/TestCasesAll/datePickerEditor';
import EditTC from '../Release/ReleaseTestMetrics/EditTC';
import TcSummary from '../../components/TestCasesAll/TcSummary';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import Multiselect from 'react-bootstrap-multiselect';
class ManageRelease extends Component {
    cntr = 0
    platformList = [];
    platformListGui = [];
    isApiUnderProgress = false;
    isAnyChanged = false;
    isBlockedOrFailed = false;
    pageNumber = 0;
    rows = 15;
    editedRows = {};
    ApplicableTcs = [];
    ApplicableTcsGui = [];
    userList = [];
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
            // 'CardType' : {
            //     headerName: "CardType", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
            
            //     cellEditor: 'selectionEditor',
            //     cellClass: 'cell-wrap-text',
            //     cellEditorParams: {
            //         values: ['BOS', 'NYNJ', 'COMMON'],
            //         multiple: true
            //     }
            // },
            'CardType' : {
                headerName: "Platforms", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
    
                cellClass: 'cell-wrap-text',
                editable: false,
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
        this.state = {
            parentReleaseList:['master',"DMC Master","DCX-DMC-Master"],
            selectedParentRelease:'',
            release: this.props.allReleases[0] ? this.props.allReleases[0].ReleaseNumber : '',
            updatedValues: {},
            basic: { editing: false, updated: {}, open: false },
            platforms : [],
            cli: '',
            gui: '',
            platformsGui : [],
            checkbox : false,
            errorflag: false,
            updateCounter: 1,
            selectedRows: 0,
            selectedReleaseGui: 0,
            totalRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while table or Tc is loading</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',
            rowSelect: false,
            isEditing: false,
            delete: false,
            displayPlatforms: [],
            displayTc: [],
            displayTcGui: [],
            showTcGui: [],
            showTc: [],
            allTCsToShow: [],
            allTCsToShowGui: [],
            addUsers: [],

            tableColumnsTcs: [
                {id: 1, value: "Skip", isChecked: false},
                {id: 2, value: "NA", isChecked: false},
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
                {id: 4, value: "CardType", isChecked: false},
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
                columnDefDict['CardType'],
                columnDefDict['TcID'],
                columnDefDict['Scenario'],
                columnDefDict['Description'],
                columnDefDict['Steps'],
                columnDefDict['Status'],
                columnDefDict['Build'],
                columnDefDict['OS'],
                columnDefDict['Bug'],
                columnDefDict['Priority'],
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
        if (!this.props.currentUser || (this.props.currentUser && !this.props.currentUser.isAdmin)) {
            this.props.history.push('/');
        }
    }
   //Priority Based Filter functions
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
        
        this.getTcsToShow(this.props.selectedRelease.ReleaseNumber , true);
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, this.state.Priority);
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

    //Handle platform 
    handleAllCheckedForPlatforms = (event) => {
        let platforms = this.state.platforms
        platforms.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({platforms: platforms})
        this.state.checkbox = false
        platforms.some(columnName => {
            if (columnName.isChecked == true) {
                this.state.checkbox = true
            }
        })
        this.getTcsToShow()
    }
   
    handleCheckChieldElementForPlatforms = (event) => {
        let platforms = this.state.platforms
        platforms.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({platforms: platforms})
        this.state.checkbox = false
        platforms.some(columnName => {
            if (columnName.isChecked == true) {
                this.state.checkbox = true
            }
        })
       
        this.getTcsToShow();  
    }
    handleAllCheckedForPlatformsGui = (event) => {
        let platforms = this.state.platformsGui
        platforms.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({platformsGui: platforms})
        this.state.checkbox = false
        platforms.some(columnName => {
            if (columnName.isChecked == true) {
                this.state.checkbox = true
            }
        })
        this.getTcsToShowGui()
    }
   
    handleCheckChieldElementForPlatformsGui = (event) => {
        let platforms = this.state.platformsGui
        platforms.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({platformsGui: platforms})
        this.state.checkbox = false
        platforms.some(columnName => {
            if (columnName.isChecked == true) {
                this.state.checkbox = true
            }
        })
       
        this.getTcsToShowGui();  
    }
    setSelectedColumns = () => {

        let columnDefDict1 = {
            'TcID' : {
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
          'CardType' : {
              headerName: "Platforms", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
        
              cellClass: 'cell-wrap-text',
              editable: false
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
        'Platform' : {
            headerCheckboxSelection: (params) => {
                if (this.gridApi) {
                    this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                }
                return true;
            },
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            headerName: "Platform", field: "Platform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            width: '180',
            editable: false,
            cellClass: 'cell-wrap-text',
        },
        'ExpectedBehaviour' : {
            headerName: "ExpectedBehaviour", field: "ExpectedBehaviour", sortable: true, filter: true, cellStyle: this.renderEditedCell,
            width: '180',
            editable: false,
            cellClass: 'cell-wrap-text',
        },
        }
        
        let tableColumns = this.state.tableColumns;
        let selectedColumns = []
        tableColumns.forEach(columnName => {
            if (columnName.isChecked == true){
                selectedColumns.push(columnDefDict1[columnName.value])
            }
        })

        this.setState({columnDefs:selectedColumns});
        this.setState({ popoverOpen1: !this.state.popoverOpen1 });
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
    /*
    toggleDelete = () => {
        this.setState({ delete: !this.state.delete })
    };
    toggleAll = () => {
        this.setState({ multipleChanges: !this.state.multipleChanges })
    };
    toggle = () => this.setState({ modal: !this.state.modal });
    */
    popoverToggle = () => this.setState({ popoverOpen: !this.state.popoverOpen });
    popoverToggle1 = () => this.setState({ popoverOpen1: !this.state.popoverOpen1 });
    popoverToggle2 = () => this.setState({ popoverOpen2: !this.state.popoverOpen2 });
    confirmStatusDeleteToggle = () => this.setState({ deleteStatusModal: !this.state.deleteStatusModal });
    /*confirmToggle() {
        this.changeLog = {};
        this.changeLog = this.whichFieldsUpdated(this.props.tcDetails, this.props.testcaseEdit);
        this.toggle();
    }*/

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
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, this.state.priority);
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
    /*componentDidMount() {
        setTimeout(() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain), 400);
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
    }*/
    /*componentWillReceiveProps(newProps) {
        if (this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.editedRows = {};
            this.isAnyChanged = false;
            this.isBlockedOrFailed = false;
            this.setState({
                rowSelect: false, CardType: '', domain: '', subDomain: '', Priority: '',
                isEditing: false
            })
            setTimeout(() => this.getTcs(null, null, null, null, null, newProps.selectedRelease.ReleaseNumber), 400);
        }
    }
    */
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
            this.getTcByPlatform(platform);
        }
        this.getTcByPlatform(platform);

        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ platform: platform, domain: ''});
        this.getTcs(this.state.CardType, '', '', this.state.Priority);
    }

    // SELECTION BOX
    onSelectDomain(domain) {
        if (domain === '') {
            domain = null;
        } else {
            console.log("domain",domain)
            this.getTcByDomain(domain);
        }
        console.log("printing domain  in on selectDomain",domain)
        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ domain: domain, subDomain: '' });
        console.log("Printing domain in onselect domain",domain)
        this.getTcs(this.state.CardType, domain, '', this.state.Priority);
        console.log(this.state.subDomain)
    }
    onSelectSubDomain(subDomain) {
        if (subDomain === '') {
            subDomain = null;
        }
        // let data = this.filterData({ Domain: this.state.domain, SubDomain: subDomain, CardType: this.state.CardType })
        this.setState({ subDomain: subDomain });
        console.log("printing subdomain  in on selectsubDomain",subDomain)
        this.getTcs(this.state.CardType, this.state.domain, subDomain, this.state.Priority);
    }
    onSelectCardType(cardType) {
        if (cardType === '') {
            cardType = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ CardType: cardType });
        this.getTcs(cardType, this.state.domain, this.state.subDomain, this.state.Priority);
    }
    onSelectPriority(priority) {
        if (priority === '') {
            priority = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ Priority: priority });
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, priority);
    }

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
            axios.delete(`/api/${this.props.selectedRelease.ReleaseNumber}/tcinfo/id/${this.props.tcDetails.TcID}`)
                .then(data => {
                    this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                }, error => {
                    alert(`Error: ${error.message}`);
                })
        }
    }

    deleteStatus() {
        console.log("IN DeleteStatus")
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
    //     status.Activity = {
    //         Release: this.props.selectedRelease.ReleaseNumber,
    //         "TcID": this.props.tcDetails.TcID,
    //         "CardType": this.props.tcDetails.CardType,
    //         "UserName": this.props.user.email,
    //         "LogData": `Status Added: Build: ${this.props.testcaseEdit.Build}, Result: ${this.props.testcaseEdit.CurrentStatus}, CardType: ${this.props.testcaseEdit.CardType}`,
    //         "RequestType": 'POST',
    //         "URL": `/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`
    //     }
    //     axios.post(`/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`, { ...status })
    //         .then(res => {
    //             this.gridOperations(true);
    //             this.saveSingleTCInfo(data);
    //         }, error => {
    //             alert('failed to update tc')
    //             this.gridOperations(true);
    //         });
    // }




    // VIEW TC
    getTcByDomain(domain) {
        console.log("In getTcByDomain")
        this.gridOperations(false);
        axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcinfo/domain/' + domain)
            .then(all => {
                if (all && all.data.length) {
                    axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + domain)
                        .then(res => {
                            this.gridOperations(true);
                            this.setState({ doughnuts: getEachTCStatusScenario({ data: res.data, domain: domain, all: all.data }) })
                        }, error => {
                            this.gridOperations(true);
                        });
                }
            }, error => {
                this.gridOperations(true);
            })
    }

    getTC(row, updateRow, updateRelease) {
        this.currentSelectedRow = row;
        let data = row.data
        if (!this.state.selectedParentRelease) {
            return;
        }
        console.log("In getTC")
        this.gridOperations(false);
        axios.get(`/api/tcinfo/${this.state.selectedParentRelease}/id/${data.TcID}/card/${data.CardType}`)
            .then(res => {
                if (updateRow) {
                    if (this.currentSelectedRow && this.currentSelectedRow.node) {
                        if (res.data.StatusList && res.data.StatusList.length) {
                            let stats = res.data.StatusList[res.data.StatusList.length - 1];
                            let CurrentStatus = {
                                Build: `${stats.Build}`,
                                Result: `${stats.Result}`,
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
    getPlatformList() {
        this.platformList = []
        let release = this.state.selectedParentRelease ? this.state.selectedParentRelease : null
        //let release = "DCX-DMC-Master"
        let url = `/api/releasewiseplatformCli/${release}?`;
        axios.get(url)
        .then(response=>{
            if(response.data){
                response.data.forEach((item)=>{
                    this.platformList.push({value: item, isChecked: false})
                })
            }
            this.setState({
                platforms : this.platformList
            })   
        })
        .catch(err=>{
            console.log("error")
        })

    }
    getPlatformListGui() {
        this.platformListGui = []
        let release = this.state.selectedParentRelease ? this.state.selectedParentRelease : null
        //let release = "DCX-DMC-Master"
        let url = `/api/releasewiseplatformGui/${release}?`;
        axios.get(url)
        .then(response=>{
            if(response.data){
                response.data.forEach((item)=>{
                    this.platformListGui.push({value: item, isChecked: false})
                })
            }
            this.setState({
                platformsGui : this.platformListGui
            })   
        })
        .catch(err=>{
            console.log("error")
        })

    }
    getUserList() {
        this.userList = []
        this.props.Users.forEach(element => {
            this.userList.push(element.name)})
        this.userList.sort()
        }
    getTcs(platform, CardType, domain, subDomain, priority, all, updateRelease) {
        //let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
       let release = this.state.selectedParentRelease ? this.state.selectedParentRelease : null
       //let release = "DCX-DMC-Master"
        if (!release) {
            console.log("not release")
            return;
        }
        this.gridOperations(false);
        console.log(this.state.isApiUnderProgress)
        let startingIndex = this.pageNumber * this.rows;
        //allTCsToShow = [];
        //let url = `/api/wholetcinfo/${release}?index=${startingIndex}&count=${this.rows}`;
        let url = `/api/wholetcinfo/${release}?`;
       // if (all) {
        //    url = `/api/wholetcinfo/${release}?`;
            // url = `/api/wholetcinfo/${release}`;
        //}
        if (platform || CardType || domain || subDomain || priority) {
            url = `/api/wholetcinfo/${release}?`;
            if (platform) url += ('&Platform=' + platform);
            if (CardType) url += ('&CardType=' + CardType);
            if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        url += ('&WorkingStatus=' + 'Manual Assignee')
        
        /*let str1 = ''
        this.state.tableColumnsTcs.forEach(item=>{
            if(item.isChecked == true){
                str1 = str1 + item.value + ","

            } 
        })
        */
        url += ('&applicable=' + "Applicable");
        
        axios.get(url)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.setState({allTCsToShow: all.data});
                for(let i = 0; i < this.state.allTCsToShow.length; i++){
                    if(this.state.allTCsToShow[i].Priority != 'NA' && this.state.allTCsToShow[i].Priority != 'Skip'){
                        this.ApplicableTcs.push(this.state.allTCsToShow[i])
                    }
                }
                this.getTcsToShow()
            }).catch(err => {
                this.saveLocalMultipleTC({ data: [], id: release });
                this.gridOperations(true);
            })
    }
    getTcsGui(platform, CardType, domain, subDomain, priority, all, updateRelease) {
        //let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
        let release = this.state.selectedParentRelease ? this.state.selectedParentRelease : null
        //let release = "DCX-DMC-Master"
        if (!release) {
            console.log("not release")
            return;
        }
        this.gridOperations(false);
        console.log(this.state.isApiUnderProgress)
        let startingIndex = this.pageNumber * this.rows;
        //allTCsToShow = [];
        //let url = `/api/wholetcinfo/${release}?index=${startingIndex}&count=${this.rows}`;
        let url = `/api/wholeguitcinfo/${release}?`;
       // if (all) {
        //    url = `/api/wholetcinfo/${release}?`;
            // url = `/api/wholetcinfo/${release}`;
        //}
        if (platform || CardType || domain || subDomain || priority) {
            url = `/api/wholeguitcinfo/${release}?`;
            if (platform) url += ('&Platform=' + platform);
            if (CardType) url += ('&CardType=' + CardType);
            if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        url += ('&WorkingStatus=' + 'Manual Assignee')
        
        /*let str1 = ''
        this.state.tableColumnsTcs.forEach(item=>{
            if(item.isChecked == true){
                str1 = str1 + item.value + ","

            } 
        })
        */
        url += ('&applicable=' + "Applicable");
        
        axios.get(url)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.setState({allTCsToShowGui: all.data});
                for(let i = 0; i < this.state.allTCsToShowGui.length; i++){
                    if(this.state.allTCsToShowGui[i].Priority != 'NA' && this.state.allTCsToShowGui[i].Priority != 'Skip'){
                        this.ApplicableTcsGui.push(this.state.allTCsToShowGui[i])
                    }
                }
                this.getTcsToShowGui()
            }).catch(err => {
                this.saveLocalMultipleTC({ data: [], id: release });
                this.gridOperations(true);
            })
    }
    getAlltcs() {
        this.setState({ loading: true, domain: '', subDomain: '', CardType: '', Priority: '' })
        this.saveLocalMultipleTC({ data: [], id: this.props.selectedRelease.ReleaseNumber }, true);
        this.getTcs(null, null, null, null, true);
    }

    getTcsToShow(){
        this.gridOperations(false);
        let platform = []
        this.setState({showTc: []})

        let temp = this.state.showTc.map(element =>{
                 return []
         })
        this.state.platforms.forEach(element => {
            if(element.isChecked === true){
                platform.push(element.value)
            }
        });
        if(platform.length !== 0) {
        // for(let i = 0; i < this.ApplicableTcs.length; i++){
        //     platform.some(element => {
        //         if(this.ApplicableTcs[i].Platform.includes(element)) {
        //              this.state.showTc.push(this.ApplicableTcs[i])
        //             }
        //     })
        for(let i = 0; i < this.ApplicableTcs.length; i++){
            platform.some(element => {
                if(this.ApplicableTcs[i].CardType && this.ApplicableTcs[i].CardType === element) {
                     this.state.showTc.push(this.ApplicableTcs[i])
                    }
            })
            
        }
        let tempList = [...new Set(this.state.showTc)]
        
        this.gridOperations(true);
        this.setState({displayTc: tempList})
        }
        else{ 
            if(this.state.allTCsToShow.length > 0) { this.gridOperations(true);}
            this.setState({displayTc: [], showTc: []})
        }
       
    }
    getTcsToShowGui(){
        this.gridOperations(false);
        let platform = []
        this.setState({showTcGui: []})

        let temp = this.state.showTcGui.map(element =>{
                 return []
         })
        this.state.platformsGui.forEach(element => {
            if(element.isChecked === true){
                platform.push(element.value)
            }
        });
        if(platform.length !== 0) {
        // for(let i = 0; i < this.ApplicableTcsGui.length; i++){
        //     platform.some(element => {
        //         if(this.ApplicableTcsGui[i].Platform.includes(element)) {
        //              this.state.showTcGui.push(this.ApplicableTcsGui[i])
        //             }
        //     })
        for(let i = 0; i < this.ApplicableTcsGui.length; i++){
            platform.some(element => {
                if(this.ApplicableTcsGui[i].CardType && this.ApplicableTcsGui[i].CardType === element) {
                     this.state.showTcGui.push(this.ApplicableTcsGui[i])
                    }
            })
            
        }
        let tempList = [...new Set(this.state.showTcGui)]
        this.gridOperations(true);
        this.setState({displayTcGui: tempList})
        }
        else{ 
            if(this.state.allTCsToShowGui.length > 0) { this.gridOperations(true);}
            this.setState({displayTcGui: [], showTcGui: []})

        }
        
    }
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
    saveLocalMultipleTC(data) {
        //this.resetRows(resetCount);
        this.props.saveTestCase(data);
        /*if (updateRelease) {
            this.updateReleaseInfo();
        }*/
        setTimeout(this.gridApi.redrawRows(), 0)
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
    componentDidMount(){
        let data = []
        let releaseInfoURL = `/api/release/info`;
        axios.get(releaseInfoURL)
        .then(res => {
          res.data.forEach(item => {
            data.push(item.ReleaseNumber)
          });
          this.setState({
            parentReleaseList : data
          })
        }, error => {
            console.log("Error Getting release Info")
          
        });
        //this.setState({displayTc: [],displayTcGui:[], showTc: [], showTcGui: []});this.getTcs();this.getTcsGui();this.getPlatformList();this.getPlatformListGui();this.resetPlatforms();
        //this.getTcs();this.getTcsGui();this.getPlatformList();this.getPlatformListGui();this.resetPlatforms();
        // axios.get('/api/applicable/platformList/')
        // .then(response=>{
        //     if(response.data){
        //         response.data.PlatformList.map((item)=>{
        //             this.platformList.push({value: item, isChecked: false})
        //         })
        //     }
        //     this.setState({
        //         platforms : this.platformList
        //     })   
        // })
        // .catch(err=>{
        //     console.log("error")
        // })

    }

    
    reset() {
        this.setState({
            release: this.props.allReleases[0] ? this.props.allReleases[0].ReleaseNumber : '',
            updatedValues: {},
            basic: { editing: false, updated: {}, open: false },
        })
    }
    delete() {
        axios.delete(`/api/release/${this.state.release}`)
            .then(res => {
                alert(`successfully deleted ${this.state.release}`);
                this.props.deleteRelease({ id: this.state.release });
            }, error => {
                alert('error deleting release');
            });
        this.delToggle();
    }
    
    confirm() {
        this.save();
    }
    confirmToggle() {
        let data = { ...this.props.selectedRelease, ...this.state.basic.updated }
        if (!data || (data && !data.ReleaseNumber)) {
            alert('Please Add Release Number');
            return;
        }
        this.toggle();
    }
    save() {
        let data = { ...this.props.selectedRelease, ...this.state.basic.updated }
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};
        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]).toISOString().split('T');
                formattedDates[item] = `${date[0]} ${date[1].substring(0, date[1].length-1)}`;
            }
        });
        data = { ...data, ...formattedDates };
        let arrays = [
            'Platform','ServerType', 'CardType', 'BuildNumberList', 'SetupsUsed', 'UpgradeMetrics', 'Customers', 'Engineers',
        ]
        let formattedArrays = {};
        arrays.forEach(item => {
            if (!data[item]) {
                formattedArrays[item] = [];
            }
            if (data[item] && !Array.isArray(data[item])) {
                formattedArrays[item] = data[item].split(',');
            }
        })

        data.ParentRelease = this.state.selectedParentRelease
        //data.ParentRelease = "DCX-DMC-Master"
        data.PlatformsCli = []
        data.PlatformsGui = []
        this.state.platforms && this.state.platforms.forEach(element => {
                if(element.isChecked === true)data.PlatformsCli.push(element.value);
        });
        this.state.platformsGui && this.state.platformsGui.forEach(element => {
            if(element.isChecked === true)data.PlatformsGui.push(element.value);
        });
        let emails = []
          this.state.addUsers && this.state.addUsers.forEach(item =>{
            this.props.Users && this.props.Users.some(element =>{
                if(element.name == item){
                    emails.push(element.email)
                }
          })
        })
        if(this.props.currentUser){emails.push(this.props.currentUser.email)}
        data = { ...data, ...formattedArrays };
        if (isNaN(data.QARateOfProgress)) {
            data.QARateOfProgress = 0;
        } else {
            data.QARateOfProgress = parseInt(data.QARateOfProgress);
        }
        if (!data.QARateOfProgress) {
            data.QARateOfProgress = 0;
        }
        let formData = {
            "emails": emails,
           "ReleasesEdit": data.ReleaseNumber
       }
       let url = `/api/userinfo/`;
       axios.post(`/api/release`, { ...data })
            .then(single => {
                if(single.data){
                    setTimeout(() => {  
                        axios.post(`/api/cleanupdb`, { ...data })
                        .then(response=>{
                                axios.put(url,formData)
                                .then(response=>{
                                    alert('successfully added the release');
                                    window.location.reload()
                                    })
                                .catch(err=>{
                                    console.log("err",err);
                                })
                            
                        })
                        .catch(error=>{
                            console.log("error creating release")
                        })
                    }, 5000);
                }
            }, error => {
                alert('error in updating');
            });
            if (this.state.modal) {
            this.toggle();
        }

    }   
    resetPlatforms() {
        this.platformList.forEach(element => {
                element.isChecked = false;
        })
        this.platformListGui.forEach(element => {
            element.isChecked = false;
    })
        this.setState({platforms: this.platformList, platformsGui: this.platformListGui, selectedRows: 0, selectedReleaseGui: 0})
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    delToggle = () => this.setState({ delModal: !this.state.delModal });
    
    selectMultiselect(event, checked) {
        let value = event.val();
        let users = null;
        if (checked && this.state.addUsers) {
            users = [...this.state.addUsers, value];
        }
        if (checked && !this.state.addUsers) {
            users = [value];
        }
        if (!checked && this.state.addUsers) {
            let array = this.state.addUsers;
            array.splice(array.indexOf(value), 1);
            users = array;
        }
        this.setState({ addUsers: users });
    }
    render() {
        //let platforms = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainCli && Object.keys(this.props.selectedRelease.TcAggregate.PlatformWiseDomainSubdomainCli);
        //console.log("**tcdetail",this.props.tcDetails)
        //console.log("platforms",this.displayPlatforms)
        //console.log("***",this.props.selectedRelease)
        //let domains = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions);
        //console.log(domains)
        //let subdomains = this.state.domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.domain];
        //console.log(subdomains)
        //alert("checking")
        let users = this.userList ? this.userList.map(item => ({ value: item, selected: this.state.addUsers && this.state.addUsers.includes(item) })) : [];
        let multiselect = { 'Users': users};
        /*if (domains) {
            domains.sort();
        } else {
            domains = [];
        }
        if (subdomains) {
            subdomains.sort();
        } else {
            subdomains = [];
        }
        */
        if (this.gridApi) {
            // //if (this.props.data && this.props.data.length === 0) {
            // if (this.state.isApiUnderProgress) {
            //     this.gridApi.showLoadingOverlay();
            // } else if (this.state.displayTc.length === 0) {
            //     this.gridApi.showNoRowsOverlay();
            // } else {
            //     this.gridApi.hideOverlay();
            // }
            if (this.state.displayTc.length === 0) {
                     this.gridApi.showNoRowsOverlay();
                }
            else {
                this.gridApi.hideOverlay();
            }
        }
        
        let manualFilter = this.state.domain || this.state.subdomain || this.state.CardType || this.state.Priority || this.state.filterValue
        let pass = 0, fail = 0, notTested = 0, prioritySkip = 0, priorityNA = 0, prioritySkipAndTested = 0, automated = 0, total = 0;

        if (manualFilter && this.gridApi) {
            pass = 0; fail = 0; notTested = 0; prioritySkip = 0; priorityNA = 0; prioritySkipAndTested = 0; automated = 0; total = 0;
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
        }
        //my code
        //let pass1 = 0, fail1 = 0, notTested1 = 0, automated1 = 0, total1 = 0;
        // if (this.gridApi && this.gridApi.getSelectedRows().length > 0) {
        //     let rows = this.gridApi.getSelectedRows();
        //     rows.forEach(row => {
        //        if (row.TcName !== 'TC NOT AUTOMATED' && row.TcName !== 'NOT AUTOMATED' && row.TcName !== 'undefined') {
        //             automated1 += 1;
        //         }
        //         let tested = false;
        //         if (row.CurrentStatus.Result === 'Pass') {
        //             pass1 += 1;
        //             tested = true;
        //         } else if (row.CurrentStatus.Result === 'Fail') {
        //             fail1 += 1;
        //             tested = true;
        //         } else {
        //             notTested1 += 1;
        //         }
        //     })
        //     total1 = this.gridApi.getSelectedRows().length;
        //     console.log("mAutomated 2 if",automated1)
        //     console.log("mpass 2 if",pass1)
        //     console.log("mfail 2 if",fail1)
        //     console.log("mtotal 2 if",total1)
        // }
        //let pass3=0, fail3=0, automated3=0, total3=0;
        if (/*this.state.selectedParentRelease &&*/ !manualFilter && this.state.displayTc.length > 0) {
            pass = 0; fail = 0; automated = 0;total = 0;
            for(let i = 0; this.state.displayTc && i < this.state.displayTc.length; i++){
                if(this.state.displayTc[i].CurrentStatus.Result ==='Pass'){
                    pass+=1;
                }
                if(this.state.displayTc[i].CurrentStatus.Result === 'Fail'){
                    fail+=1;
                }
                if(this.state.displayTc[i].TcName !== 'TC NOT AUTOMATED' && this.state.displayTc[i].TcName !== 'NOT AUTOMATED' && this.state.displayTc[i].TcName !== 'undefined'){
                    automated+=1;
                }
            }
            total = this.state.displayTc.length
        
        }
        let pass2 = 0, fail2 = 0, notTested2 = 0, automated2 = 0, total2 = 0;
        if (/*this.state.selectedParentRelease &&*/ !manualFilter && this.state.displayTcGui.length > 0) {
            pass2 = 0; fail2 = 0; automated2 = 0; total2 = 0;
            for(let i = 0; this.state.displayTcGui && i < this.state.displayTcGui.length; i++){
                if(this.state.displayTcGui[i].CurrentStatus.Result ==='Pass'){
                    pass2+=1;
                }
                if(this.state.displayTcGui[i].CurrentStatus.Result === 'Fail'){
                    fail2+=1;
                }
                if(this.state.displayTcGui[i].TcName !== 'TC NOT AUTOMATED' && this.state.displayTcGui[i].TcName !== 'NOT AUTOMATED' && this.state.displayTcGui[i].TcName !== 'undefined'){
                    automated2+=1;
                }
            }
            total2 = this.state.displayTcGui.length        
        }
        return (
            (
                <div style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    {/* <Row>
                        <Col xs="4">
                            <FormGroup>
                                <Label htmlFor="selectRelease">Release</Label>
                                <Input onChange={(e) => this.setState({ release: e.target.value })} type="select" name="selectRelease" id="selectRelease">
                                    {
                                        this.props.allReleases.map(release => <option value={release.ReleaseNumber}>{release.ReleaseNumber}</option>)
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col xs="4">
                            <Button onClick={() => this.delToggle()} size="sm" color="danger" className="rp-mr-del-button"><i className="fa fa-ban" style={{
                                'color': 'white',
                                'marginRight': '0.5rem'
                            }}></i> Delete</Button>
                        </Col>
                    </Row> */}
                    
                    <Row>
                        
                        <Col xs="12" sm="12" lg="10" className="rp-summary-tables" style={{overflow:"auto", marginLeft: '1rem', marginTop: '1rem' }}>
                            <div className='rp-app-table-header'>
                                <span className='rp-app-table-title'>Add Release</span>
                                <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                    <i className="fa fa-check-square-o"></i>
                                </Button>
                            </div>


                            <Row>
                            <Col xs="12" sm="12" md="8" lg="8">
                                <div className='rp-app-table-header'>
                                    <span className='rp-app-table-title' >Parent Release</span>
                                    <Row>
                                        <Col xs="12" sm="12" md="5" lg="5">
                                        {
                                            [
                                                { labels: 'Parent Release', values: [{ value: '', text: 'Select Release' },...(this.state.parentReleaseList.map(each => ({ value: each, text: each })))] },
                                            ].map(each => <FormGroup className='rp-app-table-value'>
                                                <Input onChange={(e) => {
                                                    this.setState({selectedParentRelease: e.target.value},()=>{
                                                        this.setState({displayTc: [],displayTcGui:[], showTc: [], showTcGui: []});this.getTcs();this.getTcsGui();this.getPlatformList();this.getPlatformListGui();this.getUserList();this.resetPlatforms();});
                                                }} type="select" id={`select_${each.labels}`}>
                                                    {
                                                        each.values.map(item => <option value={item.value}>{item.text}</option>)
                                                    }
                                                </Input>
                                            </FormGroup>)
                                        }
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                            
                            {
                                this.state.selectedParentRelease ?
                                <Row>
                                <Col xs="12" sm="12" md="5" lg="5">
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'Release Name', value: '', field: 'ReleaseNumber' },
                                                    { key: 'Operating System', value: '', field: 'FinalOS' },
                                                    { key: 'Docker Core RPM Number', value: '', field: 'FinalDockerCore' },
                                                    { key: 'Build Number', field: 'BuildNumber', value: '' },

                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>

                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>


                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                    <div className='rp-rs-hw-support'>Hardware Support</div>
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'Server Type', field: 'ServerType', value: '' },
                                                    { key: 'Card Type', field: 'CardType', value: '' },
                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>
                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>
                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                       
                                    </Table>
                                        {
                                                [
                                                    { field: 'Users', header: 'Users' }
                                                ].map(item => (
                                                    <Col xs="10" md="10" lg="10">
                                                        <FormGroup className='rp-app-table-value'>
                                                            <Label  className='rp-app-table-label' htmlFor={item.field}>{item.header}</Label>
                                                                {
                                                                    <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(e, checked)}
                                                                    data={multiselect[item.field]} multiple /></div>
                                                                }
                                                        </FormGroup>
                                                    </Col>
                                                ))
                                        }
                                </Col>
                                <Col xs="12" sm="12" md="5" lg="5">
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'UBoot Number', value: '', field: 'UbootVersion' },
                                                    { key: 'Customers', field: 'Customers', value: '' },
                                                    { key: 'Target Date', field: 'TargetedReleaseDate', value: '', type: 'date' },

                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>

                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>


                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                            {/* <tr>
                                                <React.Fragment>
                                                    <td className='rp-app-table-key'>Priority</td>

                                                    <td>
                                                        <Input type="select" id="Priority" name="Priority" value={this.state.basic.updated.Priority}
                                                            onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, Priority: e.target.value } } })}>
                                                            <option value=''>Select Priority</option>
                                                            {

                                                                ['P0','P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map(item =>
                                                                    <option value={item}>{item}</option>
                                                                )
                                                            }
                                                        </Input>
                                                    </td>


                                                </React.Fragment>

                                            </tr> */}
                                        </tbody>
                                    </Table>
                                    
                                            {/* <Row> */}
                                                <Col xs="12" sm="12" md="15" lg="15">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <input type="checkbox" onClick={this.handleAllCheckedForPlatforms}  value="checkedall" /> CLI-Check / Uncheck All
                                                        <ul>
                                                        {
                                                        this.state.platforms.map((platformName) => {
                                                            return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementForPlatforms}  {...platformName} />)
                                                        })
                                                        }
                                                        </ul>
                                                    </FormGroup>
                                                </Col>
                                            {/* </Row> */}
                                            {/* <Row> */}
                                                <Col xs="12" sm="12" md="15" lg="15">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <input type="checkbox" onClick={this.handleAllCheckedForPlatformsGui}  value="checkedall" /> GUI-Check / Uncheck All
                                                        <ul>
                                                        {
                                                        this.state.platformsGui.map((platformName) => {
                                                            return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementForPlatformsGui}  {...platformName} />)
                                                        })
                                                        }
                                                        </ul>
                                                    </FormGroup>
                                                </Col>
                                            {/* </Row> */}
                                            
                                </Col>
                            </Row> : null
                            }
                            

                            {/* <Card>
                                <CardHeader>
                                    <strong>Add New Release</strong>
                                </CardHeader>
                                <CardBody>
                                    <FormGroup>
                                        <Label htmlFor="release">Release</Label>
                                        <Input type="text" id="release" placeholder="Enter Release Name" value={this.state.updatedValues.ReleaseNumber} onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, ReleaseNumber: e.target.value } })} />
                                    </FormGroup>
                                    <BasicReleaseInfo id={this.props.id} isEditing={true} handleUpdate={(value) => this.setState({ updatedValues: { ...this.state.updatedValues, ...value } })} />
                                </CardBody>
                                <CardFooter>
                                    <div className="form-actions">
                                        <Button color="primary" onClick={() => this.toggle()}>Save changes</Button>
                                    </div>
                                </CardFooter>
                            </Card> */}
                             
                        </Col>
                    </Row>


                    <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                        <ModalHeader toggle={() => this.toggle()}>Confirmation</ModalHeader>
                        <ModalBody>
                            Are you sure you want to make the changes?
                    </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.confirm()}>Ok</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.delModal} toggle={() => this.delToggle()}>
                        <ModalHeader toggle={() => this.delToggle()}>Confirmation</ModalHeader>
                        <ModalBody>
                            {`Are you sure you want to delete release ${this.state.release}?`}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.delete()}>Delete</Button>{' '}
                            <Button color="secondary" onClick={() => this.delToggle()}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ cli: !this.state.cli})}>
                                <div class="row">
                                    <div class='col-lg-12'>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ display: 'inlineBlock' }}>
                                                {
                                                    !this.state.cli &&
                                                    <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                                }
                                                {
                                                    this.state.cli &&
                                                    <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                                }
                                                <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                                <span className='rp-app-table-title'>CLI</span>
                                                {/* <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red'  }}>Table Showing Only Applicable TC's. To see Skip Or NA TC's Use Filter [<i class="fa fa-filter" aria-hidden="true"></i>] Below</span> */}
                                                
                                                {
                                                    this.state.cli &&
                                                    <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                        <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <Collapse isOpen={this.state.cli}>
                                <div>
                                    
                                    {/* <div style={{ width: '100%', height: ((window.screen.height * (1 - 0.248)) - 20) + 'px', marginBottom: '6rem' }}> */}
                                    <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                        <div class="test-header">
                                            <div class="row">
                                                {/*
                                                    [
                                                        { style: { width: '8rem', marginLeft: '1.0rem' }, field: 'platform', onChange: (e) => this.onSelectPlatform(e), values: [{ value: '', text: 'Select Platform' }, ...(this.state.displayPlatforms.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'domain', onChange: (e) => this.onSelectDomain(e), values: [{ value: '', text: 'Select Domain' }, ...(domains && domains.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'subDomain', onChange: (e) => this.onSelectSubDomain(e), values: [{ value: '', text: 'Select SubDomain' }, ...(subdomains && subdomains.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'CardType', onChange: (e) => this.onSelectCardType(e), values: [{ value: '', text: 'Select CardType' }, ...(['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '7rem', marginLeft: '0.5rem' }, field: 'Priority', onChange: (e) => this.onSelectPriority(e), values: [{ value: '', text: 'Select Priority' }, ...(['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(each => ({ value: each, text: each })))] }
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
                                                            */}
                                                {/* <div style={{ width: '5rem', marginLeft: '0.5rem' }}>
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
                                                </div> */}
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
                                                                            // { labels: 'WorkingStatus', values: [{ value: '', text: 'Select Working Status' }, ...(wsA.map(each => ({ value: each, text: each })))] },
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
                                                                                this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } },()=>{
                                                                                })
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

                                                                    </Row>

                                                                    <Row>
                                                                        <Col md="6">
                                                                            <FormGroup className='rp-app-table-value'>
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
                                                                                <Input required disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Build} onChange={(e) => {
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
                                                                                }} type="text" id={`select_Build`} placeholder="Build No" >
                                                                                </Input> 
                                                                            </FormGroup>
                                                                        </Col>

                                                                    </Row>
                                                                    
                                                                    {
                                                                        this.isBlockedOrFailed &&
                                                                        <Row>
                                                                            <Col md="12">
                                                                                    <FormGroup className='rp-app-table-value'>
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
                                                                                        }} type="text" id={`select_Bugs`} placeholder='Bug Number DWS-000/SPEK-000'>
                                                                                        </Input>
                                                                                    </FormGroup>
                                                                            </Col>
                                                                        </Row>
                                                                    }

                                                                    <div style={{ float: 'right', marginBottom: '0.5rem' }}>
                                                                        
                                                                        <span>
                                                                            {
                                                                                this.isAnyChanged &&
                                                                                <Button disabled={this.state.isApiUnderProgress} title="Undo" size="md" className="rp-rb-save-btn" onClick={() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain)} >
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
                                                
                                                {/* <div style={{ width: '5rem', marginLeft: '0.5rem' }}>
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
                                                </div> */}
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
                                                    rowData={this.state.displayTc}
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
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Pass: {pass}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Fail: {fail}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Automated: {automated}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {total}</span>
                                                </div>
                                                :
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Pass: {pass}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Fail: {fail}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Automated: {automated}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {total}</span>
                                                </div>
                                                }
                                            <div style={{
                                                float: 'right', display: this.state.isApiUnderProgress || this.state.CardType || this.state.domain || this.state.subDomain
                                                    //(this.props.tcStrategy && this.gridApi && this.props.tcStrategy.totalTests === this.gridApi.getModel().rowsToDisplay.length)
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
                                                <TcSummary tcDetails={this.props.tcDetails}></TcSummary>
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
                                                        <EditTC isEditing={this.state.isEditing}></EditTC>
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
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ gui: !this.state.gui})}>
                                <div class="row">
                                    <div class='col-lg-12'>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ display: 'inlineBlock' }}>
                                                {
                                                    !this.state.gui &&
                                                    <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                                }
                                                {
                                                    this.state.gui &&
                                                    <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                                }
                                                <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                                <span className='rp-app-table-title'>GUI</span>
                                                {/* <span style={{ 'marginLeft': '2rem', fontWeight:'500', color: 'red'  }}>Table Showing Only Applicable TC's. To see Skip Or NA TC's Use Filter [<i class="fa fa-filter" aria-hidden="true"></i>] Below</span> */}
                                                
                                                {
                                                    this.state.gui &&
                                                    <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                        <span className='rp-app-table-value'>Selected: {this.state.selectedRowsGui}</span>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
            
                            <Collapse isOpen={this.state.gui}>
                                <div>
                                    
                                    {/* <div style={{ width: '100%', height: ((window.screen.height * (1 - 0.248)) - 20) + 'px', marginBottom: '6rem' }}> */}
                                    <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                        <div class="test-header">
                                            <div class="row">
                                                {/*
                                                    [
                                                        { style: { width: '8rem', marginLeft: '1.0rem' }, field: 'platform', onChange: (e) => this.onSelectPlatform(e), values: [{ value: '', text: 'Select Platform' }, ...(this.state.displayPlatforms.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'domain', onChange: (e) => this.onSelectDomain(e), values: [{ value: '', text: 'Select Domain' }, ...(domains && domains.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'subDomain', onChange: (e) => this.onSelectSubDomain(e), values: [{ value: '', text: 'Select SubDomain' }, ...(subdomains && subdomains.map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '8rem', marginLeft: '0.5rem' }, field: 'CardType', onChange: (e) => this.onSelectCardType(e), values: [{ value: '', text: 'Select CardType' }, ...(['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(each => ({ value: each, text: each })))] },
                                                        { style: { width: '7rem', marginLeft: '0.5rem' }, field: 'Priority', onChange: (e) => this.onSelectPriority(e), values: [{ value: '', text: 'Select Priority' }, ...(['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(each => ({ value: each, text: each })))] }
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
                                                            */}
                                                {/* <div style={{ width: '5rem', marginLeft: '0.5rem' }}>
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
                                                </div> */}
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
                                                                            // { labels: 'WorkingStatus', values: [{ value: '', text: 'Select Working Status' }, ...(wsA.map(each => ({ value: each, text: each })))] },
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
                                                                                this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } },()=>{
                                                                                })
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

                                                                    </Row>

                                                                    <Row>
                                                                        <Col md="6">
                                                                            <FormGroup className='rp-app-table-value'>
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
                                                                                <Input required disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi.Build} onChange={(e) => {
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
                                                                                }} type="text" id={`select_Build`} placeholder="Build No" >
                                                                                </Input> 
                                                                            </FormGroup>
                                                                        </Col>

                                                                    </Row>
                                                                    
                                                                    {
                                                                        this.isBlockedOrFailed &&
                                                                        <Row>
                                                                            <Col md="12">
                                                                                    <FormGroup className='rp-app-table-value'>
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
                                                                                        }} type="text" id={`select_Bugs`} placeholder='Bug Number DWS-000/SPEK-000'>
                                                                                        </Input>
                                                                                    </FormGroup>
                                                                            </Col>
                                                                        </Row>
                                                                    }

                                                                    <div style={{ float: 'right', marginBottom: '0.5rem' }}>
                                                                        
                                                                        <span>
                                                                            {
                                                                                this.isAnyChanged &&
                                                                                <Button disabled={this.state.isApiUnderProgress} title="Undo" size="md" className="rp-rb-save-btn" onClick={() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain)} >
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
                                                
                                                {/* <div style={{ width: '5rem', marginLeft: '0.5rem' }}>
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
                                                </div> */}
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
                                                    //rowSelection='multiple'
                                                    getRowHeight={this.getRowHeight}
                                                    defaultColDef={this.state.defaultColDef}
                                                    rowData={this.state.displayTcGui}
                                                    onGridReady={(params) => this.onGridReady(params)}
                                                    onCellEditingStarted={this.onCellEditingStarted}
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
                                          
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Pass: {pass2}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Fail: {fail2}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Automated: {automated2}</span>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {total2}</span>
                                                </div>
                                                
                                            <div style={{
                                                float: 'right', display: this.state.isApiUnderProgress || this.state.CardType || this.state.domain || this.state.subDomain
                                                    //(this.props.tcStrategy && this.gridApi && this.props.tcStrategy.totalTests === this.gridApi.getModel().rowsToDisplay.length)
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
                                                <TcSummary tcDetails={this.props.tcDetails}></TcSummary>
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
                                                        <EditTC isEditing={this.state.isEditing}></EditTC>
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
                </div >
            )
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    Users: state.user.users,
    users: state.currentUser && state.currentUser.users ? state.currentUser.users.map(item => item.name) : [],
    allReleases: state.release.all,
    //selectedRelease: getCurrentRelease(state, state.release.current.id),
    //selectedRelease: this.state.selectedParentRelease,
    data: state.testcase.all[state.release.current.id],
    //tcDetails: state.testcase.testcaseDetail,
    //tcStrategy: getTCForStrategy(state, state.release.current.id),
    //testcaseEdit: state.testcase.testcaseEdit
})

export default connect(mapStateToProps, { saveTestCase,getCurrentRelease, saveReleaseBasicInfo, deleteRelease, releaseChange })(ManageRelease);