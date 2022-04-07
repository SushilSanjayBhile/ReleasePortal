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

class ImportTCsGui extends Component {
    
    constructor(){
        super();
        this.state = {
            Open:false,
            errors: {},
            release: '',
            froRelease: '',
            allReleases1: [],
            platform: '',
            platforms: [],
            disable: true,
            importTc:[]
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
        if (this.state.froRelease != ''){
        let iface = "GUI"
          axios.get(`/api/getPlatformWiseDomainSubdomain/${this.state.froRelease}/${iface}/`)
            .then(res => {
              this.setState({platforms:res.data, platform:'', importTc:[]})
            }, error => {
              
            });
        }
    }

    handleSubmit = (e) => {
        if(this.state.release === this.state.froRelease) { 
            this.setState({disable:true})
            alert("Both the releases can not be same")
        }
        else {
            this.setState({disable:true})
            let d = {}
            if(this.state.importTc.length > 0) {
                this.state.importTc.forEach(domain => {
                    d[domain] = this.state.platforms[this.state.platform][domain]
                })
            }
            else {
                d = this.state.platforms[this.state.platform]
            }
            axios.get(`/api/importTCs/`,{
                params: {
                interface:"GUI",
                froRelease:this.state.froRelease,
                toRelease:this.state.release,
                platform:this.state.platform,
                domains:d
                }    
            })
                .then(response=>{
                    this.reset()
                    alert("TCs imported successfully")
            })
            .catch(err=>{
                console.log("err",err);
            })
        }
    }
    
    reset = () =>{
        this.setState({release:'', platform: '', froRelease: ''})
    }

    selectMultiselect(event, checked) {
        let value = event.val();
        let domains = null;
        if (checked && this.state.importTc) {
            domains = [...this.state.importTc, value];
        }
        if (checked && !this.state.importTc) {
            domains = [value];
        }
        if (!checked && this.state.importTc) {
            let array = this.state.importTc;
            array.splice(array.indexOf(value), 1);
            domains = array;
        }
        this.setState({ importTc: domains });
    } 

    render() {
       
        let Domains = []
        Domains = this.state.platform && Object.keys(this.state.platforms).length > 0 ? Object.keys(this.state.platforms[this.state.platform]) : []
        //SubDomains = this.state.platform && this.state.platforms && Domains.length > 0 ? this.state.platforms[this.state.platform][Domains] : []
        let d = Domains.length > 0 ? Domains.map(item => ({ value: item, selected: this.state.importTc && this.state.importTc.includes(item) })) : [];
        //let sd = SubDomains.length > 0 ? SubDomains.map(item => ({ value: item, selected: this.state.addSubDomains && this.state.addSubDomains.includes(item) })) : [];
        let multiselect = { 'Domains': d};
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
                                            <span className='rp-app-table-title'>Import Test Cases</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.Open}>
                            {
                                this.state.allReleases1 &&
                            <div>
                                <Form>

                                    <Col xs="6" md="3" lg="3">
                                        <FormGroup className='rp-app-table-value'>
                                                {/* <Label className='rp-app-table-label' htmlFor="UserRole">
                                                    User Role
                                                </Label> */}
                                                <Row xs="6" md="3" lg="3">
                                                    {
                                                            <Input style={{ borderColor: this.state.errors['release'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="release" name="release" value={this.state.release}
                                                                onChange={(e) => this.setState({ release: e.target.value , errors: { ...this.state.errors, release: null }})} >
                                                                <option value=''>Select to Release</option>
                                                                {
                                                                    this.state.allReleases1.map(item => <option value={item}>{item}</option>)
                                                                }
                                                            </Input>
                                                    }
                                                </Row>
                                        </FormGroup>
                                        <FormGroup className='rp-app-table-value'>
                                                {/* <Label className='rp-app-table-label' htmlFor="UserRole">
                                                    User Role
                                                </Label> */}
                                                <Row xs="6" md="3" lg="3">
                                                    {
                                                            <Input style={{ borderColor: this.state.errors['frorelease'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="frorelease" name="frorelease" value={this.state.froRelease}
                                                                onChange={(e) => this.setState({ froRelease: e.target.value ,platforms:{}, errors: { ...this.state.errors, froRelease: null }},() => this.getPlatform())} >
                                                                <option value=''>Select from Release</option>
                                                                {
                                                                    this.state.allReleases1.map(item => <option value={item}>{item}</option>)
                                                                }
                                                            </Input>
                                                    }
                                                </Row>
                                        </FormGroup>
                                   </Col>
                                    <Col xs="6" md="3" lg="3">
                                        {
                                            Object.keys(this.state.platforms).length > 0 ?
                                       <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                            {
                                                
                                                    <Input style={{ borderColor: this.state.errors['platform'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="platform" name="platform" value={this.state.platform}
                                                        onChange={(e) => this.setState({ platform: e.target.value ,importTc:[],disable:false, errors: { ...this.state.errors, platform: null } },() => {if(this.state.platform === '')this.setState({disable:true});})} >
                                                        <option value=''>Select Platform</option>
                                                        {
                                                            Object.keys(this.state.platforms).map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                            }
                                        </Row>
                                        </FormGroup>
                                        :null
                                        }       
                                    </Col>
                                    <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                        {
                                            this.state.platform && Object.keys(this.state.platforms).length > 0 ?
                                                [
                                                    { field: 'Domains', header: 'Select Domains' },
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
                                            :null
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

export default connect(mapStateToProps, {getCurrentRelease })(ImportTCsGui);