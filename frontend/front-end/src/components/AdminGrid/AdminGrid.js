// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../reducers/release.reducer';
import { saveSingleTestCase, saveTestCase, updateTCEdit, saveUserDetails } from '../../actions';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './AdminGrid.scss';
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
import UserTC from '../../views/Release/ReleaseTestMetrics/UserTC';
// import { data, domains, subDomains } from './constants';
// "Description": "Enable helm", "ExpectedBehaviour": "dctl feature list should display helm as enabled", "Notes": "NOTES NOT PROVIDED"
class AdminGrid extends Component {
    cntr = 0;
    editedRows = {};
    constructor(props) {
        super(props);
        this.state = {
            rowSelect: false,
            isEditing: false,
            edit: {},
            delete: {},
            add: [],
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
                    headerName: "Status", field: "Status", sortable: true, filter: true, cellStyle: this.renderEditedCell,
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
                    headerName: "Scenario", field: "Scenario", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                },
                {
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: false,
                },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['BOS', 'NYNJ', 'COMMON'],
                        multiple: true
                    }
                },
                {
                    headerName: "Server Type", field: "ServerType", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['UNKNOWN']
                    }
                },
                {
                    headerName: "Status", field: "Status", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['COMPLETED', 'NOT_COMPLETED']
                    }
                },
                {
                    headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: this.props.users.map(item => item.email)
                    }
                }
            ],
            defaultColDef: { resizable: true },

            e2eColumnDefs: [{
                headerName: "E2E Build", field: "e2eBuild", sortable: true, filter: true,
            },
            {
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true,
            },
            {
                headerName: "Log URL", field: "LogURL", sortable: true, filter: true,
            }
            ],
            autoColumnDefs: [{
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Assignee", field: "Assignee", sortable: true, filter: true,
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true,
            },
            {
                headerName: "Log URL", field: "LogURL", sortable: true, filter: true,
            }
            ],
            manualColumnDefs: [{
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Assignee", field: "Assignee", sortable: true, filter: true,
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true,
            },
            {
                headerName: "Log URL", field: "LogURL", sortable: true, filter: true,
            }
            ],
            activityColumnDefs: [{
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Summary", field: "Header", sortable: true, filter: true,
            },
            {
                headerName: "Log URL", field: "LogURL", sortable: true, filter: true,
            }
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
    getTC(e) {
        axios.get(`/test/${this.props.selectedRelease.ReleaseNumber}/tcinfo/details/id/${e.TcID}`)
            .then(res => {
                this.props.saveSingleTestCase(res.data);
                this.props.updateTCEdit({ ...res.data, errors: {}, original: res.data });
            })
            .catch(err => {
                this.deselect();
            })
    }
    deselect() {
        this.gridApi.deselectAll();
        this.props.saveSingleTestCase({});
        this.props.updateTCEdit({ Master: true, errors: {}, original: null });
    }

    componentDidMount() {
        this.getTcs();
        this.setState({ tcOpen: true });
    }

    renderEditedCell = (params) => {
        let editedInRow = this.editedRows[`${params.data.TcID}`] && this.editedRows[params.data.TcID][params.colDef.field] && this.editedRows[params.data.TcID][params.colDef.field].originalValue !== params.value;
        if (editedInRow) {
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
        if (this.editedRows[params.data.TcID]) {
            if (this.editedRows[params.data.TcID][params.colDef.field]) {
                this.editedRows[params.data.TcID][params.colDef.field] = { ...this.editedRows[params.data.TcID][params.colDef.field], oldValue: params.value }
            } else {
                this.editedRows[params.data.TcID] = { ...this.editedRows[params.data.TcID], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        } else {
            this.editedRows[params.data.TcID] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
        }
    }

    getEditedCells() {
        var cellDefs = this.gridApi.getEditingCells();
        console.log('edited cells ', cellDefs);
    }
    onFilterTextBoxChanged(value) {
        this.deselect();
        this.setState({ domain: null, subDomain: null, rowSelect: false });
        this.gridApi.setQuickFilter(value);
    }
    onSelectDomain(domain) {
        this.deselect();
        if (domain === '') {
            this.setState({ domain: null, subDomain: null, data: this.props.data, rowSelect: false });
            return;
        }
        let filter = this.props.data.filter(item => item.Domain === domain);
        this.setState({ domain: domain, subDomain: null, data: filter, rowSelect: false });
    }
    onSelectSubDomain(subDomain) {
        this.deselect();
        if (subDomain === '') {
            let filter = this.props.data.filter(item => item.Domain === this.state.domain);
            this.setState({ subDomain: null, data: filter, rowSelect: false });
            return;
        }
        let filter = this.props.data.filter(item => item.SubDomain === subDomain && item.Domain === this.state.domain);
        this.setState({ subDomain: subDomain, data: filter, rowSelect: false });
    }
    rowSelect(e) {
        this.setState({ rowSelect: true, toggleMessage: null })
        this.getTC(e.data);
    }
    getTcs() {
        if (this.props.user && this.props.user.email) {
            axios.get(`/user/${this.props.selectedRelease.ReleaseNumber}/assigned/${this.props.user.email}`)
                .then(res => {
                    if (this.props.user && this.props.user.isAdmin) {
                        axios.get(`/user/${this.props.selectedRelease.ReleaseNumber}/assigned/ADMIN`)
                            .then(admin => {
                                console.log('user data');
                                console.log(admin.data)
                                console.log(res.data);
                                this.props.saveUserDetails([...admin.data, ...res.data]);
                            })
                            .catch(err => this.props.saveUserDetails(res.data))
                    } else {
                        this.props.saveUserDetails(res.data);
                    }
                }).catch(err => this.props.saveUserDetails([]))
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    reset() {
        this.props.updateTCEdit({ ...this.props.tcDetails, errors: {} });
        this.setState({ isEditing: false });
    }
    save() {
        let data = { ...this.props.testcaseEdit };
        console.log('data for creating tc');
        console.log(data);
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};
        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]);
                formattedDates[item] = date.toISOString()
            }
        })
        let DateTC = new Date().toISOString();
        let release = data['Master'] ? `${this.props.selectedRelease.ReleaseNumber},master` : this.props.selectedRelease.ReleaseNumber;

        let Status = 'UPDATED';
        if (this.props.testcaseEdit.Status !== this.props.testcaseEdit.original.Status) {
            Status = this.props.testcaseEdit.Status
        }
        let header = `${Status}: ${release}, REPORTER: ${this.props.user.email}`;

        let Assignee = this.props.testcaseEdit.Assignee ? this.props.testcaseEdit.Assignee : 'UNASSIGNED';

        let arrays = ['CardType', 'ServerType', 'OrchestrationPlatform'];
        let formattedArrays = {};
        arrays.forEach(item => {
            if (!data[item]) {
                formattedArrays[item] = [];
            }
            if (data[item] && !Array.isArray(data[item])) {
                formattedArrays[item] = data[item].split(',');
            }
        });
        let details = {
            old: { ...this.props.testcaseEdit.original, original: '', Activity: '', LatestE2EBuilds: '', ManualBuilds: '', AutoBuilds: '' },
            new: { ...data, original: '', ...formattedDates, ...formattedArrays, Assignee, Activity: '', LatestE2EBuilds: '', ManualBuilds: '', AutoBuilds: '' }
        }
        let Activity = {
            "Date": DateTC,
            "Header": header,
            "Details": details
        };

        data = { ...data, ...formattedDates, ...formattedArrays, Activity, Assignee, original: '' };
        axios.put(`/test/${this.props.selectedRelease.ReleaseNumber}/tcinfo/details/id/${data.TcID}`, { ...data })
            .then(res => {
                this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.props.testcaseEdit.TcID} Updated Successfully` });
                this.deselect();
                this.toggle();

                this.getTcs();
            }, error => {
                let message = error.response.data.message;
                let found = false;
                ['Domain', 'SubDomain', 'TcID', 'TcName', 'CardType', 'ServerType', 'Scenario', 'OrchestrationPlatform',
                    'Description', 'ExpectedBehavior', 'Notes', 'Steps', 'Date', 'Master', 'Assignee', 'Created', 'Tag', 'Activity']
                    .forEach((item, index) => {
                        if (!found && message.search(item) !== -1) {
                            found = true;
                            let msg = { [item]: `Invalid ${item}` };
                            if (item === 'TcID' || item === 'TcName') {
                                msg = { [item]: `Invalid or Duplicate ${item}` };
                            }
                            this.setState({ errors: msg, toggleMessage: `Error: ${error.message}` });
                            this.toggle();
                        }
                    });
                if (!found) {
                    this.setState({ errors: {}, toggleMessage: `Error: ${error.message}` });
                    this.toggle();
                }
            });
        this.setState({ toggleMessage: null, isEditing: false })
        // this.toggle();
    }
    confirmToggle() {
        let errors = null;
        ['Domain', 'SubDomain', 'TcID', 'TcName', 'CardType']
            .forEach(item => {
                if (!errors) {
                    let valid = (this.props.testcaseEdit[item] && this.props.testcaseEdit[item].length > 0);
                    if (!valid) {
                        errors = { ...this.props.testcaseEdit.errors, [item]: 'Cannot be empty' };
                    }
                }
            });
        if (!errors) {
            this.setState({ toggleMessage: null })
            this.toggle();
        } else {
            this.setState({ errors: errors })
        }
    }
    delete() {
        if (this.props.testcaseEdit.TcID) {
            axios.delete(`/test/${this.props.selectedRelease.ReleaseNumber}/tcinfo/details/id/${this.props.testcaseEdit.TcID}`)
                .then(data => {
                    this.deselect();
                    this.getTcs();
                }, error => {
                    this.setState({ errors: {}, toggleMessage: `Error: ${error.message}` });
                    this.toggle();
                })
        }
    }
    render() {

        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ tcOpen: !this.state.tcOpen })} style={{ display: 'inlineBlock' }}>
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
                                <div style={{ width: (window.screen.width * (1 - 0.218)) + 'px', height: '250px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div class="col-md-3">
                                                <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onFilterTextBoxChanged(e.target.value)} />
                                            </div>
                                            {
                                                this.props.data &&
                                                <div class="col-md-3">
                                                    <Input onChange={(e) => this.onSelectDomain(e.target.value)} type="select" name="selectDomain" id="selectDomain">
                                                        <option value=''>Select Domain</option>
                                                        {
                                                            this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions).map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.state.domain &&
                                                <div class="col-md-3">
                                                    <Input onChange={(e) => this.onSelectSubDomain(e.target.value)} type="select" name="subDomains" id="subDomains">
                                                        <option value=''>Select Sub Domain</option>
                                                        {
                                                            this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.domain].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
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
                                                onRowClicked={(e) => this.rowSelect(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefs}
                                                rowSelection='single'
                                                defaultColDef={this.state.defaultColDef}
                                                rowData={this.state.data ? this.state.data : this.props.data ? this.props.data : []}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
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
                                </div>
                                <Collapse isOpen={this.state.rowSelect}>
                                    {
                                        this.props.tcDetails && this.props.tcDetails.TcID &&
                                        <React.Fragment>
                                            <UserTC delete={() => this.delete()} isEditing={this.state.isEditing} edit={(val) => val ? this.setState({ isEditing: val }) : this.reset()} toggle={() => this.toggle()}></UserTC>
                                            {
                                                !this.state.more &&
                                                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                                    <i className="fa fa-angle-down rp-save-tc-icon" onClick={() => this.setState({ more: !this.state.more })}> Expand</i>
                                                </div>
                                            }
                                            {
                                                this.state.more &&
                                                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                                    <i className="fa fa-angle-up rp-save-tc-icon" onClick={() => this.setState({ more: !this.state.more })}> Close</i>
                                                </div>
                                            }
                                            {
                                                (this.props.testcaseEdit.Domain || this.props.tcDetails.Domain) && (this.props.testcaseEdit.SubDomain || this.props.tcDetails.SubDomain) &&
                                                <Collapse isOpen={this.state.more}>
                                                    <Row>
                                                        <Col lg="6">
                                                            <div className='rp-app-table-title'>E2E Builds Status</div>

                                                            <div class="test-header">
                                                                <div class="row">
                                                                    <div class="col-md-3">
                                                                        <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onE2EFilterTextBoxChanged(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ width: (window.screen.width * ((1 - 0.218) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}>
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
                                                                            rowData={this.props.tcDetails ? this.props.tcDetails.LatestE2EBuilds : []}

                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </Col>
                                                        <Col lg="6">
                                                            <div className='rp-app-table-title'>Activity</div>
                                                            <div style={{ width: (window.screen.width * ((1 - 0.218) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}>
                                                                <div class="test-header">
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onActivityFilterTextBoxChanged(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                                                                            columnDefs={this.state.activityColumnDefs}
                                                                            defaultColDef={this.state.defaultColDef}
                                                                            rowData={this.props.tcDetails ? this.props.tcDetails.Activity : []}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <FormGroup row className="my-0">
                                                        {
                                                            [

                                                                { field: 'Description', header: 'Description', type: 'text' },
                                                                { field: 'Steps', header: 'Steps', type: 'text' },
                                                                { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                                                { field: 'Notes', header: 'Notes', type: 'text' },

                                                            ].map((item, index) => (
                                                                <Col xs="12" md="6" lg="6" className='rp-margin-tp-btm-1'>
                                                                    <FormGroup className='rp-app-table-value'>
                                                                        <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                                                            this.props.testcaseEdit.errors.Master &&
                                                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Master}</i>
                                                                        }</Label>
                                                                        {
                                                                            !this.state.isEditing ?
                                                                                <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '', backgroundColor: 'white', color: 'rgb(4, 56, 26)' }} className='rp-app-table-value' type='textarea' rows='9' readOnly={true}>{this.props.tcDetails && this.props.tcDetails[item.field]}</Input>
                                                                                :
                                                                                <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows='4' id={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]}
                                                                                    onChange={(e) => this.setState({ addTC: { ...this.props.testcaseEdit, [item.field]: e.target.value }, errors: { ...this.props.testcaseEdit.errors, [item.field]: null } })} >

                                                                                </Input>
                                                                        }
                                                                    </FormGroup>
                                                                </Col>
                                                            ))
                                                        }
                                                    </FormGroup>



                                                    <Row>

                                                        <Col lg="6">
                                                            <div className='rp-app-table-title'>Auto Builds Status</div>
                                                            <div style={{ width: (window.screen.width * ((1 - 0.218) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}>
                                                                <div class="test-header">
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onAutoFilterTextBoxChanged(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: "100%", height: "100%" }}>
                                                                    <div
                                                                        id="autoGrid"
                                                                        style={{
                                                                            height: "100%",
                                                                            width: "100%",
                                                                        }}
                                                                        className="ag-theme-balham"
                                                                    >
                                                                        <AgGridReact
                                                                            modules={this.state.modules}
                                                                            columnDefs={this.state.autoColumnDefs}
                                                                            defaultColDef={this.state.defaultColDef}
                                                                            rowData={this.props.tcDetails ? this.props.tcDetails.AutoBuilds : []}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        <Col lg="6">
                                                            <div className='rp-app-table-title'>Manual Builds Status</div>
                                                            <div style={{ width: (window.screen.width * ((1 - 0.218) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}>
                                                                <div class="test-header">
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onManualFilterTextBoxChanged(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: "100%", height: "100%" }}>
                                                                    <div
                                                                        id="manualGrid"
                                                                        style={{
                                                                            height: "100%",
                                                                            width: "100%",
                                                                        }}
                                                                        className="ag-theme-balham"
                                                                    >
                                                                        <AgGridReact
                                                                            onRowClicked={(e) => this.setState({ manual: e.data })}
                                                                            modules={this.state.modules}
                                                                            columnDefs={this.state.manualColumnDefs}
                                                                            defaultColDef={this.state.defaultColDef}
                                                                            rowData={this.props.tcDetails ? this.props.tcDetails.ManualBuilds : []}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>

                                                    </Row>
                                                </Collapse>
                                            }
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
            </div >

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users.map(item => item.email),
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.user.details,
    tcDetails: state.testcase.testcaseDetail,
    testcaseEdit: state.testcase.testcaseEdit,
})
export default connect(mapStateToProps, { saveUserDetails, saveTestCase, getCurrentRelease, saveSingleTestCase, updateTCEdit })(AdminGrid);





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