import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import {
    Row, Col, Button, Input, Collapse, FormGroup, Label,Modal, ModalHeader, ModalBody, ModalFooter,Badge,
} from 'reactstrap';
import Multiselect from 'react-bootstrap-multiselect';
import { getCurrentRelease, optionSelector, getDomainStatus } from '../../../reducers/release.reducer';
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
    toggleSuccess = () => this.setState({ successModal: !this.state.successModal });
    
    confirmToggle() {
        this.toggle();
    }
    save() {
        if(this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber) {

        this.toggle();
        console.log(this.state.addedDomains, this.state.addedSubDomains, this.state.selectedDomain, this.state.addedCards)
        let selected = {
            domains: this.state.addedDomains ? this.state.addedDomains : [], 
            selectedDomain: this.state.selectedDomain ? this.state.selectedDomain : null,
            subdomains: this.state.addedSubDomains ? this.state.addedSubDomains : [],
        }
        let data = {
            Activity: {
                Release: this.props.selectedRelease.ReleaseNumber,
                "TcID": '',
                CardType: '',
                "UserName": this.props.user.email,
                LogData: `${this.props.user.email} added Options ${JSON.stringify(selected)}`,
                "RequestType": 'POST',
                "URL": `/api/${this.props.selectedRelease.ReleaseNumber}/options/add`
            },
            ...selected
        }
        axios.post(`/api/${this.props.selectedRelease.ReleaseNumber}/options/add`, {...data})
        .then(data => {
            axios.get(`/api/release/all`)
            .then(res => {
              res.data.forEach(item => {
                // this.props.updateNavBar({ id: item.ReleaseNumber });
                this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
              });
            }, error => {
            });
            this.edit();
            this.toggleSuccess();
        }, err => {
            alert('unable to edit');
        })
    }
    }
    edit() {
        this.setState({
            addedDomains: null,
            addedSubDomains: null,
            addedCards: null,
            selectedDomain: ''
        })
    }
    render() {
            // let domains = this.props.options && this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber] && Object.keys(this.props.options.SpecificRelease[this.props.selectedRelease.ReleaseNumber].domains).join(',');
            // let OrchestrationPlatform = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
            // let CardType = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
            // let ServerType = this.props.options && Object.keys(this.props.options.OrchestrationPlatform).join(',');
           let domains= this.props.selectedRelease && this.props.selectedRelease.TcAggregate ? this.props.selectedRelease.TcAggregate.AvailableDomainOptions : {};
           let subDomains = [];
           if(domains) {
            domains = Object.keys(domains);
            if(domains) {
                domains = domains.sort();
            }
            subDomains = domains[this.state.domainSelected];
            if(subDomains) {
                subDomains =  subDomains.sort();
            }
           } else {
               domains = [];
           }
           let cards = this.props.selectedRelease && this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType:[];
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
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                            <i className="fa fa-check-square-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.edit(false)} >
                                                            <i className="fa fa-undo"></i>
                                                        </Button>
                                                    </Fragment>
                                        </React.Fragment>
                                    }
                <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        <Col xs="6" md="4" lg="3">
                        {
                                this.state.addedDomains && this.state.addedDomains.map((item, index) => {
                                    return (
                                        <div class='row'>
                                            <div class='col-md-6'>
                                        <Input style={{marginTop: '0.2rem', marginBottom: '0.2rem'}} type='text' onChange={(e) => {
                                            this.state.addedDomains[index] = e.target.value;
                                            
                                            this.setState({addedDomains: [...this.state.addedDomains]})
                                            }} value={item}>
                                        </Input>
                                        </div>
                                        <div class='col-md-6'>
<Button size="md" color='transparent' className='rp-save-btn' onClick={() => {
    this.state.addedDomains.splice(index,1);
    this.setState({addedDomains: [...this.state.addedDomains]});
    }}>  <i className="fa fa-trash"></i></Button>
                                        </div>
                                        </div>

                                    )
                                })
                            }
                            <div className='rp-app-table-value' style={{marginTop: '1rem'}}><Button onClick={() => {
                                let domains = this.state.addedDomains;
                                if(!domains) {
                                    domains=['']
                                } else {
                                    domains.push('');
                                }
                                this.setState({addedDomains: domains})
                                }}>Add Domain</Button></div>


                        </Col>
                        <Col xs="6" md="4" lg="4">
                        <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="SelectDomain">
                                     Select Domain to add SubDomains
                                </Label>
                           
                                {
                                    !this.state.isEditing &&
                                        
                                        <Input type='select' onChange={(e) => 
                                        this.setState({
                                            selectedDomain: e.target.value, addedSubDomains: null,
                                        })} value={this.state.selectedDomain}>
                                            <option value="">Select Domain</option>
                                            {
                                            domains.map(item => (
                                                <option value={item}>{item}</option>
                                                
                                                ))
                                            }
                                        </Input>
                                }
                        </FormGroup>
                        {
                        this.state.selectedDomain && this.state.addedSubDomains && this.state.addedSubDomains.map((item, index) => {
                                    return (
                                        <div class='row'>
                                            <div class='col-md-6'>
                                        <Input style={{marginTop: '0.2rem', marginBottom: '0.2rem'}} type='text' onChange={(e) => {
                                            this.state.addedSubDomains[index] = e.target.value;
                                            
                                            this.setState({addedSubDomains: [...this.state.addedSubDomains]})
                                            }} value={item}>
                                        </Input>
                                        </div>
                                        <div class='col-md-6'>
<Button size="md" color='transparent' onClick={() => {
    this.state.addedSubDomains.splice(index,1);
    this.setState({addedSubDomains: [...this.state.addedSubDomains]});
    }}><i className="fa fa-trash"></i></Button>
                                        </div>
                                        </div>

                                    )
                                })
                            }
                            {
                                this.state.selectedDomain &&
                                <div className='rp-app-table-value' style={{marginTop: '1rem'}}><Button onClick={() => {
                                let domains = this.state.addedSubDomains;
                                if(!domains) {
                                    domains=['']
                                } else {
                                    domains.push('');
                                }
                                this.setState({addedSubDomains: domains})
                                }}>Add Sub-Domain</Button></div>
                            }

                        
                        </Col>
                        {/* <Col xs="6" md="4" lg="3">
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
                        </Col> */}
                        {/* <Col xs="6" md="4" lg="3">
                        {
                                this.state.addedCards && this.state.addedCards.map((item, index) => {
                                    return (
                                        <div class='row'>
                                            <div class='col-md-6'>
                                        <Input style={{marginTop: '0.2rem', marginBottom: '0.2rem'}} type='text' onChange={(e) => {
                                            this.state.addedCards[index] = e.target.value;
                                            
                                            this.setState({addedCards: [...this.state.addedCards]})
                                            }} value={item}>
                                        </Input>
                                        </div>
                                        <div class='col-md-6'>
<Button size="md" color='transparent' onClick={() => {
    this.state.addedCards.splice(index,1);
    this.setState({addedCards: [...this.state.addedCards]});
    }}><i className="fa fa-trash"></i></Button>
                                        </div>
                                        </div>

                                    )
                                })
                            }
                            <div className='rp-app-table-value' style={{marginTop: '1rem'}}><Button onClick={() => {
                                let domains = this.state.addedCards;
                                if(!domains) {
                                    domains=['']
                                } else {
                                    domains.push('');
                                }
                                this.setState({addedCards: domains})
                                }}>Add CardType</Button></div>


                        </Col> */}
                        {/* <Col xs="6" md="4" lg="3">
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
                        </Col> */}
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
                <Modal isOpen={this.state.successModal} toggle={() => this.toggleSuccess()}>
                    {
                        <ModalHeader toggle={() => this.toggleSuccess()}>{
                            'Success'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Options updated successfully`
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.toggleSuccess()}>Ok</Button>{' '}
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
})
export default connect(mapStateToProps, { saveOptions})(AddOptions);