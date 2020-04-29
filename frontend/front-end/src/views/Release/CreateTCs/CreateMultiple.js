// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress, Popover, PopoverBody, FormGroup, Label
} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import {
    getTCStrategyForUIDomains, getTCStrategyForUISubDomains, alldomains, getTCStatusForSunburst,
    getTCStrategyForUISubDomainsDistribution, getTCStrategyForUIDomainsDistribution
} from '../../../reducers/release.reducer';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import Multiselect from 'react-bootstrap-multiselect';
import readXlsxFile from 'read-excel-file'
import CSVReader from 'react-csv-reader'
import ExcelReader from '../../../components/ExcelReader/ExcelReader';

import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import NumericEditor from "./numericEditor";
import SelectionEditor from './selectionEditor';
import { getDatePicker } from './datepicker';
import DatePickerEditor from './datePickerEditor';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
const order = ['']
class CreateMultiple extends Component {
    // [field] : {old,new}
    changeLog = {};
    editedRows = {};
    constructor(props) {
        super(props);
        this.state = {
            addTC: { Master: true },
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            edited: {},
            errors: {},
            rowData: [],
            multipleModal: false,

            columnDefs: [
                {
                    cellStyle: { alignItems: 'top' },
                    headerName: "ID", field: "TABLEID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    width: 50,
                    hide: true
                },
                {
                    cellStyle: { alignItems: 'top' },
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                    editable: true,
                    width: 180
                },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true,
                },
                {
                    headerName: "Card Type", field: "CardType",
                    editable: true,
                    sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'],
                        multiple: true,
                    }

                },
                {
                    headerName: "Domain", field: "Domain",
                    editable: true,
                    sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                },
                {
                    headerName: "SubDomain", field: "SubDomain",
                    editable: true,
                    sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                },
                {
                    headerName: "Priority", field: "Priority",
                    editable: true,
                    sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    cellEditor: 'selectionEditor',
                    cellEditorParams: {
                        values: ['Select Priority', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA']
                    }
                },
                {
                    headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true, autoHeight: true, width: '420',
                },
                {
                    headerName: "Expected Behaviour", field: "ExpectedBehaviour", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true, autoHeight: true, width: '420',
                },
                {
                    headerName: "Steps", field: "Steps", sortable: true, filter: true, cellStyle: this.renderEditedCell, cellClass: 'cell-wrap-text',
                    editable: true, autoHeight: true, width: '420',
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
            modules: AllCommunityModules,
            frameworkComponents: {
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },

        }
    }
    multipleToggle = () => this.setState({ multipleModal: !this.state.multipleModal });
    onCellEditingStarted = params => {
        if (params.data) {
            if (this.editedRows[`id${params.data.TABLEID}`]) {
                if (this.editedRows[`id${params.data.TABLEID}`][params.colDef.field]) {
                    this.editedRows[`id${params.data.TABLEID}`][params.colDef.field] =
                        { ...this.editedRows[`id${params.data.TABLEID}`][params.colDef.field], oldValue: params.value }
                } else {
                    this.editedRows[`id${params.data.TABLEID}`] =
                        { ...this.editedRows[`id${params.data.TABLEID}`], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
                }
            } else {
                this.editedRows[`id${params.data.TABLEID}`] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        }
    }
    componentWillReceiveProps(newProps) {
        if (newProps && this.props && newProps.selectedRelease.ReleaseNumber !== this.props.selectedRelease.ReleaseNumber) {
            this.globalErrors = null;
            this.editedRows = {};
            this.currentID = null;
            this.setState({ multipleErrors: {} })
            setTimeout(() => this.gridApi.redrawRows(), 1000);
        }
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
        this.multipleToggle();
        this.globalErrors = null;
        this.currentID = 0;
        this.save();
    }
    textFields = [
        'Domain', 'SubDomain',
        'TcID', 'TcName', 'Scenario', 'Tag', 'Priority',
        'Description', 'Steps', 'ExpectedBehaviour', 'Notes', 'Assignee',
    ];
    arrayFields = ['CardType']
    getTcName(name) {
        let tcName = name;
        if (!tcName || tcName === 'NOT AUTOMATED' || tcName === undefined || tcName === null) {
            tcName = 'TC NOT AUTOMATED';
        }
        return tcName;
    }
    save() {
        this.gridOperations(false)
        this.props.showLoadingMessage(true);
        let row = this.state.multiple[this.currentID];
        let data = {};
        // tc info meta fields
        // data.Role = 'QA';
        // tc info fields
        this.textFields.map(item => data[item] = row[item]);
        this.arrayFields.forEach(item => data[item] = this.joinArrays(row[item]));
        data.Activity = {
            Release: this.props.selectedRelease.ReleaseNumber,
            "TcID": data.TcID,
            "CardType": data.CardType,
            "UserName": this.props.currentUser.email,
            "LogData": `CREATED TC`,
            "RequestType": 'POST',
            "URL": `/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`
        };
        data.WorkingStatus = 'CREATED'
        data.TcName = this.getTcName(`${data.TcName}`);

        axios.post(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                this.currentID += 1;
                if (this.currentID < this.state.multiple.length) {
                    this.save()
                } else {
                    this.gridOperations(true)
                    this.props.showLoadingMessage(false);
                    if (this.globalErrors) {
                        this.setState({ multipleErrors: this.globalErrors });
                        alert('Some or all tcs failed to create')
                    } else {
                        alert('All tcs created successfully')
                    }
                }
            }, error => {
                this.gridOperations(true)
                this.props.showLoadingMessage(false);
                console.log('entered here')
                if (!this.globalErrors) this.globalErrors = {}
                this.globalErrors = { ...this.globalErrors, [this.state.multiple[this.currentID].TABLEID]: { uploadError: true } }
                this.currentID += 1;
                if (this.currentID < this.state.multiple.length) {
                    this.save()
                } else {
                    if (this.globalErrors) {
                        this.setState({ multipleErrors: this.globalErrors });
                        alert('Some or all tcs failed to create')
                    } else {
                        alert('Some or all tcs failed to create')
                    }
                }
            });
    }
    confirmMultipleToggle() {
        console.log(this.state.multiple);
        let domains = this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions);
        if (domains) {
            domains.sort();
        }
        if (!this.state.multiple || (this.state.multiple && this.state.multiple.length === 0)) {
            return;
        }
        let errors = null;
        this.multiChangeLog = {};
        this.state.multiple.forEach(row => {
            ['Domain', 'SubDomain', 'TcID']
                .forEach(item => {
                    let valid = (row[item] && row[item].length > 0);
                    if (!valid) {
                        if (!errors) errors = {};
                        errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], [item]: 'Cannot be empty' } };
                    }
                });
            if (!domains.includes(row.Domain)) {
                if (!errors) errors = {};
                errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], Domain: 'Should be a value from given domains' } };
            }
            let subdomains = row.Domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[row.Domain];
            if (!subdomains || (subdomains && !subdomains.includes(row.SubDomain))) {
                if (!errors) errors = {};
                errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], SubDomain: 'Should be a value from given subdomains' } };
            }

            let cards = this.joinArrays(row.CardType);
            cards.forEach(card => {
                if (!['NYNJ', 'BOS', 'COMMON', 'SOFTWARE'].includes(card)) {
                    if (!errors) errors = {};
                    errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], CardType: 'Invalid Cardtype' } };
                }
            });
            if (!['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].includes(row.Priority)) {
                if (!errors) errors = {};
                errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], Priority: 'Invalid Priority' } };
            }



            if (!isNaN(row['TcID'])) {
                if (!errors) errors = {};
                errors = { ...errors, [row.TABLEID]: { ...errors[row.TABLEID], TcID: 'Cannot be a number' } };
            }

        })
        if (!errors) {
            // this.multiChangeLog = this.whichFieldsUpdated({}, row);
            // this.multipleToggle();
            this.multipleToggle();
        } else {
            this.setState({ multipleErrors: errors })
            setTimeout(() => this.gridApi.redrawRows(), 1000)
        }
    }
    renderEditedCell = (params) => {
        if (params.data) {
            console.log('errors inside')
            console.log(this.state.multipleErrors)
            if (this.state.multipleErrors && this.state.multipleErrors[params.data.TABLEID] && this.state.multipleErrors[params.data.TABLEID].uploadError) {
                return {
                    backgroundColor: 'rgb(237,102,72)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderColor: 'rgb(237,102,72)'
                }
            }
            if (this.state.multipleErrors && this.state.multipleErrors[params.data.TABLEID] && this.state.multipleErrors[params.data.TABLEID][params.colDef.field]) {
                return {
                    backgroundColor: 'rgb(237,102,72)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderColor: 'rgb(237,102,72)'
                }
            }

            let editedInRow = this.editedRows[`id${params.data.TABLEID}`] && this.editedRows[`id${params.data.TABLEID}`][params.colDef.field] && this.editedRows[`id${params.data.TABLEID}`][params.colDef.field].originalValue !== params.value;
            // let restored = this.editedRows[`${params.data.TcID}_${params.data.CardType}`] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field].originalValue === params.value;
            if (editedInRow) {
                this.editedRows[`id${params.data.TABLEID}`].Changed = true;
                return {
                    backgroundColor: 'rgb(209, 255, 82)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderColor: 'rgb(255, 166, 0)'
                };
            }
        }
        return { backgroundColor: '' };
    }
    onCellEditing = (params, field, value) => {
        if (params.data) {
            if (this.editedRows[`id${params.data.TABLEID}`]) {
                if (this.editedRows[`id${params.data.TABLEID}`][field]) {
                    this.editedRows[`id${params.data.TABLEID}`][field] =
                        { ...this.editedRows[`id${params.data.TABLEID}`][field], oldValue: params[field], newValue: value }
                } else {
                    this.editedRows[`id${params.data.TABLEID}`] =
                        { ...this.editedRows[`id${params.data.TABLEID}`], [field]: { oldValue: params[field], originalValue: params[field], newValue: value } }
                }

            } else {
                this.editedRows[`id${params.data.TABLEID}`] = {
                    [field]: { oldValue: params[field], originalValue: params[field], newValue: value }
                }
            }
        }
    }
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 1);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 28;
    }
    toggle = () => this.setState({ modal: !this.state.modal });


    textFields = [
        'Domain', 'SubDomain',
        'TcID', 'TcName', 'Scenario', 'Tag', 'Priority',
        'Description', 'Steps', 'ExpectedBehaviour', 'Notes',
    ];
    arrayFields = ['CardType', 'ServerType']
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
            array = `${array}`.split(',');
        }
        return array;
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };

    getTcs() {
        this.props.saveTestCase({ data: [], id: this.props.selectedRelease.ReleaseNumber });
        this.props.saveSingleTestCase({});
        axios.get(`/api/wholetcinfo/${this.props.selectedRelease.ReleaseNumber}`)
            .then(all => {
                if (all.data && all.data.length) {
                    this.props.saveTestCase({ data: all.data, id: this.props.selectedRelease.ReleaseNumber });
                }
            })
    }

    parseData(data, format) {
        switch (format) {
            case 'XLS':

                data = data.map((item, index) => ({ TABLEID: `id${index}`, ...item }));
                this.editedRows = {};
                this.setState({ rowData: data, multipleErrors: {} })

                this.getData(data);
                break;
        }
    }
    getData = (data) => {
        this.setState({ multiple: data && data[0].gridApi ? data.map(each => each.data) : data })
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
        let allCards = ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'];
        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE').map(item => item.email);

        let cards = ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(item => ({ value: item, selected: this.state.addTC.CardType && this.state.addTC.CardType.includes(item) }));
        let servers = ['Intel', 'Dell', 'Lenovo'].map(item => ({ value: item, selected: this.state.addTC.ServerType && this.state.addTC.ServerType.includes(item) }));
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item, selected: this.state.addTC.OrchestrationPlatform && this.state.addTC.OrchestrationPlatform.includes(item) })) : [];
        let multiselect = { 'CardType': cards, 'OrchestrationPlatform': op, 'ServerType': servers };
        let rowData = [];
        return (
            <div>
                <Row>
                    {/* <Col className='col-md-5'>
                        <span>Upload CSV file</span>
                        <CSVReader onFileLoaded={data => this.parseData(data, 'CSV')} />
                    </Col> */}
                    {!this.state.isApiUnderProgress &&
                        <Button style={{ position: 'absolute', right: '1rem' }} title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmMultipleToggle()} >
                            <i className="fa fa-save"></i>
                        </Button>
                    }
                    <Col className='col-md-6' style={{ marginBottom: '1rem' }}>
                        <div className='rp-app-table-value' style={{ marginBottom: '0.3rem' }}>Allowed Domains, SubDomains and Cards</div>
                        <FormGroup row className="my-0" style={{ marginTop: '1rem', marginBottom: '1rem' }}>

                            {
                                <div style={{ width: '9rem', marginLeft: '1.5rem' }}>
                                    <Input style={{ fontSize: '12px' }} value={this.state.domain} onChange={(e) => this.setState({ domain: e.target.value })} type="select" name="selectDomain" id="selectDomain">
                                        <option value=''>Select Domain</option>
                                        {
                                            domains && domains.map(item => <option value={item}>{item}</option>)
                                        }
                                    </Input>
                                </div>
                            }
                            {
                                <div style={{ width: '9rem', marginLeft: '0.5rem' }}>
                                    <Input style={{ fontSize: '12px' }} value={this.state.subDomain} onChange={(e) => this.setState({ subDomain: e.target.value })} type="select" name="subDomains" id="subDomains">
                                        <option value=''>Select SubDomain</option>
                                        {
                                            subdomains && subdomains.map(item => <option value={item}>{item}</option>)
                                        }
                                    </Input>
                                </div>
                            }
                            {
                                <div style={{ width: '9rem', marginLeft: '0.5rem' }}>
                                    <Input style={{ fontSize: '12px' }} type="select" name="cardTypes" id="cardTypes">
                                        <option value=''>Select CardType</option>
                                        {
                                            allCards && allCards.map(item => <option value={item}>{item}</option>)
                                        }
                                    </Input>
                                </div>
                            }
                        </FormGroup>
                    </Col>
                    <Col className='col-md-5'>
                        <span>Upload Excel file</span>
                        <ExcelReader onFileLoaded={data => this.parseData(data, 'XLS')} />
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <div>
                            <div style={{ width: '100%', height: '400px', marginBottom: '6rem' }}>
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
                                            rowStyle={{ alignItems: 'top' }}
                                            // onRowClicked={(e) => this.rowSelect(e)}
                                            modules={this.state.modules}
                                            columnDefs={this.state.columnDefs}
                                            getRowHeight={this.getRowHeight}
                                            defaultColDef={this.state.defaultColDef}
                                            rowData={this.state.rowData}
                                            onGridReady={(params) => this.onGridReady(params)}
                                            onCellEditingStarted={this.onCellEditingStarted}
                                            onCellEditingStopped={() => this.getData(this.gridApi.getModel().rowsToDisplay)}
                                            frameworkComponents={this.state.frameworkComponents}
                                            stopEditingWhenGridLosesFocus={true}
                                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                        // cellDoubleClicked={(e) => this.cellDoubleClicked(e)}
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>
                    </Col>
                </Row>
                <Modal isOpen={this.state.multipleModal} toggle={() => this.multipleToggle()}>
                    {
                        <ModalHeader toggle={() => this.multipleToggle()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to make the changes?`
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.saveAll()}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.multipleToggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    users: state.user.users,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    testcaseDetail: state.testcase.testcaseDetail
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(CreateMultiple);








