// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import {Form, FormGroup, Col, Row, Table, Button, Input, Collapse} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import axios from 'axios';
import { saveSingleFeature,saveBugs } from '../../../actions';
import './ReleaseStatus.scss'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';

let allBugs = []
const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class ReleaseStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addTC: {},
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            featureOpen: true,
            buildOpen: false,
            bugOpen: false,
            graphsOpen: false,
            blockedBugOpen:false,
            blockedBugList:[],
            BugsList:[],
            totalBugList:[],
            releaseInfo: false,
            fixVersion:'',
            epicLink:'',
            save:false
        }
    }
    initialize() {
        if (!this.props.singleFeature.fields) {
            if (this.props.feature && this.props.feature.issues) {
                this.getFeatureDetails(this.props.feature.issues[0].self)
            }
        }
        if (this.props.statusPage) {
            this.setState({ ...this.state, ...this.props.statusPage });
        }
        
        console.log("selected release from release status",this.props,this.props.selectedRelease)
        console.log("bug reducer",this.props.bug);
        let fixVersion = this.props.selectedRelease.fixVersion;
        let tempRelease = this.props.selectedRelease.ReleaseNumber
        let release = this.props.selectedRelease.ReleaseNumber
            let totalCount = 0
            let maxResults = 0
            let totalBugs = []

            if(tempRelease === 'Spektra 2.4') {
                tempRelease='2.4.0'
            }
            if(tempRelease === 'DMC-3.0') {
                tempRelease="\"Spektra 3.0\""
            }
            if(tempRelease === 'DSS-3.1') {
                tempRelease='3.1.0'
            }
            if(tempRelease === 'Overlay=3.1' || tempRelease === 'OCP-4.5') {
                tempRelease = "\"Spek 3.1.0\""
            }
            tempRelease="\"Spektra 3.0\""
            fixVersion = "\"" + fixVersion + "\""
            // axios.get('/rest/bugs/total/' + tempRelease)
            axios.get('/rest/bugs/total/' + fixVersion)
            .then(response => {
                totalBugs = response;
                maxResults = response.data.maxResults
                totalCount = parseInt(response.data.total/response.data.maxResults)
                let startAt = 0

                for(let i = 0; i < totalCount ; i++){
                    startAt = startAt + response.data.maxResults + 1
                    // let url = '/rest/bugs/totalCount/'  + tempRelease + "/" + startAt
                    let url = '/rest/bugs/totalCount/'  + fixVersion + "/" + startAt
                    axios.get(url).then(response1=>{
                        for(let i = 0 ;i < response1['data']['issues'].length ;i++){
                            totalBugs['data']['issues'].push(response1['data']['issues'][i])
                        }
                    })
                }
        
                this.setState({totalBugList:totalBugs.data},()=>{
                    if(this.state.totalBugList){
                        this.BlockedBugList(release)
                     }else{
                        console.log("coming in empty totalBugList")
                     }
                })

                

            }, err => {
                console.log('err ', err);
            })
    }
    componentDidMount() {
        this.initialize();
        
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.history.push('/release/summary')
            this.initialize();
        }
    }

    BlockedBugList = (release) =>{
        //calculate blocker bug count
        let list = []
        let list2 = []
        let url  = `/api/bugwiseblockedtcs/` + release
        axios.get(url).then(res=>{
                    // console.log("response of blocked data",res.data)
                    list.push(res.data);
                    for (let [key, value] of Object.entries(list[0])) {
                        list2.push({'bug_no':key,'value':value})
                    }
                    let a = this.sortBugList(list2)
                    this.setState({blockedBugList:list2})
                    let list3 = []
                    let list4 = []
                    if(this.state.totalBugList.issues){
                        for(let i = 0 ; i < this.state.blockedBugList.length ; i++){
                            for(let j = 0 ; j < this.state.totalBugList.issues.length ; j++ ){
                                if(this.state.totalBugList.issues[j]['key'] == this.state.blockedBugList[i]['bug_no'] ){
                                    let bug = this.state.totalBugList.issues[j].fields
                                    list3.push({'bug_no':this.state.totalBugList.issues[j]['key'],'value':this.state.blockedBugList[i]['value'],'summary':bug.summary,'status':bug.status.name,'priority':bug.priority.name})
                                }
                                else{
                                    if (this.state.blockedBugList[i]['bug_no'].indexOf(',') != -1) {
                                        list3.push({'bug_no':this.state.blockedBugList[i]['bug_no'],'value':this.state.blockedBugList[i]['value'],'summary':'','status':'','priority':''})
                                    }
                                    
                                }
                            }
                        }
                    
                    for(let i = 0; i < list3.length-1;i++){
                        if(list3[i]['bug_no'] !== list3[i+1]['bug_no'] ){
                            list4.push(list3[i])
                        }
                    }
                    this.setState({blockedBugList:list4})
                    }
                },
                error => {
                console.log('bugwiseblockedtcs',error);
        }) 
    }
    getFeatureDetails(dws) {
        axios.post('/rest/featuredetail', { data: dws }).then(res => {
            let issuesArray = []
            if (this.props.selectedRelease.ReleaseNumber === "DMC-3.0"){
                axios.get("/rest/DMCfeaturedetail/"+ res.data.key).then(res1 => {
                    if(res1.data.issues){
                        for(let i = 0 ; i < res1.data.issues.length ; i++ ){
                            issuesArray.push(res1.data.issues[i]);
                        }
                    }
                    res.data.fields.subtasks = issuesArray;
                   
                    this.props.saveSingleFeature({ data: res.data });
                })
                res.data.fields.subtasks = issuesArray;
            }
            this.props.saveSingleFeature({ data: res.data });
        }, err => {})
    }

    sortBugList = (list) =>{
        return list.sort(function(a, b){
            return b.value - a.value
        })
    }
        
    renderTableData  = () => {
        
        return this.state.blockedBugList == 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.blockedBugList.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td width="100px" height="50px" >{e.bug_no}</td>
                            <td width="100px" height="50px" >{e.summary}</td>
                            <td width="100px" height="50px" >{e.status}</td>
                            <td width="100px" height="50px" >{e.value}</td>
                            <td width="100px" height="50px" >{e.priority}</td>
                        </tr>    
                );
            })
        )
        
    }

    checkSelectedBug = (item) =>{
        let list = []
        if(this.props.bug.bug.issues){
            this.props.bug.bug.issues.forEach((eachBug)=>{
                if(item == 'open'){
                    if(eachBug.fields.status.name == 'Open' || eachBug.fields.status.name == 'To Do' || eachBug.fields.status.name == 'In Progress'){
                        list.push(eachBug)
                    }
                }
                if(item == 'resolved'){
                    if(eachBug.fields.status.name == 'Resolved' || eachBug.fields.status.name == 'Closed' ){
                        list.push(eachBug)
                    }
                }
                if(item == 'total'){
                    list.push(eachBug)
                }
                if(item == "others" && eachBug.fields.status.name != 'Open' && eachBug.fields.status.name != 'Resolved' && eachBug.fields.status.name != 'To Do' && eachBug.fields.status.name != 'In Progress' && eachBug.fields.status.name != 'Closed'){
                    list.push(eachBug)
                }
            })
            this.setState({BugsList:list})
        }
    }

    handleChange = (e) => {
        if(e.target.name == 'fixVersion'){
            this.setState({
                fixVersion: e.target.value.trim()
            })
        }
        
        if(e.target.name == 'epicLink'){
            this.setState({
                epicLink: e.target.value.trim()
            })
        }
    };

    handleSubmit = (e) => {
        // e.preventDefault();
        // e.target.reset();
        this.setState({
            save : true
        })
        let fixVersion = this.state.fixVersion;
        let epicLink = this.state.epicLink;
        let formData = {
            "fixVersion": fixVersion,
            "epicLink": epicLink,
        }

        let url = ''
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
        document.getElementById('fixVersion').value='';
        document.getElementById('epicLink').value='';
    }
    
    render() {
        let featuresCount = 0;
        let featuresStatusDict = {'Open': { total: 0 },'Resolved': { total: 0 },'Others': { total: 0 } }
        let statusScenarios = { Open: { total: 0 }, Resolved: { total: 0 } };

        if (this.props.feature && this.props.feature.issues) {
            featuresCount = this.props.feature.issues.length;
            this.props.feature.issues.forEach(item => {
                if(statusScenarios[item.fields.status.name] == 'In Progress' || statusScenarios[item.fields.status.name] == 'To Do' ) {
                    statusScenarios['Open'].total += 1;
                }
                if (statusScenarios[item.fields.status.name]) {
                    statusScenarios[item.fields.status.name].total += 1;
                } else if(statusScenarios[item.fields.status.name] != 'In Progress' || statusScenarios[item.fields.status.name] != 'To Do') {
                    statusScenarios[item.fields.status.name] = { total: 1 }
                }
                
            })
        }

        if (this.props.feature && this.props.feature.issues) {
            featuresCount = this.props.feature.issues.length;
            this.props.feature.issues.forEach(item => {
                if(item.fields.status.name == 'In Progress' || item.fields.status.name == 'To Do'|| item.fields.status.name == 'Open' ) {
                    featuresStatusDict['Open'].total += 1;
                }
                else if(item.fields.status.name == 'Resolved'){
                    featuresStatusDict['Resolved'].total += 1;
                }
                else{
                    featuresStatusDict['Others'].total += 1;
                }
            })
        }
        return (
            <div>
                {
                    this.props.currentUser && !this.props.currentUser.isExe &&
                <div>
                {/* {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                                <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ releaseInfo: !this.state.releaseInfo })}>
                                    <div class="row">
                                        <div class='col-md-6'>
                                            <div class='row'>
                                                <div class='col-md-4'>
                                                    {
                                                        !this.state.releaseInfo &&
                                                        <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                                    }
                                                    {
                                                        this.state.releaseInfo &&
                                                        <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                                    }
                                                    <span className='rp-app-table-title'>Release Info</span>
                                                </div>
                                            
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Collapse isOpen={this.state.releaseInfo}>
                                <div>
                                    <Form>
                                        <FormGroup row>
                                            <Col sm={6}>
                                                <Input type = "text" name = "fixVersion" id = "fixVersion" placeholder = "Enter Fix Version "/>
                                            </Col>
                                        </FormGroup>

                                        <FormGroup row>
                                            <Col sm={6}>
                                                <Input type = "text" name = "epicLink" id = "epicLink" placeholder = "Enter Epic Link "/>
                                            </Col>
                                        </FormGroup>

                                        <Button outline color="success" id = 'submit' onClick={this.handleSubmit} > Save </Button>
                                    </Form>
                                </div>
                            </Collapse>
                        </Col>
                    </Row>
                } */}

                <Row>
                
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                    
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ bugOpen: !this.state.bugOpen })}>
                            <div class="row">
                                <div class='col-md-6'>
                                    <div class='row'>
                                        <div class='col-md-4'>
                                            {
                                                !this.state.bugOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.bugOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }

                                            <div className='rp-icon-button'><i className="fa fa-bug"></i></div><span className='rp-app-table-title'>Bugs</span>
                                        </div>
                                        {/* {
                                            this.props.bug && Object.keys(this.props.bug.bugCount.all).map(item =>
                                                
                                                <div class='col-md-2'>
                                                    <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }}>
                                                        <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                        <strong class="h5">{this.props.bug.bugCount.all[item]}</strong>
                                                    </div>
                                                </div>
                                            )
                                        } */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Collapse isOpen={this.state.bugOpen}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }} >
                                <div class="row">
                                    <div class='col-md-6'>
                                        <div class='row'>
                                            {
                                                this.props.bug && Object.keys(this.props.bug.bugCount.all).map(item =>
                                                    <div class='col-md-2'>
                                                        <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }} onClick={() => this.checkSelectedBug(item)}>
                                                            <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                            <strong class="h5">{this.props.bug.bugCount.all[item]}</strong>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Row style={
                                {
                                    marginRight: '0',
                                    marginLeft: '0'
                                }
                            }>
                                <Col xs="12" sm="12" md="12" lg="12">
                                    
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{width:'250px'}}>Bug</th>
                                                    <th>Summary</th>
                                                    <th  style={{width:'250px'}}>Status</th>
                                                    <th  style={{width:'250px'}}>Priority</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {  
                                                    this.props.bug && this.props.bug.bug && this.props.bug.bug.issues && 
                                                    this.state.BugsList.map(item => {
                                                        return (
                                                            <tr style={{ cursor: 'pointer' }}>
                                                                <td style={{ width: '250px' }} className='rp-app-table-key'><span onClick={() => window.open(`https://diamanti.atlassian.net/browse/${item.key}`)}>{item.key}</span></td>
                                                                
                                                                <td>{item.fields.summary}</td>
                                                                
                                                                <td style={{width:'250px'}}> 
                                                                    <div className={`c-callout c-callout-${item.fields.status.name.toLowerCase()} rp-new-badge`}>
                                                                        <strong class="h5">{item.fields.status.name}</strong>
                                                                    </div>
                                                                </td>
                                                                <div style={{width:'250px'}} className={`c-callout c-callout-${item.fields.priority.name.toLowerCase()} rp-new-badge`}>
                                                                    <strong class="h5">{item.fields.priority.name}</strong>
                                                                </div>

                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>
                        </Collapse>
                    </Col>
                </Row>


                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>

                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ blockedBugOpen: !this.state.blockedBugOpen },()=>{this.BlockedBugList(this.props.selectedRelease.ReleaseNumber)})} style={{ display: 'inlineBlock' }}>
                                        
                                        {
                                            !this.state.blockedBugOpen &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.blockedBugOpen &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Blocker Bugs</span>
                                      
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Collapse isOpen={this.state.blockedBugOpen}>
                            <Row style={
                                {
                                    marginRight: '0',
                                    marginLeft: '0'
                                }
                                }>
                                <Col xs="12" sm="12" md="12" lg="12">
                                    
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{width:'100px'}}>Bug</th>
                                                    <th style={{width:'450px'}}>Summary</th>
                                                    <th  style={{width:'150px'}}>Status</th>
                                                    <th  style={{width:'80px'}}>#TC Blocked</th>
                                                    <th  style={{width:'150px'}}>Priority</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                this.renderTableData()
                                                }
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>
                        </Collapse>

                    </Col>
                </Row>

                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ buildOpen: !this.state.buildOpen })}>
                            {
                                !this.state.buildOpen &&
                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                            }
                            {
                                this.state.buildOpen &&
                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                            }

                            <div className='rp-icon-button'><i className="fa fa-gears"></i></div>
                            <span className='rp-app-table-title'>Upgrade Metrics and Risks</span>
                        </div>
                        <Collapse isOpen={this.state.buildOpen}>
                            <Row>
                                <Col xs="11" sm="11" md="11" lg="4">
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <div className='rp-rs-hw-support'>Upgrade Metrics</div>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <thead>
                                                <tr>
                                                    <th>From Version</th>
                                                    <th>To Version</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.props.selectedRelease.UpgradeMetrics && this.props.selectedRelease.UpgradeMetrics.map(item =>
                                                        <tr>
                                                            <td>{item}</td>
                                                            <td>{this.props.selectedRelease.ReleaseNumber}</td>
                                                        </tr>
                                                    )
                                                }

                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                                <Col xs="11" sm="11" md="11" lg="8">
                                    <div className='rp-rs-hw-support'>Risks and Red Flags</div>
                                    <Input readOnly={true} type="textarea" name="risksRedFlags" id="risksRedFlags" rows="5"
                                        placeholder="Content..." value={this.props.selectedRelease.RedFlagsRisks} />
                                </Col>
                            </Row>
                        </Collapse>
                    </Col>
                </Row>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ featureOpen: !this.state.featureOpen })}>
                            <div class="row">
                                <div class='col-md-8'>
                                    <div class="row">
                                        <div class='col-md-3'>
                                            {
                                                !this.state.featureOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.featureOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }

                                            <div className='rp-icon-button'><i className="fa fa-empire"></i></div>
                                            <span className='rp-app-table-title'>Features</span>

                                        </div>
                                        <div class="col-sm-2">
                                            <div className={`c-callout c-callout-total`} style={{ marginTop: '0', marginBottom: '0' }}>
                                                <small class="text-muted">TOTAL</small><br></br>
                                                <strong class="h4">{featuresCount}</strong>
                                            </div>
                                        </div>
                                        {
                                            Object.keys(featuresStatusDict).map(item =>
                                                <div class="col-sm-2">
                                                    <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }}>
                                                        <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                        <strong class="h4">{featuresStatusDict[item].total}</strong>
                                                    </div>
                                                </div>
                                            )
                                        }

                                    </div>
                                </div>
                            </div>

                        </div>
                        <Collapse isOpen={this.state.featureOpen}>

                            <Row>
                                <Col xs="11" sm="11" md="11" lg="4">
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <thead>
                                                <tr>
                                                    <th>Feature</th>
                                                    <th>Summary</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                        this.props.feature && this.props.feature.issues &&
                                                        this.props.feature.issues.map(item => {
                                                            return (
                                                                <tr style={{ cursor: 'pointer' }} onClick={() => this.getFeatureDetails(item.self)}>
                                                                    <td className='rp-app-table-key' onClick={() => window.open(`https://diamanti.atlassian.net/browse/${item.key}`)}>{item.key}</td>
                                                                    <td>{item.fields.summary}</td>
                                                                    <td>
                                                                        {/* <Badge className='rp-open-status-badge'>{item.fields.status.name}</Badge> */}
                                                                        <div className={`c-callout c-callout-open rp-new-badge`}>
                                                                            <strong class="h5">{item.fields.status.name}</strong>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                }
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                                <Col xs="11" sm="11" md="11" lg="8">
                                    {
                                        (this.props.singleFeature && !this.props.singleFeature.fields
                                        && loading())

                                    }
                                    {
                                        this.props.singleFeature && this.props.singleFeature.fields &&

                                        <Row style={{ marginLeft: '0.5rem', maxHeight: '30rem', overflowY: 'scroll' }}>
                                            <div className='rp-rs-hw-support'>{this.props.singleFeature.key}</div>


                                            <Table scroll responsive style={{ overflow: 'scroll' }}>
                                                <tbody>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Summary</td>
                                                        <td className='rp-app-table-key'>{this.props.singleFeature.fields.summary}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Created</td>
                                                        <td className='rp-app-table-key'>{this.props.singleFeature.fields.created}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Updated</td>
                                                        <td className='rp-app-table-key'>{this.props.singleFeature.fields.updated}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Priority</td>
                                                        <td className='rp-app-table-key'>
                                                            <div className={`c-callout c-callout-${this.props.singleFeature.fields.priority.name.toLowerCase()} rp-new-badge`}>
                                                                <strong class="h5">{this.props.singleFeature.fields.priority.name}</strong>
                                                            </div>
                                                            {/* <Badge className={`rp-priority-${this.props.singleFeature.fields.priority.name}-status-badge`} style={{ marginTop: '0.5rem' }}>
                                                            {this.props.singleFeature.fields.priority.name}
                                                            </Badge> */}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Progress</td>
                                                        <td className='rp-app-table-key'>{this.props.singleFeature.fields.progress.progress}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='rp-app-table-key'>Status</td>
                                                        <td className='rp-app-table-key'>
                                                            <div className={`c-callout c-callout-${this.props.singleFeature.fields.status.name.toLowerCase()} rp-new-badge`}>
                                                                <strong class="h5">{this.props.singleFeature.fields.status.name}</strong>
                                                            </div>
                                                            {/* <Badge className={`rp-feature-${this.props.singleFeature.fields.status.name}-status-badge`} style={{ marginTop: '0.5rem' }}>
                                                            {this.props.singleFeature.fields.status.name}
                                                            </Badge> */}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>

                                                
                                            <div className='rp-rs-hw-support'>Subtasks</div>
                                            <Table scroll responsive style={{ overflow: 'scroll' }}>
                                                <tbody>
                                                    {

                                                        this.props.singleFeature.fields.subtasks.map(item => {
                                                            return (
                                                                <tr>
                                                                    <td style={{ width: '250px' }}><span onClick={() => window.open(`https://diamanti.atlassian.net/browse/${item.key}`)}>{item.key}</span></td>
                                                                    <td>{item.fields.summary}</td>
                                                                
                                                                    <td  style={{width:'250px'}}>
                                                                        <div className={`c-callout c-callout-${item.fields.status.name.toLowerCase()} rp-new-badge`}>
                                                                            <strong class="h5">{item.fields.status.name}</strong>
                                                                        </div>
                                                                        {/* <Badge className={`rp-feature-${item.fields.status.name}-status-badge`} style={{ marginTop: '0.5rem' }}>
                                                                        {item.fields.status.name}</Badge> */}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                            
                                        </Row>
                                    }
                                </Col>
                            </Row>
                        </Collapse>
                    </Col>
                </Row>
                </div>
                }
                {
                    this.props.currentUser && this.props.currentUser.isExe &&
                    <div class="container" style={{ 'margin-top': '1rem' }}>
                        <h5>You are not allowed to view this page.</h5>
                    </div>
                }
        </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    feature: state.feature.all[state.release.current.id],
    bug: state.bug.all[state.release.current.id],
    singleFeature: state.feature.single,
    statusPage: state.app.statusPage
})
export default connect(mapStateToProps, { saveSingleFeature })(ReleaseStatus);








