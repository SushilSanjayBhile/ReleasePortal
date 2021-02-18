import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { getCurrentRelease }  from '../../reducers/release.reducer';
import { saveUI, saveSingleUI, updateUIEdit, updateSanityEdit } from '../../actions';
import {
    Col, Button,Input, FormGroup, Label
} from 'reactstrap';
import './UITestCases.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import NumericEditor from "./numericEditor";
import SelectionEditor from './selectionEditor';
import DatePickerEditor from './datePickerEditor';

class UITestCases extends Component {
    cntr = 0;
    pageNumber = 0;
    rows = 15;
    editedRows = {};
    isApiUnderProgress = false;
    isAnyChanged = false;
    constructor(props) {
        super(props);
        this.state = {
            sanityDetails: null, 
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
                    headerName: "Tc ID", field: "id", sortable: true, filter: true, cellStyle: this.renderEditedCell,
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
                    checkboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    cellStyle: { alignItems: 'top' },
                    headerName: "Date", field: "Date", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: "datePicker",
                    filter: 'agDateColumnFilter',
                    width: 150
                },
                {
                    headerName: "Setup Type", field: "Setup", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true,
                    width:100
                },

                {
                    headerName: "Build", field: "Build", 
                    editable: true, 
                    sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    width:100
                },
                {
                    headerName: "Result", field: "Result",
                     editable: true,
                      sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Result', 'Fail', 'Pass']
                    },
                    width:100
                },
                {
                    headerName: "Bugs", field: "Bugs",
                     editable: true, 
                     sortable: true, filter: true, cellStyle: this.renderEditedCell, width: 100, cellClass: 'cell-wrap-text',
                },
                {
                    headerName: "Passed Tcs", field: "NoOfTCsPassed", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                    cellEditor: 'numericEditor',
                    filter: 'agNumberColumnFilter',
                    editable: true,
                },
                

                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell,width: '100',
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Card', 'NYNJ', 'BOS', 'COMMON', 'SOFTWARE']
                    }

                },
                {
                    headerName: "User", field: "User", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '150',
                    cellClass: 'cell-wrap-text',
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Assignee', 'Jenkin', ...this.props.users]
                    }
                },
                {
                    headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    width: '420',
                    editable: true,
                    cellClass: 'cell-wrap-text',
                    autoHeight: true
                },
               
            ],
            defaultColDef: { resizable: true },

            uiColumnDefs: [{
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
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },
        }
    }
    componentDidMount() {
        this.props.updateSanityEdit({});
        this.getTcs();
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

    getRowHeight = (params) => {
       
        if (params.data && params.data.LogData) {
            return 28 * (Math.floor(params.data.LogData.length / 60) + 1);
        }
        return 28;
    }
    getActivityRowHeight = (params) => {
        if (params.data && params.data.LogData) {
            return 28 * (Math.floor(params.data.LogData.length / 60) + 1);
        }
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
        return 2;
    }
    getTC(e) {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        this.props.saveSingleUI(e);
        this.props.updateUIEdit({ ...e, errors: {}, original: e });
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.updateSanityEdit({});
            this.getTcs(newProps.selectedRelease.ReleaseNumber);
        }
        if (newProps && this.props && this.props.e2eCounter && newProps.e2eCounter !== this.props.e2eCounter) {
            this.getTcs();
        }
        if (newProps && this.props && this.props.saveCounter && newProps.saveCounter !== this.props.saveCounter) {
            this.save();
        }
        if (newProps && this.props && this.props.deleteCounter && newProps.deleteCounter !== this.props.deleteCounter) {
            this.delete();
        }
    }
    delete = () => {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        if (!this.gridApi) {
            return;
        }
        let items = this.gridApi.getSelectedRows();

        if (items.length <= 0) {
            alert('Please select atleast one UI to delete');
            return;
        }
        let sendingItems = items.map(each => ({
            id:each.id,
            Date: each.Date,
            Setup: each.Setup,
            Build: each.Build,
            Bugs: each.Bugs,
            UIFocus: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.UIFocus : each.UIFocus,
            UISkipList: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.UISkipList : each.UISkipList,
            NoOfTCsPassed: each.NoOfTCsPassed,
            Notes: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.Notes : each.Notes,
            User: each.User,
            Result: `${each.Result}`,
            CardType: `${each.CardType}`, 
            Activity: {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": each.id,
                CardType: each.CardType,
                "UserName": this.props.user.email,
                LogData: `${this.props.user.email} deleted ui ${each.id}`,
                "RequestType": 'DELETE',
                "URL": `/api/sanity/uiDelete/${this.props.selectedRelease.ReleaseNumber}`
            }
        }));

        this.gridOperations(false);

        let url = `/api/sanity/uiDelete/${this.props.selectedRelease.ReleaseNumber}`;
        axios.post(url, sendingItems)
            .then(all => {
                this.deselect();
                this.getTcs();
                setTimeout(this.gridApi.refreshView(), 0)

                this.gridOperations(true);

            }).catch(err => {
                alert('failed to delete ui results');
                this.gridOperations(true);
            })

    }
    save = () => {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        if (!this.gridApi) {
            return;
        }
        let items = [...this.gridApi.getSelectedRows()];
        let edited = this.gridApi.getEditingCells();
        if (items.length <= 0) {
            alert('Please select atleast one UI to save');
            return;
        }
        let sendingItems = items.map(each => ({
            id:each.id,
            Date: each.Date,
            Setup: each.Setup,
            Build: each.Build,
            Bugs: each.Bugs,
            UIFocus: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.UIFocus : each.UIFocus,
            UISkipList: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.UISkipList : each.UISkipList,
            NoOfTCsPassed: each.NoOfTCsPassed,
            Notes: each.Notes,
            User: each.User,
            Result: `${each.Result}`,
            CardType: `${each.CardType}`, 
            Notes: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.Notes : each.Notes,
            Activity: {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": each.id,
                CardType: each.CardType,
                "UserName": this.props.user.email,
                LogData: `${this.props.user.email} updated UI ${each.id}`,
                "RequestType": 'PUT',
                "URL": `/api/sanity/uiUpdate/${this.props.selectedRelease.ReleaseNumber}`
            }
        }))

        this.gridOperations(false);

        let url = `/api/sanity/uiUpdate/${this.props.selectedRelease.ReleaseNumber}`;
        axios.post(url, sendingItems)
            .then(all => {
                this.deselect();
                this.getTcs();
                setTimeout(this.gridApi.refreshView(), 0)

                this.gridOperations(true);

            }).catch(err => {
                alert('failed to update ui results');
                this.gridOperations(true);
            })
    }
    deselect(updateTotalRows) {
        this.editedRows = {};
        if (this.gridApi) {
            this.gridApi.deselectAll();
        }
        this.props.saveSingleUI({});
        this.props.updateUIEdit({ Master: true, errors: {}, original: null });
        if (!updateTotalRows) {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, totalRows: this.gridApi.getModel().rowsToDisplay.length, selectedRows: this.gridApi.getSelectedRows().length })
        } else {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, selectedRows: 0, totalRows: 0 })
        }
    }
    renderEditedCell = (params) => {
        let editedInRow = this.editedRows[`id${params.data.id}`] && this.editedRows[`id${params.data.id}`][params.colDef.field] && this.editedRows[`id${params.data.id}`][params.colDef.field].originalValue !== params.value;
        if (editedInRow) {
            this.editedRows[`id${params.data.id}`].Changed = true;
            return {
                backgroundColor: 'rgb(209, 255, 82)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'rgb(255, 166, 0)',
                wordWrap: 'break-word'
            };
        }
        return { backgroundColor: '', wordWrap: 'break-word' };
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onCellEditingStarted = params => {
        if (this.editedRows[`id${params.data.id}`]) {
            if (this.editedRows[`id${params.data.id}`][params.colDef.field]) {
                this.editedRows[`id${params.data.id}`][params.colDef.field] =
                    { ...this.editedRows[`id${params.data.id}`][params.colDef.field], oldValue: params.value }
            } else {
                this.editedRows[`id${params.data.id}`] =
                    { ...this.editedRows[`id${params.data.id}`], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        } else {
            this.editedRows[`id${params.data.id}`] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
        }
    }
    onCellEditing = (params, field, value) => {
        if (this.editedRows[`id${params.data.id}`]) {
            if (this.editedRows[`id${params.data.id}`][field]) {
                this.editedRows[`id${params.data.id}`][field] =
                    { ...this.editedRows[`id${params.data.id}`][field], oldValue: params[field], newValue: value }
            } else {
                this.editedRows[`id${params.data.id}`] =
                    { ...this.editedRows[`id${params.data.id}`], [field]: { oldValue: params[field], originalValue: params[field], newValue: value } }
            }

        } else {
            this.editedRows[`id${params.data.id}`] = {
                id: { oldValue: `${params.id}`, originalValue: `${params.id}`, newValue: `${params.id}` },
                [field]: { oldValue: params[field], originalValue: params[field], newValue: value }
            }
        }
    }
    onSelectionChanged = (event) => {
        if(event.api.getSelectedRows().length !== 1) {
            this.setState({sanityDetails: null, isEditing: false, selectedRows: event.api.getSelectedRows().length})
        } else {
            let row = event.api.getSelectedRows()[0];
            if(row) {
                this.setState({selectedRows: 1, sanityDetails: {
                    ...row, oldNotes: row.Notes+'', oldUIFocus: row.UIFocus, oldUISkipList: row.UISkipList 
                }})
            } else {
                this.setState({sanityDetails: null, isEditing: false, selectedRows: event.api.getSelectedRows().length})
            }

        }
    }
    onFilterTextBoxChanged(value) {
        this.setState({ rowSelect: false });
        this.gridApi.setQuickFilter(value);
        this.deselect();
    }
    toggleDelete = () => {
        this.setState({ delete: !this.state.delete })
    };
    rowSelect(row) {
        this.currentSelectedRow = row;
        let data = row.data
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        data.oldUIFocus = data.Description+'';
        data.oldUISkipList = data.UISkipList+'';
        data.oldNotes = data.Notes+'';
        this.setState({sanityDetails: data, rowSelect: true});
    }
    getTcs(selectedRelease) {
        let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
        if (!release) {
            return;
        }
        this.gridOperations(false);
        let startingIndex = this.pageNumber * this.rows;
        this.deselect(true);
        this.props.saveUI([]);
        let url = `/api/sanity/ui/${release}`;
        setTimeout(() => axios.get(url)
            .then(all => {
                this.props.saveUI(all.data);
                setTimeout(this.gridApi.refreshView(), 0)
                this.deselect();
                this.gridOperations(true);

            }).catch(err => {
                this.deselect();
                this.gridOperations(true);
            }), 300);
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    reset() {
        this.setState({ uiPresent: false });
        this.props.updateSanityEdit({});
        this.getTcs();
    }

    undo() {
        this.editedRows = {};
        this.deselect();
        this.isAnyChanged = false;
        this.getTcs();
    }

    textFields = [
        'Build', 'Result', 'Notes', 'UIFocus', 'UISkipList', 'NoOfTCsPassed', 'Bugs',
    ];
    arrayFields = ['CardType', 'User']
    whichFieldsUpdated(old, latest) {
        let changes = {};
        this.textFields.forEach(item => {
            if (old[item] !== latest[item]) {
                changes[item] = { old: old[item], new: latest[item] }
            }
        });
        this.arrayFields.forEach(item => {
            if (!old[item] && latest[item]) {
                changes[item] = { old: '', new: latest[item] }
            } else if (!latest[item] && old[item]) {
                changes[item] = { old: old[item], new: '' }
            } else if (old[item] && latest[item]) {
                let arrayChange = latest[item].filter(each => old[item].includes(each));
                if (arrayChange.length > 0) {
                    changes[item] = { old: old[item], new: latest[item] }
                }
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
    saveAll() {
        this.gridOperations(false);
        let items = [];
        let selectedRows = this.props.sanityEdit['UI'];
        if (selectedRows) {
            Object.keys(selectedRows).forEach(id => {
                let pushable = {
                    id: id,
                    Build: selectedRows[id].Build,
                    Result: selectedRows[id].Result,
                    Notes: selectedRows[id].Notes,
                    UIFocus: selectedRows[id].UIFocus,
                    NoOfTCsPassed: selectedRows[id].NoOfTCsPassed,
                    Bugs: selectedRows[id].Bugs,
                    NoOfTCsPassed: selectedRows[id].NoOfTCsPassed,
                    User: selectedRows[id].User,
                    CardType: selectedRows[id].CardType,
                    Type: selectedRows[id].Type
                };
                pushable.Date = selectedRows[id].Date
                items.push(pushable);
            })
        }
        this.props.saveUI([]);
        axios.put(`/dummy/api/sanity/ui/${this.props.selectedRelease.ReleaseNumber}`, items)
            .then(res => {
                this.props.updateSanityEdit({});
                this.gridOperations(true);
                this.setState({ uiPresent: false, errors: {}, toggleMessage: `Results Updated Successfully` });
                this.toggle();
                this.undo();
            }, error => {
                this.gridOperations(true);
                alert('failed to update TCs');
            });
        this.setState({ rowSelect: false, toggleMessage: null, })
    }
    confirmToggle(isAll) {
        this.setState({ toggleMessage: null })
        this.toggle();
    }
    convertDate = (date) => {
        if (!date) {
            return ''
        }
        let d = new Date(date).toISOString()
        d = new Date(date).toISOString().split('T');
        return `${d[0]}`;
    }
    resetSingle() {
        this.setState({ isEditing: false, sanityDetails: {...this.state.sanityDetails, UIFocus: this.state.sanityDetails.oldUIFocus+'', 
            UISkipList: this.state.sanityDetails.UISkipList+'', 
            Notes: this.state.sanityDetails.oldNotes+'' } });
    }
    render() {
        let rowData = []
        if( this.props.data){
            rowData = this.props.data.filter(it => it.Tag === this.props.tag).map(item => ({
                ...item,
                Date: this.convertDate(item.Date),
                sanityEdit: this.props.sanityEdit,
                updateSanityEdit: (sanity) => {
                    this.props.updateSanityEdit(sanity)
                    let uiPresent = sanity['UI'] ? true : false;
                    this.setState({ uiPresent: uiPresent })
                }
            }))

        }
        
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {

                this.gridApi.showLoadingOverlay();
            } else if (rowData && rowData.length === 0) {
                this.gridApi.showNoRowsOverlay();
            } else {
                this.gridApi.hideOverlay();
            }
        }
        let selected = 0;
        if (this.gridApi) {

        }

        return (
            <div>
                <div class="test-header">
                    <div class="row">
                        <div class="col-md-12">
                            <div style={{ display: 'inline', float: 'right' }}>
                                <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                <span className='rp-app-table-value'>{`       Total: ${this.state.totalRows}`}</span>

                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div style={{ width: '100%', height: '500px', marginBottom: '2rem' }}>
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
                                    rowStyle={{ alignItems: 'top' }}
                                    onSelectionChanged={(e) => this.onSelectionChanged(e)}
                                    onRowClicked={(e) => this.rowSelect(e)}
                                    modules={this.state.modules}
                                    columnDefs={this.state.columnDefs}
                                    rowSelection='multiple'
                                    rowMultiSelectWithClick={true}
                                    getRowHeight={this.getRowHeight}
                                    defaultColDef={this.state.defaultColDef}
                                    rowData={rowData}
                                    onGridReady={(params) => this.onGridReady(params)}
                                    onCellEditingStarted={this.onCellEditingStarted}
                                    frameworkComponents={this.state.frameworkComponents}
                                    stopEditingWhenGridLosesFocus={true}
                                    overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                    overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <div>Select only one test case to view Notes, UIFocus and UISkipList </div>
                {
                                        this.props.user && this.props.user.email && this.state.sanityDetails && 
                                        <React.Fragment>
                                            {
                                               this.state.isEditing &&
                                                <Fragment>
                                                    <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.resetSingle()} >
                                                        <i className="fa fa-undo"></i>
                                                    </Button>
                                                </Fragment>
                                            }
                                            {!this.state.isEditing &&
                                                <Fragment>
                                                    <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.setState({ isEditing: true })} >
                                                        <i className="fa fa-pencil-square-o"></i>
                                                    </Button>
                                                </Fragment>

                                            }
                                        </React.Fragment>
                                    }
                {
                    this.state.sanityDetails && 
                <FormGroup row className="my-0">
                                                {
                                                    [
                                                        { field: 'UIFocus', header: 'UIFocus', type: 'text', size:"6"  },
                                                        { field: 'UISkipList', header: 'UISkipList', type: 'text', size:"6"  },
                                                        { field: 'Notes', header: 'Notes', type: 'text', size:"12" },
                                                    ].map((item, index) => (
                                                        <Col xs="12" md={item.size}  lg={item.size}>
                                                            <FormGroup className='rp-app-table-value'>
                                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}</Label>
                                                                {
                                                                    !this.state.isEditing ?
                                                                        <Input style={{ backgroundColor: 'white' }} className='rp-app-table-value' type='textarea' rows={this.getTextAreaHeight(this.state.sanityDetails && this.state.sanityDetails[item.field])} value={this.state.sanityDetails && this.state.sanityDetails[item.field]}></Input>
                                                                        :
                                                                        <Input className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows={this.getTextAreaHeight(this.state.sanityDetails && this.state.sanityDetails[item.field])} id={item.field} value={this.state.sanityDetails && this.state.sanityDetails[item.field]}
                                                                            onChange={(e) => this.setState({
                                                                                sanityDetails: {...this.state.sanityDetails, [item.field]: e.target.value}
                                                                            })} >
                                                                        </Input>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
    }
            </div >

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users.map(item => item.name),
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.testcase.ui,
    UIDetails: state.testcase.uiDetails, //UIDetails
    UIEdit: state.testcase.UIEdit, //UIEdit
    sanityEdit: state.testcase.sanityEdit //UIEdit
})
export default connect(mapStateToProps, { saveUI, updateSanityEdit, getCurrentRelease, saveSingleUI, updateUIEdit })(UITestCases);


