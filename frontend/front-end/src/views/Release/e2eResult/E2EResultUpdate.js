import React, {Component} from 'react';
import {
    Row, Col, Button, Collapse, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap';
import axios from 'axios';
import { connect } from 'react-redux';
import { saveUsers } from '../../../actions';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import JSZip from 'jszip';
import Multiselect from 'react-bootstrap-multiselect';
import { element } from 'prop-types';
import  CheckBox  from '../../../components/TestCasesAll/CheckBox';
let form = {}
class UpdateE2EResult extends Component {
    
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
    componentDidMount() {
        let releaseInfoURL = `/api/release/infoAsc`;
        let rel = []
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                rel.push(item.ReleaseNumber)
              });
              this.setState({allReleases1:rel})
            }, error => {
              
            });
      }
    getPlatform = (e) => {
        let releaseInfoURL = `/api/releasewiseplatformCli/`+this.state.release;
        let platform = []
          axios.get(releaseInfoURL)
            .then(res => {
              res.data.forEach(item => {
                platform.push(item)
              });
              this.setState({platforms:platform,disable:false})
            }, error => {
              
            });
    }
    handleSubmit = (e) => {
        this.setState({
            save : true, disable:true
        })
        var zip = new JSZip();
        const data = new FormData()
        zip.file(this.state.file.name, this.state.file)
        //  const data = new FormData()
        //  data.append('file',this.state.file)
        let req = {
            release:this.state.release,
            platform:this.state.platform
        }
        zip.generateAsync({type: "blob", compression: "DEFLATE",compressionOptions: {
           level: 9,
       }}).then(content => {data.append('file', content);
            axios.post(`/api/execute/${this.state.release}/${this.state.platform}/${this.state.file.name}`,data)
                .then(response=>{
                this.setState({output:response.data})
                this.reset();
            })
            .catch(err=>{
                console.log("err",err);
            })
        })
    }
    
    reset = () =>{
        this.setState({release:'', platform: '',platforms: []})
    }
    handleChange =(e) => {
        const files = e.target.files;
        if (files && files[0]) {
            let t = Math.random().toString().split(".")[1]
            let temp = new File([files[0]],files[0].name + (new Date().getTime()).toString() + t,{type:files[0].type})
            this.setState({ file: temp});
        }
      };

    render() {
        if(this.state.platforms){
            this.state.platforms.sort()
        }
        return(
            <div>
            {
                this.props.currentUser && !this.props.currentUser.isExe &&
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ Open: !this.state.Open })}>
                            <div class="row">
                                {/* <div class='col-lg-12'> */}
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
                                {/* </div> */}
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
                                                                onChange={(e) => this.setState({ release: e.target.value , errors: { ...this.state.errors, release: null }},() => {this.getPlatform();this.setState({output:''})})} >
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
            {
            this.props.currentUser && this.props.currentUser.isExe &&
                <div class="container" style={{ 'margin-top': '1rem' }}>
                    <h5>You are not allowed to view this page.</h5>
                </div>
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

export default connect(mapStateToProps, { saveUsers, getCurrentRelease })(UpdateE2EResult);