import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
    Col, Button, Input, Collapse, FormGroup, Label
} from 'reactstrap';
import Multiselect from 'react-bootstrap-multiselect';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { updateTCEdit } from '../../../actions';

class EditMyTcsForRegression extends Component {
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
                                 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.Domain}</span></div>
                                   
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
                                       
                                            <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail.SubDomain}</span></div>
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
            
                                                        <div key={index} className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
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
                                                    
                                                    <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
                                                }
                                                {/* {
                                                    <div style={{ display: this.props.isEditing ? '' : 'none' }}><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                        data={multiselect[item.field]} multiple /></div>
                                                } */}
                                            </FormGroup>
                                        </Col>
                                    ))
                                }
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
                                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.testcaseDetail && this.props.testcaseDetail[item.field]}</span></div>
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
export default connect(mapStateToProps, {updateTCEdit})(EditMyTcsForRegression);