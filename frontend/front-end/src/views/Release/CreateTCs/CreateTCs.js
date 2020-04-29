// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress, Popover, PopoverBody, FormGroup, Label, TabContent, TabPane, Nav, NavItem, NavLink,
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
import CreateMultiple from './CreateMultiple';
import UpdateMultiple from './UpdateMultiple';
import classnames from 'classnames';
import { workingStatuses, steps } from '../../../constants';
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class CreateTCs extends Component {
    // [field] : {old,new}
    changeLog = {};
    constructor(props) {
        super(props);
        this.state = {
            addTC: { Master: true },
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            edited: {},
            errors: {},
            multipleErrors: { 'mesg': 'hi' },
            activeTab: '1',
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });

    toggleTab = tab => {
        if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
    }

    textFields = [
        'Domain', 'SubDomain',
        'TcID', 'TcName', 'Scenario', 'Tag', 'Assignee', 'AutoAssignee', 'DevAssignee', 'Priority',
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
    getTcName(name) {
        let tcName = name;
        if (!tcName || tcName === 'NOT AUTOMATED' || tcName === undefined || tcName === null) {
            tcName = 'TC NOT AUTOMATED';
        }
        return tcName;
    }

    save() {
        let data = {};
        // tc info meta fields
        // data.Role = 'QA';
        // tc info fields
        this.textFields.map(item => data[item] = this.state.addTC[item]);
        this.arrayFields.forEach(item => data[item] = this.state.addTC[item]);
        data.Activity = {
            Release: this.props.selectedRelease.ReleaseNumber,
            "TcID": data.TcID,
            "CardType": data.CardType,
            "UserName": this.props.currentUser.email,
            "LogData": `${JSON.stringify(this.changeLog)}`,
            "RequestType": 'POST',
            "URL": `/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`
        };
        let request = {};
        if (this.props.currentUser && this.props.currentUser.isAdmin) {
            if (data.Assignee && data.Assignee !== 'ADMIN') {
                request = steps.onAdminManualAssigned({ step: 'onAdminManualAssigned', Assignee: data.Assignee });
                request.note = 'added by admin and unassigned'
            } else {
                request = steps.onAdminCreate();
                request.note = 'added by admin and unassigned'
            }
        } else {
            request = steps.onNonAdminCreateRequest({ Assignee: this.props.currentUser.email });
            request.note = 'added by non-admin and pending for approval'
        }
        data = { ...data, ...request }
        data.TcName = this.getTcName(`${data.TcName}`);
        axios.post(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                // this.getTcs();
                this.setState({ addTC: { Master: true, Domain: this.state.Domain, SubDomain: this.state.SubDomain, CardType: this.state.CardType }, errors: {} });
                alert(`TC ${data.TcID} Added Successfully`)
            }, error => {
                alert('failed to create TC');
            });
    }
    confirmToggle() {
        let errors = null;
        this.changeLog = {};
        ['Domain', 'SubDomain', 'TcID', 'CardType']
            .forEach(item => {
                if (!errors) {
                    let valid = (this.state.addTC[item] && this.state.addTC[item].length > 0);
                    if (!valid) {
                        errors = { ...this.state.errors, [item]: 'Cannot be empty' };
                    }
                }
            });
        if (!isNaN(this.state.addTC['TcID'])) {
            errors = { ...this.state.errors, TcID: 'Cannot be a number' };
        }
        if (this.props.currentUser && !this.props.currentUser.isAdmin) {
            if (!this.state.addTC['Assignee'] || this.state.addTC['Assignee'] === 'ADMIN') {
                errors = { ...this.state.errors, Assignee: 'Cannot be ADMIN or empty' };
            }
        }
        if (!errors) {
            this.changeLog = this.whichFieldsUpdated({}, this.state.addTC);
            this.toggle();
        } else {
            this.setState({ errors: errors })
        }
    }
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
        switch (field) {
            case 'CardType':
                let cardType = null;
                if (checked && this.state.addTC.CardType) {
                    cardType = [...this.state.addTC.CardType, value];
                }
                if (checked && !this.state.addTC.CardType) {
                    cardType = [value];
                }
                if (!checked && this.state.addTC.CardType) {
                    let array = this.state.addTC.CardType;
                    array.splice(array.indexOf(value), 1);
                    cardType = array;
                }
                this.setState({ addTC: { ...this.state.addTC, CardType: cardType }, errors: { ...this.state.errors, CardType: null } });
                break;
            case 'OrchestrationPlatform':
                let op = null;
                if (checked && this.state.addTC.OrchestrationPlatform) {
                    op = [...this.state.addTC.OrchestrationPlatform, value];
                }
                if (checked && !this.state.addTC.OrchestrationPlatform) {
                    op = [value];
                }
                if (!checked && this.state.addTC.OrchestrationPlatform) {
                    let array = this.state.addTC.OrchestrationPlatform;
                    array.splice(array.indexOf(value), 1);
                    op = array;
                }
                this.setState({ addTC: { ...this.state.addTC, OrchestrationPlatform: op }, errors: { ...this.state.errors, OrchestrationPlatform: null } });
                break;
            case 'ServerType':
                let servers = null;
                if (checked && this.state.addTC.ServerType) {
                    servers = [...this.state.addTC.ServerType, value];
                }
                if (checked && !this.state.addTC.ServerType) {
                    servers = [value];
                }
                if (!checked && this.state.addTC.ServerType) {
                    let array = this.state.addTC.ServerType;
                    array.splice(array.indexOf(value), 1);
                    servers = array;
                }
                this.setState({ addTC: { ...this.state.addTC, ServerType: servers }, errors: { ...this.state.errors, ServerType: null } });
                break;
            default:
                break;
        }

    }
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
    render() {

        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE').map(item => item.email);

        let cards = ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(item => ({ value: item, selected: this.state.addTC.CardType && this.state.addTC.CardType.includes(item) }));
        let servers = ['Intel', 'Dell', 'Lenovo'].map(item => ({ value: item, selected: this.state.addTC.ServerType && this.state.addTC.ServerType.includes(item) }));
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item, selected: this.state.addTC.OrchestrationPlatform && this.state.addTC.OrchestrationPlatform.includes(item) })) : [];
        let multiselect = { 'CardType': cards, 'OrchestrationPlatform': op, 'ServerType': servers };
        return (
            <div>
                {
                    this.props.currentUser &&
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                                <div class="row">
                                    <div class='col-md-12'>
                                        {/* <React.Fragment> */}
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ display: 'inlineBlock' }} onClick={() => this.setState({ createTc: !this.state.createTc })}>
                                                {
                                                    !this.state.createTc &&
                                                    <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                                }
                                                {
                                                    this.state.createTc &&
                                                    <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                                }

                                                <div className='rp-icon-button'><i className="fa fa-plus-circle"></i></div>
                                                <span className='rp-app-table-title'>Create OR Update Test Case</span>
                                                {
                                                    this.state.showLoading &&
                                                    <spam style={{ marginLeft: '2rem' }} className='rp-app-table-value'>Please Wait while TC are creating or updating ...</spam>
                                                }
                                                {
                                                    !this.state.showLoading && <span style={{ 'marginLeft': '2rem', fontWeight: '500', color: 'red' }}>TcName is Automated TC Name. It should contain '.' in its name. Please dont add description/scenario in TcName.</span>
                                                }
                                            </div>
                                        </div>


                                        {/* </React.Fragment> */}



                                    </div>

                                </div>

                            </div>
                            <Collapse isOpen={this.state.createTc}>
                                <Nav tabs>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '1' })}
                                            onClick={() => this.toggleTab('1')}>
                                            Multiple
                                </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '2' })}
                                            onClick={() => this.toggleTab('2')}
                                        >
                                            Single
                                </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '3' })}
                                            onClick={() => this.toggleTab('3')}
                                        >
                                            Update Multiple
                                </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId="1">
                                        <CreateMultiple showLoadingMessage={(show) => this.setState({ showLoading: show })}></CreateMultiple>
                                    </TabPane>
                                    <TabPane tabId="2">

                                        <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                                            <Button style={{ position: 'absolute', right: '1rem' }} title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                                <i className="fa fa-save"></i>
                                            </Button>
                                            <Col xs="6" md="3" lg="3">
                                                <FormGroup className='rp-app-table-value'>
                                                    <Label className='rp-app-table-label' htmlFor="Domain">
                                                        Domain
                                                {
                                                            this.state.errors['Domain'] &&
                                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors['Domain']}</i>
                                                        }
                                                    </Label>
                                                    {
                                                        !this.props.isEditing ?
                                                            <span className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail.Domain}</span>
                                                            :
                                                            <Input style={{ borderColor: this.state.errors['Domain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.state.addTC && this.state.addTC.Domain}
                                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Domain: e.target.value }, errors: { ...this.state.errors, Domain: null } })} >
                                                                <option value=''>Select Domain</option>
                                                                {
                                                                    this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions &&
                                                                    Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions).map(item => <option value={item}>{item}</option>)
                                                                }
                                                            </Input>
                                                    }
                                                </FormGroup>
                                            </Col>
                                            {
                                                this.state.addTC.Domain &&
                                                <Col xs="6" md="3" lg="3">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Label className='rp-app-table-label' htmlFor="SubDomain">Sub Domain
                                                {
                                                                this.state.errors['SubDomain'] &&
                                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors['SubDomain']}</i>
                                                            }
                                                        </Label>
                                                        {
                                                            !this.props.isEditing ?
                                                                <span className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail.SubDomain}</span>
                                                                :
                                                                <Input style={{ borderColor: this.state.errors['SubDomain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.state.addTC && this.state.addTC.SubDomain}
                                                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, SubDomain: e.target.value }, errors: { ...this.state.errors, SubDomain: null } })} >
                                                                    <option value=''>Select Sub Domain</option>
                                                                    {
                                                                        this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions &&
                                                                        this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.addTC.Domain].map(item => <option value={item}>{item}</option>)
                                                                    }
                                                                </Input>
                                                        }
                                                    </FormGroup>
                                                </Col>
                                            }

                                            {
                                                this.state.addTC.Domain && this.state.addTC.SubDomain &&
                                                <React.Fragment>
                                                    {
                                                        [
                                                            { field: 'CardType', header: 'Card Type' },
                                                            { field: 'ServerType', header: 'Server Type' },
                                                            // { field: 'OrchestrationPlatform', header: 'Orchestration Platform' },
                                                        ].map(item => (
                                                            <Col xs="6" md="3" lg="2">
                                                                <FormGroup className='rp-app-table-value'>
                                                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                                        {
                                                                            this.state.errors[item.field] &&
                                                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                                        }</Label>
                                                                    {
                                                                        !this.props.isEditing ?
                                                                            <span className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span>
                                                                            :
                                                                            <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                                                data={multiselect[item.field]} multiple /></div>
                                                                    }
                                                                </FormGroup>
                                                            </Col>
                                                        ))
                                                    }

                                                    {
                                                        [
                                                            { field: 'Scenario', header: 'Scenario *', type: 'text' },
                                                            { field: 'TcID', header: 'Tc ID *', type: 'text', }
                                                        ].map((item, index) => (
                                                            <Col xs="6" md="3" lg="3">
                                                                <FormGroup className='rp-app-table-value'>
                                                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                                        this.state.errors[item.field] &&
                                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                                    }</Label>
                                                                    {
                                                                        !this.props.isEditing ?
                                                                            <span key={index} className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span>
                                                                            :
                                                                            <Input style={{ borderColor: this.state.errors[item.field] ? 'red' : '' }} key={index} className='rp-app-table-value' type="text" placeholder={`Add ${item.header}`} id={item.field} name={item.field} value={this.state.addTC && this.state.addTC[item.field]}
                                                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value }, errors: { ...this.state.errors, [item.field]: null } })} >

                                                                            </Input>
                                                                    }
                                                                </FormGroup>
                                                            </Col>
                                                        ))
                                                    }
                                                    <Col xs="6" md="3" lg="3">
                                                        <FormGroup className='rp-app-table-value'>
                                                            <Label className='rp-app-table-label' htmlFor='TAG'>Tag {
                                                                this.state.errors.Tag &&
                                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors.Tag}</i>
                                                            }</Label>
                                                            {
                                                                !this.props.isEditing ?
                                                                    <span className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail.Tag}</span>
                                                                    :
                                                                    <Input style={{ borderColor: this.state.errors.Tag ? 'red' : '' }} className='rp-app-table-value' type="select" id="TAG" name="TAG" value={this.state.addTC && this.state.addTC.Tag}
                                                                        onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Tag: e.target.value }, errors: { ...this.state.errors, Tag: null } })} >
                                                                        {
                                                                            ['DAILY', 'WEEKLY', 'SANITY'].map(item => <option value={item}>{item}</option>)
                                                                        }
                                                                    </Input>
                                                            }
                                                        </FormGroup>
                                                    </Col>


                                                    {
                                                        [
                                                            { field: 'Assignee', header: 'Assignee' },
                                                            // { field: 'AutoAssignee', header: 'AutoAssignee' },
                                                            // { field: 'DevAssignee', header: 'DevAssignee' },
                                                            // { field: 'Status', header: 'Status' },
                                                        ].map(item => (
                                                            <Col xs="6" md="3" lg="3">
                                                                <FormGroup className='rp-app-table-value'>
                                                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                                                        this.state.errors[item.field] &&
                                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                                    }</Label>
                                                                    {
                                                                        !this.props.isEditing ?
                                                                            <span className='rp-app-table-value'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span>
                                                                            :
                                                                            <Input style={{ borderColor: this.state.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' type="select" id={item.field} name={item.field} value={this.state.addTC && this.state.addTC[item.field]} onChange={(e) =>
                                                                                this.setState(
                                                                                    {
                                                                                        addTC: { ...this.state.addTC, [item.field]: e.target.value },
                                                                                        errors: { ...this.state.errors, [item.field]: null }
                                                                                    })} >
                                                                                <option value=''>{`Select ${item.header}`}</option>
                                                                                <option value='ADMIN'>ADMIN</option>
                                                                                {
                                                                                    users &&
                                                                                    users.map(item => <option value={item}>{item}</option>)
                                                                                }
                                                                            </Input>
                                                                    }
                                                                </FormGroup>
                                                            </Col>))
                                                    }

                                                </React.Fragment>
                                            }
                                        </FormGroup>
                                        {
                                            this.state.addTC.Domain && this.state.addTC.SubDomain &&
                                            <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
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
                                                                    this.state.errors.Master &&
                                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors.Master}</i>
                                                                }</Label>
                                                                {
                                                                    !this.props.isEditing ?
                                                                        <Input style={{ borderColor: this.state.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' type='textarea' rows='9' readOnly={true}>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</Input>
                                                                        :
                                                                        <Input className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows='9' id={item.field} value={this.state.addTC && this.state.addTC[item.field]}
                                                                            onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value }, errors: { ...this.state.errors, [item.field]: null } })} >

                                                                        </Input>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
                                        }
                                    </TabPane>
                                    <TabPane tabId="3">
                                        <UpdateMultiple showLoadingMessage={(show) => this.setState({ showLoading: show })}></UpdateMultiple>
                                    </TabPane>
                                </TabContent>

                            </Collapse>
                        </Col>
                    </Row>
                }
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
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggle(); this.save() }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
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
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(CreateTCs);








