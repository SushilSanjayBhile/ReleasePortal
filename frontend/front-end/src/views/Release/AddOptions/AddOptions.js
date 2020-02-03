import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import {
    Row, Col, Button, Input, Collapse, FormGroup, Label,Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import Multiselect from 'react-bootstrap-multiselect';
import { getCurrentRelease, optionSelector } from '../../../reducers/release.reducer';
import { saveOptions } from '../../../actions';
import axios from 'axios';

class AddOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDomain: '',
        }
    }
    // {OrchestrationPlatform:[], CardType:[], ServerType:[], ReleaseSpecific:{2.3.0: {domains:{subDomains:[]}}}
    componentDidMount() {
        // axios.get(`/api/options/${this.props.selectedRelease.ReleaseNumber}`).then(options => {
        //     this.props.saveOptions(options.data);
        // })
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    confirmToggle() {
        this.toggle();
    }
    save() {
        alert(
            `Domains: ${this.state.domains}, Selected DOmain: ${this.state.selectedDomain} SubDomains: ${this.state.subDomains} 
            OP: ${this.state.OrchestrationPlatform}, ServerTypes: ${this.state.ServerType}, CardTypes: ${this.state.CardType}
            `)
    }
    edit(value) {
        this.setState({
            isEditing: value, 
            domains: this.props.selectedRelease && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions).join(','),
            selectedDomain: '',
            OrchestrationPlatform: this.props.selectedRelease && this.props.selectedRelease.OrchestrationPlatform && this.props.selectedRelease.OrchestrationPlatform.join(','),
            CardType: this.props.selectedRelease && this.props.selectedRelease.CardType && this.props.selectedRelease.CardType.join(','),
            ServerType: this.props.selectedRelease && this.props.selectedRelease.ServerType && this.props.selectedRelease.ServerType.join(',')
        })
    }
    render() {
                    let domains = this.props.options && this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber] && Object.keys(this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber].domains).join(',');
            let OrchestrationPlatform = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
            let CardType = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
            let ServerType = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
           
        return (
            <div>
                {
                    this.props.user && this.props.user.email && 
                
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
                                                <span className='rp-app-table-title'>Add Options</span>
                                            </div>
                                            {/* <Button style={{ position: 'absolute', right: '1rem' }} title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                                <i className="fa fa-check-square-o"></i>
                                            </Button> */}
                                        </div>


                                        {/* </React.Fragment> */}



                                    </div>

                                </div>

                            </div>
                 <Collapse isOpen={this.state.createTc}>
                {
                                        this.props.user && this.props.user.email &&
                                        <React.Fragment>
                                            {
                                                this.state.isEditing ?
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                            <i className="fa fa-check-square-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.edit(false)} >
                                                            <i className="fa fa-undo"></i>
                                                        </Button>
                                                    </Fragment>
                                                    :
                                                    <Fragment>

                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggleDelete()} >
                                                            <i className="fa fa-trash-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.edit(true)} >
                                                            <i className="fa fa-pencil-square-o"></i>
                                                        </Button>
                                                    </Fragment>

                                            }
                                        </React.Fragment>
                                    }
                <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Domain">
                                    Add Domains
                                    {
                                        this.props.testcaseEdit.errors['Domain'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['Domain']}</i>
                                    }
                                </Label>
                                {
                                    !this.state.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.domains}</span></div>:
                                        <Input type='text' onChange={(e) => this.setState({domains: e.target.value})} value={this.state.domains}>
                                        </Input>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs="6" md="4" lg="4">
                        <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="SelectDomain">
                                     Select Domain to add SubDomains
                                </Label>
                                {
                                    !this.state.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.selectedDomain}</span></div>:
                                        <Input type='select' onChange={(e) => 
                                        this.setState({
                                            selectedDomain: e.target.value, 
                                            subDomains: this.props.options && this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber] && this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber][e.target.value].join(',')
                                        })} value={this.state.selectedDomain}>
                                            <option value="">Select Domain</option>
                                            {
                                            this.props.options && this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber] && 
                                                Object.keys(this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber]).map(item => (
                                                <option value={item}>{item}</option>
                                                
                                                ))
                                            }
                                        </Input>
                                }
                        </FormGroup>
                        {
                        this.state.subDomains && 
                        <FormGroup className='rp-app-table-value'>
                        <Label className='rp-app-table-label' htmlFor="SubDomain">
                            Add SubDomains
                            {
                                this.props.testcaseEdit.errors['Domain'] &&
                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['SubDomain']}</i>
                            }
                        </Label>
                        {
                            this.state.subDomains && 
                        <React.Fragment>
                        {
                            !this.state.isEditing ? 
    <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.subDomains}</span></div>:
                                <Input type='text' onChange={(e) => this.setState({subDomains: e.target.value})} value={this.state.subDomains}>
                                </Input>
                        }
                        </React.Fragment>
    }
                        </FormGroup>
                        }
                        </Col>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="OrchestrationPlatform">
                                    Add Orchestration Platform
                                    {
                                        this.props.testcaseEdit.errors['OrchestrationPlatform'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['OrchestrationPlatform']}</i>
                                    }
                                </Label>
                                {
                                    !this.state.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.OrchestrationPlatform}</span></div>:
                                        <Input type='text' onChange={(e) => this.setState({OrchestrationPlatform: e.target.value})} value={this.state.OrchestrationPlatform}>
                                        </Input>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Cards">
                                    Add Card Types
                                    {
                                        this.props.testcaseEdit.errors['CardType'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['CardType']}</i>
                                    }
                                </Label>
                                {
                                    !this.state.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.CardType}</span></div>:
                                        <Input type='text' onChange={(e) => this.setState({CardType: e.target.value})} value={this.state.CardType}>
                                        </Input>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs="6" md="4" lg="3">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Server">
                                Add Server Types
                                    {
                                        this.props.testcaseEdit.errors['ServerType'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors['ServerType']}</i>
                                    }
                                </Label>
                                {
                                    !this.state.isEditing ? 
                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.state.ServerType}</span></div>:
                                        <Input type='text' onChange={(e) => this.setState({ServerType: e.target.value})} value={this.state.ServerType}>
                                        </Input>
                                }
                            </FormGroup>
                        </Col>
                    </FormGroup>
                    </Collapse>
                    </Col>
                    </Row>
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
                        <Button color="primary" onClick={() => this.state.toggleMessage ? this.toggle() : this.save()}>Ok</Button>{' '}
                        {
                            !this.state.toggleMessage &&
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div>

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    options: optionSelector(state)
})
export default connect(mapStateToProps, { saveOptions})(AddOptions);