import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Input, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { getEachTCStatusScenario } from '../../../reducers/testcase.reducer';
import { getTCStatusForUIDomains, getTCStatusForUISubDomains, alldomains, getTCStatusForSunburst } from '../../../reducers/release.reducer';
import { Bar, Doughnut,} from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import './ReleaseTestCase.scss'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import Sunburst from '../components/Sunburst';
import CustomerBugs from '../../../components/CustomerBugs/CustomerBugs';
import { element, object } from 'prop-types';
const Status = {
    Fail: 'Fail',
    Pass: 'Pass',
    Warning: 'Warning'
}
const DeviceType = {
    dev1: 'dev1',
    dev2: 'dev2',
    dev3: 'dev3',
    dev4: 'dev4'
}
const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}


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
let tempDateStartAPI = ''
let tempDateEndAPI = ''
let tempDateStartAPIGUI = ''
let tempDateEndAPIGUI = ''
let ttempDateStart = ''
let ttempDateEnd = ''
let ttempDateStartGUI = ''
let ttempDateEndGUI = ''
let globalDate = 0
if(month >= '10'){

    tempDateStart = year +"-"+ month +"-"+ "01"
    tempDateEnd = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartGUI = year +"-"+ month +"-"+ "01"
    tempDateEndGUI = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartAPI = year +"-"+ month +"-"+ "01"
    tempDateEndAPI = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartAPIGUI = year +"-"+ month +"-"+ "01"
    tempDateEndAPIGUI = year +"-"+ month +"-"+ dayInCurrentMonth

    ttempDateStart = year +"-"+ month +"-"+ "01"
    ttempDateEnd = year +"-"+ month +"-"+ dayInCurrentMonth

    ttempDateStartGUI = year +"-"+ month +"-"+ "01"
    ttempDateEndGUI = year +"-"+ month +"-"+ dayInCurrentMonth
}
else{

    tempDateStart = year + "-" + "0" + month + "-" + "01"
    tempDateEnd =year + "-" + "0" + month + "-" + dayInCurrentMonth

    tempDateStartGUI = year +"-0"+ month +"-"+ "01"
    tempDateEndGUI = year +"-0"+ month +"-"+ dayInCurrentMonth

    tempDateStartAPI = year +"-"+ month +"-"+ "01"
    tempDateEndAPI = year +"-"+ month +"-"+ dayInCurrentMonth
   
    tempDateStartAPIGUI = year +"-"+ month +"-"+ "01"
    tempDateEndAPIGUI = year +"-"+ month +"-"+ dayInCurrentMonth

    ttempDateStart = year +"-"+ "0" + month +"-"+ "01"
    ttempDateEnd = year +"-"+ "0" + month +"-"+ dayInCurrentMonth

    ttempDateStartGUI = year +"-"+ "0" + month +"-"+ "01"
    ttempDateEndGUI = year +"-"+ "0" +  month +"-"+ dayInCurrentMonth
}


const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class ReleaseTestCase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cntr:0,
            component: 'all',
            result: 'all',
            svgKey: 0,
            selected: 'Domains',
            metricsOpen: false,
            addTC: {},
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            doughnuts: getTCStatusForUIDomains(this.props.selectedRelease),
            qaStrategy: {},
            domainSelected: false,
            releaseNo:false,
            domains: getTCStatusForSunburst(this.props.selectedRelease),
            tcSummaryTitleStyle: window.screen.availWidth > 1400 ?
                { position: 'absolute', top: '41%', left: '47%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' } :
                { position: 'absolute', top: '42%', left: '46%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' },

            allTestCaseStatus:[],
            allTestCaseStatusCLI:[],
            allTestCaseStatusGUI:[],
            allDomains:[],
            allSubDomainwiseStatus:[],
            subDomainModal:false,
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',
            platformWiseDomain : [],
            platformWiseDomainGUI : [],
           
            automationCountView : false,
            automationCountViewGUI : false,
           
            automationCountWithRangeView : false,
            automationCountData : [],
            automationCountDataGUI : [],

            automationCountDataGUI : [],
            automationCountDataWithRange : [],
            automationCountDataWithRangeForGUI : [],
            testCountDataWithRange : [],
            testCountDataWithRangeForGUI : [],
            automationCountDataByDomain : [],
            jiraBugData: [],
            cusbugdata: [],


            startDate : tempDateStartAPI,
            endDate : tempDateEndAPI,
           
            startDateToShow : tempDateStart,
            endDateToShow : tempDateEnd,

            startDateGUI : tempDateStartAPIGUI,
            endDateGUI : tempDateEndAPIGUI,
            
            startDateToShowGUI : tempDateStartGUI,
            endDateToShowGUI : tempDateEndGUI,
            
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
    confirmToggle() {
        let data = { ...this.state.addTC }
        if (!data || (data && !data.TcID) || !this.state.domainSelected) {
            alert('Please Add Tc ID or Domain');
            return;
        }
        this.toggle();
    }
    
    sunburstClick(node) {
       
        if (alldomains.includes(node.data.name)) {
            this.setState({ doughnuts: getTCStatusForUISubDomains(this.props.selectedRelease, node.data.name), domainSelected: false })
            return true;
        }
        if (node.data.name === 'domains') {
            this.setState({ doughnuts: getTCStatusForUIDomains(this.props.selectedRelease), domainSelected: false })
            return true;
        }
        if (!alldomains.includes(node.data.name) && node.data.name !== 'domains') {
            this.setState({ domainSelected: node.data.name, doughnuts: null });
            axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcinfo/domain/' + node.data.name)
                .then(all => {
                    if (all && all.data.length) {
                        axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + node.data.name)
                            .then(res => {
                                this.props.saveTestCase({ id: this.props.selectedRelease.ReleaseNumber, data: res.data })

                                this.setState({ domainSelected: node.data.name, doughnuts: getEachTCStatusScenario({ data: res.data, domain: node.data.name, all: all.data }) })
                            }, error => {

                            });
                    }
                })
                return false;
        }
    }
    sectionSelect(e) {
        this.setState({ selected: e.rule.name, svgKey: this.state.svgKey + 1 })
    }
    newLegendClickHandler = e => {
        console.log('e ',e);
    }

    getReleaseData = () =>{
        this.setState({allTestCaseStatus:[]})
        let url  = `/api/release/`  + this.props.selectedRelease.ReleaseNumber
        axios.get(url).then(res=>{
            let domainData =[]
            for (const [key, value] of Object.entries(res.data.TcAggregate.domain)) {
                let arr = {}
                arr['Domain'] = key
                for(const [key1, value1] of Object.entries(value)){
                    if(key1 == 'Tested'){
                        for(const [key2, value2] of Object.entries(value1)){
                            for(const [key3, value3] of Object.entries(value2)){
                                let str = key2 + key3
                                arr[str] = value3;
                            }
                        }
                    }
                    else{
                        arr[key1] = value1;
                    }
                }
                domainData.push(arr);
            }
            
            this.setState({allTestCaseStatus:domainData})
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }
    
    getReleaseDataCLI = () =>{
        let domainList = []
        this.setState({allTestCaseStatusCLI:[]})
        let url  = `/api/release/`  + this.props.selectedRelease.ReleaseNumber
        axios.get(url).then(res=>{
            let domainData =[]
            if(res.data.TcAggregate['domain-cli']){
                for (const [key, value] of Object.entries(res.data.TcAggregate['domain-cli'])) {
                    let arr = {}
                    arr['Domain'] = key
                    for(const [key1, value1] of Object.entries(value)){
                        if(key1 == 'Tested'){
                            for(const [key2, value2] of Object.entries(value1)){
                                for(const [key3, value3] of Object.entries(value2)){
                                    let str = key2 + key3
                                    arr[str] = value3;
                                }
                            }
                        }
                        else{
                            arr[key1] = value1;
                        }
                    }
                    domainData.push(arr);
                }
            }
            
            this.setState({
                allTestCaseStatusCLI:domainData,
            })
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }
    
    getReleaseDataGUI = () =>{
        this.setState({allTestCaseStatusGUI:[]})
        let url  = `/api/release/`  + this.props.selectedRelease.ReleaseNumber
        axios.get(url).then(res=>{
            let domainData =[]
            if(res.data.TcAggregate['domain-gui']){
                for (const [key, value] of Object.entries(res.data.TcAggregate['domain-gui'])) {
                    let arr = {}
                    arr['Domain'] = key
                    for(const [key1, value1] of Object.entries(value)){
                        if(key1 == 'Tested'){
                            for(const [key2, value2] of Object.entries(value1)){
                                for(const [key3, value3] of Object.entries(value2)){
                                    let str = key2 + key3
                                    arr[str] = value3;
                                }
                            }
                        }
                        else{
                            arr[key1] = value1;
                        }
                    }
                    domainData.push(arr);
                }
            }
            this.setState({allTestCaseStatusGUI:domainData})
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }

    subDomainByDomain(domainName){
        let subDomainData = []

        this.state.allTestCaseStatusCLI.map((item)=>{
            if(item['Domain'] == domainName){
                for (const [key, value] of Object.entries(item['subDomain-cli'])) {
                    let arr = {}
                    arr['subDomain'] = key
                    for(const [key1, value1] of Object.entries(value)){
                        if(key1 == 'Tested'){
                            for(const [key2, value2] of Object.entries(value1)){
                                for(const [key3, value3] of Object.entries(value2)){
                                    let str = key2 + key3
                                    arr[str] = value3;
                                }
                            }
                        }
                        else{
                            arr[key1] = value1;
                        }
                    }
                    subDomainData.push(arr)
                }
            }

            this.setState({
                allSubDomainwiseStatus  : subDomainData
            })

        })

        
    }



    renderTableDataSubDomain  = () => {
        return this.state.allSubDomainwiseStatus === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.allSubDomainwiseStatus.map((e, i) => {
            return (
                        <tr key={i}> 
                            {/* <td onClick={() => this.selectedDomainName(e.Domain)}>
                                <a href='#' style={{color: 'green'}}>{e.Domain}</a>
                               
                            </td> */}
                            <td>
                                {e.subDomain}
                            </td>
                            <td>{e.autoPass + e.manualPass}</td>
                            <td>{e.autoFail + e.manualFail}</td>
                            <td>{e.autoBlocked + e.manualBlocked}</td>
                            <td>{e.NotTested}</td>
                            <td>{e.autoPass + e.manualPass + e.autoFail + e.manualFail + e.autoBlocked + e.manualBlocked + e.NotTested}</td>
                        </tr>    
                );
            })
        )
    }



    renderTableDataAll  = () => {
        return this.state.allTestCaseStatus === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.allTestCaseStatus.map((e, i) => {
            return (
                        <tr key={i}> 
                            {/* <td onClick={() => this.selectedDomainName(e.Domain)}>
                                <a href='#' style={{color: 'green'}}>{e.Domain}</a>
                               
                            </td> */}
                            <td>
                                {e.Domain}
                            </td>
                            <td>{e.autoPass + e.manualPass}</td>
                            <td>{e.autoFail + e.manualFail}</td>
                            <td>{e.autoBlocked + e.manualBlocked}</td>
                            <td>{e.NotTested}</td>
                            <td>{e.autoPass + e.manualPass + e.autoFail + e.manualFail + e.autoBlocked + e.manualBlocked + e.NotTested}</td>
                        </tr>    
                );
            })
        )
    }

    renderTableDataCLI  = () => {
        
        return this.state.allTestCaseStatusCLI === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.allTestCaseStatusCLI.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td onClick={() => this.subDomainByDomain(e.Domain)}>
                                <a href='#' style={{color: 'green'}}>{e.Domain}</a>
                            </td>
                            {/* <td>
                                {e.Domain}
                            </td> */}
                            <td>{e.autoPass + e.manualPass}</td>
                            <td>{e.autoFail + e.manualFail}</td>
                            <td>{e.autoBlocked + e.manualBlocked}</td>
                            <td>{e.NotTested}</td>
                            <td>{e.autoPass + e.manualPass + e.autoFail + e.manualFail + e.autoBlocked + e.manualBlocked + e.NotTested}</td>
                        </tr>    
                );
            })
        )
    }

    renderTableDataGUI  = () => {
        
        return this.state.allTestCaseStatusGUI === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.allTestCaseStatusGUI.map((e, i) => {
            return (
                        <tr key={i}> 
                            {/* <td onClick={() => this.selectedDomainName(e.Domain)}>
                                <a href='#' style={{color: 'green'}}>{e.Domain}</a>
                            </td> */}

                            <td>
                                {e.Domain}
                            </td>
                            <td>{e.autoPass + e.manualPass}</td>
                            <td>{e.autoFail + e.manualFail}</td>
                            <td>{e.autoBlocked + e.manualBlocked}</td>
                            <td>{e.NotTested}</td>
                            <td>{e.autoPass + e.manualPass + e.autoFail + e.manualFail + e.autoBlocked + e.manualBlocked + e.NotTested}</td>
                        </tr>    
                ); 
            })
        )
        
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
                // keys.forEach(key =>{
                //     let keysofkeys = Object.keys(data[key])
                //     keysofkeys.forEach(kok => {
                //         tempList.push({
                //             "Release":key,
                //             "DateRange":kok,
                //             "Total":data[key][kok]
                //         })
                //     })

                // })
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
                // keys.forEach(key =>{
                //     let keysofkeys = Object.keys(data[key])
                //     keysofkeys.forEach(kok => {
                //         tempListGUI.push({
                //             "Release":key,
                //             "DateRange":kok,
                //             "Total":data[key][kok]
                //         })
                //     })

                // })
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


    getAutomationCountDataGUI = () => {
        let tempList = []
        let dict1= {}
        let automation_perc = 0
        axios.get('/api/automationCountForGUI/' + this.props.selectedRelease.ReleaseNumber)
        .then(response=>{
            let data = []
            response.data.Data.forEach(element => {
                data.push(element.Platform)
            })
            data.sort()
            let dataObj = []
            data.forEach(element => {
                response.data.Data.forEach(item => {
                    if(element === item.Platform) dataObj.push(item)

                })
            })
            dataObj.map((item)=>{     
            //response.data.Data.map((item)=>{
                automation_perc = 0
                if(item.Total_TCs > 0){
                    automation_perc = (item.Automated_TCs / item.Total_TCs) * 100
                }
                tempList.push({
                    "Platform" : item.Platform,
                    "P0_Automated" : item.P0_Automated,
                    "P0_Total" : item.P0_Total,
                    "P1_Automated" : item.P1_Automated,
                    "P1_Total" : item.P1_Total,
                    "Total_TCs" : item.Total_TCs,
                    "Automated_TCs" : item.Automated_TCs,
                    "Automation_Perc" : automation_perc
                })
               
            })
              this.setState({
                automationCountDataGUI : tempList
              })
        })
        .catch(error=>{
            console.log("Error Getting Data",error)
        })
    }

    selectedPlatformNameGUI = (platformName) =>{
        let tempListByDomain = []
        let automation_perc = 0
        axios.get('/api/automationCountByDomainForGUI/' + platformName)
        .then(response=>{
            response.data.Data.map((item)=>{
                if(item.Platform == platformName){
                    if(item.Total_TCs > 0){
                        automation_perc = (item.Automated_TCs / item.Total_TCs) * 100
                    }
                    tempListByDomain.push({
                        "Domain" : item.Domain,
                        "P0_Automated" : item.P0_Automated,
                        "P0_Total" : item.P0_Total,
                        "P1_Automated" : item.P1_Automated,
                        "P1_Total" : item.P1_Total,
                        "Total_TCs" : item.Total_TCs,
                        "Automated_TCs" : item.Automated_TCs,
                        "Automation_Perc" : automation_perc
                    })
                }
            })
             
            this.setState({
                platformWiseDomainGUI : tempListByDomain
            })
        })
        .catch(error=>{
            console.log("Error Getting Data",error)
        })
    }

    getAutomationCountData = () => {
        let tempList = []
        let dict1= {}
        let automation_perc = 0
        axios.get('/api/automationCount/' + this.props.selectedRelease.ReleaseNumber)
        .then(response=>{
            let data = []
            response.data.Data.forEach(element => {
                data.push(element.Platform)
            })
            data.sort()
            let dataObj = []
            data.forEach(element => {
                response.data.Data.forEach(item => {
                    if(element === item.Platform) dataObj.push(item)

                })
            })
            console.log(dataObj)
            dataObj.map((item)=>{            
            //response.data.Data.map((item)=>{
                    automation_perc = 0
                    if(item.Total_TCs > 0){
                        automation_perc = (item.Automated_TCs / item.Total_TCs) * 100
                    }
                    tempList.push({
                        "Platform" : item.Platform,
                        "P0_Automated" : item.P0_Automated,
                        "P0_Total" : item.P0_Total,
                        "P1_Automated" : item.P1_Automated,
                        "P1_Total" : item.P1_Total,
                        "Total_TCs" : item.Total_TCs,
                        "Automated_TCs" : item.Automated_TCs,
                        "Automation_Perc" : automation_perc
                    })
               
            })
              this.setState({
                automationCountData : tempList
              })
        })
        .catch(error=>{
            console.log("Error Getting Data",error)
        })
    }

    selectedPlatformName = (platformName) =>{
        let tempListByDomain = []
        let automation_perc = 0
        axios.get('/api/automationCountByDomain/' + '/' + platformName)
        .then(response=>{
            response.data.Data.map((item)=>{
                if(item.Platform == platformName){
                    if(item.Total_TCs > 0){
                        automation_perc = (item.Automated_TCs / item.Total_TCs) * 100
                    }
                    tempListByDomain.push({
                        "Domain" : item.Domain,
                        "P0_Automated" : item.P0_Automated,
                        "P0_Total" : item.P0_Total,
                        "P1_Automated" : item.P1_Automated,
                        "P1_Total" : item.P1_Total,
                        "Total_TCs" : item.Total_TCs,
                        "Automated_TCs" : item.Automated_TCs,
                        "Automation_Perc" : automation_perc
                    })
                }
            })
             
            this.setState({
                platformWiseDomain : tempListByDomain
            })
        })
        .catch(error=>{
            console.log("Error Getting Data",error)
        })
    }

    renderTableDataForAutomationCountGUI  = (list1) => {
        return this.state.automationCountDataGUI === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.automationCountDataGUI.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td onClick={() => this.selectedPlatformNameGUI(e.Platform)}>
                            <a href='#' style={{color: 'green'}}>{e.Platform}</a>
                        </td>
                        {/* <td>
                            {e.Platform}
                        </td> */}
                        <td>{e.P0_Total}</td>
                        <td>{e.P0_Automated}</td>
                        <td>{e.P1_Total}</td>
                        <td>{e.P1_Automated}</td>
                        <td>{e.Total_TCs}</td>
                        <td>{e.Automated_TCs}</td>
                        <td>{e.Automation_Perc.toFixed(0)}%</td>
                    </tr>    
                ); 
            })
        )
    }
    renderTableDataForPlatforWiseDomainGUI = ()=>{

        return this.state.platformWiseDomainGUI === 0  ? (
            <div>Loading...</div>
        ) : (
            this.state.platformWiseDomainGUI.map((e, i) => {
                return (
                    <tr key={i}> 
                        <td>
                            {e.Domain}
                        </td>
                        <td>{e.P0_Total}</td>
                        <td>{e.P0_Automated}</td>
                        <td>{e.P1_Total}</td>
                        <td>{e.P1_Automated}</td>
                        <td>{e.Total_TCs}</td>
                        <td>{e.Automated_TCs}</td>
                        <td>{e.Automation_Perc.toFixed(0)}%</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForAutomationCount  = (list1) => {
        return this.state.automationCountData === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.automationCountData.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td onClick={() => this.selectedPlatformName(e.Platform)}>
                            <a href='#' style={{color: 'green'}}>{e.Platform}</a>
                        </td>
                        {/* <td>
                            {e.Platform}
                        </td> */}
                        <td>{e.P0_Total}</td>
                        <td>{e.P0_Automated}</td>
                        <td>{e.P1_Total}</td>
                        <td>{e.P1_Automated}</td>
                        <td>{e.Total_TCs}</td>
                        <td>{e.Automated_TCs}</td>
                        <td>{e.Automation_Perc.toFixed(0)}%</td>
                    </tr>    
                ); 
            })
        )
    }

    renderTableDataForPlatforWiseDomain = ()=>{
        return this.state.platformWiseDomain === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.platformWiseDomain.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td>
                            {e.Domain}
                        </td>
                        <td>{e.P0_Total}</td>
                        <td>{e.P0_Automated}</td>
                        <td>{e.P1_Total}</td>
                        <td>{e.P1_Automated}</td>
                        <td>{e.Total_TCs}</td>
                        <td>{e.Automated_TCs}</td>
                        <td>{e.Automation_Perc.toFixed(0)}%</td>
                    </tr>    
                ); 
            })
        )
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
            <div>{
            this.props.currentUser && !this.props.currentUser.isExe &&
            <div>
                <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'marginLeft': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ metricsOpen: !this.state.metricsOpen })}>
                                    <div class='row'>
                                        <div class='col-md-6 col-lg-6'>
                                            {
                                                !this.state.metricsOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.metricsOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }

                                            <div className='rp-icon-button'><i className="fa fa-area-chart"></i></div>
                                            <span className='rp-app-table-title'>Test Case Status (CLI + GUI)</span>
                                
                                        </div>
                                    </div>
                        </div>
                        <Collapse isOpen={this.state.metricsOpen}>
                            <React.Fragment>
                                <Row>
                                    <Col xs="11" sm="11" md="4">
                                        <div style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                                            <Sunburst
                                                tooltip={false}
                                                onClick={(node) => this.sunburstClick(node)}
                                                data={this.state.domains}
                                                width={this.state.width}
                                                height={this.state.width}
                                                count_member="size"
                                                labelFunc={(node) => node.data.name}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs="11" sm="11" md="8">
                                    {
                                            this.state.domainSelected && 
                                            <div style={{textAlign:'center'}}>
                                                 <strong class="h4">{this.state.domainSelected}</strong>
                                           
                                        </div>
                                        }
                                        <Row style={{ marginLeft: '2.5rem' }}>
                                            {
                                                this.state.domainSelected &&
                                                !this.state.doughnuts &&
                                                loading()
                                            }
                                            {
                                                this.state.domainSelected &&
                                                this.state.doughnuts &&
                                                this.state.doughnuts.map((item, index) => {
                                                    if (index < 2) {
                                                        return (
                                                            <Col xs="12" sm="12" md="12" lg="12">
                                                                <div className="chart-wrapper" style={{ minHeight: '400px' }}>
                                                                    <Bar data={item.data} options={options} />
                                                                </div>
                                                                <div className='rp-tc-dougnut-text'>
                                                                    {item && item.title}
                                                                </div>
                                                            </Col>
                                                        )
                                                    }
                                                })
                                            }
                                            {
                                                !this.state.domainSelected &&
                                                this.state.doughnuts &&
                                                this.state.doughnuts.map((item, index) => {
                                                    if (index < 4) {
                                                        return (
                                                            <Col xs="12" sm="12" md="6" lg="6">
                                                                <div className="chart-wrapper">
                                                                    <div class='row' style={{ padding: '10px', margin: 'auto' }}>
                                                                        <Doughnut data={item.data} style={{ textAlign: 'center' }} 
                                                                            options = {{
                                                                                legend: {
                                                                                    onClick: (e) => this.newLegendClickHandler(e)
                                                                                }
                                                                            }}
                                                                        />

                                                                    </div>
                                                                </div>
                                                                <div className='rp-tc-dougnut-text'>
                                                                    <span>{item && `${item.title}   `}</span><span style={{fontSize:'14px'}}>({item && (item.data.datasets[0].data[0] + item.data.datasets[0].data[1] + item.data.datasets[0].data[2] + item.data.datasets[0].data[3])})</span>
                                                                </div>
                                                                {
                                                                    this.state.component === item.title &&
                                                                    <div>
                                                                        <div style={{ width: '80%', height: '150px', marginBottom: '3rem' }}>
                                                                        <div style={{ width: "100%", height: "100%" }}>
                                                                        <div
                                                                id="e2eGrid"
                                                                style={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                }}
                                                                className="ag-theme-balham">
                                                                <AgGridReact
                                                                    modules={this.state.modules}
                                                                    columnDefs={this.state.e2eColumnDefs}
                                                                    defaultColDef={this.state.defaultColDef}
                                                                    rowData={this.props.tcDetails ? this.props.tcDetails.StatusList : []}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                                    </div>
                                                                }
                                                                <div>

                                                                </div>
                                                            </Col>
                                                        )
                                                    }

                                                })
                                            }
                                        </Row>
                                    </Col>
                                </Row>
                                {
                                    this.state.domainSelected &&
                                    !this.state.doughnuts &&
                                    loading()
                                }
                                {
                                    this.state.domainSelected &&
                                    <Row>
                                        {
                                            this.state.doughnuts &&
                                            this.state.doughnuts.map((item, index) => {
                                                if (index >= 2) {
                                                    return (
                                                        <Col xs="12" sm="12" md="6" lg="6">
                                                            <div className="chart-wrapper" style={{ minHeight: '400px' }}>
                                                                {/* <Doughnut data={item.data} /> */}
                                                                <Bar data={item.data} options={options} />
                                                            </div>
                                                            <div className='rp-tc-dougnut-text'>
                                                                {item && item.title}
                                                            </div>
                                                        </Col>
                                                    )
                                                }

                                            })
                                        }
                                    </Row>
                                }
                                {
                                    !this.state.domainSelected &&
                                    <Row>
                                        {
                                            this.state.doughnuts &&
                                            this.state.doughnuts.length >= 4 &&
                                            this.state.doughnuts.map((item, index) => {
                                                if (index >= 4) {
                                                    return (<Col xs="12" sm="12" md="4" lg="4">
                                                        <div className="chart-wrapper">
                                                            <Doughnut data={item.data} />
                                                        </div>
                                                        <div className='rp-tc-dougnut-text'>
                                                                    <span>{item && `${item.title}   `}</span><span style={{fontSize:'14px'}}>({item && (item.data.datasets[0].data[0] + item.data.datasets[0].data[1] + item.data.datasets[0].data[2] + item.data.datasets[0].data[3])})</span>
                                                        </div>
                                                    </Col>)
                                                }
                                            })
                                        }
                                    </Row>
                                }
                            </React.Fragment>
                        </Collapse>
                    </Col>
                </Row>
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                                <div class="row">
                                    <div class='col-lg-12'>
                                        <div style={{ display: 'flex' }}>
                                            <div onClick={() => this.setState({ showTable: !this.state.showTable },()=>{this.getReleaseData();})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.showTable &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.showTable &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>Test Case Status (CLI + GUI)</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Collapse isOpen={this.state.showTable}>
                                <Row style={
                                    {
                                        marginRight: '0',
                                        marginLeft: '0'
                                    }
                                    }>
                                    <Col xs="12" sm="12" md="12" lg="12">
                                        <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '80rem' }}>
                                            <Table scroll responsive style={{ overflow: 'scroll'}} >
                                                <thead>
                                                    <tr>
                                                    <th>Domain</th>
                                                    <th>Pass</th>
                                                    <th>Fail</th>
                                                    <th>Block</th>
                                                    <th>Not Tested</th>
                                                    <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.allTestCaseStatus.length > 1 ? this.renderTableDataAll() : <span class="ag-overlay-loading-center">Loading ...</span>
                                                    }
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Col>
                                </Row>
                            </Collapse>
                        </Col>
                    </Row>
                </div>
                <div>
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                            <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                                <div class="row">
                                    <div class='col-lg-12'>
                                        <div style={{ display: 'flex' }}>
                                            <div onClick={() => this.setState({ showTableCLI: !this.state.showTableCLI },()=>{this.getReleaseDataCLI();})} style={{ display: 'inlineBlock' }}>
                                            
                                            {
                                                !this.state.showTableCLI &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.showTableCLI &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'></div>
                                            <span className='rp-app-table-title'>Test Case Status (CLI)</span>
                                        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <Collapse isOpen={this.state.showTableCLI}>
                            <Row style={
                                {
                                    marginRight: '0',
                                    marginLeft: '0'
                                }
                                }>
                                <Col xs="12" sm="12" md="12" lg="12">
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll'}} >
                                            <thead>
                                                <tr>
                                                <th>Domain</th>
                                                <th>Pass</th>
                                                <th>Fail</th>
                                                <th>Block</th>
                                                <th>Not Tested</th>
                                                <th>Total</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.allTestCaseStatusCLI.length > 1 ? this.renderTableDataCLI() : <span class="ag-overlay-loading-center">Loading ...</span>
                                                }
                                            </tbody>
                                        </Table>
                                        {
                                            this.state.allSubDomainwiseStatus.length && 
                                            <Table scroll responsive style={{ overflow: 'scroll'}} >
                                                {/* <div> SubDomain List for selected Domain</div> */}
                                                <thead>
                                                    <tr>
                                                    <th>SubDomain</th>
                                                    <th>Pass</th>
                                                    <th>Fail</th>
                                                    <th>Block</th>
                                                    <th>Not Tested</th>
                                                    <th>Total</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.allSubDomainwiseStatus.length > 1 ? this.renderTableDataSubDomain() : <span class="ag-overlay-loading-center">Loading ...</span>
                                                    }
                                                </tbody>
                                            </Table>
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </Collapse>
                    </Col>
                </Row>
            </div>
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ showTableGUI: !this.state.showTableGUI },()=>{this.getReleaseDataGUI();})} style={{ display: 'inlineBlock' }}>
                                        {
                                            !this.state.showTableGUI &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.showTableGUI &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Test Case Status (GUI)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <Collapse isOpen={this.state.showTableGUI}>
                        <Row style={
                            {
                                marginRight: '0',
                                marginLeft: '0'
                            }
                            }>
                            <Col xs="12" sm="12" md="12" lg="12">
                                <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>
                                    <Table scroll responsive style={{ overflow: 'scroll'}} >
                                        <thead>
                                            <tr>
                                            <th>Domain</th>
                                            <th>Pass</th>
                                            <th>Fail</th>
                                            <th>Block</th>
                                            <th>Not Tested</th>
                                            <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.allTestCaseStatusGUI.length > 1 ? this.renderTableDataGUI() : <span class="ag-overlay-loading-center">Loading ...</span>
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
                                        <div onClick={() => this.setState({ automationCountView: !this.state.automationCountView },()=>{this.getAutomationCountData();})} style={{ display: 'inlineBlock' }}>
                                        
                                        {
                                            !this.state.automationCountView &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.automationCountView &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>CLI Automation Percentage Platformwise</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.automationCountView}>
                            <Row>
                                <div style={{ marginRight: '4rem' ,marginLeft: '4rem', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                    {/* <Table scroll responsive style={{ overflow: 'scroll' }}> */}
                                    <Table>
                                        <tbody>
                                            {/* <th width="100px" height="50px" ><b>Task List Name</b></th> */}
                                            <th width="100px" height="50px" ><b>Platform</b></th>
                                            <th width="100px" height="50px" ><b>P0 TCs</b></th>
                                            <th width="100px" height="50px" ><b>P0 Automated</b></th>
                                            <th width="100px" height="50px" ><b>P1 TCs</b></th>
                                            <th width="100px" height="50px" ><b>P1 Automated</b></th>
                                            <th width="100px" height="50px" ><b>Total TCs</b></th>
                                            <th width="100px" height="70px" ><b>Automated TCs</b></th>
                                            <th width="100px" height="70px" ><b>Automated Percentage</b></th>
                                                {
                                                    this.state.automationCountData ? this.renderTableDataForAutomationCount() : null
                                                }
                                        </tbody>
                                    </Table>
                                    {
                                            this.state.platformWiseDomain.length >= 1 ?
                                            <Table scroll responsive style={{ overflow: 'scroll'}} >
                                                <thead>
                                                    <tr>
                                                    <th width="100px" height="50px" ><b>Domain</b></th>
                                                    <th width="100px" height="50px" ><b>P0 TCs</b></th>
                                                    <th width="100px" height="50px" ><b>P0 Automated</b></th>
                                                    <th width="100px" height="50px" ><b>P1 TCs</b></th>
                                                    <th width="100px" height="50px" ><b>P1 Automated</b></th>
                                                    <th width="100px" height="50px" ><b>Total TCs</b></th>
                                                    <th width="100px" height="70px" ><b>Automated TCs</b></th>
                                                    <th width="100px" height="70px" ><b>Automated Percentage</b></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.platformWiseDomain.length > 1 ? this.renderTableDataForPlatforWiseDomain() : <span class="ag-overlay-loading-center">Loading ...</span>
                                                    }
                                                </tbody>
                                            </Table> : null
                                        }
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
                                        <div onClick={() => this.setState({ automationCountViewGUI: !this.state.automationCountViewGUI },()=>{this.getAutomationCountDataGUI();})} style={{ display: 'inlineBlock' }}>
                                        {
                                            !this.state.automationCountViewGUI &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.automationCountViewGUI &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>GUI Automation Percentage Platformwise</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.automationCountViewGUI}>
                            <Row>
                                <div style={{ marginRight: '4rem' ,marginLeft: '4rem', marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                    {/* <Table scroll responsive style={{ overflow: 'scroll' }}> */}
                                    <Table>
                                        <tbody>
                                            {/* <th width="100px" height="50px" ><b>Task List Name</b></th> */}
                                            <th width="100px" height="50px" ><b>Platform</b></th>
                                            <th width="100px" height="50px" ><b>P0 TCs</b></th>
                                            <th width="100px" height="50px" ><b>P0 Automated</b></th>
                                            <th width="100px" height="50px" ><b>P1 TCs</b></th>
                                            <th width="100px" height="50px" ><b>P1 Automated</b></th>
                                            <th width="100px" height="50px" ><b>Total TCs</b></th>
                                            <th width="100px" height="70px" ><b>Automated TCs</b></th>
                                            <th width="100px" height="70px" ><b>Automated Percentage</b></th>
                                                {
                                                    this.state.automationCountDataGUI ? this.renderTableDataForAutomationCountGUI() : null
                                                }
                                        </tbody>
                                    </Table>
                                    {
                                            this.state.platformWiseDomainGUI.length >= 1 ? 
                                            <Table scroll responsive style={{ overflow: 'scroll'}} >
                                                <thead>
                                                    <tr>
                                                    <th width="100px" height="50px" ><b>Domain</b></th>
                                                    <th width="100px" height="50px" ><b>P0 TCs</b></th>
                                                    <th width="100px" height="50px" ><b>P0 Automated</b></th>
                                                    <th width="100px" height="50px" ><b>P1 TCs</b></th>
                                                    <th width="100px" height="50px" ><b>P1 Automated</b></th>
                                                    <th width="100px" height="50px" ><b>Total TCs</b></th>
                                                    <th width="100px" height="70px" ><b>Automated TCs</b></th>
                                                    <th width="100px" height="70px" ><b>Automated Percentage</b></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.platformWiseDomainGUI.length > 0 ? this.renderTableDataForPlatforWiseDomainGUI() : <span class="ag-overlay-loading-center">Loading ...</span>
                                                    }
                                                </tbody>
                                            </Table> : null
                                        }
                                </div>
                            </Row>
                        </Collapse>
                    </Col>
                </Row>
            {/* <Row>
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
            </Row> */}
            {/* <Row>
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
            </Row> */}
            {/* <Row>
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
            </Row> */}
            {/* <Row>
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
            </Row> */}
            {/* <Row>
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
            </Row> */}
            </div>
            < Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                <ModalHeader toggle={() => this.toggle()}>Confirmation</ModalHeader>
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
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    // selectedTCStatus: state.testcase.status[state.release.current.id],
    // doughnuts: getTCStatusForUIDomains(state, state.release.current.id)
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(ReleaseTestCase);
