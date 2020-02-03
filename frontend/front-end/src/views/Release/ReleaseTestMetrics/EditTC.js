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
class EditTC extends Component {
    WorkingStatusOptions = [
        'CREATED',
        'UNAPPROVED',
        'UNASSIGNED',
        'MANUAL_ASSIGNED',
        'AUTO_ASSIGNED',
        'MANUAL_COMPLETED',
        'AUTO_COMPLETED',
        'PENDING_FOR_APPROVAL'
    ]
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            edited: {},
        }
    }
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
        console.log(value);
        let updated = {};
        switch (field) {
            // case 'CardType':
            //     let cardType = [];
            //     if (checked && this.props.testcaseEdit.CardType) {
            //         console.log(this.props.testcaseEdit.CardType)
            //         cardType = [...this.props.testcaseEdit.CardType, value];
            //     }
            //     if (checked && !this.props.testcaseEdit.CardType) {
            //         cardType = [value];
            //     }
            //     if (!checked && this.props.testcaseEdit.CardType) {
            //         let array = this.props.testcaseEdit.CardType;
            //         array.splice(array.indexOf(value), 1);
            //         cardType = array;
            //     }

            //     console.log(cardType)
            //     let updated = { ...this.props.testcaseEdit, CardType: cardType, errors: { ...this.props.testcaseEdit.errors, CardType: null } };
            //     this.props.updateTCEdit(updated);
            //     break;
            case 'OrchestrationPlatform':
                let op = null;
                if (checked && this.props.testcaseEdit.OrchestrationPlatform) {
                    op = [...this.props.testcaseEdit.OrchestrationPlatform, value];
                }
                if (checked && !this.props.testcaseEdit.OrchestrationPlatform) {
                    op = [value];
                }
                if (!checked && this.props.testcaseEdit.OrchestrationPlatform) {
                    let array = this.props.testcaseEdit.OrchestrationPlatform;
                    array.splice(array.indexOf(value), 1);
                    op = array;
                }
                updated = { ...this.props.testcaseEdit, OrchestrationPlatform: op, errors: { ...this.props.testcaseEdit.errors, OrchestrationPlatform: null } }
                this.props.updateTCEdit(updated);
                break;
            case 'ServerType':
                let servers = null;
                if (checked && this.props.testcaseEdit.ServerType) {
                    servers = [...this.props.testcaseEdit.ServerType, value];
                }
                if (checked && !this.props.testcaseEdit.ServerType) {
                    servers = [value];
                }
                if (!checked && this.props.testcaseEdit.ServerType) {
                    let array = this.props.testcaseEdit.ServerType;
                    array.splice(array.indexOf(value), 1);
                    servers = array;
                }
                updated = { ...this.props.testcaseEdit, ServerType: servers, errors: { ...this.props.testcaseEdit.errors, ServerType: null } }
                this.props.updateTCEdit(updated);
                break;
            default:
                break;
        }

    }
    render() {

        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE');
        let statuses = this.WorkingStatusOptions

        let cards = this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.map(item => ({ value: item, selected: this.props.testcaseEdit.CardType && this.props.testcaseEdit.CardType.includes(item) })) : [];
        let servers = this.props.selectedRelease.ServerType ? this.props.selectedRelease.ServerType.map(item => ({ value: item, selected: this.props.testcaseEdit.ServerType && this.props.testcaseEdit.ServerType.includes(item) })) : [];
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item, selected: this.props.testcaseEdit.OrchestrationPlatform && this.props.testcaseEdit.OrchestrationPlatform.includes(item) })) : [];
        let multiselect = { 'CardType': cards, 'OrchestrationPlatform': op, 'ServerType': servers };
        return (

            <div>
                <React.Fragment>
                    <div className='rp-app-table-header' style={{
                        cursor: 'pointer',
                        paddingTop: '1rem'
                    }}>
                    </div>
                    {
                        this.props.isEditing &&

                        <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>

                            <Col xs="12" md="6" lg="6">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor="Result">
                                        Result
                                                        </Label>
                                    {
                                        !this.props.isEditing ?
                                            <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.CurrentStatus}</span></div> :
                                            <Input value={this.props.testcaseEdit && this.props.testcaseEdit.CurrentStatus} onChange={(e) => this.props.updateTCEdit({
                                                ...this.props.testcaseEdit, CurrentStatus: e.target.value,
                                                errors: { ...this.props.testcaseEdit.errors, CurrentStatus: null }
                                            })} type="select" >
                                                <option value=''>Select Status</option>
                                                <option value='Fail'>Fail</option>
                                                <option value='Pass'>Pass</option>
                                            </Input>
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="12" md="6" lg="6">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor="Build Number">
                                        Build Number
                                                     </Label>
                                    {
                                        !this.props.isEditing ?
                                            <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Build}</span></div> :
                                            <Input placeholder='Build Number' value={this.props.testcaseEdit && this.props.testcaseEdit.Build} onChange={(e) => this.props.updateTCEdit({
                                                ...this.props.testcaseEdit, Build: e.target.value,
                                                errors: { ...this.props.testcaseEdit.errors, Build: null }
                                            })} type="input" >
                                            </Input>
                                    }
                                </FormGroup>
                            </Col>
                            {/* <Col xs="12" md="6" lg="6">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor="Card Type">
                                        Card Type
                                                     </Label>
                                    {
                                        // !this.props.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.CardType}</span></div>
                                        //  <Input placeholder='Build Number' value={this.props.testcaseEdit && this.props.testcaseEdit.Build} onChange={(e) => this.props.updateTCEdit({
                                        //             ...this.props.testcaseEdit, Build: e.target.value,
                                        //             errors: { ...this.props.testcaseEdit.errors, Build: null }
                                        //             })}  type="input" >
                                        //  </Input>
                                    }
                                </FormGroup>
                            </Col> */}

                        </FormGroup>
                    }
                    {/* <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="WorkingStatus">
                                    Working Status
                                    {
                                        this.props.testcaseEdit.errors['WorkingStatus'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['WorkingStatus']}</i>
                                    }
                                </Label>
                                {
                                    !this.props.isEditing || (!this.props.currentUser.isAdmin && (this.props.testcaseDetail.WorkingStatus === 'CREATED' || this.props.testcaseDetail.WorkingStatus === 'UNAPPROVED')) ?
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.WorkingStatus}</span></div>
                                        :
                                        <Input style={{ borderColor: this.props.testcaseEdit.errors['WorkingStatus'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="WorkingStatus" name="WorkingStatus" value={this.props.testcaseEdit && this.props.testcaseEdit.WorkingStatus}
                                            onChange={(e) => {
                                                this.setState({ statusChange: true });
                                                this.props.updateTCEdit({ ...this.props.testcaseEdit, WorkingStatus: e.target.value, errors: { ...this.props.testcaseEdit.errors, WorkingStatus: null } })
                                            }} >
                                            {
                                                this.WorkingStatusOptions &&
                                                this.WorkingStatusOptions.map(item => <option value={item}>{item}</option>)
                                            }
                                        </Input>
                                }
                            </FormGroup>
                            <Collapse isOpen={this.state.statusChange}>
                                {
                                    this.props.testcaseEdit.WorkingStatus && this.props.testcaseEdit.WorkingStatus.search('COMPLETED') > 0 ?
                                        <React.Fragment>
                                            <div>
                                                <span className='rp-app-table-label'>Result</span>
                                                <div style={{ display: 'inlineBlock' }}>
                                                    <Input type="select" onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Status: e.target.value, StatusChangeComments: { ...this.props.StatusChangeComments, Result: e.target.value }, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >
                                                        <option value="Fail">Fail</option>
                                                        <option value="Pass">Pass</option>
                                                    </Input>
                                                </div>
                                            </div>
                                            <div>
                                                <span className='rp-app-table-label'>Log Url</span>
                                                <div style={{ display: 'inlineBlock' }}>
                                                    <Input type="text" onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, StatusChangeComments: { ...this.props.StatusChangeComments, logURL: e.target.value }, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >

                                                    </Input>
                                                </div>
                                            </div>
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor="StatusChangeComments">
                                                    Notes
                                            </Label>
                                                {
                                                    <Input className='rp-app-table-value' placeholder={'Add Comments'} type="textarea" rows='4' id='StatusComments'
                                                        value={this.props.testcaseEdit && this.props.testcaseEdit.StatusChangeComments && this.props.testcaseEdit.StatusChangeComments.Notes}
                                                        onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, StatusChangeComments: { ...this.props.StatusChangeComments, Notes: e.target.value }, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >

                                                    </Input>
                                                }
                                            </FormGroup>
                                        </React.Fragment> :
                                        this.props.testcaseEdit.Status && this.props.testcaseEdit.Status === 'BUG' ?
                                            <React.Fragment>
                                                <div>
                                                    <span className='rp-app-table-label'>DWS Url</span>
                                                    <div style={{ display: 'inlineBlock' }}>
                                                        <Input type="text" onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, StatusChangeComments: { ...this.props.StatusChangeComments, logURL: e.target.value }, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >
                                                        </Input>
                                                    </div>
                                                </div>
                                                <FormGroup className='rp-app-table-value'>
                                                    <Label className='rp-app-table-label' htmlFor="StatusChangeComments">
                                                        Notes
                                            </Label>
                                                    {
                                                        <Input className='rp-app-table-value' placeholder={'Add Notes'} type="textarea" rows='4' id='StatusComments'
                                                            value={this.props.testcaseEdit && this.props.testcaseEdit.StatusChangeComments && this.props.testcaseEdit.StatusChangeComments.Notes}
                                                            onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, StatusChangeComments: { ...this.props.StatusChangeComments, Notes: e.target.value }, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >

                                                        </Input>
                                                    }
                                                </FormGroup>
                                            </React.Fragment> :
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor="StatusChangeComments">
                                                    Add Comments for changing Status
                                            </Label>
                                                {
                                                    <Input className='rp-app-table-value' placeholder={'Add Comments'} type="textarea" rows='4' id='StatusComments' value={this.props.testcaseEdit && this.props.testcaseEdit.StatusChangeComments}
                                                        onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, StatusChangeComments: e.target.value, errors: { ...this.props.testcaseEdit.errors, StatusChangeComments: null } })} >

                                                    </Input>
                                                }
                                            </FormGroup>
                                }

                            </Collapse>
                        </Col>
                    </FormGroup> */}
                    <div>TC Information</div>
                    <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        {
                            [
                                { field: 'Assignee', header: 'Assignee' },
                                // { field: 'Status', header: 'Status' },
                            ].map(item => (
                                <Col xs="12" md="6" lg="6">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                            this.props.testcaseEdit.errors[item.field] &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                        }</Label>
                                        {
                                            !this.props.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' type="select" id={item.field} name={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]} onChange={(e) =>
                                                    this.props.updateTCEdit(
                                                        {
                                                            ...this.props.testcaseEdit, [item.field]: e.target.value,
                                                            errors: { ...this.props.testcaseEdit.errors, [item.field]: null }
                                                        })} >
                                                    <option value="">{`Select ${item.header}`}</option>
                                                    <option value='ADMIN'>ADMIN</option>
                                                    {

                                                        this.props.users.map(item => <option value={item}>{item}</option>)
                                                    }
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>))
                        }
                        <Col xs="12" md="6" lg="6">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Domain">
                                    Domain
                                    {
                                        this.props.testcaseEdit.errors['Domain'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['Domain']}</i>
                                    }
                                </Label>
                                {
                                    // !this.props.isEditing ?
                                    <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Domain}</span></div>
                                    // :
                                    // <Input style={{ borderColor: this.props.testcaseEdit.errors['Domain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.props.testcaseEdit && this.props.testcaseEdit.Domain}
                                    //     onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Domain: e.target.value, errors: { ...this.props.testcaseEdit.errors, Domain: null } })} >
                                    //     <option value=''>Select Domain</option>
                                    //     {
                                    //         this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions &&
                                    //         Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions).map(item => <option value={item}>{item}</option>)
                                    //     }
                                    // </Input>
                                }
                            </FormGroup>
                        </Col>
                        {
                            (this.props.testcaseEdit.Domain || this.props.testcaseDetail.Domain) &&
                            <Col xs="12" md="6" lg="6">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor="SubDomain">Sub Domain
                                                {
                                            this.props.testcaseEdit.errors['SubDomain'] &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['SubDomain']}</i>
                                        }
                                    </Label>
                                    {

                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.SubDomain}</span></div>
                                        // :
                                        // <Input style={{ borderColor: this.props.testcaseEdit.errors['SubDomain'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="Domain" value={this.props.testcaseEdit && this.props.testcaseEdit.SubDomain}
                                        //     onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, SubDomain: e.target.value, errors: { ...this.props.testcaseEdit.errors, SubDomain: null } })} >
                                        //     <option value=''>Select Sub Domain</option>
                                        //     {
                                        //         this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions &&
                                        //         this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.props.testcaseEdit.Domain].map(item => <option value={item}>{item}</option>)
                                        //     }
                                        // </Input>
                                    }
                                </FormGroup>
                            </Col>
                        }
                        {
                            (this.props.testcaseEdit.Domain || this.props.testcaseDetail.Domain) && (this.props.testcaseEdit.SubDomain || this.props.testcaseDetail.SubDomain) &&
                            <React.Fragment>


                                {
                                    [
                                        { field: 'TcName', header: 'Tc Name', type: 'text', restrictWidth: false },
                                        { field: 'Scenario', header: 'Scenario', type: 'text' },

                                    ].map((item, index) => (
                                        <Col xs="12" md="6" lg="6">
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                    this.props.testcaseEdit.errors[item.field] &&
                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                                }</Label>
                                                {
                                                    !this.props.isEditing ?
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
                                {/* {
                                    [
                                        // { field: 'CardType', header: 'Card Type' },
                                        // { field: 'ServerType', header: 'Server Type' },
                                        // { field: 'OrchestrationPlatform', header: 'Orchestration Platform' },
                                    ].map(item => (
                                        <Col xs="6" md="4" lg="3">
                                            <FormGroup className='rp-app-table-value'>
                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                    {
                                                        this.props.testcaseEdit.errors[item.field] &&
                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors[item.field]}</i>
                                                    }</Label>
                                                {
                                                    !this.props.isEditing &&
                                                    <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>


                                                }

                                                {
                                                    <div style={{ display: this.props.isEditing ? '' : 'none' }}><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                        data={multiselect[item.field]} multiple /></div>
                                                }
                                            </FormGroup>
                                        </Col>
                                    ))
                                } */}
                                {/* TAG OPTION UPCOMING */}




                                {/* <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='Master' >Include in Master {
                                            this.props.testcaseEdit.errors.Master &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Master}</i>
                                        }</Label>
                                        {
                                            !this.props.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Master ? 'Yes' : 'No'}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.Master ? 'red' : '' }} className='rp-app-table-value' type="select" id="Master" name="Master" value={this.props.testcaseEdit && this.props.testcaseEdit.Master}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Master: e.target.value, errors: { ...this.props.testcaseEdit.errors, Master: null } })} >
                                                    <option value={true}>Yes</option>
                                                    <option value={false}>No</option>
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col> */}
                                <Col xs="12" md="6" lg="6">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='Master' >Priority {
                                            this.props.testcaseEdit.errors.Priority &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Priority}</i>
                                        }</Label>
                                        {
                                            !this.props.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Priority}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.Priority ? 'red' : '' }} className='rp-app-table-value' type="select" id="Priority" name="Priority" value={this.props.testcaseEdit && this.props.testcaseEdit.Priority}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Priority: e.target.value, errors: { ...this.props.testcaseEdit.errors, Priority: null } })} >
                                                    <option value=''>Select Priority</option>
                                                    {
                                                        ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Skip', 'NA'].map(item =>
                                                            <option value={item}>{item}</option>
                                                        )
                                                    }
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>
                                <Col xs="12" md="6" lg="6">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='TAG'>Tag {
                                            this.props.testcaseEdit.errors.Tag &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Tag}</i>
                                        }</Label>
                                        {
                                            !this.props.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Tag}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.Tag ? 'red' : '' }} className='rp-app-table-value' type="select" id="TAG" name="TAG" value={this.props.testcaseEdit && this.props.testcaseEdit.Tag}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, Tag: e.target.value, errors: { ...this.props.testcaseEdit.errors, Tag: null } })} >
                                                    <option value=''>Select Tag</option>
                                                    {
                                                        ['DAILY', 'WEEKLY', 'SANITY'].map(item => <option value={item}>{item}</option>)
                                                    }
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>
                                <Col xs="12" md="6" lg="6">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor='WorkingStatus'>Working Status {
                                            this.props.testcaseEdit.errors.WorkingStatus &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.WorkingStatus}</i>
                                        }</Label>
                                        {
                                            !this.props.isEditing ?
                                                <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.WorkingStatus}</span></div>
                                                :
                                                <Input style={{ borderColor: this.props.testcaseEdit.errors.WorkingStatus ? 'red' : '' }} className='rp-app-table-value' type="select" id="WorkingStatus" name="WorkingStatus" value={this.props.testcaseEdit && this.props.testcaseEdit.WorkingStatus}
                                                    onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, WorkingStatus: e.target.value, errors: { ...this.props.testcaseEdit.errors, WorkingStatus: null } })} >
                                                    <option value=''>Select Working Status</option>
                                                    {

                                                        ['CREATED', 'UNASSIGNED', 'DEV_ASSIGNED', 'DEV_APPROVED', 'APPROVED', 'UNAPPROVED', 'MANUAL_ASSIGNED', 'MANUAL_COMPLETED',
                                                            'AUTO_ASSIGNED', 'AUTO_COMPLETED', 'DELETED'
                                                        ].map(item => <option value={item}>{item}</option>)
                                                    }
                                                </Input>
                                        }
                                    </FormGroup>
                                </Col>



                            </React.Fragment>
                        }
                    </FormGroup>
                </React.Fragment>

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
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase, updateTCEdit })(EditTC);








