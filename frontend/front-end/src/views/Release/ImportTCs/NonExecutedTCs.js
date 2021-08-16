import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';
import { saveUsers } from '../../../actions';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import Multiselect from 'react-bootstrap-multiselect';
import { element, object } from 'prop-types';
import  CheckBox  from '../../../components/TestCasesAll/CheckBox';

let form = {}
class NonExecutedTCs extends Component {
    
    constructor(){
        super();
        this.state = {
            Open:false,
            errors: {},
            disable: true,
            importTc:[],
            data : [],
        }
       
    }

    handleSubmit = (e) => {
       
            axios.get(`/api/getNonExecutedTCs/`,{
                params: {
                Release:this.props.selectedRelease.ReleaseNumber,
                Platform:JSON.stringify(this.state.importTc),
                }    
            })
                .then(response=>{
                    this.setState({ data:response.data },)
                })
            .catch(err=>{
                console.log("err",err);
            })
    }
    
    reset = () =>{
        this.setState({importTc:[]})
    }

    selectMultiselect(event, checked) {
        let value = event.val();
        let platforms = null;
        if (checked && this.state.importTc) {
            platforms = [...this.state.importTc, value];
        }
        if (checked && !this.state.importTc) {
            platforms = [value];
        }
        if (!checked && this.state.importTc) {
            let array = this.state.importTc;
            array.splice(array.indexOf(value), 1);
            platforms = array;
        }
        this.setState({ importTc: platforms ,disable: false});
    } 

    render() {
       
        let platforms = this.props.selectedRelease && this.props.selectedRelease.PlatformsCli ? this.props.selectedRelease.PlatformsCli : []
        //SubDomains = this.state.platform && this.state.platforms && Domains.length > 0 ? this.state.platforms[this.state.platform][Domains] : []
        let d = platforms.length > 0 ? platforms.map(item => ({ value: item, selected: this.state.importTc && this.state.importTc.includes(item) })) : [];
        //let sd = SubDomains.length > 0 ? SubDomains.map(item => ({ value: item, selected: this.state.addSubDomains && this.state.addSubDomains.includes(item) })) : [];
        let multiselect = { 'Platforms': d};
        return(
            <div>
            {
                this.props.currentUser &&
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem', overflow:"auto"}}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ Open: !this.state.Open })}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.Open &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.Open &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-arrow-down"></i></div>
                                            <span className='rp-app-table-title'>Download Non Executed Test Cases</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.Open}>
                            {
                            <div>
                                <Form>
                                    
                                    <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                        {
                                                [
                                                    { field: 'Platforms', header: 'Select Platforms' },
                                                    //{ field: 'SubDomains', header: 'Select Sub Domains' }
                                                ].map(item => (
                                                    <Col xs="10" md="10" lg="10">
                                                        <FormGroup className='rp-app-table-value'>
                                                            <Label  className='rp-app-table-label' htmlFor={item.field}>{item.header}</Label>
                                                                {
                                                                    <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(e, checked)}
                                                                    data={multiselect[item.field]} multiple /></div>
                                                                }
                                                        </FormGroup>
                                                    </Col>
                                                ))
                                            
                                        }
                                        </Row>
                                        </FormGroup>
                                    </Col>
                                    
                                    <Button outline color="success" id = 'submit' disabled={this.state.disable} onClick={this.handleSubmit} > Submit </Button>
                                </Form>
                            </div>
                        }
                        </Collapse>
                    </Col>
                </Row>
            }
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    allUsers: state.user.users,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
}
)

export default connect(mapStateToProps, {getCurrentRelease })(NonExecutedTCs);