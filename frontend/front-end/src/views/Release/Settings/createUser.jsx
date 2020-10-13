import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';

let form = {}
class createUser extends Component {
    constructor(){
        super();
        this.state = {
            Open:'',
            name : '',
            email : '',
            gender : '',
            role : '',
            save: false
        }
       
    }

    handleChange = (e) => {
        if(e.target.name == 'name'){
            this.setState({
                name: e.target.value.trim()
            })
        }
        
        if(e.target.name == 'email'){
            this.setState({
                email: e.target.value.trim()
            })
        }
        if(e.target.name == 'role'){
            this.setState({
                role: e.target.value.trim()
            })
        }
        if(e.target.name == 'gender'){
            this.setState({
                gender: e.target.id.trim()
            })
        }
      };
    
    handleSubmit = (e) => {
        // e.preventDefault();
        // e.target.reset();
        this.setState({
            save : true
        })
        let name = this.state.name;
        let email = this.state.email;
        let gender = this.state.gender;
        let role = this.state.role;
        let formData = {
            "name": name,
            "email": email,
            "role": role,
            "Gender": gender
        }

        let url = `/api/userinfo/`;
        axios.post(url,formData)
        .then(response=>{
            alert("added successfully");
            this.reset();
        })
        .catch(err=>{
            console.log("err",err);
        })
    }

    reset = () =>{
        document.getElementById('name').value='';
        document.getElementById('email').value='';
        document.getElementById('role').value='';
        document.getElementById('F').value='';
        document.getElementById('M').value='';
        document.getElementById('submit').value='';
    }


    render() {
        return(
            <div>
            {
                this.props.currentUser && this.props.currentUser.isAdmin &&
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
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
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>Create User</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.Open}>
                            <div>
                                <Form>
                                    <FormGroup row>
                                        <Col sm={6}>
                                            <Input type="text" name="name" id = 'name' placeholder="Enter User Name"  onChange={this.handleChange} />
                                        </Col>
                                    </FormGroup>

                                    <FormGroup row>
                                        <Col sm={6}>
                                            <Input type="email" name="email" id = 'email' placeholder="Enter Email"  onChange={this.handleChange} />
                                        </Col>
                                    </FormGroup>

                                    <FormGroup row>
                                        <Col sm={6}>
                                            <Input type="text" name="role" id = 'role' placeholder="Enter User Role" onChange={this.handleChange} />
                                        </Col>
                                    </FormGroup>

                                    <FormGroup tag="fieldset" row>
                                        <legend className="col-form-label col-sm-2">Select Gender</legend>
                                        <Col sm={10}>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input type="radio" name="gender" id="F" onChange={this.handleChange} />
                                                        Female
                                                </Label>
                                            </FormGroup>
                                            
                                            <FormGroup check>
                                                <Label >
                                                    <Input type="radio" name="gender" id="M" onChange={this.handleChange} />
                                                        Male
                                                </Label>
                                            </FormGroup>
                                        </Col>
                                    </FormGroup>
                                    
                                    <Button outline color="success" id = 'submit' onClick={this.handleSubmit} > Save </Button>
                                </Form>
                            </div>
                        
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
}
)

export default connect(mapStateToProps, {  })(createUser);