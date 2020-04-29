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
import { getEachTCStatusScenario } from '../../reducers/testcase.reducer';
import { saveSingleTestCase, saveTestCase, updateTCEdit, saveReleaseBasicInfo } from '../../actions';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    UncontrolledPopover, PopoverHeader, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './TestCases.scss';
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
class TestCases extends Component {
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
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while table or Tc is loading</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',
            rowSelect: false,
            isEditing: false,
            delete: false,
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
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                },
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

    getEditedCells() {
        var cellDefs = this.gridApi.getEditingCells();
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
    toggleAll = () => {
        this.setState({ multipleChanges: !this.state.multipleChanges })
    };
    onSelectDomain(domain) {
        this.deselect(true);
        if (domain === '') {
            domain = null;
        } else {
            this.getTcByDomain(domain);
        }
        
        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ domain: domain, subDomain: '' });
        this.getTcs(this.state.CardType, domain, '', this.state.Priority);
    }
    getTcByDomain(domain) {
        this.gridOperations(false);
        axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcinfo/domain/' + domain)
        .then(all => {
            if (all && all.data.length) {
                axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + domain)
                    .then(res => {
                        this.gridOperations(true);
                        // this.props.saveTestCase({ id: this.props.selectedRelease.ReleaseNumber, data: res.data })
                        this.setState({ doughnuts: getEachTCStatusScenario({ data: res.data, domain: domain, all: all.data }) })
                    }, error => {
                        this.gridOperations(true);
                    });
            }
        }, error => {
            this.gridOperations(true);
        })
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
        this.setState({
            isEditing: false, rowSelect: true, toggleMessage: null, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0,
            selectedRows: this.gridApi.getSelectedRows().length, totalRows: this.gridApi.getModel().rowsToDisplay.length
        })
        this.getTC(e.data);
    }
    getTcs(CardType, domain, subDomain, priority, all, selectedRelease) {
        let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
        if (!release) {
            return;
        }
        this.gridOperations(false);
        let startingIndex = this.pageNumber * this.rows;
        this.deselect(true);
        this.props.saveTestCase({ data: [], id: release });
        this.props.saveSingleTestCase({});
        let url = `/api/wholetcinfo/${release}?index=${startingIndex}&count=${this.rows}`;
        if (all) {
            url = `/api/wholetcinfo/${release}`;
        }
        if (CardType || domain || subDomain || priority) {
            url = `/api/wholetcinfo/${release}?`;
            if (CardType) url += ('&CardType=' + CardType);
            if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        console.log(url);
        axios.get(url)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.props.saveTestCase({ data: all.data, id: release });
                setTimeout(this.gridApi.redrawRows(), 0)
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
        // this.toggle();
        this.gridOperations(false);
        let statusItems = [];
        let items = [];
        let selectedRows = this.gridApi.getSelectedRows();
        selectedRows.forEach(item => {
            let pushable = {
                TcID: item.TcID,
                CardType: item.CardType,
                Activity: {
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "TcID": item.TcID,
                    CardType: item.CardType,
                    "UserName": this.props.user.email,
                    LogData: ``,
                    "RequestType": 'PUT',
                    "URL": `/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`
                }
            };
            if (item.Priority) {
                pushable.Priority = item.Priority
                let old = `${item.Priority}`;
                if (this.editedRows[`${item.TcID}_${item.CardType}`] && this.editedRows[`${item.TcID}_${item.CardType}`].Priority) {
                    old = `${this.editedRows[`${item.TcID}_${item.CardType}`].Priority.originalValue}`
                }
                pushable.Activity.LogData += `Priority:{old: ${old}, new: ${item.Priority}}, `
            }
            if (item.Assignee) {
                pushable.Assignee = item.Assignee
                let old = `${item.Assignee}`;
                if (this.editedRows[`${item.TcID}_${item.CardType}`] && this.editedRows[`${item.TcID}_${item.CardType}`].Assignee) {
                    old = `${this.editedRows[`${item.TcID}_${item.CardType}`].Assignee.originalValue}`
                }
                pushable.Activity.LogData += `Assignee:{old: ${old}, new: ${item.Assignee}}, `
            }
            if (item.WorkingStatus) {
                pushable.WorkingStatus = item.WorkingStatus
                let old = `${item.WorkingStatus}`;
                if (this.editedRows[`${item.TcID}_${item.CardType}`] && this.editedRows[`${item.TcID}_${item.CardType}`].WorkingStatus) {
                    old = `${this.editedRows[`${item.TcID}_${item.CardType}`].WorkingStatus.originalValue}`
                }
                pushable.Activity.LogData += `WorkingStatus:{old: ${old}, new: ${item.WorkingStatus}}, `
            }

            if(this.state.multi && this.state.multi.Build) {
                let status = {};
                status.Domain = item.Domain;
                status.SubDomain = item.SubDomain;
                status.TcName = item.TcName;
                status.Build = this.state.multi.Build;
                status.Result = this.state.multi.Result;
                status.CardType = item.CardType;
                status.TcID = item.TcID;
                status.Activity = {
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "TcID": item.TcID,
                    "CardType": item.CardType,
                    "UserName": this.props.user.email,
                    "LogData": `Status Added: Build: ${this.state.multi.Build}, Result: ${this.state.multi.Result}, CardType: ${item.CardType}`,
                    "RequestType": 'POST',
                    "URL": `/api/tcstatus/${this.props.selectedRelease.ReleaseNumber}`
                }
                statusItems.push(status)
            }
            items.push(pushable);
        })
        if(items.length===0 && statusItems.length === 0) {
            return;
        }
        this.props.saveTestCase({ data: [], id: this.props.selectedRelease.ReleaseNumber });
        this.props.saveSingleTestCase({});
        console.log(statusItems)
        console.log(items)
        if(statusItems.length>0) {
            this.gridOperations(false);
            axios.post(`/api/tcstatusUpdate/${this.props.selectedRelease.ReleaseNumber}`, statusItems)
            .then(res => {
                this.gridOperations(true);
                this.setState({multi: {}});
                if(items.length>0) {
                    this.sendTcUpdate(items)
                } else {
                    this.undo();
                    alert('successfully updated TCs');
                }
            }, error => {
                this.gridOperations(true);
                alert('failed to update TCs');
            });
        } else {
            this.sendTcUpdate(items)
        }
        this.props.updateTCEdit({ Master: true, errors: {} });
        this.setState({ rowSelect: false, toggleMessage: null, isEditing: false, multi: { Priority: '', Assignee: '', WorkingStatus: '' } })
    }

    sendTcUpdate(items) {
        this.gridOperations(false);
        axios.put(`/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`, items)
        .then(res => {
            this.gridOperations(true);
            this.undo();
            alert('successfully updated TCs');
        }, error => {
            this.gridOperations(true);
            alert('failed to update TCs');
        });
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
                this.setState({ isApiUnderProgress: false, loading: false });
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

        if (this.props.testcaseEdit.CurrentStatus === 'Pass' || this.props.testcaseEdit.CurrentStatus === 'Fail') {
            let status = {};
            status.Domain = this.props.tcDetails.Domain;
            status.SubDomain = this.props.tcDetails.SubDomain;
            status.TcName = this.props.tcDetails.TcName;
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
                    if (this.props.testcaseEdit.NewTcID) {
                        data.NewTcID = this.props.testcaseEdit.NewTcID
                        data.Activity.LogData += `NewTcId: ${this.props.testcaseEdit.NewTcID} updated`
                    }
                    if(data.Activity.LogData.length<5) {
                        this.setState({ errors: {}, toggleMessage: `TC ${data.TcID} Updated Successfully` });
                        this.deselect();
                        this.toggle();
                        axios.get(`/api/release/all`)
                        .then(res => {
                          res.data.forEach(item => {
                            // this.props.updateNavBar({ id: item.ReleaseNumber });
                            this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
                          });
                        }, error => {
                        });
                        setTimeout(() => {
                            this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                            this.gridOperations(true);
                        }, 400);
                    } else {
                        setTimeout(() => axios.put(`/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${data.TcID}/card/${this.props.tcDetails.CardType}`, { ...data })
                        .then(res => {
                            this.setState({ errors: {}, toggleMessage: `TC ${data.TcID} Updated Successfully` });
                            this.deselect();
                            this.toggle();
                            axios.get(`/api/release/all`)
                            .then(res => {
                              res.data.forEach(item => {
                                // this.props.updateNavBar({ id: item.ReleaseNumber });
                                this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
                              });
                            }, error => {
                            });
                            setTimeout(() => {
                                this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                                this.gridOperations(true);
                            }, 400);
                        }, error => {
                            alert('failed to update tc')
                            this.gridOperations(true);
                        }, 400));
                    }
                }, error => {
                    alert('failed to update tc')
                    console.log('failed updating status')
                    this.gridOperations(true);
                });
        } else {
            if (this.props.testcaseEdit.NewTcID) {
                data.NewTcID = this.props.testcaseEdit.NewTcID
                data.Activity.LogData += `NewTcId: ${this.props.testcaseEdit.NewTcID} updated`
            }
            axios.put(`/api/tcinfoput/${this.props.selectedRelease.ReleaseNumber}/id/${data.TcID}/card/${this.props.tcDetails.CardType}`, { ...data })
                .then(res => {
                    this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.props.testcaseEdit.TcID} Updated Successfully` });
                    this.deselect();
                    this.toggle();
                    setTimeout(() => {
                        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain);
                        this.gridOperations(true);
                    }, 400);
                }, error => {
                    alert('failed to update tc')
                    this.gridOperations(true);
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
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, this.state.priority);
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

    onBuildGridReady = (params) => {
        this.buildGridApi = params.api;
        this.buildGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    }
    initialize() {

    }
    componentDidMount() {
        setTimeout(() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain), 400);
        if (this.props.user &&
            (this.props.user.role === 'ADMIN' || this.props.user.role === 'QA' || this.props.user.role === 'DEV' ||
                this.props.user.role === 'ENGG')) {
            this.setState({ tcOpen: true })
        }
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.editedRows = {};
            this.isAnyChanged = false;
            this.setState({
                rowSelect: false, CardType: '', domain: '', subDomain: '',Priority: '',
                isEditing: false})
            setTimeout(() => this.getTcs(null, null, null, null, null, newProps.selectedRelease.ReleaseNumber), 400);
        }
    }
    getAlltcs() {
        this.setState({ loading: true })
        this.getTcs(null, null, null, null, true);
    }
    render() {
        let domains = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions);
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

        let pass=0,fail=0,automated=0,total=0;
        if(this.state.domain && this.state.doughnuts) {
            if(this.state.CardType) {
               let card = this.state.doughnuts.filter(d => d.CardType === this.state.CardType)[0];
               if(card) {
                if(this.state.subDomain && card.SubDomains[this.state.subDomain]) {
                    pass = card.SubDomains[this.state.subDomain].Pass;
                    fail = card.SubDomains[this.state.subDomain].Fail;
                    total = card.SubDomains[this.state.subDomain].Total; 
                } else {
                    Object.keys(card.SubDomains).forEach(subdomain => {
                        pass += card.SubDomains[subdomain].Pass;
                        fail += card.SubDomains[subdomain].Fail;
                        total += card.SubDomains[subdomain].Total;
                    })
                }
               }
               } else {
                this.state.doughnuts.forEach(card => {
                    if(this.state.subDomain && card.SubDomains[this.state.subDomain]) {
                        pass += card.SubDomains[this.state.subDomain].Pass;
                        fail += card.SubDomains[this.state.subDomain].Fail;
                        total += card.SubDomains[this.state.subDomain].Total; 
                    } else {
                        Object.keys(card.SubDomains).forEach(subdomain => {
                            pass += card.SubDomains[subdomain].Pass;
                            fail += card.SubDomains[subdomain].Fail;
                            total += card.SubDomains[subdomain].Total;
                        })
                    }
                });
               }
        } else {
            if(this.props.selectedRelease && this.props.selectedRelease.TcAggregate) {
                let tcAggr = this.props.selectedRelease.TcAggregate.all;
                pass = tcAggr.Tested.manual.Pass + tcAggr.Tested.auto.Pass;
                // automated = tcAggr.Tested.auto.Pass + tcAggr.Tested.auto.Fail;
                fail = tcAggr.Tested.manual.Fail + tcAggr.Tested.auto.Fail;
                total = pass+fail+tcAggr.Tested.manual.Skip+tcAggr.Tested.auto.Skip+tcAggr.NotTested+tcAggr.NotApplicable
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
                                        <span className='rp-app-table-title'>{this.props.title}</span>
                                            {
                                                this.state.loading && <span style={{ 'marginLeft': '2rem' }}>Please Wait for approx 3 mins to load complete table...</span>
                                            }

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
                                {/* <div style={{ width: (window.screen.width * (1 - 0.248) - 20) + 'px', height: '250px', marginBottom: '6rem' }}> */}
                                <div style={{ width: '100%', height: '400px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">

                                            {
                                                this.props.data &&
                                                <div style={{width: '9rem',marginLeft:'1.5rem'}}>
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.domain} onChange={(e) => this.onSelectDomain(e.target.value)} type="select" name="selectDomain" id="selectDomain">
                                                        <option value=''>Select Domain</option>
                                                        {
                                                            domains && domains.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.props.data &&
                                                <div style={{width: '9rem',marginLeft:'0.5rem'}}>
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.subDomain} onChange={(e) => this.onSelectSubDomain(e.target.value)} type="select" name="subDomains" id="subDomains">
                                                        <option value=''>Select SubDomain</option>
                                                        {
                                                            subdomains && subdomains.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.props.data &&
                                                <div style={{width: '9rem',marginLeft:'0.5rem'}}>
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.CardType} onChange={(e) => this.onSelectCardType(e.target.value)} type="select" name="selectCardType" id="selectCardType">
                                                        <option value=''>Select Card Type</option>
                                                        {
                                                            ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.props.data &&
                                                <div style={{width: '8rem',marginLeft:'0.5rem'}}>
                                                    <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} value={this.state.Priority} onChange={(e) => this.onSelectPriority(e.target.value)} type="select" name="selectPriority" id="selectPriority">
                                                        <option value=''>Select Priority</option>

                                                        {
                                                            ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            <div style={{width: '5rem' ,marginLeft:'0.5rem'}}>
                                                <Input disabled={this.state.isApiUnderProgress} style={{ fontSize: '12px' }} type="text" id="filter-text-box" placeholder="Search..." onChange={(e) => this.onFilterTextBoxChanged(e.target.value)} />
                                            </div>
                                            <div style={{ width: '3rem', marginLeft: '0.5rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} id="getall" onClick={() => this.getAlltcs()} type="button">All</Button>
                                            </div>
                                            {
                                                this.props.user &&

                                                <div style={{width: '8rem',marginLeft:'0.5rem'}}>
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
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_${each.labels}`}>
                                                                            <option value=''>Select Priority</option>
                                                                            {
                                                                                ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(item => <option value={item}>{item}</option>)
                                                                            }
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
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_assignee${each.labels}`}>
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
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_WS${each.labels}`}>
                                                                            <option value=''>Select Working Status</option>
                                                                            {
                                                                                ['CREATED', 'UNASSIGNED', 'DEV_ASSIGNED', 'DEV_APPROVED', 'APPROVED', 'UNAPPROVED', 'MANUAL_ASSIGNED', 'MANUAL_COMPLETED',
                                                                                    'AUTO_ASSIGNED', 'AUTO_COMPLETED', 'DELETED'
                                                                                ].map(item => <option value={item}>{item}</option>)
                                                                            }
                                                                        </Input>
                                                                    </FormGroup>)
                                                                }

                                                                    
                                                                        {/* <Row>
                                                                {
                                                                    [
                                                                        { header: 'Result', labels: 'Result', type:'select', 
                                                                        options: [
                                                                            {value: '', text: 'Select Result...'},{value: 'Pass', text: 'Pass'},{value: 'Fail', text: 'Fail'},
                                                                        ]},
                                                                        { header: 'Build', labels: 'Build', type:'text' }
                                                                    ].map(each => <Col md="6"><FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        {
                                                                            each.type==='select' &&
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {
                                                                                   this.onCellEditing(item, 'CurrentStatus.Result', e.target.value)
                                                                                    item['CurrentStatus.Result'] = e.target.value;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_Result${each.labels}`}>
                                                                            {
                                                                                    each.options.map(item => <option value={item.value}>{item.text}</option>)
                                                                            }
                                                                        </Input>
                                                                        }
                                                                        {
                                                                            each.type==='text' &&
                                                                        <Input disabled={this.state.isApiUnderProgress} value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {
                                                                                   this.onCellEditing(item, 'CurrentStatus.Build', e.target.value)
                                                                                    item['CurrentStatus.Build'] = e.target.value;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="text" id={`select_Build${each.labels}`}>
                                                                        </Input>
                                                                        }
                                                                        </FormGroup></Col>)
                                                                }
                                                                </Row> */}
                                                    <div style={{float: 'right' ,marginBottom: '0.5rem'}}>
                                                                      
                                                        <span>
                                                            {
                                                                this.isAnyChanged &&
                                                                <Button disabled={this.state.isApiUnderProgress} title="Undo" size="md"  className="rp-rb-save-btn" onClick={() => this.undo()} >
                                                                    {/* <i className="fa fa-undo"></i> */} Undo
                                                                </Button>
                                                            }
                                                        </span>
                                                        <span>
                                                            {
                                                                this.isAnyChanged &&
                                                                <Button disabled={this.state.isApiUnderProgress} title="Save" size="md"  className="rp-rb-save-btn" onClick={() => this.toggleAll()} >
                                                                    {/* <i className="fa fa-save"></i> */} Save
                                                                </Button>
                                                            }
                                                        </span>
                                                    </div>


                                                            </PopoverBody>
                                                        </UncontrolledPopover>
                                                    </span>
                                                
                                                </div>
                                            }
                                            <div style={{width: '6rem',marginLeft:'0.5rem'}}>
                                            <Button disabled={this.state.isApiUnderProgress} title="CSV" size="md"  className="rp-rb-save-btn" onClick={() => {
                                                if(this.gridApi) {
                                                    this.gridApi.exportDataAsCsv();
                                                }
                                            }} >
                                                                    {/* <i className="fa fa-save"></i> */} Download
                                                                </Button>
                                            </div>


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
                                                suppressScrollOnNewData={true}
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
                                                rowMultiSelectWithClick={true}
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
                                    <div style={{display: 'inline'}}>
                                        <div style={{display: 'inline'}}>
                                        <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>Pass: {pass}</span>
                                        <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>Fail: {fail}</span>
                                        {/* <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>Automated: {automated}</span> */}
                                        <span style={{marginLeft: '0.5rem'}} className='rp-app-table-value'>Total: {total}</span>
                                        </div>
                                    <div style={{
                                        float: 'right', display: this.state.isApiUnderProgress || this.state.CardType || this.state.domain || this.state.subDomain ||
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
                                                this.state.isEditing ?
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                                            <i className="fa fa-save"></i>
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
                                                                <strong style={{wordWrap: 'break-word'}} class="h5">{this.props.tcDetails.TcID}</strong>
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
                            !this.state.toggleMessage &&
                            < React.Fragment >
                                <Row>
                                    <Col xs="11" md="11" lg="11">
                                        
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
                        <Button color="primary" onClick={() => { this.saveAll(); this.toggleAll(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleAll()}>Cancel</Button>
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
export default connect(mapStateToProps, { saveTestCase, getCurrentRelease, saveSingleTestCase, updateTCEdit, saveReleaseBasicInfo })(TestCases);





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
                //     headerName: "Price", field: "price", sortable: true, valueParser: this.numberParser,
                //     cellStyle: this.renderEditedCell, editable: true,
                //     cellEditor: 'numericEditor',
                // filter: 'agNumberColumnFilter', 
                // }