import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';
import { saveUsers } from '../../../actions';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import Multiselect from 'react-bootstrap-multiselect';
import { element } from 'prop-types';
import  CheckBox  from '../../../components/TestCasesAll/CheckBox';

let form = {}
class createUser extends Component {
    
    constructor(){
        super();
        this.state = {
            output : {},
            errors: {},
            release: '',
            allReleases1: [],
            platform: '',
            save: false,
            file:null,
            platforms: [],
            disable: true
        }
       
    }
    // handleAllCheckedRelInsert = (event) => {
    //     let rel = this.state.allReleases1
    //     rel.forEach(columnName => columnName.isChecked = event.target.checked) 
    //     this.setState({allReleases1: rel})
    // }
   
    // handleCheckChieldRelInsert = (event) => {
    //     let rel = this.state.allReleases1
    //     rel.forEach(columnName => {
    //         if (columnName.value === event.target.value)
    //             columnName.isChecked =  event.target.checked
    //     })
    //     this.setState({allReleases1: rel})
    // }
    // handleAllCheckedRel = (event) => {
    //     let rele = this.state.rel
    //     rele.forEach(columnName => columnName.isChecked = event.target.checked) 
    //     this.setState({rel: rele})
    // }
   
    // handleCheckChieldRel = (event) => {
    //     let rele = this.state.rel
    //     rele.forEach(columnName => {
    //         if (columnName.value === event.target.value)
    //             columnName.isChecked =  event.target.checked
    //     })
    //     this.setState({rel: rele})
    // }
    componentDidMount() {
        //this.setState({allReleases1:[]})
        let releaseInfoURL = `/api/release/infoAsc`;
        let rel = []
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                rel.push(item.ReleaseNumber)
                //this.state.rel.push({value:item.ReleaseNumber, isChecked:false})
                // this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
              });
              this.setState({allReleases1:rel})
            }, error => {
              
            });
      }
    getPlatform = (e) => {
        let releaseInfoURL = `/api/releasewiseplatformCli/`+this.state.release;
        let platform = []
        console.log(releaseInfoURL)
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                platform.push(item)
                //this.state.rel.push({value:item.ReleaseNumber, isChecked:false})
                // this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
              });
              this.setState({platforms:platform,disable:false})
            }, error => {
              
            });
    }
    handleSubmit = (e) => {
        // e.preventDefault();
        // e.target.reset();
        console.log("IN handleSubmit")
        this.setState({
            save : true, disable:true
        })
        const data = new FormData()
        data.append('file',this.state.file)
        console.log("data",data)
        let req = {
            release:this.state.release,
            platform:this.state.platform
        }
        axios.post(`/api/execute/${this.state.release}/${this.state.platform}`,data)
            .then(response=>{
            //alert(response.data.stdout);
            console.log(response)
            //let jsondata = JSON.parse(response.data)
            //console.log(jsondata)
            // let str = JSON.stringify(response.data)
            // str = str.trim()
            // let da = str.replace(/'/g,'"').replace(/\n/g, '');
            // console.log(da)
            // let jsondata = JSON.parse(da)
            // console.log(jsondata)
            this.setState({output:response.data})
            console.log(this.state.output)
            this.reset();
        })
        .catch(err=>{
            console.log("err",err);
        })
    }
    
    reset = () =>{
        this.setState({release:'', platform: ''})
    }
    handleChange =(e) => {
        const files = e.target.files;
        if (files && files[0]) {
            this.setState({ file: files[0] });
            //this.handleFile(files[0]);
        }
      };

    render() {
        // this.state.allReleases1.sort()
        //this.state.rel.sort()
        //let rel = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleases && this.state.selectedReleases.includes(item) })) : [];
        //let relEdit = this.state.allReleases1 ? this.state.allReleases1.map(item => ({ value: item, selected: this.state.selectedReleasesEdit && this.state.selectedReleasesEdit.includes(item) })) : [];
        // let relRemove = this.state.assignedR ? this.state.assignedR.map(item => ({ value: item, selected: this.state.selectedReleasesRemove && this.state.selectedReleasesRemove.includes(item) })) : [];
        // let multiselect = {/*'Releases': rel, 'SelectedReleases': relEdit,*/ "RemoveReleases": relRemove};
        //let platforms = this.props.selectedRelease && this.props.selectedRelease.PlatformsCli ? this.props.selectedRelease.PlatformsCli : []
        if(this.state.platforms){
            this.state.platforms.sort()
        }
        
        console.log(this.state.disable)
        return(
            <div>
            {
                this.props.currentUser &&
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
                                            <span className='rp-app-table-title'>E2E Result Updation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={true}>
                            {
                                this.state.allReleases1 &&
                            <div>
                                <Form>
                                <Row xs="6" md="3" lg="3">
                                        <FormGroup className='rp-app-table-value'>
                                                {/* <Label className='rp-app-table-label' htmlFor="UserRole">
                                                    User Role
                                                </Label> */}
                                                <div>
                                                   <Col>  
                                                    <input type="file" id="file" onChange={this.handleChange} /> 
                                                    </Col>
                                                    {/* <Button outline color="success" id = 'Upload file' onClick={this.handleSubmit} > Upload File </Button> */}
                                                </div> 
                                        </FormGroup>
                                   </Row>

                                    <Col xs="6" md="3" lg="3">
                                        <FormGroup className='rp-app-table-value'>
                                                {/* <Label className='rp-app-table-label' htmlFor="UserRole">
                                                    User Role
                                                </Label> */}
                                                <Row xs="6" md="3" lg="3">
                                                    {
                                                            <Input style={{ borderColor: this.state.errors['release'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="release" name="release" value={this.state.release}
                                                                onChange={(e) => this.setState({ release: e.target.value , errors: { ...this.state.errors, release: null }},() => this.getPlatform())} >
                                                                <option value=''>Select Release</option>
                                                                {
                                                                    this.state.allReleases1.map(item => <option value={item}>{item}</option>)
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
                                                    <Input style={{ borderColor: this.state.errors['platform'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="platform" name="platform" value={this.state.platform}
                                                        onChange={(e) => this.setState({ platform: e.target.value , errors: { ...this.state.errors, platform: null } })} >
                                                        <option value=''>Select Platform</option>
                                                        {
                                                            this.state.platforms.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                            }
                                        </Row>
                                        </FormGroup>
                                    </Col>
                                    
                                    <Button outline color="success" id = 'submit' disabled={this.state.disable} onClick={this.handleSubmit} > Submit </Button>
                                </Form>
                                <div>
                                    {
                                        this.state.output.output ?
                                        <div>
                                            <ul>
                                                {Object.keys(this.state.output).map((key, value) => <li key={value}>{key} : {this.state.output[key]}</li>)}
                                            </ul>
                                        </div>  
                                        :null
                                    }

                                </div>
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

export default connect(mapStateToProps, { saveUsers, getCurrentRelease })(createUser);