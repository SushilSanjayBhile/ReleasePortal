import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
    Col, Button, Input, Collapse, FormGroup, Label
} from 'reactstrap';
import Multiselect from 'react-bootstrap-multiselect';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { updateTCEdit } from '../../../actions';

class EditPendingForApproval extends Component {
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
        let obj = null;
        if (checked && this.props.testcaseEdit[field]) {
            obj = [...this.props.testcaseEdit[field], value];
        }
        if (checked && !this.props.testcaseEdit[field]) {
            obj = [value];
        }
        if (!checked && this.props.testcaseEdit[field]) {
            let array = this.props.testcaseEdit[field];
            array.splice(array.indexOf(value), 1);
            obj = array;
        }
        let updated = { ...this.props.testcaseEdit, [field]: obj, errors: { ...this.props.testcaseEdit.errors, [field]: null } };
        this.props.updateTCEdit(updated);
    }
    render() {
        let cards = this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.map(item => ({ value: item, selected: this.props.testcaseEdit.CardType && this.props.testcaseEdit.CardType.includes(item) })) : [];
        let servers = this.props.selectedRelease.ServerType ? this.props.selectedRelease.ServerType.map(item => ({ value: item, selected: this.props.testcaseEdit.ServerType && this.props.testcaseEdit.ServerType.includes(item) })) : [];
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item, selected: this.props.testcaseEdit.OrchestrationPlatform && this.props.testcaseEdit.OrchestrationPlatform.includes(item) })) : [];
        let multiselect = { 'CardType': cards, 'OrchestrationPlatform': op, 'ServerType': servers };
        return (
            <div>
                <div className='rp-app-table-header' style={{
                        cursor: 'pointer',
                        borderStyle: 'solid',
                        borderWidth: '1px 0px 0px 0px',
                        paddingTop: '1rem'
                    }}>
                        <div class="row">
                            <div class='col-md-12'>
                                <span className='rp-app-table-value'>TC ID: {this.props.testcaseDetail.TcID}</span>
                                <span></span>
                                <div style={{ display: 'inline', marginLeft: '2rem' }}>
                                    <div style={{ display: 'inline' }}>
                                        <span>Created on </span><span style={{
                                            fontSize: '16px',
                                            color: '#04381a',
                                            marginRight: '1rem'
                                        }}>{this.props.testcaseDetail.Date}</span>
                                        <span>Created by</span><span style={{
                                            fontSize: '16px',
                                            color: '#04381a',
                                            marginRight: '1rem'
                                        }}> {this.props.testcaseDetail.Created}</span>
                                    </div>
                                </div>
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
                                    !this.props.isEditing ?
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
                                        !this.props.isEditing ?
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
                            this.props.testcaseDetail.Domain && this.props.testcaseDetail.SubDomain &&
                            <React.Fragment>
                                {
                                    [
                                        { field: 'Scenario', header: 'Scenario', type: 'text' },
                                    ].map((item, index) => (
                                        <Col xs="6" md="4" lg="3">
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
                                }
                                <Col xs="6" md="3" lg="3">
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
                                    ].map(item => (
                                        <Col xs="6" md="3" lg="3">
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

                                                                this.props.users.map(item => <option value={item.email}>{item.email}</option>)
                                                            }
                                                        </Input>
                                                }
                                            </FormGroup>
                                        </Col>))
                                }
                            </React.Fragment>
                        }
                    </FormGroup>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    testcaseDetail: state.testcase.testcaseDetail,
    testcaseEdit: state.testcase.testcaseEdit
})
export default connect(mapStateToProps, {updateTCEdit})(EditPendingForApproval);