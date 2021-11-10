import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Input, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import './QaAnalysis.scss'
import CustomerBugs from '../../../components/CustomerBugs/CustomerBugs';
import IndividualReport from '../../../components/QaReport/IndividualReport';
import CustomerReport from '../../../components/CustomerBugs/CustomerReport';
import ManagerReport from '../../../components/CustomerBugs/ManagerReport';
import ClosedBugReport from '../../../components/CustomerBugs/ClosedBugReport';
import DeveloperReport from '../../../components/CustomerBugs/DeveloperReport';
function daysInThisMonth() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
}

let month = new Date().getMonth() + 1;
let year = new Date().getFullYear();
let dayInCurrentMonth = daysInThisMonth();

let tempDateStart = ''
let tempDateEnd = ''
let tempDateStartGUI = ''
let tempDateEndGUI = ''
let ttempDateStart = ''
let ttempDateEnd = ''
let ttempDateStartGUI = ''
let ttempDateEndGUI = ''
let tempDateStartAPI = ''
let tempDateEndAPI = ''
let globalDate = 0
if(month >= '10'){
    tempDateStart = year +"-"+ month +"-"+ "01"
    tempDateEnd = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartGUI = year +"-"+ month +"-"+ "01"
    tempDateEndGUI = year +"-"+ month +"-"+ dayInCurrentMonth

    ttempDateStart = year +"-"+ month +"-"+ "01"
    ttempDateEnd = year +"-"+ month +"-"+ dayInCurrentMonth

    ttempDateStartGUI = year +"-"+ month +"-"+ "01"
    ttempDateEndGUI = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartAPI = year +"-"+ month +"-"+ "01"
    tempDateEndAPI = year +"-"+ month +"-"+ dayInCurrentMonth
}
else{
    tempDateStart = year + "-" + "0" + month + "-" + "01"
    tempDateEnd =year + "-" + "0" + month + "-" + dayInCurrentMonth

    tempDateStartGUI = year +"-0"+ month +"-"+ "01"
    tempDateEndGUI = year +"-0"+ month +"-"+ dayInCurrentMonth

    ttempDateStart = year +"-"+ "0" + month +"-"+ "01"
    ttempDateEnd = year +"-"+ "0" + month +"-"+ dayInCurrentMonth

    ttempDateStartGUI = year +"-"+ "0" + month +"-"+ "01"
    ttempDateEndGUI = year +"-"+ "0" +  month +"-"+ dayInCurrentMonth

    tempDateStartAPI = year +"-"+ month +"-"+ "01"
    tempDateEndAPI = year +"-"+ month +"-"+ dayInCurrentMonth
}
class QaAnalysis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            metricsOpen: false,
            addTC: {},
            width: window.screen.availWidth > 1700 ? 500 : 380,
            domainSelected: false,
   
            automationCountWithRangeView : false,

            automationCountDataWithRange : [],
            automationCountDataWithRangeForGUI : [],
            testCountDataWithRange : [],
            testCountDataWithRangeForGUI : [],
            jiraBugData: [],
            startDate : tempDateStartAPI,
            endDate : tempDateEndAPI,         
            globalDate : false
        }
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.history.push('/release/summary');
        }
    }
    componentDidMount() {
        this.setState({ metricsOpen: false })
    }
    getTcs() {
        if (this.state.domainSelected) {
            axios.get(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}/tcinfo/domain/${this.state.domainSelected}`)
                .then(res => {
                    this.props.saveTestCase({ data: res.data, id: this.props.selectedRelease.ReleaseNumber });
                }, error => {
                })
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    save() {
        let data = { ...this.state.addTC };
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};
        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]);
                formattedDates[item] = date.toISOString()
            }
        })
        data = { ...data, ...formattedDates };
        data.Domain = this.state.domainSelected;
        axios.post(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                this.getTcs();
                this.setState({ addTC: {} });
            }, error => {
                alert('error in updating');
            });
        if (this.state.modal) {
            this.toggle();
        }
    }

    getAutomationCountDataWithRange = (startDate,endDate,intf) =>{ 
        let tempList = []
        let tempListGUI = []
        
        axios.get('/api/automation/',{
            params: {
                startdate:startDate,
                enddate :endDate
            },
        })
        .then(response=>{
            let data = response.data
            data.map((item)=>{
                console.log("automation dateRange data",item)
                tempList.push({
                    "AutomatedCli": item.AutomatedCli,
                    "DateRange": item.DateRange,
                    "TotalCli": item.TotalCli,
                    "Increase_In_Total" : item.totalCLIDelta,
                    "Increase_In_Automation" : item.automatedCLIDelta,
                    "Automation_Perc" : item.automation_perc_cli
                })

                tempListGUI.push({
                    "AutomatedGui": item.AutomatedGui,
                    "DateRange": item.DateRange,
                    "TotalGui": item.TotalGui,
                    "Increase_In_Total" : item.totalGUIDelta,
                    "Increase_In_Automation" : item.automatedGUIDelta,
                    "Automation_Perc" : item.automation_perc_gui
                })
            })

            if(intf == 'CLI'){
                this.setState({
                    automationCountDataWithRange : tempList,
                })
            }
            else if(intf == 'GUI'){
                this.setState({
                    automationCountDataWithRangeForGUI : tempListGUI
                })
            }
        })
        .catch(error=>{
            console.log("Error",error)
        })
    }

    getTestCountDataWithRange = (startDate, endDate, intf) =>{   
        let tempList = []
        let tempListGUI = []
        if(intf === "CLI") {
            axios.get('/api/tcReport/',{
                params: {
                    interface:intf,
                    startdate:startDate,
                    enddate :endDate
                },
            })
            .then(response=>{
                let data = response.data
                
                let keys = Object.keys(data)
                keys.forEach(key =>{
                    if(data[key] != 0){
                        tempList.push({
                                "Release":key,
                                "Total":data[key]
                        })
                    }
                })
                if(tempList.length == 0){
                    tempList.push({
                        "Release":"NA",
                        "Total":"NA"
                    })
                }
                this.setState({
                    testCountDataWithRange : tempList
                  })
            })
            .catch(error=>{
                console.log("Error",error)
            })
        }
        if(intf === "GUI") {
            axios.get('/api/tcReport/',{
                params: {
                    interface:intf,
                    startdate:startDate,
                    enddate :endDate
                },
            })
            .then(response=>{
                let data = response.data
                
                let keys = Object.keys(data)
                keys.forEach(key =>{
                    if(data[key] != 0){
                        tempListGUI.push({
                                "Release":key,
                                "Total":data[key]
                        })
                    }
                })
                if(tempListGUI.length == 0){
                    tempListGUI.push({
                        "Release":"NA",
                        "Total":"NA"
                    })
                }
                this.setState({
                    testCountDataWithRangeForGUI : tempListGUI
                  })
                
            })
            .catch(error=>{
                console.log("Error",error)
            })
        }
         
    }

    renderTableDataForAutomationCountWithRange = () =>{
        return this.state.automationCountDataWithRange === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.automationCountDataWithRange.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td width="140px" height="50px">{e.DateRange}</td>
                        <td>{e.TotalCli}</td>
                        <td>{e.Increase_In_Total}</td>
                        <td>{e.AutomatedCli}</td>
                        <td>{e.Increase_In_Automation}</td>
                        <td>{e.Automation_Perc}%</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForAutomationCountWithRangeForGUI = () =>{
        return this.state.automationCountDataWithRangeForGUI === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.automationCountDataWithRangeForGUI.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td width="140px" height="50px">{e.DateRange}</td>
                        <td>{e.TotalGui}</td>
                        <td>{e.Increase_In_Total}</td>
                        
                        <td>{e.AutomatedGui}</td>
                        <td>{e.Increase_In_Automation}</td>
                        
                        <td>{e.Automation_Perc}%</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForTestCountWithRange = () =>{
        return this.state.testCountDataWithRange.length == 0 ? (
            <tr> 
                Lodaing...
            </tr>    
        ) : (
            this.state.testCountDataWithRange.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td width="140px" height="50px">{e.Release}</td>
                        <td width="140px" height="50px">{e.Total}</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForTestCountWithRangeForGUI = () =>{
        return this.state.testCountDataWithRangeForGUI.length == 0 ? (
            <tr> 
                Lodaing...
            </tr> 
        ) : (
            this.state.testCountDataWithRangeForGUI.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td width="140px" height="50px">{e.Release}</td>
                        <td width="140px" height="50px">{e.Total}</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForJiraBugData = () =>{
        return this.state.jiraBugData.length == 0 ? (
            <tr> 
                Lodaing...
            </tr> 
        ) : (
            this.state.jiraBugData.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td width="140px" height="50px">{e.Release}</td>
                        <td width="140px" height="50px">{e.Total}</td>
                        <td width="140px" height="50px">{e.Close}</td>
                        <td width="140px" height="50px">{e.CustomerBug}</td>
                        <td width="140px" height="50px">{e.Open}</td>
                    </tr>    
                ); 
            })
        )
    }

    selectedStartDate = (startDate) =>{
        tempDateStart = startDate['StartDate']
        this.setState({
            startDate : tempDateStart,
        },()=>{
            this.globalDate = 1
        })
    }
    
    selectedEndDate = (endDate) =>{
        tempDateEnd = endDate['EndDate']
        this.setState({
            endDate : tempDateEnd,
        },()=>{
            this.getAutomationCountDataWithRange(this.state.startDate,this.state.endDate,'CLI');
        })
    }

    selectedStartDateGUI = (startDate) =>{
        tempDateStartGUI = startDate['StartDate1']
        this.setState({
            startDateGUI : tempDateStartGUI,
        })
    }
    
    selectedEndDateGUI = (endDate) =>{
        tempDateEndGUI = endDate['EndDate1']
        this.setState({
            endDateGUI : tempDateEndGUI,
        },()=>{
            this.getAutomationCountDataWithRange(this.state.startDateGUI,this.state.endDateGUI,'GUI');
        })
    }

    testSelectedStartDateCLI = (startDate) =>{
        ttempDateStart = startDate['tStartDate']
        this.setState({
            tstartDate : ttempDateStart,
        },()=>{
            this.globalDate = 1
        })
    }
    
    testSelectedEndDateCLI = (endDate) =>{
        ttempDateEnd = endDate['tEndDate']
        this.setState({
            tendDate : ttempDateEnd,
            testCountDataWithRange : []
        },()=>{
            //this.getTestCountDataWithRange(this.state.tstartDate,this.state.tendDate,'CLI');
            this.getTestCountDataWithRange(this.state.tstartDate, this.state.tendDate, 'CLI');
        })
    }

    testSelectedStartDateGUI = (startDate) =>{
        ttempDateStartGUI = startDate['tStartDate1']
        this.setState({
            tstartDateGUI : ttempDateStartGUI,
        })
    }
    
    testSelectedEndDateGUI = (endDate) =>{
        ttempDateEndGUI = endDate['tEndDate1']
        this.setState({
            tendDateGUI : ttempDateEndGUI,
            testCountDataWithRangeForGUI : []
            
        },()=>{
            //this.getTestCountDataWithRange(this.state.tstartDateGUI,this.state.tendDateGUI,'GUI');
            this.getTestCountDataWithRange(this.state.tstartDateGUI, this.state.tendDateGUI, 'GUI');
        })
    }

    getdata(){
        let output = []
        axios.get(`/rest/jira/bugdata`)
        .then(res => {
            let data = res.data.rows
            data.forEach(element => {
                let keyofelement = Object.keys(element)
                if(keyofelement.length > 0){
                    let key = keyofelement[0]
                    let filter = element[key][0]["markup"].split(".")
                        if(filter.length > 1 && filter[0] !== "2" && filter[0] !== "1" && filter[0] !== "0"){
                            let openurl = element[key][1]["markup"]
                            let openBugCount = parseInt(openurl.split(">")[1].split("<")[0],10)

                            let todourl = element[key][5]["markup"]
                            let todoBugCount = parseInt(todourl.split(">")[1].split("<")[0],10)

                            let inpgurl = element[key][2]["markup"]
                            let inpgBugCount = parseInt(inpgurl.split(">")[1].split("<")[0],10)

                            let closeurl = element[key][4]["markup"]
                            let closeBugCount = parseInt(closeurl.split(">")[1].split("<")[0],10)

                            let resurl = element[key][3]["markup"]
                            let resBugCount = parseInt(resurl.split(">")[1].split("<")[0],10)

                            let inqaurl = element[key][11]["markup"]
                            let inqaBugCount = parseInt(inqaurl.split(">")[1].split("<")[0],10)

                            let totalurl = element[key][12]["markup"]
                            let totalBugCount = parseInt(totalurl.split(">")[1].split("<")[0],10)
                                                     
                            output.push({
                                    "Release": element[key][0]["markup"],
                                    "Open": openBugCount + todoBugCount + inpgBugCount,
                                    "Close": closeBugCount + resBugCount + inqaBugCount,
                                    "Total": totalBugCount,
                                    "CustomerBug": 0
                                    })

                        }
                }
            })
                axios.get(`/rest/cbug`)
                .then(res => {
                    let data = res.data.searchResultTotal.rows
                    
                    let out = []
                    data.forEach(element => {   
                        let keyofelement = Object.keys(element)
                        if(keyofelement.length > 0){
                            let key = keyofelement[0]
                            let filter = element[key][0]["markup"].split(".")
                                if(filter.length != 1 && filter[0] !== "2" && filter[0] !== "1" && filter[0] !== "0"){
                                    let totalurl = element[key][13]["markup"]
                                    let totalBugCount = parseInt(totalurl.split(">")[1].split("<")[0],10)
        
                                    out.push({
                                            "Release": element[key][0]["markup"],
                                            "CustomerBug": totalBugCount,
                                            })
                                   
                                }
                        }
                    })
                    out.forEach(element => {
                        output.some(item => {
                            if(item["Release"] === element["Release"]){
                                item["CustomerBug"] = element["CustomerBug"]
                            }
                        })
                    })
                    this.setState({jiraBugData : output})
                }).catch(error=>{
                    console.log("Error",error)
                    })
           
        }).catch(error=>{
            console.log("Error",error)
            })
    }


    render() {
        let DATE1 = tempDateStart     
        let DATE2 = tempDateEnd 
        let DATE3 = tempDateStartGUI     
        let DATE4 = tempDateEndGUI
        let DATE5 = ttempDateStart     
        let DATE6 = ttempDateEnd
        let DATE7 = ttempDateStartGUI     
        let DATE8 = ttempDateEndGUI
        return (
            <div>
            {
            this.props.currentUser && this.props.currentUser.isAdmin &&
            <div>
                <div>
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                                <div class="row">
                                    <div class='col-lg-12'>
                                        <div style={{ display: 'flex' }}>
                                            <div onClick={() => this.setState({ automationCountWithRangeView: !this.state.automationCountWithRangeView },()=>{this.getAutomationCountDataWithRange(this.state.startDate,this.state.endDate,'CLI');})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.automationCountWithRangeView &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.automationCountWithRangeView &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>CLI Weekly Automation Progress</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Collapse isOpen={this.state.automationCountWithRangeView}>
                                <Row>
                                    
                                    <div style={{ marginRight: '4rem' ,marginLeft: '4rem', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <div class="row"  style={{marginTop:'1rem'}}>
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="StartDate" value={DATE1} onChange={(e) => this.selectedStartDate({ StartDate: e.target.value })} ></Input>
                                            </div> 

                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="EndDate" value={DATE2} onChange={(e) => this.selectedEndDate({ EndDate: e.target.value })} />
                                            </div> 
                                        </div>
                                        <Table>
                                            <tbody>
                                                <th width="130px" height="50px" ><b>Date </b></th>
                                                <th width="130px" height="50px" ><b>Total TCs</b></th>
                                                <th width="130px" height="50px" ><b>Increase IN Total TCs</b></th>
                                                <th width="130px" height="70px" ><b>Total Automated TCs</b></th>
                                                <th width="130px" height="70px" ><b>Increase In Automated TCs</b></th>
                                                <th width="130px" height="70px" ><b>Automated Percentage</b></th>
                                                    {
                                                        this.state.automationCountDataWithRange ? this.renderTableDataForAutomationCountWithRange() : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
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
                                            <div onClick={() => this.setState({ automationCountWithRangeViewForGUI: !this.state.automationCountWithRangeViewForGUI },()=>{this.getAutomationCountDataWithRange(this.state.startDate,this.state.endDate,'GUI');})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.automationCountWithRangeViewForGUI &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.automationCountWithRangeViewForGUI &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>GUI Weekly Automation Progress</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Collapse isOpen={this.state.automationCountWithRangeViewForGUI}>
                                <Row>
                                    <div style={{ marginRight: '4rem' ,marginLeft: '4rem', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <div class="row"  style={{marginTop:'1rem'}}>
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="StartDate1" value={DATE3} onChange={(e) => this.selectedStartDateGUI({ StartDate1: e.target.value })} ></Input>
                                            </div> 

                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="EndDate1" value={DATE4} onChange={(e) => this.selectedEndDateGUI({ EndDate1: e.target.value })} />
                                            </div>         
                                            
                                        </div>
                                        <Table>
                                            <tbody>
                                                <th width="130px" height="50px" ><b>Date </b></th>
                                                <th width="130px" height="50px" ><b>Total TCs</b></th>
                                                <th width="130px" height="50px" ><b>Increase IN Total TCs</b></th>
                                                <th width="130px" height="70px" ><b>Total Automated TCs</b></th>
                                                <th width="130px" height="70px" ><b>Increase In Automated TCs</b></th>
                                                <th width="130px" height="70px" ><b>Automated Percentage</b></th>
                                                    {
                                                        this.state.automationCountDataWithRangeForGUI ? this.renderTableDataForAutomationCountWithRangeForGUI() : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
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
                                            <div onClick={() => this.setState({ jiraDataView: !this.state.jiraDataView },()=>{this.getdata();})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.jiraDataView &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.jiraDataView &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>Bug Analysis</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Collapse isOpen={this.state.jiraDataView}>
                                <Row>
                                    <div style={{ marginRight: '8rem' ,marginLeft: '4rem', width:'650px', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table>
                                            <tbody>
                                                <th width="140px" height="50px" ><b>Release</b></th>
                                                <th width="140px" height="50px" ><b>Total Filed</b></th>
                                                <th width="140px" height="50px" ><b>Resolved</b></th>
                                                <th width="140px" height="50px" ><b>Customer Bugs</b></th>
                                                <th width="140px" height="50px" ><b>Still Open</b></th>
                                                
                                                    {
                                                        this.state.jiraBugData ? this.renderTableDataForJiraBugData() :null 
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
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
                                            <div onClick={() => this.setState({ testCountWithRangeView: !this.state.testCountWithRangeView },()=>{this.getTestCountDataWithRange(this.state.startDate,this.state.endDate,'CLI');})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.testCountWithRangeView &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.testCountWithRangeView &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>CLI Test case report</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Collapse isOpen={this.state.testCountWithRangeView}>
                                <Row>
                                    <div style={{ marginRight: '8rem' ,marginLeft: '4rem', width:'650px', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <div class="row"  style={{marginTop:'1rem'}}>
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="tStartDate" value={DATE5} onChange={(e) => this.testSelectedStartDateCLI({ tStartDate: e.target.value })} ></Input>
                                            </div> 

                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="tEndDate" value={DATE6} onChange={(e) => this.testSelectedEndDateCLI({ tEndDate: e.target.value })} />
                                            </div>         
                                            
                                        </div>
                                        <Table>
                                            <tbody>
                                                <th width="140px" height="50px" ><b>Release</b></th>
                                                {/* <th width="250px" height="50px" ><b>Date Range</b></th> */}
                                                <th width="140px" height="50px" ><b>Total Tested</b></th>
                                                    {
                                                        this.state.testCountDataWithRange ? this.renderTableDataForTestCountWithRange() : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
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
                                            <div onClick={() => this.setState({ testCountWithRangeViewForGUI: !this.state.testCountWithRangeViewForGUI },()=>{this.getTestCountDataWithRange(this.state.startDate,this.state.endDate,'GUI');})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.testCountWithRangeViewForGUI &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.testCountWithRangeViewForGUI &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>GUI Test Case Report</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Collapse isOpen={this.state.testCountWithRangeViewForGUI}>
                                <Row>
                                    <div style={{ marginRight: '4rem' ,marginLeft: '4rem', width:'650px', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <div class="row"  style={{marginTop:'1rem'}}>
                                            <div class="col-md-3">
                                                From Date<Input  type="date" id="tStartDate1" value={DATE7} onChange={(e) => this.testSelectedStartDateGUI({ tStartDate1: e.target.value })} ></Input>
                                            </div> 

                                            <div class="col-md-3">
                                                To Date<Input  type="date" id="tEndDate1" value={DATE8} onChange={(e) => this.testSelectedEndDateGUI({ tEndDate1: e.target.value })} />
                                            </div>         
                                        </div>
                                        <Table>
                                            <tbody>
                                                <th width="140px" height="50px" ><b>Release </b></th>
                                                {/* <th width="250px" height="50px" ><b>Date Range</b></th> */}
                                                <th width="140px" height="50px" ><b>Total Tested</b></th>
                                                    {
                                                        this.state.testCountDataWithRangeForGUI ? this.renderTableDataForTestCountWithRangeForGUI() : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                </Row>
                            </Collapse>
                        </Col>
                    </Row>
                </div>
                {
                    <CustomerBugs></CustomerBugs>
                }
                {
                    <IndividualReport></IndividualReport>
                }
                {
                    <CustomerReport></CustomerReport>
                }
                {
                    <ManagerReport></ManagerReport>
                }
                {
                    <ClosedBugReport></ClosedBugReport>
                }
                < Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    <ModalHeader eader toggle={() => this.toggle()}>Confirmation</ModalHeader>
                    <ModalBody>
                        Are you sure you want to make the changes?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.save()}>Ok</Button>{' '}
                        <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div >
            }
            {
                this.props.currentUser && !this.props.currentUser.isAdmin &&
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
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    // selectedTCStatus: state.testcase.status[state.release.current.id],
    // doughnuts: getTCStatusForUIDomains(state, state.release.current.id)
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(QaAnalysis);
