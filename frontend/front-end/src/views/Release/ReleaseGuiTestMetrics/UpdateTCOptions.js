// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component, Fragment } from 'react';
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
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase, updateTCEdit } from '../../../actions';
import Multiselect from 'react-bootstrap-multiselect';
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class UpdateTCOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            edited: {},
        }
    }
    render() {

        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXEC');
        let statuses = this.props.selectedRelease.StatusOptions

        let cards = this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.map(item => ({ value: item, selected: this.props.testcaseEdit.CardType && this.props.testcaseEdit.CardType.includes(item) })) : [];
        let servers = this.props.selectedRelease.ServerType ? this.props.selectedRelease.ServerType.map(item => ({ value: item, selected: this.props.testcaseEdit.ServerType && this.props.testcaseEdit.ServerType.includes(item) })) : [];
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item, selected: this.props.testcaseEdit.OrchestrationPlatform && this.props.testcaseEdit.OrchestrationPlatform.includes(item) })) : [];
        let multiselect = { 'CardType': cards, 'OrchestrationPlatform': op, 'ServerType': servers };
        return (
            <div>
                <React.Fragment>
                    <div className='rp-app-table-header' style={{
                        cursor: 'pointer',
                        borderStyle: 'solid',
                        borderWidth: '1px 0px 0px 0px',
                        paddingTop: '1rem'
                    }}>
                        <div class="row">
                            <div class='col-md-12'>
                                {
                                    this.props.currentUser && this.state.isEditing ?
                                        <Fragment>
                                            <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                <i className="fa fa-check-square-o"></i>
                                            </Button>
                                            <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.reset()} >
                                                <i className="fa fa-undo"></i>
                                            </Button>
                                        </Fragment>
                                        :
                                        <Fragment>
                                            <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.setState({ isEditing: true })} >
                                                <i className="fa fa-pencil-square-o"></i>
                                            </Button>
                                        </Fragment>
                                }
                            </div>

                        </div>

                    </div>
                    <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Domain">
                                    Domain
                                    {
                                        this.props.testcaseEdit.errors['Domain'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['Domain']}</i>
                                    }
                                </Label>
                                {
                                    !this.state.isEditing ?
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Domain}</span></div>
                                        :
                                        <Input style={{ borderColor: this.props.testcaseEdit.errors['Domain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.props.testcaseEdit && this.props.testcaseEdit.Domain}
                                            onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Domain: e.target.value, errors: { ...this.props.testcaseEdit.errors, Domain: null } })} >
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
                            (this.props.testcaseEdit.Domain || this.props.testcaseDetail.Domain) &&
                            <Col xs="6" md="4" lg="3">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor="SubDomain">Sub Domain
                                                {
                                            this.props.testcaseEdit.errors['SubDomain'] &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['SubDomain']}</i>
                                        }
                                    </Label>
                                    {
                                        !this.state.isEditing ?
                                            <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.SubDomain}</span></div>
                                            :
                                            <Input style={{ borderColor: this.props.testcaseEdit.errors['SubDomain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.props.testcaseEdit && this.props.testcaseEdit.SubDomain}
                                                onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, SubDomain: e.target.value, errors: { ...this.props.testcaseEdit.errors, SubDomain: null } })} >
                                                <option value=''>Select Sub Domain</option>
                                                {
                                                    this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions &&
                                                    this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.props.testcaseEdit.Domain].map(item => <option value={item}>{item}</option>)
                                                }
                                            </Input>
                                    }
                                </FormGroup>
                            </Col>
                        }
                        {
                            (this.props.testcaseEdit.Domain || this.props.testcaseDetail.Domain) && (this.props.testcaseEdit.SubDomain || this.props.testcaseDetail.SubDomain) &&
                            <React.Fragment>


                                {
                                    [
                                        { field: 'TcName', header: 'Tc Name *', type: 'text', restrictWidth: false },
                                        { field: 'Scenario', header: 'Scenario *', type: 'text' },

                                    ].map((item, index) => (
                                        <Col xs="6" md="4" lg="3">
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                    this.props.testcaseEdit.errors[item.field] &&
                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                                }</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <div key={index} className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
                                                        :
                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} key={index} className='rp-app-table-value' type="text" placeholder={`Add ${item.header}`} id={item.field} name={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]}
                                                            onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, [item.field]: e.target.value, errors: { ...this.props.testcaseEdit.errors, [item.field]: null } })} >

                                                        </Input>
                                                }
                                            </FormGroup>
                                        </Col>
                                    ))
                                }
                                {
                                    [
                                        { field: 'CardType', header: 'Card Type' },
                                        { field: 'ServerType', header: 'Server Type' },
                                        { field: 'OrchestrationPlatform', header: 'Orchestration Platform' },
                                    ].map(item => (
                                        <Col xs="6" md="4" lg="3">
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                    {
                                                        this.props.testcaseEdit.errors[item.field] &&
                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                                    }</Label>
                                                {
                                                    !this.state.isEditing &&
                                                    <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>


                                                }

                                                {
                                                    <div style={{ display: this.state.isEditing ? '' : 'none' }}><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                        data={multiselect[item.field]} multiple /></div>
                                                }
                                            </FormGroup>
                                        </Col>
                                    ))
                                }
                                <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='TAG'>E2E Test Tag {
                                            this.props.testcaseEdit.errors.Tag &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Tag}</i>
                                        }</Label>
                                        {
                                            !this.state.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Tag}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.Tag ? 'red' : '' }} className='rp-app-table-value' type="select" id="TAG" name="TAG" value={this.props.testcaseEdit && this.props.testcaseEdit.Tag}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Tag: e.target.value, errors: { ...this.props.testcaseEdit.errors, Tag: null } })} >
                                                    {
                                                        this.props.selectedRelease.TagOptions &&
                                                        this.props.selectedRelease.TagOptions.map(item => <option value={item}>{item}</option>)
                                                    }
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>


                                {
                                    [
                                        { field: 'Assignee', header: 'Assignee' },
                                        // { field: 'Status', header: 'Status' },
                                    ].map(item => (
                                        <Col xs="6" md="3" lg="3">
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                                    this.props.testcaseEdit.errors[item.field] &&
                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                                }</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
                                                        :
                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' type="select" id={item.field} name={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]} onChange={(e) =>
                                                            this.props.updateTCEdit(
                                                                {
                                                                    ...this.props.testcaseEdit, [item.field]: e.target.value,
                                                                    errors: { ...this.props.testcaseEdit.errors, [item.field]: null }
                                                                })} >
                                                            <option value={`Select ${item.header}`}></option>
                                                            {

                                                                this.props.users.map(item => <option value={item}>{item}</option>)
                                                            }
                                                        </Input>
                                                }
                                            </FormGroup>
                                        </Col>))
                                }
                                <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='Master' >Include in Master {
                                            this.props.testcaseEdit.errors.Master &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Master}</i>
                                        }</Label>
                                        {
                                            !this.state.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Master ? 'Yes' : 'No'}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.Master ? 'red' : '' }} className='rp-app-table-value' type="select" id="Master" name="Master" value={this.props.testcaseEdit && this.props.testcaseEdit.Master}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Master: e.target.value, errors: { ...this.props.testcaseEdit.errors, Master: null } })} >
                                                    <option value={true}>Yes</option>
                                                    <option value={false}>No</option>
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>



                            </React.Fragment>
                        }
                    </FormGroup>
                </React.Fragment>
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
                        <Button color="primary" onClick={() => { this.props.delete(); this.toggleDelete(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleDelete()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    users: state.user.users.map(item => item.email),
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    testcaseDetail: state.testcase.testcaseDetail,
    testcaseEdit: state.testcase.testcaseEdit
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase, updateTCEdit })(UpdateTCOptions);








