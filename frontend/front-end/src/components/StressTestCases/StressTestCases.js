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
import { saveStress, updateSanityEdit, saveSingleE2E, updateE2EEdit } from '../../actions';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    UncontrolledPopover, PopoverHeader, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './StressTestCases.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import NumericEditor from "./numericEditor";
import SelectionEditor from './selectionEditor';
import { getDatePicker } from './datepicker';
import DatePickerEditor from './datePickerEditor';

class StressTestCases extends Component {
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
                    checkboxSelection: true,
                    cellStyle: { alignItems: 'top' },
                    headerName: "Date", field: "Date", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: "datePicker",
                    filter: 'agDateColumnFilter',
                    width: 120
                },
                {
                    headerName: "Setup Type", field: "Setup", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true,
                    width:100
                },
                {
                    headerName: "Iterations", field: "NoOfIteration", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                    cellEditor: 'numericEditor',
                    filter: 'agNumberColumnFilter',
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
                     sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100', cellClass: 'cell-wrap-text',
                },
                {
                    headerName: "CfgFileUsed", field: "CfgFileUsed", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                    editable: true,
                    width:150
                },


                {
                    headerName: "Link-Flap", field: "LinkFlap", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Link-Flap', 'Yes', 'No']
                    },
                    editable: true,
                    width:80
                },

                {
                    headerName: "User", field: "User", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100',
                    cellClass: 'cell-wrap-text',
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: this.props.users
                    },
                    width:150
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Card', 'BOS', 'NYNJ', 'COMMON', 'SOFTWARE']
                    },
                    width:100

                },
                // {
                //     headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                //     width: '420',
                //     editable: true,
                //     cellClass: 'cell-wrap-text',
                //     autoHeight: true
                // },

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
    getRowHeight = (params) => {
        if (params.data && params.data.Notes) {
            return 28 * (Math.floor(params.data.Notes.length / 60) + 1);
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
        this.props.saveSingleE2E(e);
        this.props.updateE2EEdit({ ...e, errors: {}, original: e });
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.updateSanityEdit({});
            this.getTcs(newProps.selectedRelease.ReleaseNumber);
        }
        console.log('called')
        if (newProps && this.props && this.props.e2eCounter && newProps.e2eCounter !== this.props.e2eCounter) {
            console.log('inside')
            this.getTcs();
        }
        if (newProps && this.props && this.props.deleteCounter && newProps.deleteCounter !== this.props.deleteCounter) {
            this.delete();
        }
        if (newProps && this.props && this.props.saveCounter && newProps.saveCounter !== this.props.saveCounter) {
            this.save();
        }
    }
    save = () => {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        if (!this.gridApi) {
            return;
        }
        let items = [...this.gridApi.getSelectedRows()];
        if (items.length <= 0) {
            alert('Please select atleast one stress sanity to save');
            return;
        }
        let sendingItems = items.map(each => ({
            id: each.id,
            Date: each.Date,
            Setup: each.Setup,
            Result:each.Result,
            Build: each.Build,
            Bugs: each.Bugs,
            NoOfIteration: each.NoOfIteration,
            CfgFileUsed: each.CfgFileUsed,
            User:each.User,
            CardType:each.CardType,
            Notes: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.Notes : each.Notes,
            LinkFlap: each.LinkFlap,
            Activity: {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": each.id,
                CardType: each.CardType,
                "UserName": this.props.user.email,
                LogData: `${this.props.user.email} saved stress ${each.id}`,
                "RequestType": 'PUT',
                "URL": `/api/sanity/stressUpdate/${this.props.selectedRelease.ReleaseNumber}`
            }
        }))

        this.gridOperations(false);
        let url = `/api/sanity/stressUpdate/${this.props.selectedRelease.ReleaseNumber}`;
        axios.post(url, sendingItems)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.deselect();
                this.getTcs();
                setTimeout(this.gridApi.refreshView(), 0)

                this.gridOperations(true);

            }).catch(err => {
                alert('failed to save stress results');
                this.gridOperations(true);
            })

    }
    delete = () => {
        if (!this.props.selectedRelease.ReleaseNumber) {
            return;
        }
        if (!this.gridApi) {
            return;
        }
        let items = [...this.gridApi.getSelectedRows()];
        if (items.length <= 0) {
            alert('Please select atleast one stress sanity to delete');
            return;
        }
        let sendingItems = items.map(each => ({
            id: each.id,
            Date: each.Date,
            Setup: each.Setup,
            Result:each.Result,
            Bugs: each.Bugs,
            NoOfIteration: each.NoOfIteration,
            CfgFileUsed: each.CfgFileUsed,
            User:each.User,
            CardType:each.CardType,
            Notes: this.state.sanityDetails && this.state.sanityDetails.id === each.id ? this.state.sanityDetails.Notes : each.Notes,
            LinkFlap: each.LinkFlap,
            Activity: {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": each.id,
                CardType: each.CardType,
                "UserName": this.props.user.email,
                LogData: `${this.props.user.email} deleted stress sanity ${each.id}`,
                "RequestType": 'DELETE',
                "URL": `/api/sanity/stressDelete/${this.props.selectedRelease.ReleaseNumber}`
            }
        }))

        this.gridOperations(false);
        let url = `/api/sanity/stressDelete/${this.props.selectedRelease.ReleaseNumber}`;
        axios.post(url, sendingItems)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.deselect();
                this.getTcs();
                setTimeout(this.gridApi.refreshView(), 0)

                this.gridOperations(true);

            }).catch(err => {
                alert('failed to delete stress sanity results');
                this.gridOperations(true);
            })

    }

    onSelectionChanged = (event) => {
        if(event.api.getSelectedRows().length !== 1) {
            this.setState({sanityDetails: null, isEditing: false, selectedRows: event.api.getSelectedRows().length})
        } else {
            let row = event.api.getSelectedRows()[0];
            if(row) {
                this.setState({selectedRows: 1, sanityDetails: {
                    ...row, oldNotes: row.Notes+''
                }})
            } else {
                this.setState({sanityDetails: null, isEditing: false, selectedRows: event.api.getSelectedRows().length})
            }

        }
    }
    deselect(updateTotalRows) {
        this.editedRows = {};
        if (this.gridApi) {
            this.gridApi.deselectAll();
        }
        this.props.saveSingleE2E({});
        this.props.updateE2EEdit({ Master: true, errors: {}, original: null });
        if (!updateTotalRows) {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, totalRows: this.gridApi.getModel().rowsToDisplay.length, selectedRows: this.gridApi.getSelectedRows().length })
        } else {
            this.setState({ multi: {}, allRows: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0, selectedRows: 0, totalRows: 0 })
        }
    }
    renderEditedCell = (params) => {
        let editedInRow = this.editedRows[`${params.data.id}_${params.data.CardType}`] && this.editedRows[`${params.data.id}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.id}_${params.data.CardType}`][params.colDef.field].originalValue !== params.value;
        if (editedInRow) {
            this.editedRows[`${params.data.id}_${params.data.CardType}`].Changed = true;
            return {
                backgroundColor: 'rgb(209, 255, 82)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'rgb(255, 166, 0)',
                wordWrap: 'break-word'
            };
        }
        return { backgroundColor: '',   wordWrap: 'break-word' };
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onCellEditingStarted = params => {
        if (this.editedRows[`${params.data.id}_${params.data.CardType}`]) {
            if (this.editedRows[`${params.data.id}_${params.data.CardType}`][params.colDef.field]) {
                this.editedRows[`${params.data.id}_${params.data.CardType}`][params.colDef.field] =
                    { ...this.editedRows[`${params.data.id}_${params.data.CardType}`][params.colDef.field], oldValue: params.value }
            } else {
                this.editedRows[`${params.data.id}_${params.data.CardType}`] =
                    { ...this.editedRows[`${params.data.id}_${params.data.CardType}`], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        } else {
            this.editedRows[`${params.data.id}_${params.data.CardType}`] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
        }
    }
    onCellEditing = (params, field, value) => {
        if (this.editedRows[`${params.id}_${params.CardType}`]) {
            if (this.editedRows[`${params.id}_${params.CardType}`][field]) {
                this.editedRows[`${params.id}_${params.CardType}`][field] =
                    { ...this.editedRows[`${params.id}_${params.CardType}`][field], oldValue: params[field], newValue: value }
            } else {
                this.editedRows[`${params.id}_${params.CardType}`] =
                    { ...this.editedRows[`${params.id}_${params.CardType}`], [field]: { oldValue: params[field], originalValue: params[field], newValue: value } }
            }

        } else {
            this.editedRows[`${params.id}_${params.CardType}`] = {
                id: { oldValue: `${params.id}`, originalValue: `${params.id}`, newValue: `${params.id}` },
                [field]: { oldValue: params[field], originalValue: params[field], newValue: value }
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
        this.props.saveStress([]);
        let url = `/api/sanity/stress/${release}`;
        axios.get(url)
            .then(all => {
                // Filters should not go away if data is reloaded
                //this.setState({ domain: this.state.domain, subDomain: this.state.domain, CardType: this.state.CardType, data: null, rowSelect: false })
                this.props.saveStress(all.data);
                setTimeout(this.gridApi.refreshView(), 0)
                this.deselect();
                this.gridOperations(true);

            }).catch(err => {
                this.deselect();
                this.gridOperations(true);
            })
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    reset() {
        this.setState({ e2ePresent: false });
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
        'Build', 'Result', 'Notes', 'E2EFocus', 'NoOfTCsPassed', 'Bugs',
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
        let selectedRows = this.props.sanityEdit['E2E'];
        if (selectedRows) {
            Object.keys(selectedRows).forEach(id => {
                let pushable = {
                    id: id,
                    Build: selectedRows[id].Build,
                    Result: selectedRows[id].Result,
                    Notes: selectedRows[id].Notes,
                    E2EFocus: selectedRows[id].E2EFocus,
                    NoOfTCsPassed: selectedRows[id].NoOfTCsPassed,
                    Bugs: selectedRows[id].Bugs,
                    NoOfTCsPassed: selectedRows[id].NoOfTCsPassed,
                    User: selectedRows[id].User,
                    CardType: selectedRows[id].CardType,
                    Type: selectedRows[id].Type
                };
                // let date = new Date(selectedRows[id].Date).toISOString().split('T');
                // pushable.Date = `${date[0]} ${date[1].substring(0, date[1].length - 1)}`;
                pushable.Date = selectedRows[id].Date
                items.push(pushable);
            })
        }
        this.props.saveStress([]);
        axios.put(`/api/sanity/stress/${this.props.selectedRelease.ReleaseNumber}`, items)
            .then(res => {
                this.props.updateSanityEdit({});
                this.gridOperations(true);
                this.setState({ e2ePresent: false, errors: {}, toggleMessage: `Results Updated Successfully` });
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
        console.log(date);
        if (!date) {
            return ''
        }
        let d = new Date(date).toISOString()
        d = new Date(date).toISOString().split('T');
        return `${d[0]}`;
    }
    resetSingle() {
        this.setState({ isEditing: false, sanityDetails: {...this.state.sanityDetails,
            Notes: this.state.sanityDetails.oldNotes+'' } });
    }
    render() {
        console.log('rendering')
        console.log(this.props.data)
        let rowData = this.props.data.map(item => ({
            ...item,
            Date: this.convertDate(item.Date),
            sanityEdit: this.props.sanityEdit,
            updateSanityEdit: (sanity) => {
                this.props.updateSanityEdit(sanity)
                let e2ePresent = sanity['Stress'] ? true : false;
                this.setState({ e2ePresent: e2ePresent })
            }
        }))
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
                <div class="test-header">
                    <div class="row">
                        <div class="col-md-12">
                            <div style={{ display: 'inline', float: 'right' }}>
                                <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                <span className='rp-app-table-value'>{`       Total: ${this.state.totalRows}`}</span>

                            </div>
                        </div>
                    </div>
                    {/* {
                        this.state.e2ePresent &&
                        <div class='row'>
                            <div class="col-md-12">
                                <div style={{ display: 'inline', float: 'right' }}>
                                </div>
                                <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle(true)} >
                                    <i className="fa fa-save"></i>
                                </Button>
                                <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.reset()} >
                                    <i className="fa fa-undo"></i>
                                </Button>
                            </div>
                        </div>
                    } */}
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
                                    // suppressScrollOnNewData={true}
                                    onSelectionChanged={(e) => this.onSelectionChanged(e)}
                                    onRowClicked={(e) => this.rowSelect(e)}
                                    rowStyle={{ alignItems: 'top' }}
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
                                // cellDoubleClicked={(e) => this.cellDoubleClicked(e)}
                                />
                            </div>
                        </div>


                    </div>
                </div >
                <div>Select only one test case to view Notes</div>
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
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.state.toggleMessage ? this.toggle() : this.saveAll()}>Ok</Button>{' '}
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
                            `Are you sure you want to delete ${this.props.E2EEdit.id} ?`
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
    users: ['Select Assignee', 'Jenkin',...state.user.users.map(item => item.email)],
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.testcase.stress,
    E2EDetails: state.testcase.e2eDetails, //E2EDetails
    E2EEdit: state.testcase.e2eEdit, //E2EEdit
    sanityEdit: state.testcase.sanityEdit //E2EEdit
})
export default connect(mapStateToProps, { saveStress, updateSanityEdit, getCurrentRelease, saveSingleE2E, updateE2EEdit })(StressTestCases);


