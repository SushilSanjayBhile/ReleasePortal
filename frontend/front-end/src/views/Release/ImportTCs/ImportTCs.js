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
class ImportTCs extends Component {
    constructor(){
        super();
        this.state = {
            Open:false,
            errors: {},
            release: '',
            froRelease: '',
            allReleases1: [],
            platform: '',
            platforms: {},
            domain: '',
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
        let iface = "CLI"
        if (this.state.froRelease != ''){
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
            let subd = []
            console.log("this.state.importTc",this.state.importTc)
            if(this.state.importTc.length == 0) {
                if(this.state.platform && this.state.domain){
                    subd = this.state.platforms[this.state.platform][this.state.domain]
                }
            }
            else {
                subd = this.state.importTc
            }
            axios.get(`/api/importTCs/`,{
                params: {
                interface:"CLI",
                froRelease: this.state.froRelease,
                toRelease: this.state.release,
                platform: this.state.platform,
                domain: this.state.domain,
                subd: { subd },
                }
            })
                .then(response=>{
                    alert("TCs imported successfully")
            })
            .catch(err=>{
                console.log("err",err);
            })
        }
    }

    reset = () =>{
        this.setState({release:'', platform: '', domain: '', froRelease: '  '})
    }

    selectMultiselect(event, checked) {
        let value = event.val();
        let temp = null;
        if (checked && this.state.importTc) {
            temp = [...this.state.importTc, value];
        }
        if (checked && !this.state.importTc) {
            temp = [value];
        }
        if (!checked && this.state.importTc) {
            let array = this.state.importTc;
            array.splice(array.indexOf(value), 1);
            temp = array;
        }
        this.setState({ importTc: temp });
    }

    render() {
        let Domains = [], SubDomains = [];
        Domains = this.state.platform && Object.keys(this.state.platforms).length > 0 ? Object.keys(this.state.platforms[this.state.platform]) : []
        SubDomains = this.state.platform && Object.keys(this.state.platforms).length > 0 && this.state.domain ? this.state.platforms[this.state.platform][this.state.domain] : []
        //let d = Domains.length > 0 ? Domains.map(item => ({ value: item, selected: this.state.importTc && this.state.importTc.includes(item) })) : [];
        let sd = SubDomains.length > 0 ? SubDomains.map(item => ({ value: item, selected: this.state.importTc && this.state.importTc.includes(item) })) : [];
        let multiselect = { 'SubDomains': sd};
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
                                                <Row xs="6" md="3" lg="3">
                                                    {
                                                            <Input style={{ borderColor: this.state.errors['frorelease'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="frorelease" name="frorelease" value={this.state.froRelease}
                                                                onChange={(e) => this.setState({ froRelease: e.target.value ,platforms:{}, domain: '', errors: { ...this.state.errors, froRelease: null }},() => this.getPlatform())} >
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
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                            {
                                                 Object.keys(this.state.platforms).length > 0 ?
                                                    <Input style={{ borderColor: this.state.errors['platform'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="platform" name="platform" value={this.state.platform}
                                                        onChange={(e) => this.setState({ platform: e.target.value ,importTc:[], disable:false, errors: { ...this.state.errors, platform: null } },() => {if(this.state.platform === '')this.setState({disable:true, domain: ''});})} >
                                                        <option value=''>Select Platform</option>
                                                        {
                                                            Object.keys(this.state.platforms).map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>:null
                                            }
                                        </Row>
                                        </FormGroup>
                                    </Col>
                                    <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                            {
                                                 this.state.platform && Domains.length > 0 ?
                                                    <Input style={{ borderColor: this.state.errors['domains'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="domain" name="domain" value={this.state.domain}
                                                        onChange={(e) => this.setState({ domain: e.target.value ,importTc:[], disable:false, errors: { ...this.state.errors, domain: null } },() => {if(this.state.domain === '')this.setState({disable:true});})} >
                                                        <option value=''>Select Domain</option>
                                                        {
                                                            Domains.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>:null
                                            }
                                        </Row>
                                        </FormGroup>
                                    </Col>
                                    <Col xs="6" md="3" lg="3">
                                    <FormGroup className='rp-app-table-value'>
                                        <Row xs="10" md="10" lg="10">
                                        {
                                            this.state.domain && Object.keys(this.state.platforms).length > 0 ?
                                                [
                                                    //{ field: 'Domains', header: 'Select Domains' },
                                                    { field: 'SubDomains', header: 'Select Sub Domains' }
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

export default connect(mapStateToProps, {getCurrentRelease })(ImportTCs);