import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';
import { saveUsers } from '../../../actions';
import Multiselect from 'react-bootstrap-multiselect';
import { element } from 'prop-types';
import  CheckBox  from '../../../components/TestCasesAll/CheckBox';

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
            //gender : '',
            role : '',
            engType: '',
            assignedengType: '',
            errors: {},
            selectedUserToDelete: '',
            selectedUserToEdit: '',
            allReleases1: [],
            assignedR: [],
            assignedRole: '',
            save: false,
            rel: []
        }
       
    }
    handleAllCheckedRelInsert = (event) => {
        let rel = this.state.allReleases1
        rel.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({allReleases1: rel})
    }
   
    handleCheckChieldRelInsert = (event) => {
        let rel = this.state.allReleases1
        rel.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({allReleases1: rel})
    }
    handleAllCheckedRel = (event) => {
        let rele = this.state.rel
        rele.forEach(columnName => columnName.isChecked = event.target.checked) 
        this.setState({rel: rele})
    }
   
    handleCheckChieldRel = (event) => {
        let rele = this.state.rel
        rele.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({rel: rele})
    }
    componentDidMount() {
        //if (this.props.allUsers.length === 0) {
          axios.get(`/api/userinfo`).then(res => {
            this.props.saveUsers(res.data)
          })
          
        //}
        this.setState({allReleases1:[], rel: []})
        let releaseInfoURL = `/api/release/infoAsc`;
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                this.state.allReleases1.push({value:item.ReleaseNumber, isChecked:false})
                this.state.rel.push({value:item.ReleaseNumber, isChecked:false})
                // this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
              });
    
            }, error => {
              
            });
      }
      getUserDetail() {
          this.state.rel.forEach(element => {
              element.isChecked = false
          })
          let temp = this.state.rel
          let email
          this.props.allUsers && this.props.allUsers.some(element =>{
              if(element.name == this.state.selectedUserToEdit){email = element.email}
          })
        axios.get(`/api/user1/name/${email}`)
            .then(res => {
              res.data.forEach(item => {
                this.setState({assignedR: item.AssignedReleases ? item.AssignedReleases : [],assignedengType: item.EngineerType ? item.EngineerType : '',assignedRole: item.role ? item.role : ''})
                
            });
            if(temp.map(element =>{
                if(this.state.assignedR.includes(element.value)){
                    element.isChecked = true
                }
                this.setState({rel: temp})
        }));
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
        // if(e.target.name == 'role'){
        //     this.setState({
        //         role: e.target.value.trim()
        //     })
        // }
        // if(e.target.name == 'gender'){
        //     this.setState({
        //         gender: e.target.id.trim()
        //     })
        // }
        // if(e.target.name == 'type'){
        //     this.setState({
        //         engType: e.target.id.trim()
        //     })
        // }
    };
    
    handleSubmit = (e) => {
        // e.preventDefault();
        // e.target.reset();
        this.setState({
            save : true
        })
        let name = this.state.name;
        let email = this.state.email;
        //let gender = this.state.gender;
        let role = this.state.role;
        let engType = this.state.engType;
        let rel = []
        this.state.allReleases1.forEach(element => {
            if(element.isChecked === true) rel.push(element.value)    
        })
        let formData = {
            "name": name,
            "email": email,
            "role": role,
            //"Gender": gender,
            "EngineerType": engType,
            "AssignedReleases": rel
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
            "ReleasesEdit": this.state.rel
        }
        let url = `/api/userinfo/`;
        axios.put(url,formData)
        .then(response=>{
            alert("Updated successfully");
                this.reset();
                this.componentDidMount()
        })
        .catch(err=>{
            console.log("err",err);
        })
    }
    handleDeleteSubmit = (e) => {
        this.setState({
            save : true
        })
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
        //document.getElementById('role').value='';
       //document.getElementById('F').value='';
        //document.getElementById('M').value='';
        document.getElementById('submit').value='';
        this.state.allReleases1.forEach(element => {
            element.isChecked = false
        })
        this.state.rel.forEach(element => {
            element.isChecked = false
        })
        this.setState({role:'', assignedRole: '', engType: '',assignedR: [], selectedUserToEdit:'', selectedUserToDelete: ''})
    }

    render() {
        // this.state.allReleases1.sort()
        //this.state.rel.sort()
        //let rel = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleases && this.state.selectedReleases.includes(item) })) : [];
        //let relEdit = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleasesEdit && this.state.selectedReleasesEdit.includes(item) })) : [];
        // let relRemove = this.state.assignedR ? this.state.assignedR.map(item => ({ value: item, selected: this.state.selectedReleasesRemove && this.state.selectedReleasesRemove.includes(item) })) : [];
        // let multiselect = {/*'Releases': rel, 'SelectedReleases': relEdit,*/ "RemoveReleases": relRemove};
        let userList = []
        this.props.allUsers.forEach(element => {
            userList.push(element.name)
        })
        userList.sort()
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

                                    <Col xs="6" md="3" lg="3">
                                        <FormGroup className='rp-app-table-value'>
                                                {/* <Label className='rp-app-table-label' htmlFor="UserRole">
                                                    User Role
                                                </Label> */}
                                                <Row xs="6" md="3" lg="3">
                                                    {
                                                            <Input style={{ borderColor: this.state.errors['UserRole'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="UserRole" name="UserRole" value={this.state.role}
                                                                onChange={(e) => this.setState({ role: e.target.value , errors: { ...this.state.errors, role: null } },)} >
                                                                <option value=''>Select Role</option>
                                                                {
                                                                    ["ADMIN", "QA", "Dev"].map(item => <option value={item}>{item}</option>)
                                                                }
                                                            </Input>
                                                    }
                                                </Row>
                                        </FormGroup>
                                   </Col>
                                    <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                            {
                                                    <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="User" value={this.state.engType}
                                                        onChange={(e) => this.setState({ engType: e.target.value , errors: { ...this.state.errors, engType: null } })} >
                                                        <option value=''>Select Engineer Type</option>
                                                        {
                                                            ["CLI", "GUI", "CLI+GUI"].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                            }
                                        </Row>
                                        </FormGroup>
                                    </Col>
                                    {
                                        this.state.allReleases1 &&
                                        <Row>
                                                <Col xs="12" sm="12" md="15" lg="15">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <input type="checkbox" onClick={this.handleAllCheckedRelInsert}  value="checkedall" /> Releases-Check / Uncheck All
                                                        <ul>
                                                        {
                                                        this.state.allReleases1.map((relName) => {
                                                            return (<CheckBox handleCheckChieldElement={this.handleCheckChieldRelInsert}  {...relName} />)
                                                        })
                                                        }
                                                        </ul>
                                                    </FormGroup>
                                                </Col>
                                        </Row>
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
                                            {/* <Label className='rp-app-table-label' htmlFor="User">
                                                Users
                                            </Label> */}
                                            <Row xs="10" md="10" lg="10">
                                                {
                                                        <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="User" value={this.state.selectedUserToEdit}
                                                            onChange={(e) => this.setState({ selectedUserToEdit: e.target.value , errors: { ...this.state.errors, selectedUserToEdit: null } },() => {this.getUserDetail()})} >
                                                            <option value=''>Select User</option>
                                                            {
                                                                userList.map(item => <option value={item}>{item}</option>)
                                                            }
                                                        </Input>
                                                }
                                            </Row>
                                        </FormGroup>
                                            {
                                                this.state.selectedUserToEdit &&
                                                <Row xs="10" md="10" lg="10">
                                                    <Label className='rp-app-table-label' htmlFor="User">
                                                            Role:
                                                        </Label>
                                                        {
                                                            this.state.assignedRole ?(<h6> {this.state.assignedRole} </h6>): ''
                                                        }
                                                </Row>
                                            }
                                            {
                                                this.state.selectedUserToEdit &&
                                                <Row xs="10" md="10" lg="10">
                                                <Label className='rp-app-table-label' htmlFor="User">
                                                            Engineer Type:
                                                        </Label>
                                                        {
                                                                this.state.assignedengType ?(<h6> {this.state.assignedengType} </h6>): ''
                                                        }
                                                </Row>
                                            }
                                             {
                                                this.state.selectedUserToEdit &&
                                                <Row xs="auto" md="auto" lg="auto">
                                                <Label className='rp-app-table-label' htmlFor="User">
                                                            Releases:
                                                        </Label>
                                                        {
                                                            this.state.assignedR ? this.state.assignedR.map(element => {
                                                                    return(<h6> {element}, &nbsp;</h6>)
                                                                })
                                                                : '' 
                                                        }
                                                </Row>
                                            }
                                            {
                                                this.state.selectedUserToEdit &&
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Row xs="10" md="10" lg="10">
                                                            {
                                                                    <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="User" value={this.state.role}
                                                                        onChange={(e) => this.setState({ role: e.target.value , errors: { ...this.state.errors, role: null } })} >
                                                                        <option value=''>Select User Role</option>
                                                                        {
                                                                            ["ADMIN", "QA", "Dev"].map(item => <option value={item}>{item}</option>)
                                                                        }
                                                                    </Input>
                                                            }
                                                        </Row>
                                                    </FormGroup>
                                            }
                                             {
                                                this.state.selectedUserToEdit &&
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Row xs="10" md="10" lg="10">
                                                            {
                                                                    <Input style={{ borderColor: this.state.errors['User'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Domain" name="User" value={this.state.engType}
                                                                        onChange={(e) => this.setState({ engType: e.target.value , errors: { ...this.state.errors, engType: null } })} >
                                                                        <option value=''>Select Engineer Type</option>
                                                                        {
                                                                            ["CLI", "GUI", "CLI+GUI"].map(item => <option value={item}>{item}</option>)
                                                                        }
                                                                    </Input>
                                                            }
                                                        </Row>
                                                    </FormGroup>
                                            }
                                    </Col>
                                    {
                                        this.state.selectedUserToEdit && this.state.rel ?
                                        <Row>
                                                <Col xs="12" sm="12" md="15" lg="15">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <input type="checkbox" onClick={this.handleAllCheckedRel}  value="checkedall" /> Releases-Check / Uncheck All
                                                        <ul>
                                                        {
                                                        this.state.rel.map((relName) => {
                                                            return (<CheckBox handleCheckChieldElement={this.handleCheckChieldRel}  {...relName} />)
                                                        })
                                                        }
                                                        </ul>
                                                    </FormGroup>
                                                </Col>
                                        </Row>: ''
                                    }
                                    { this.state.selectedUserToEdit ?
                                    <Button outline color="success" id = 'submit' onClick={this.handleEditSubmit} > Save </Button>:[]
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