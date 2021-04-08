import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';
import { saveUsers } from '../../../actions';
import Multiselect from 'react-bootstrap-multiselect';
import { element } from 'prop-types';

let form = {}
class createUser extends Component {
    
    constructor(){
        super();
        this.state = {
            Open:'',
            OpenEdit:'',
            OpenDelete:'',
            name : '',
            email : '',
            gender : '',
            role : '',
            engType: '',
            assignedengType: '',
            errors: {},
            selectedReleases: [],
            selectedReleasesEdit: [],
            selectedUserToDelete: '',
            selectedUserToEdit: '',
            selectedReleasesRemove: [],
            allReleases1: [],
            assignedR: [],
            assignedRole: '',
            save: false
        }
       
    }
    componentDidMount() {
        //if (this.props.allUsers.length === 0) {
          axios.get(`/api/userinfo`).then(res => {
            this.props.saveUsers(res.data)
          })
          
        //}
    
        let releaseInfoURL = `/api/release/info`;
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                this.state.allReleases1.push(item.ReleaseNumber)
                // this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
              });
    
            }, error => {
              
            });
      }
      getUserDetail() {
          let email
          this.props.allUsers && this.props.allUsers.some(element =>{
              if(element.name == this.state.selectedUserToEdit){email = element.email}
          })
        axios.get(`/api/user1/name/${email}`)
            .then(res => {
              res.data.forEach(item => {
                this.setState({assignedR: item.AssignedReleases ? item.AssignedReleases : [],assignedengType: item.EngineerType ? item.EngineerType : '',assignedRole: item.role ? item.role : ''})
              });
    
            }, error => {
              
            });
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
        if(e.target.name == 'type'){
            this.setState({
                engType: e.target.id.trim()
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
        let engType = this.state.engType;
        let selectedReleases = this.state.selectedReleases;
        let formData = {
            "name": name,
            "email": email,
            "role": role,
            "Gender": gender,
            "EngineerType": engType,
            "AssignedReleases": selectedReleases
        }
        this.reset()
        let url = `/api/userinfo/`;
        axios.post(url,formData)
        .then(response=>{
            alert("added successfully");
            this.reset();
            this.componentDidMount();
        })
        .catch(err=>{
            console.log("err",err);
        })
    }
    handleEditSubmit = (e) => {
        this.setState({
            save : true
        })
        let email
          this.props.allUsers && this.props.allUsers.some(element =>{
              if(element.name == this.state.selectedUserToEdit){email = element.email}
          })
        let formData = {
             "email": email,
            "role": this.state.role,
            "EngineerType":this.state.engType,
            "AssignedReleases":this.state.selectedReleasesEdit,
            "RemoveReleases": this.state.selectedReleasesRemove
        }
        console.log(this.state.selectedReleasesEdit)
        if (this.state.selectedReleasesEdit !== this.state.assignedR){
        let url = `/api/userinfo/`;
        axios.put(url,formData)
        .then(response=>{
            alert("Updated successfully");
            console.log(this.state.selectedReleasesEdit)
            if (email === this.props.currentUser.email && this.state.selectedReleasesEdit.length > 0) {
                window.location.reload()
            }
            else {
                this.reset();
                this.componentDidMount()
            }
        })
        .catch(err=>{
            console.log("err",err);
        })
        }
    }
    handleDeleteSubmit = (e) => {
        this.setState({
            save : true
        })
        console.log("this.state.selectedUsertodelete",this.state.selectedUserToDelete)
          let email
          let name
          this.props.allUsers && this.props.allUsers.some(element =>{
              if(element.name == this.state.selectedUserToDelete){email = element.email; name = element.name}
          })
          let formData = {
             "email": email
        }
          let url = `/api/userinfo/`;
          axios.delete(url,{data:formData})
          .then(response=>{
              alert("deleted successfully");
              this.reset();
              this.componentDidMount()
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
        this.setState({role:'', assignedRole: '', selectedReleasesRemove: [], engType: '', allReleases1: [], selectedReleases: [],selectedReleasesEdit: [],assignedR: [], selectedUserToEdit:'', selectedUserToDelete: ''})
    }
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
        switch (field) {
            case 'Releases':
                let releases = null;
                if (checked && this.state.selectedReleases) {
                    releases = [...this.state.selectedReleases, value];
                }
                if (checked && !this.state.selectedReleases) {
                    releases = [value];
                }
                if (!checked && this.state.selectedReleases) {
                    let array = this.state.selectedReleases;
                    array.splice(array.indexOf(value), 1);
                    releases = array;
                }
                this.setState({ selectedReleases: releases});
                break;
            case 'SelectedReleases':
                let sreleases = null;
                if (checked && this.state.selectedReleasesEdit) {
                    sreleases = [...this.state.selectedReleasesEdit, value];
                }
                if (checked && !this.state.selectedReleasesEdit) {
                    sreleases = [value];
                }
                if (!checked && this.state.selectedReleasesEdit) {
                    let array = this.state.selectedReleasesEdit;
                    array.splice(array.indexOf(value), 1);
                    sreleases = array;
                }
                this.setState({ selectedReleasesEdit: sreleases});
                break;
            case 'RemoveReleases':
                let rreleases = null;
                if (checked && this.state.selectedReleasesRemove) {
                    rreleases = [...this.state.selectedReleasesRemove, value];
                }
                if (checked && !this.state.selectedReleasesRemove) {
                    rreleases = [value];
                }
                if (!checked && this.state.selectedReleasesRemove) {
                    let array = this.state.selectedReleasesRemove;
                    array.splice(array.indexOf(value), 1);
                    rreleases = array;
                }
                this.setState({ selectedReleasesRemove: rreleases});
                break;
    
            default:
                break;
            }
            
    }

    render() {
        let rel = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleases && this.state.selectedReleases.includes(item) })) : [];
        let relEdit = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleasesEdit && this.state.selectedReleasesEdit.includes(item) })) : [];
        let relRemove = this.state.assignedR ? this.state.assignedR.map(item => ({ value: item, selected: this.state.selectedReleasesRemove && this.state.selectedReleasesRemove.includes(item) })) : [];
        let multiselect = {'Releases': rel,'SelectedReleases': relEdit, "RemoveReleases": relRemove};
        let userList = []
        this.props.allUsers.forEach(element => {
            userList.push(element.name)
        })
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
                                    <FormGroup tag="fieldset" row>
                                        <legend className="col-form-label col-sm-2">Select Engineer Type</legend>
                                        <Col sm={10}>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input type="radio" name="type" id="CLI" onChange={this.handleChange} />
                                                        CLI
                                                </Label>
                                            </FormGroup>
                                            
                                            <FormGroup check>
                                                <Label >
                                                    <Input type="radio" name="type" id="GUI" onChange={this.handleChange} />
                                                        GUI
                                                </Label>
                                            </FormGroup>
                                            <FormGroup check>
                                                <Label >
                                                    <Input type="radio" name="type" id="CLI+GUI" onChange={this.handleChange} />
                                                        CLI+GUI
                                                </Label>
                                            </FormGroup>
                                        </Col>
                                    </FormGroup>
                                    {
                                        [
                                            { field: 'Releases', header: 'Releases' }
                                        ].map(item => (
                                            <Col xs="6" md="3" lg="2">
                                                <FormGroup className='rp-app-table-value'>
                                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                        {
                                                            this.state.errors[item.field] &&
                                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                        }</Label>
                                                    {   
                                                            <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                                data={multiselect[item.field]} multiple /></div>
                                                    }
                                                </FormGroup>
                                            </Col>
                                        ))
                                    }
                                    
                                    <Button outline color="success" id = 'submit' onClick={this.handleSubmit} > Save </Button>
                                </Form>
                            </div>
                        
                        </Collapse>
                    </Col>
                </Row>
            }
            {
                this.props.currentUser && this.props.currentUser.isAdmin &&
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ OpenEdit: !this.state.OpenEdit })}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.OpenEdit &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.OpenEdit &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>Edit User</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.OpenEdit}>
                            <div>
                                <Form>
                                    <Col xs="6" md="3" lg="3">    
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor="User">
                                                Users
                                            </Label>
                                                {
                                                        <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="User" value={this.state.selectedUserToEdit}
                                                            onChange={(e) => this.setState({ selectedUserToEdit: e.target.value , errors: { ...this.state.errors, selectedUserToEdit: null } },() => {this.getUserDetail()})} >
                                                            <option value=''>Select User</option>
                                                            {
                                                                userList.map(item => <option value={item}>{item}</option>)
                                                            }
                                                        </Input>
                                                }
                                        </FormGroup>
                                    </Col>
                                    {
                                        this.state.selectedUserToEdit &&
                                        <Col xs="10" md="10" lg="10">    
                                            <FormGroup className='rp-app-table-value'>  
                                                {
                                                    [
                                                        { field: 'SelectedReleases', header: 'Add Releases' }
                                                    ].map(item => (
                                                        <Col xs="6" md="3" lg="2">
                                                            <FormGroup className='rp-app-table-value'>
                                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                                    {
                                                                        this.state.errors[item.field] &&
                                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                                    }</Label>
                                                                {   
                                                                        <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                                            data={multiselect[item.field]} multiple /></div>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
                                        </Col>
                                    }
                                     {
                                        this.state.selectedUserToEdit &&
                                        <Col xs="10" md="10" lg="10">    
                                            <FormGroup className='rp-app-table-value'>  
                                                {
                                                    [
                                                        { field: 'RemoveReleases', header: 'Remove Releases' }
                                                    ].map(item => (
                                                        <Col xs="6" md="3" lg="2">
                                                            <FormGroup className='rp-app-table-value'>
                                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                                                    {
                                                                        this.state.errors[item.field] &&
                                                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                                                    }</Label>
                                                                {   
                                                                        <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                                                            data={multiselect[item.field]} multiple /></div>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
                                        </Col>
                                    }
                                    {
                                        this.state.selectedUserToEdit &&
                                    <Col xs="10" md="10" lg="10">
                                        <FormGroup row>
                                            <Col sm={6}>
                                                <Input type="text" name="role" id = 'role' placeholder="Edit User Role" onChange={this.handleChange} />
                                            </Col>
                                        </FormGroup>
                                        <Row xs="10" md="10" lg="10">
                                        <Label className='rp-app-table-label' htmlFor="User">
                                                    Role:
                                                </Label>
                                                {
                                                        this.state.assignedRole ?(<h6> {this.state.assignedRole} </h6>): ''
                                                }
                                        </Row>
                                        <FormGroup tag="fieldset" row>
                                            <legend className="rp-app-table-label">Select Engineer Type</legend>
                                            <Col sm={10}>
                                                <FormGroup check>
                                                    <Label check>
                                                        <Input type="radio" name="type" id="CLI" onChange={this.handleChange} />
                                                            CLI
                                                    </Label>
                                                </FormGroup>
                                                
                                                <FormGroup check>
                                                    <Label >
                                                        <Input type="radio" name="type" id="GUI" onChange={this.handleChange} />
                                                            GUI
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup check>
                                                    <Label >
                                                        <Input type="radio" name="type" id="CLI+GUI" onChange={this.handleChange} />
                                                            CLI+GUI
                                                    </Label>
                                                </FormGroup>
                                            </Col>
                                        </FormGroup>
                                        <Row xs="10" md="10" lg="10">
                                        <Label className='rp-app-table-label' htmlFor="User">
                                                    Engineer Type:
                                                </Label>
                                                {
                                                        this.state.assignedengType ?(<h6> {this.state.assignedengType} </h6>): ''
                                                }
                                        </Row>
                                    </Col>
                                }
                                    { this.state.selectedUserToEdit ?
                                    <Button outline color="success" id = 'submit' onClick={this.handleEditSubmit} > Edit </Button>:[]
                                    }
                               
                                </Form>
                            </div>
                        
                        </Collapse>
                    </Col>
                </Row>
            }
            {
                this.props.currentUser && this.props.currentUser.isAdmin &&
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ OpenDelete: !this.state.OpenDelete })}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.OpenDelete &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.OpenDelete &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>Delete User</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.OpenDelete}>
                            <div>
                                <Form>
                                <Col xs="6" md="3" lg="3">    
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor="User">
                                                Users
                                            </Label>
                                                {
                                                        <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="User" name="User" value={this.state.selectedUserToDelete}
                                                            onChange={(e) => this.setState({ selectedUserToDelete: e.target.value , errors: { ...this.state.errors, selectedUserToDelete: null } },)} >
                                                            <option value=''>Select User</option>
                                                            {
                                                               userList.map(item => <option value={item}>{item}</option>)
                                                            }
                                                        </Input>
                                                }
                                        </FormGroup>
                                </Col>
                                    {this.state.selectedUserToDelete ?
                                    <Button outline color="success" id = 'submit' onClick={this.handleDeleteSubmit} > Delete </Button>
                                    : []
                                    }           
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
    allUsers: state.user.users
}
)

export default connect(mapStateToProps, { saveUsers })(createUser);