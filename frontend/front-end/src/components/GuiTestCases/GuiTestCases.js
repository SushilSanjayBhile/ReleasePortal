// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to

// TODO: list descending order: CUrretnStatus and statuslist
// ExpectedBehaviour and Steps not updating
//  Working Status: Deleted, and others
// User list from backend
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { getCurrentRelease, getTCForStrategy } from '../../reducers/release.reducer';
import { saveSingleTestCase, saveTestCase, updateTCEdit } from '../../actions';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    UncontrolledPopover, PopoverHeader, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './GuiTestCases.scss';
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
import EditTC from '../../views/Release/ReleaseTestMetrics/EditTC';
// import { data, domains, subDomains } from './constants';
// "Description": "Enable helm", "ExpectedBehaviour": "dctl feature list should display helm as enabled", "Notes": "NOTES NOT PROVIDED"
class GuiTestCases extends Component {
    cntr = 0;
    pageNumber = 0;
    rows = 15;
    editedRows = {};
    isApiUnderProgress = false;
    isAnyChanged = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedRows: 0,
            totalRows: 0,
            allRows: 0,
            failRows: 0,
            automatedRows: 0,
            passRows: 0,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while table or Tc is loading</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',
            rowSelect: false,
            isEditing: false,
            delete: false,
            editColumnDefs: [
                {
                    headerName: "Date", field: "Date", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "SubDomain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Scenario", field: "Scenario", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell,

                },
                {
                    headerName: "Server Type", field: "ServerType", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Status", field: "StatusList[0].Result", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "OrchestrationPlatform", field: "OrchestrationPlatform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Steps", field: "Steps", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "ExpectedBehavior", field: "ExpectedBehavior", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Master", field: "Master", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Tag", field: "Tag", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },

            ],

            columnDefs: [
                {
                    headerCheckboxSelection: (params) => {
                        if (this.gridApi) {
                            this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                        }
                        return true;
                    },
                    headerCheckboxSelectionFilteredOnly: true,
                    cellStyle: { alignItems: 'top' },
                    checkboxSelection: true,
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: false,
                    width: 180
                },
                {
                    headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    width: '420',
                    editable: false,
                    cellClass: 'cell-wrap-text',
                    autoHeight: true
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',

                    cellEditor: 'selectionEditor',
                    cellClass: 'cell-wrap-text',
                    cellEditorParams: {
                        values: ['BOS', 'NYNJ', 'COMMON'],
                        multiple: true
                    }
                },
                {
                    headerName: "Build", field: "CurrentStatus.Build", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',

                    cellEditor: 'selectionEditor',
                    cellClass: 'cell-wrap-text',
                    cellEditorParams: {
                        values: ['BOS', 'NYNJ', 'COMMON'],
                        multiple: true
                    }
                },
                {
                    headerName: "Status", field: "CurrentStatus.Result", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',

                    cellEditor: 'selectionEditor',
                    cellClass: 'cell-wrap-text',
                    cellEditorParams: {
                        values: ['COMPLETED', 'NOT_COMPLETED']
                    }
                },
                {
                    headerName: "Priority", field: "Priority", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100', cellClass: 'cell-wrap-text',
                },
                {
                    headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',

                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: this.props.users.map(item => item.email)
                    }
                },
                {
                    headerName: "Working Status", field: "WorkingStatus", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                },
                // {
                //     headerName: "Server Type", field: "ServerType", sortable: true, filter: true, cellStyle: this.renderEditedCell,

                //     cellEditor: 'selectionEditor',
                //     cellClass: 'cell-wrap-text',
                //     cellEditorParams: {
                //         values: ['UNKNOWN']
                //     }
                // },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                },
                // {
                //     headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                // },
                // {
                //     headerName: "SubDomain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                // }
            ],
            defaultColDef: { resizable: true },

            e2eColumnDefs: [{
                headerCheckboxSelection: true,
                checkboxSelection: true,
                headerName: "Build", field: "Build", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
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
    onBtShowLoading() {
        this.gridApi.showLoadingOverlay();
    }
    onBtShowNoRows() {
        this.gridApi.showNoRowsOverlay();
    }
    onBtHide() {
        this.gridApi.hideOverlay();
    }
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 1);
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
    getTC(e) {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        this.gridOperations(false);
        axios.get(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}/id/${e.TcID}/card/${e.CardType}`)
            .then(res => {
                this.props.saveSingleTestCase(res.data);
                this.props.updateTCEdit({ ...res.data, errors: {}, original: res.data });
                this.gridOperations(true);
            })
            .catch(err => {
                this.deselect();
                this.gridOperations(true);
            })
    }

    onSelectionChanged = (event) => {
        this.setState({ selectedRows: event.api.getSelectedRows().length })
    }
    deselect(updateTotalRows) {
        if (this.gridApi) {
            this.gridApi.deselectAll();
        }
        this.props.saveSingleTestCase({});
        this.props.updateTCEdit({ Master: true, errors: {}, original: null });
        if (!updateTotalRows) {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, totalRows: this.gridApi.getModel().rowsToDisplay.length, selectedRows: this.gridApi.getSelectedRows().length })
        } else {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, selectedRows: 0, totalRows: 0 })
        }
    }
    renderSmallCell = (params) => {
        return {
            backgroundColor: '', maxWidth: '50px'
        }
    }
    renderEditedCell = (params) => {
        // if(params.data) {
        //     console.log(this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field]);
        //     console.log(params.value)
        // }
        console.log(params);
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
        // if (restored) {
        //     console.log('restoried')
        //     this.editedRows[`${params.data.TcID}_${params.data.CardType}`].Changed = false;
        // }
        return { backgroundColor: '' };
    }
    numberParser(params) {
        var newValue = params.newValue;
        var valueAsNumber;
        if (newValue === null || newValue === undefined || newValue === "") {
            valueAsNumber = null;
        } else {
            valueAsNumber = parseFloat(params.newValue);
        }
        return valueAsNumber;
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
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
        console.log('current')
        console.log(this.editedRows);
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
        console.log('upadred')
        console.log(this.editedRows);
    }

    getEditedCells() {
        var cellDefs = this.gridApi.getEditingCells();
        console.log('edited cells ', cellDefs);
    }
    onFilterTextBoxChanged(value) {
        this.setState({ rowSelect: false });
        this.gridApi.setQuickFilter(value);
        this.deselect();
    }
    filterData({ Domain, SubDomain, CardType }) {
        return this.props.data.filter(item => {
            let domain = Domain && Domain !== '' ? Domain : item.Domain;
            let subdomain = SubDomain && SubDomain !== '' ? SubDomain : item.SubDomain;
            let card = CardType && CardType !== '' ? CardType : item.CardType;
            if (domain === item.Domain && subdomain === item.SubDomain && card === item.CardType) {
                return true;
            }
            return false;
        })
    }
    toggleDelete = () => {
        this.setState({ delete: !this.state.delete })
    };
    onSelectDomain(domain) {
        this.deselect(true);
        if (domain === '') {
            domain = null;
        }
        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ domain: domain, subDomain: '' });
        this.getTcs(this.state.CardType, domain, '', this.state.Priority);


    }
    onSelectSubDomain(subDomain) {
        this.deselect(true);
        if (subDomain === '') {
            subDomain = null;
        }
        // let data = this.filterData({ Domain: this.state.domain, SubDomain: subDomain, CardType: this.state.CardType })
        this.setState({ subDomain: subDomain });
        this.getTcs(this.state.CardType, this.state.domain, subDomain, this.state.Priority);


    }
    onSelectCardType(cardType) {
        this.deselect(true);
        if (cardType === '') {
            cardType = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ CardType: cardType });
        this.getTcs(cardType, this.state.domain, this.state.subDomain, this.state.Priority);

    }
    onSelectPriority(priority) {
        this.deselect(true);
        if (priority === '') {
            priority = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ Priority: priority });
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, priority);
    }
    rowSelect(e) {
        console.log('model')
        console.log(this.gridApi.getModel())
        this.setState({
            isEditing: false, rowSelect: true, toggleMessage: null, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0,
            selectedRows: this.gridApi.getSelectedRows().length, totalRows: this.gridApi.getModel().rowsToDisplay.length
        })
        this.getTC(e.data);
    }
    getTcs(CardType, domain, subDomain, priority) {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        this.gridOperations(false);
        let startingIndex = this.pageNumber * this.rows;
        this.deselect(true);
        this.props.saveTestCase({ data: [], id: this.props.selectedRelease.ReleaseNumber });
        this.props.saveSingleTestCase({});
        let url = `/api/wholeguitcinfo/${this.props.selectedRelease.ReleaseNumber}`;
        if (CardType || domain || subDomain || priority) {
            url = `/api/wholeguitcinfo/${this.props.selectedRelease.ReleaseNumber}?`;
            // if (CardType) url += ('&CardType=' + CardType);
            // if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        console.log(url);
        axios.get(url)
            .then(all => {

                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.props.saveTestCase({ data: all.data, id: this.props.selectedRelease.ReleaseNumber });
                setTimeout(this.gridApi.refreshView(), 0)
                this.deselect();
                this.gridOperations(true);

            }).catch(err => {
                this.deselect();
                this.gridOperations(true);
            })
        // .then(all => {

        // })
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    reset() {
        this.props.updateTCEdit({ ...this.props.tcDetails, errors: {} });
        this.setState({ isEditing: false, multi: {} });
    }

    undo() {
        this.editedRows = {};
        this.deselect();
        this.isAnyChanged = false;
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
    }

    saveAll() {
        this.gridOperations(false);
        let items = [];
        // Object.keys(this.editedRows).forEach(item => {
        //     if (this.editedRows[item] && this.editedRows[item].Changed) {
        //         // let assignee = this.editedRows[item].Assignee.newValue && this.editedRows[item].Assignee.newValue !== 'ADMIN' 
        //         // ? this.editedRows[item].Assignee.newValue : 'ADMIN';
        //         // let ws = assignee === 'ADMIN' ? 'UNASSIGNED' : 'MANUAL_ASSIGNED'
        //         let pushable = {
        //             TcID: this.editedRows[item].TcID.newValue,
        //             CardType: this.editedRows[item].CardType.newValue
        //         };
        //         if(this.editedRows[item].Priority) {
        //             if (this.editedRows[item].Priority.newValue === 'Skip') {
        //                 this.editedRows[item].Priority.newValue = 'Skp';
        //             }
        //             pushable.Priority = this.editedRows[item].Priority.newValue
        //         }
        //         if(this.editedRows[item].Assignee) {
        //             pushable.Assignee = this.editedRows[item].Assignee.newValue
        //         }
        //         if(this.editedRows[item].WorkingStatus) {
        //             pushable.WorkingStatus = this.editedRows[item].WorkingStatus.newValue
        //         }
        //         items.push(pushable);
        //     }
        // });
        let selectedRows = this.gridApi.getSelectedRows();
        selectedRows.forEach(item => {
            let pushable = {
                TcID: item.TcID,
                CardType: item.CardType
            };
            if (item.Priority) {
                if (item.Priority === 'Skip') {
                    item.Priority = 'Skp';
                }
                pushable.Priority = item.Priority
            }
            if (item.Assignee) {
                pushable.Assignee = item.Assignee
            }
            if (item.WorkingStatus) {
                pushable.WorkingStatus = item.WorkingStatus
            }
            items.push(pushable);
        })

        this.props.saveTestCase({ data: [], id: this.props.selectedRelease.ReleaseNumber });
        this.props.saveSingleTestCase({});
        axios.put(`/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`, items)
            .then(res => {
                this.gridOperations(true);
                this.setState({ errors: {}, toggleMessage: `TCs Updated Successfully` });
                this.toggle();
                this.undo();

            }, error => {
                this.gridOperations(true);
                this.undo();
                alert('failed to update TCs');

            });
        this.props.updateTCEdit({ Master: true, errors: {} });
        this.setState({ rowSelect: false, toggleMessage: null, isEditing: false, multi: { Priority: '', Assignee: '', WorkingStatus: '' } })
    }

    textFields = [
        'TcID', 'TcName', 'Scenario', 'Tag', 'Assignee', 'Tag', 'Priority',
        'Description', 'Steps', 'ExpectedBehaviour', 'Notes', 'WorkingStatus'
    ];
    // arrayFields = ['CardType','ServerType', 'OrchestrationPlatform']
    whichFieldsUpdated(old, latest) {
        let changes = {};
        this.textFields.forEach(item => {
            if (old[item] !== latest[item]) {
                changes[item] = { old: old[item], new: latest[item] }
            }
        });
        // this.arrayFields.forEach(item => {
        //     if(!old[item] && latest[item]) {
        //         changes[item] = {old: '', new: latest[item]}
        //     } else if(!latest[item] && old[item]) {
        //         changes[item] = {old: old[item], new: ''}
        //     } else if(old[item] && latest[item]){
        //         let arrayChange = latest[item].filter(each => old[item].includes(each));
        //         if(arrayChange.length > 0) {
        //             changes[item] = {old: old[item], new: latest[item]}
        //         }
        //     }
        // });
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
    statusUpdate() {
        let data = {};
    }
    detailsUpdate() {
        let data = {};
    }
    gridOperations(enable) {
        if (enable) {
            if (this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: false });
            }
        } else {
            if (!this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: true });
            }
        }
    }
    save() {
        this.toggle();
        this.gridOperations(false);
        let data = {};
        // tc info meta fields
        // tc info fields
        this.textFields.map(item => data[item] = this.props.testcaseEdit[item]);
        // this.arrayFields.forEach(item => data[item] = this.joinArrays(this.props.testcaseEdit[item]));
        data.Activity = {
            Release: this.props.selectedRelease.ReleaseNumber,
            "TcID": this.props.tcDetails.TcID,
            "CardType": this.props.tcDetails.CardType,
            "UserName": this.props.user.email,
            "LogData": `${JSON.stringify(this.changeLog)}`,
            "RequestType": 'PUT',
            "URL": `/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${this.props.tcDetails.TcID}/card/${this.props.tcDetails.CardType}`
        };
        if (data.Priority === 'Skip') {
            data.Priority = 'Skp';
        }
        if (this.props.testcaseEdit.CurrentStatus === 'Pass' || this.props.testcaseEdit.CurrentStatus === 'Fail') {
            let status = {};
            status.Build = this.props.testcaseEdit.Build;
            status.Result = this.props.testcaseEdit.CurrentStatus;
            status.CardType = this.props.tcDetails.CardType;
            status.TcID = this.props.tcDetails.TcID;
            status.Activity = {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": this.props.tcDetails.TcID,
                "CardType": this.props.tcDetails.CardType,
                "UserName": this.props.user.email,
                "LogData": `Status Added: Build: ${this.props.testcaseEdit.Build}, Result: ${this.props.testcaseEdit.CurrentStatus}, CardType: ${this.props.testcaseEdit.CardType}`,
                "RequestType": 'POST',
                "URL": `/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`
            }
            axios.post(`/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`, { ...status })
                .then(res => {
                    console.log('updated status')
                    setTimeout(() => axios.put(`/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${data.TcID}/card/${this.props.tcDetails.CardType}`, { ...data })
                        .then(res => {
                            this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.props.testcaseEdit.TcID} Updated Successfully` });
                            this.deselect();
                            this.toggle();

                            setTimeout(() => {

                                this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                                this.gridOperations(true);
                            }, 1000);
                        }, error => {

                            alert('failed to update tc')
                            this.gridOperations(true);
                        }, 1000));
                }, error => {
                    alert('failed to update tc')
                    console.log('failed updating status')
                    this.gridOperations(true);
                });
        } else {
            axios.put(`/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${data.TcID}/card/${this.props.tcDetails.CardType}`, { ...data })
                .then(res => {
                    this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.props.testcaseEdit.TcID} Updated Successfully` });
                    this.deselect();
                    this.toggle();
                    setTimeout(() => {
                        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                        this.gridOperations(true);
                    }, 1000);
                }, error => {
                    alert('failed to update tc')
                    this.deselect();
                    setTimeout(() => {
                        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain)
                        this.gridOperations(true);
                    }, 1000);
                });
        }
        this.setState({ toggleMessage: null, isEditing: false })
        // this.toggle();
    }
    confirmToggle() {
        console.log('tc edit')
        console.log(this.props.testcaseEdit);
        this.changeLog = {};
        console.log('noerror find')
        this.changeLog = this.whichFieldsUpdated(this.props.tcDetails, this.props.testcaseEdit);
        this.setState({ toggleMessage: null })
        this.toggle();
    }
    deleteStatus() {

    }
    paginate(index) {
        this.pageNumber += index;
        if (this.pageNumber < 0) {
            this.pageNumber = 0;
        }
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
    }
    delete() {
        if (this.props.tcDetails.TcID) {
            axios.delete(`/api/${this.props.selectedRelease.ReleaseNumber}/tcinfo/id/${this.props.tcDetails.TcID}`)
                .then(data => {
                    this.deselect();
                    this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                }, error => {
                    this.setState({ errors: {}, toggleMessage: `Error: ${error.message}` });
                    this.toggle();
                })
        }
    }
    getAlltcs() {

    }

    onBuildGridReady = (params) => {
        this.buildGridApi = params.api;
        this.buildGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    }
    componentDidMount() {
        setTimeout(() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain), 1000);
        if (this.props.user &&
            (this.props.user.role === 'ADMIN' || this.props.user.role === 'QA' || this.props.user.role === 'DEV' ||
                this.props.user.role === 'ENGG')) {
            this.setState({ tcOpen: true })
        }
    }
    render() {
        let domains = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions);
        if (domains) {
            domains = domains.filter(item => item === 'GUI');
        }

        let subdomains = this.state.domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.domain];
        if (domains) {
            domains.sort();
        }
        if (subdomains) {
            subdomains.sort();
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
                                            <span className='rp-app-table-title'>Test Cases</span>
                                            {
                                                this.state.tcOpen &&
                                                <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                    <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                                    <span className='rp-app-table-value'>{`    Rows Displayed: ${this.state.totalRows}`}</span>
                                                    <span className='rp-app-table-value'>{`    Total: ${this.state.allRows}`}</span>
                                                    {/* <span className='rp-app-table-value'>{`    All Tcs: ${this.state.allRows}`}</span> */}
                                                </div>
                                            }


                                        </div>
                                        {/* {
                                            this.state.rowSelect &&
                                            <React.Fragment>
                                                {
                                                    this.props.user && this.state.isEditing ?
                                                        <Fragment>
                                                            <Button style={{ position: 'absolute', right: '1rem' }} title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                                <i className="fa fa-check-square-o"></i>
                                                            </Button>
                                                            <Button style={{ position: 'absolute', right: '3rem' }} size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.reset()} >
                                                                <i className="fa fa-undo"></i>
                                                            </Button>
                                                        </Fragment>
                                                        :
                                                        <Button style={{ position: 'absolute', right: '1rem' }} size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.setState({ isEditing: true })} >
                                                            <i className="fa fa-pencil-square-o"></i>
                                                        </Button>
                                                }
                                            </React.Fragment>
                                        } */}

                                    </div>
                                </div>

                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div>
                                {/* <div style={{ width: (window.screen.width * (1 - 0.248) - 20) + 'px', height: '250px', marginBottom: '6rem' }}> */}
                                <div style={{ width: '100%', height: '400px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">

                                            {/* {
                                                this.props.data &&
                                                <div class="col-md-2">
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.domain} onChange={(e) => this.onSelectDomain(e.target.value)} type="select" name="selectDomain" id="selectDomain">
                                                        <option value=''>Select Domain</option>
                                                        {
                                                            domains && domains.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            } */}
                                            {
                                                this.props.data &&
                                                <div class="col-md-2">
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.subDomain} onChange={(e) => this.onSelectSubDomain(e.target.value)} type="select" name="subDomains" id="subDomains">
                                                        <option value=''>Select SubDomain</option>
                                                        {
                                                            subdomains && subdomains.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {/* {
                                                this.props.data &&
                                                <div class="col-md-2">
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.CardType} onChange={(e) => this.onSelectCardType(e.target.value)} type="select" name="selectCardType" id="selectCardType">
                                                        <option value=''>Select Card Type</option>
                                                        {
                                                            ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            } */}
                                            {
                                                this.props.data &&
                                                <div class="col-md-2">
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.Priority} onChange={(e) => this.onSelectPriority(e.target.value)} type="select" name="selectPriority" id="selectPriority">
                                                        <option value=''>Select Priority</option>

                                                        {
                                                            ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            <div class="col-md-2">
                                                <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} type="text" id="filter-text-box" placeholder="Search..." onChange={(e) => this.onFilterTextBoxChanged(e.target.value)} />
                                            </div>

                                            {
                                                this.props.user &&

                                                <div class="col-md-2">
                                                    <span>
                                                        <Button disabled={this.state.isApiUnderProgress} id="PopoverAssign" type="button">Apply Multiple</Button>

                                                        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign" id="PopoverAssignButton">
                                                            <PopoverBody>
                                                                {
                                                                    [
                                                                        { header: 'Priority', labels: 'Priority' }
                                                                    ].map(each => <FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {

                                                                                    this.onCellEditing(item, 'Priority', e.target.value)
                                                                                    item.Priority = e.target.value;
                                                                                    // let ws = e.target.value && e.target.value !== 'ADMIN'? 'MANUAL_ASSIGNED' : 'UNASSIGNED';
                                                                                    // this.onCellEditing(item, ['Assignee', 'WorkingStatus'], [
                                                                                    //     e.target.value,
                                                                                    //     ws
                                                                                    // ])
                                                                                    // item.Assignee = e.target.value;
                                                                                    // item.WorkingStatus = ws;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.refreshView(), 0);
                                                                        }} type="select" id={`select_${each.labels}`}>
                                                                            <option value=''>Select Priority</option>
                                                                            {
                                                                                ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(item => <option value={item}>{item}</option>)
                                                                            }
                                                                            {/* <option value='ADMIN'>ADMIN</option>
                                                                        {
                                                                            this.props.users && this.props.users.map(item => <option value={item.email}>{item.email}</option>)
                                                                        } */}
                                                                        </Input>
                                                                    </FormGroup>)
                                                                }
                                                                {
                                                                    [
                                                                        { header: 'Assignee', labels: 'Assignee' }
                                                                    ].map(each => <FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {

                                                                                    this.onCellEditing(item, 'Assignee', e.target.value)
                                                                                    item.Assignee = e.target.value;
                                                                                    // let ws = e.target.value && e.target.value !== 'ADMIN'? 'MANUAL_ASSIGNED' : 'UNASSIGNED';
                                                                                    // this.onCellEditing(item, ['Assignee', 'WorkingStatus'], [
                                                                                    //     e.target.value,
                                                                                    //     ws
                                                                                    // ])
                                                                                    // item.Assignee = e.target.value;
                                                                                    // item.WorkingStatus = ws;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.refreshView(), 0);
                                                                        }} type="select" id={`select_assignee${each.labels}`}>
                                                                            {/* {
                                                                            ['P0','P1','P2','P3','P4','P5','P6','P7','P8','P9'].map(item => <option value={item}>{item}</option>)
                                                                        } */}
                                                                            <option value=''>Select Assignee</option>
                                                                            {
                                                                                this.props.users.map(item => <option value={item}>{item}</option>)
                                                                            }
                                                                        </Input>
                                                                    </FormGroup>)
                                                                }
                                                                {
                                                                    [
                                                                        { header: 'Working Status', labels: 'WorkingStatus' }
                                                                    ].map(each => <FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {

                                                                                    this.onCellEditing(item, 'WorkingStatus', e.target.value)
                                                                                    item.WorkingStatus = e.target.value;
                                                                                    // let ws = e.target.value && e.target.value !== 'ADMIN'? 'MANUAL_ASSIGNED' : 'UNASSIGNED';
                                                                                    // this.onCellEditing(item, ['Assignee', 'WorkingStatus'], [
                                                                                    //     e.target.value,
                                                                                    //     ws
                                                                                    // ])
                                                                                    // item.Assignee = e.target.value;
                                                                                    // item.WorkingStatus = ws;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.refreshView(), 0);
                                                                        }} type="select" id={`select_WS${each.labels}`}>
                                                                            <option value=''>Select Working Status</option>
                                                                            {
                                                                                ['CREATED', 'UNASSIGNED', 'DEV_ASSIGNED', 'DEV_APPROVED', 'APPROVED', 'UNAPPROVED', 'MANUAL_ASSIGNED', 'MANUAL_COMPLETED',
                                                                                    'AUTO_ASSIGNED', 'AUTO_COMPLETED', 'DELETED'
                                                                                ]
                                                                                    .map(item => <option value={item}>{item}</option>)
                                                                            }


                                                                        </Input>
                                                                    </FormGroup>)
                                                                }


                                                            </PopoverBody>
                                                        </UncontrolledPopover>
                                                    </span>

                                                    <span>
                                                        {
                                                            this.isAnyChanged &&
                                                            <Button disabled={this.state.isApiUnderProgress} title="Undo" size="md" color="transparent" className="rp-rb-save-btn" onClick={() => this.undo()} >
                                                                <i className="fa fa-undo"></i>
                                                            </Button>
                                                        }
                                                    </span>
                                                    <span>
                                                        {
                                                            this.isAnyChanged &&
                                                            <Button disabled={this.state.isApiUnderProgress} title="Save" size="md" color="transparent" className="rp-rb-save-btn" onClick={() => this.saveAll()} >
                                                                <i className="fa fa-check-square-o"></i>
                                                            </Button>
                                                        }
                                                    </span>




                                                </div>
                                            }


                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="myGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                onSelectionChanged={(e) => this.onSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                onRowClicked={(e) => this.rowSelect(e)}
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

                                            />
                                        </div>
                                        {/* {
                                            !this.state.open &&
                                            this.state.rowSelect &&
                                            this.props.tcDetails && this.props.tcDetails.TcID &&
                                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                                <i className="fa fa-angle-down rp-save-tc-icon" onClick={() => this.setState({ open: !this.state.open })}> More</i>
                                            </div>
                                        }
                                        {
                                            this.state.open &&
                                            this.state.rowSelect &&
                                            this.props.tcDetails && this.props.tcDetails.TcID &&
                                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                                <i className="fa fa-angle-up rp-save-tc-icon" onClick={() => this.setState({ open: !this.state.open })}> Less</i>
                                            </div>
                                        } */}
                                    </div>
                                    <div style={{ float: 'right', display: this.state.isApiUnderProgress || this.state.CardType || this.state.domain || this.state.subDomain ? 'none' : '' }}>
                                        <Button onClick={() => this.paginate(-1)}>Previous</Button>
                                        <span  >{`   Page: ${this.pageNumber}   `}</span>

                                        <Button onClick={() => this.paginate(1)}>Next</Button>

                                    </div>


                                </div>
                                <div>

                                </div>
                                <Collapse isOpen={this.state.rowSelect}>
                                    {
                                        this.props.user && this.props.user.email && this.props.tcDetails && this.props.tcDetails.TcID &&
                                        <React.Fragment>
                                            {
                                                this.state.isEditing ?
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                                            <i className="fa fa-check-square-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.reset()} >
                                                            <i className="fa fa-undo"></i>
                                                        </Button>
                                                    </Fragment>
                                                    :
                                                    <Fragment>

                                                        {/* <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggleDelete()} >
                                                            <i className="fa fa-trash-o"></i>
                                                        </Button> */}
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
                                            <div class="row">
                                                <div class='col-md-12'>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <div className={`c-callout c-callout-total`}>
                                                                <small style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: '500'

                                                                }} class="text-muted">TC ID</small><br></br>
                                                                <strong class="h5">{this.props.tcDetails.TcID}</strong>
                                                            </div>
                                                        </div>
                                                        {
                                                            this.props.tcDetails && this.props.tcDetails.StatusList && this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1] ?
                                                                <div class="col-md-2">
                                                                    <div className={`c-callout c-callout-${this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Result.toLowerCase()}`}>
                                                                        <small style={{
                                                                            fontSize: '13px',
                                                                            fontWeight: '500'

                                                                        }} class="text-muted">Current Status</small><br></br>
                                                                        <strong class="h5">{this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Result}</strong>
                                                                    </div>
                                                                </div> :
                                                                <div class="col-md-2">
                                                                    <div className={`c-callout c-callout-nottested`}>
                                                                        <small style={{
                                                                            fontSize: '13px',
                                                                            fontWeight: '500'

                                                                        }} class="text-muted">Current Status</small><br></br>
                                                                        <strong class="h5">NOT TESTED</strong>
                                                                    </div>
                                                                </div>
                                                        }
                                                        {this.props.tcDetails && this.props.tcDetails.StatusList && this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1] ?
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-total`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Current Build</small><br></br>
                                                                    <strong class="h5">{this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Build}</strong>
                                                                </div>
                                                            </div> :
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-nottested`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Current Build</small><br></br>
                                                                    <strong class="h5">NOT AVAILABLE</strong>
                                                                </div>
                                                            </div>
                                                        }
                                                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.CardType ?
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-total`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Card Type</small><br></br>
                                                                    <strong class="h5">{this.props.tcDetails.CardType}</strong>
                                                                </div>
                                                            </div> :
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-nottested`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">CardType</small><br></br>
                                                                    <strong class="h5">NOT AVAILABLE</strong>
                                                                </div>
                                                            </div>
                                                        }
                                                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.ServerType ?
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-total`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Server Type</small><br></br>
                                                                    <strong class="h5">{this.props.tcDetails.ServerType.join(',')}</strong>
                                                                </div>
                                                            </div> :
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-nottested`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Server Type</small><br></br>
                                                                    <strong class="h5">NOT AVAILABLE</strong>
                                                                </div>
                                                            </div>
                                                        }
                                                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.WorkingStatus ?
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-total`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Working Status</small><br></br>
                                                                    <strong class="h5">{this.props.tcDetails.WorkingStatus}</strong>
                                                                </div>
                                                            </div> :
                                                            <div class="col-md-2">
                                                                <div className={`c-callout c-callout-nottested`}>
                                                                    <small style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'

                                                                    }} class="text-muted">Working Status</small><br></br>
                                                                    <strong class="h5">NOT AVAILABLE</strong>
                                                                </div>
                                                            </div>
                                                        }


                                                    </div>
                                                    {/* <span className='rp-app-table-value'>TC ID: {this.props.tcDetails.TcID}</span>
                                <span style={{marginLeft: '2rem'}} className='rp-app-table-value'>Current Status: {this.props.tcDetails.StatusList[0].Result}</span>
                                <span style={{marginLeft: '2rem'}} className='rp-app-table-value'>Current Build: {this.props.tcDetails.StatusList[0].Build}</span>
                                <span style={{marginLeft: '2rem'}} className='rp-app-table-value'>Card Type: {this.props.tcDetails.StatusList[0].CardType}</span> */}
                                                    {/* <div style={{ display: 'inline', marginLeft: '2rem' }}>
                                    <div style={{ display: 'inline' }}>
                                        <span>Created on </span><span style={{
                                            fontSize: '16px',
                                            color: '#04381a',
                                            marginRight: '1rem'
                                        }}>{this.props.tcDetails.Date}</span>
                                        <span>Created by</span><span style={{
                                            fontSize: '16px',
                                            color: '#04381a',
                                            marginRight: '1rem'
                                        }}> {this.props.tcDetails.Created}</span>
                                    </div>
                                </div> */}
                                                </div>
                                            </div>
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
                                                    <div className='rp-app-table-title'>Test Status</div>
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
                                                                    rowSelection='multiple'
                                                                    onGridReady={(params) => this.onBuildGridReady(params)}
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

                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    {
                        !this.state.toggleMessage &&
                        <ModalHeader toggle={() => this.toggle()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            this.state.toggleMessage ? this.state.toggleMessage : `Are you sure you want to make the changes?`
                        }
                        {
                            !this.state.toggleMessage && this.props.testcaseEdit.original &&
                            < React.Fragment >
                                <Row>
                                    <Col xs="11" md="11" lg="11">
                                        <div>Original</div>
                                        <div style={{ width: '450px', height: '150px', marginBottom: '3rem' }}>
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
                                                        columnDefs={this.state.editColumnDefs}
                                                        defaultColDef={this.state.defaultColDef}
                                                        rowData={[this.props.testcaseEdit.original]}

                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs="11" md="11" lg="11">
                                        <div>Updated</div>
                                        <div style={{ width: '450px', height: '150px', marginBottom: '3rem' }}>
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
                                                        columnDefs={this.state.editColumnDefs}
                                                        defaultColDef={this.state.defaultColDef}
                                                        rowData={[this.props.testcaseEdit]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.state.toggleMessage ? this.toggle() : this.save()}>Ok</Button>{' '}
                        {
                            !this.state.toggleMessage &&
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
                        <Button color="primary" onClick={() => { this.delete(); this.toggleDelete(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleDelete()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div >

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users.map(item => item.email),
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.testcase.all[state.release.current.id],
    tcDetails: state.testcase.testcaseDetail,
    tcStrategy: getTCForStrategy(state, state.release.current.id),
    testcaseEdit: state.testcase.testcaseEdit
})
export default connect(mapStateToProps, { saveTestCase, getCurrentRelease, saveSingleTestCase, updateTCEdit })(GuiTestCases);





                // {
                //     headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                //     editable: true,
                //     cellEditor: 'selectionEditor',
                //     cellEditorParams: {
                //         values: ['achavan@diamanti.com']
                //     }
                // },
                // {
                //     headerName: "Orchestration Platform", field: "OrchestrationPlatform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                //     editable: true,
                //     cellEditor: 'selectionEditor',
                //     cellEditorParams: {
                //         values: ['dcx-k8s']
                //     }
                // },
                // {
                //     headerName: 'Mood', field: "mood", cellRenderer: "moodRenderer",
                //     cellEditorParams: {
                //         values: ['Toyota', 'Ford', 'Porsche']
                //     },
                //     cellEditor: "moodEditor",
                //     editable: true,
                // },
                // {
                //     headerName: 'Date', field: "date",
                //     cellEditor: "datePicker",
                //     filter: 'agDateColumnFilter',
                //     sortable: true,
                //     editable: true,
                // },
                // {
                //     headerName: "Model", field: "model", sortable: true, filter: true, editable: true, cellStyle: this.renderEditedCell,
                //     cellEditor: 'agLargeTextCellEditor',
                //     cellEditorParams: {
                //         maxLength: '300',   // override the editor defaults
                //         cols: '50',
                //         rows: '6'
                //     }
                // },
                // {
                //     headerName: "Price", field: "price", sortable: true, filter: 'agNumberColumnFilter', valueParser: this.numberParser,
                //     cellStyle: this.renderEditedCell, editable: true,
                //     cellEditor: 'numericEditor'
                // }