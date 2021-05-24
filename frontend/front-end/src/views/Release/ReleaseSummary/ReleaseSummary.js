import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Row,
    Modal, ModalHeader, ModalBody, ModalFooter, Table, Collapse, Progress, Badge,
    UncontrolledPopover, PopoverBody,
} from 'reactstrap';
import { connect } from 'react-redux';
import { updateSelectedPriority, saveReleaseBasicInfo, saveFeatures, saveBugs, saveSingleFeature, statusPage } from '../../../actions';
import { getCurrentRelease, getDomainStatus } from '../../../reducers/release.reducer';
import { getTCForStatus, getTCForStrategy } from '../../../reducers/release.reducer';
import BasicReleaseInfo from '../components/BasicReleaseInfo';
import ChatBox from '../../../components/ChatBox/ChatBox';
import AppTable from '../../../components/AppTable/AppTable';
import './ReleaseSummary.scss';
import { Bar, Doughnut, Line, Pie, Polar, Radar, HorizontalBar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { TABLE_OPTIONS } from '../../../constants';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import SunburstComponent from '../components/SunburstComponent';
import { cardChartOpts2, cardChartData2, chartData, chartOptions, stackedBarChart, stackedBarChartOptions } from '../constants';
import Multiselect from 'react-bootstrap-multiselect';
const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
//  TODO: dates after updating only while displaying are wrong in release summary
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
const mainChartOpts = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
            labelColor: function (tooltipItem, chart) {
                return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
            }
        }
    },
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    drawOnChartArea: false,
                },
            }],
        yAxes: [
            {
                ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                },
            }],
    },
    elements: {
        point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
        },
    },
};

var elements = 12;
var data1 = [];
var data2 = [];
var data3 = [];
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
for (var i = 0; i <= elements; i++) {
    data1.push(random(50, 200));
    data2.push(random(80, 100));
    data3.push(65);
}

// var Client = require('node-rest-client').Client;
// client = new Client();
// const express = require('express');
// const jsonfile = require('jsonfile')
// var jiraHeaders = null;
// var searchArgs = null;
// var searchArgs = {
//     headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Basic YWNoYXZhbkBkaWFtYW50aS5jb206Y2VtRDF5UW1ySTIweFNCSWQwUU9DODgw"
//     }
// }

// var JIRA_URL = 'https://diamanti.atlassian.net'
// const app = express();



var releaseData = '';
class ReleaseSummary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tableApi : false,
            release:{},
            tcStrategy:{},
            tcSummary:[],
            releaseData:'',
            selectedPriority: ['P0', 'P1'],
            selectedPriorityGUI: ['P0', 'P1'],
            cntr: 0,
            isEditing: false,
            isReleaseStatusEditing: false,
            modal: false,
            toggleModal: false,
            jenkinsBuildLink: '',
            totalBugsList:[],
            editReleaseStatusOptions: [TABLE_OPTIONS.EDIT],
            basic: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false },
            qaStrategy: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false, collapseOpen: { SetupsUsed: false, Engineers: false } },
            qaStatus: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false },
            screen: {
                tcStrategyTitleStyle: window.screen.availWidth > 1400 ?
                    { position: 'absolute', top: '30%', left: '47%', textAlign: 'center', fontSize: '20px', fontWeight: 600, color: '#00742b' } :
                    { position: 'absolute', top: '30%', left: '46%', textAlign: 'center', fontSize: '16px', fontWeight: 600, color: '#00742b' },
                tcSummaryTitleStyle: window.screen.availWidth > 1400 ?
                    { position: 'absolute', top: '21%', left: '34%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' } :
                    { position: 'absolute', top: '38%', left: '29%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' },
            },
            showFeatures: false,
            cardType: 'BOS',
            data: {
                data: [
                    {
                        'name': Status.Fail,
                        'count': 20,
                        'flexName': 'testA',
                        'device': DeviceType.dev1
                    },
                    {
                        'name': Status.Warning,
                        'count': 0,
                        'flexName': 'testA',
                        'device': DeviceType.dev1
                    },
                    {
                        'name': Status.Pass,
                        'count': 21,
                        'flexName': 'testA',
                        'device': DeviceType.dev1
                    },
                    {
                        'name': Status.Fail,
                        'count': 8,
                        'flexName': 'testA',
                        'device': DeviceType.dev2
                    },
                    {
                        'name': Status.Warning,
                        'count': 0,
                        'flexName': 'testA',
                        'device': DeviceType.dev2
                    },
                    {
                        'name': Status.Pass,
                        'count': 6,
                        'flexName': 'testA',
                        'device': DeviceType.dev2
                    },
                    {
                        'name': Status.Fail,
                        'count': 21,
                        'flexName': 'testA',
                        'device': DeviceType.dev3
                    },
                    {
                        'name': Status.Warning,
                        'count': 16,
                        'flexName': 'testA',
                        'device': DeviceType.dev3
                    },
                    {
                        'name': Status.Pass,
                        'count': 40,
                        'flexName': 'testA',
                        'device': DeviceType.dev3
                    },
                    {
                        'name': Status.Fail,
                        'count': 0,
                        'flexName': 'testA',
                        'device': DeviceType.dev4
                    },
                    {
                        'name': Status.Warning,
                        'count': 0,
                        'flexName': 'testA',
                        'device': DeviceType.dev4
                    },
                    {
                        'name': Status.Pass,
                        'count': 0,
                        'flexName': 'testA',
                        'device': DeviceType.dev4
                    },
                ],
                componentType: 'dev1'
            }
        }
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.initialize(newProps.selectedRelease.ReleaseNumber,newProps.selectedRelease);
            // this.initialize(newProps.selectedRelease);
            this.setState({
                releaseData : newProps.selectedRelease
            })
            
        }
    }
    componentDidMount() {
        axios.get(`/api/release_all_info/releaseName/${this.props.selectedRelease.ReleaseNumber}`)
                .then(res => {
                    this.setState({release:res.data, tableApi: true},() => {this.getTCForStatuss()} )
                }, err => {
                    console.log('err ', err);
                });
        //this.initialize(this.props.selectedRelease.ReleaseNumber);
        // this.initialize(this.props.selectedRelease);
    }
    componentDidUpdate(prevProps, prevState) {
        //let release = this.props.selectedRelease.ReleaseNumber ? this.props.selectedRelease.ReleaseNumber : null
        if (prevProps.selectedRelease.ReleaseNumber !== this.props.selectedRelease.ReleaseNumber) {
            this.setState({tableApi: false})
            axios.get(`/api/release_all_info/releaseName/${this.props.selectedRelease.ReleaseNumber}`)
                .then(res => {
                    this.setState({release:res.data, tcSummary: {}, tableApi: true},() => {this.getTCForStatuss()})                   
                }, err => {
                    console.log('err ', err);
                });
        }
        //this.initialize(this.props.selectedRelease.ReleaseNumber);
        //this.initialize(this.props.selectedRelease);
    }

    initialize(release,newReleaseData) {
       
        let fixVersion = newReleaseData.fixVersion;
        this.reset();
        // let temp = release.ReleaseNumber;;
        let temp = release;
        let totalCount = 0
        let maxResults = 0
        let totalBugs = []

       
        if(temp === 'Spektra 2.4') {
            temp='2.4.0'
        }
        if(temp === 'DMC-3.0') {
            temp="\"Spektra 3.0\""
        }
        if(temp === 'DSS-3.1') {
            temp = "3.1.0"
        }
        if(temp === 'Overlay-3.1' || temp === 'OCP-4.5') {
            temp = "\"Spek 3.1.0\""
        }

        fixVersion = "\"" + fixVersion + "\""

        // if(release === 'DSS-3.1'){
        //     axios.get('/rest/DSSepic/' + temp)
        //     .then(res => {
        //         console.log("DSS epic",res.data)
        //         this.props.saveFeatures({ data: res.data, id: release })
        //         this.setState({ showFeatures: true })
        //     }, err => {
        //         console.log('err ', err);
        //     });
        // }
        // console.log("Currrent Selected release number",this.props.selectedRelease.ReleaseNumber,this.props.selectedRelease.fixVersion)
        if(release === 'DMC-3.0'){
            // axios.get('/rest/epic/' + temp)
            axios.get('/rest/epic/' + fixVersion)
            .then(res => {
                this.props.saveFeatures({ data: res.data, id: release })
                this.setState({ showFeatures: true })
            }, err => {
                console.log('err ', err);
            });
        }
        else{

            // axios.get('/rest/features/' + temp)
            axios.get('/rest/features/' + fixVersion)
            .then(res => {
                this.props.saveFeatures({ data: res.data, id: release })
                this.setState({ showFeatures: true })
            }, err => {
                console.log('err ', err);
            });

        }
        
        // Function to get list of all bugs
        // axios.get('/rest/bugs/total/' + temp)
        axios.get('/rest/bugs/total/' + fixVersion)
            .then(res => {
                totalBugs = res;
                maxResults = res.data.maxResults
                totalCount = parseInt(res.data.total/res.data.maxResults)
                let startAt = 0

                for(let i = 0; i < totalCount ; i++){
                    startAt = startAt + res.data.maxResults + 1
                    // let url = '/rest/bugs/totalCount/'  + temp + "/" + startAt
                    let url = '/rest/bugs/totalCount/'  + fixVersion + "/" + startAt
                    axios.get(url).then(res1=>{
                        for(let i = 0 ;i < res1['data']['issues'].length ;i++){
                            totalBugs['data']['issues'].push(res1['data']['issues'][i])
                        }
                    })
                }

                this.props.saveBugs({ data: { total: totalBugs.data.total, all: totalBugs.data }, id: release })
                this.setState({ showBugs: true, cntr: 2 })
            }, err => {
                console.log('err ', err);
            })
            // axios.get('/rest/bugs/open/' + temp)
            axios.get('/rest/bugs/open/' + fixVersion)
            .then(res => {
                this.props.saveBugs({ data: { open: res.data.total }, id: release })
                this.setState({ showBugs: true, cntr: 4 })

            }, err => {
                console.log('err ', err);
            })
        // axios.get('/rest/bugs/resolved/' + temp)
        axios.get('/rest/bugs/resolved/' + fixVersion)
            .then(res => {
                this.props.saveBugs({ data: { resolved: res.data.total }, id: release})
                this.setState({ showBugs: true, cntr: 6 })

            }, err => {
                console.log('err ', err);
            })

    }

   
    edit() {
        this.setState({ isEditing: true });
    }
    reset() {
        this.setState({
            isEditing: false,
            isReleaseStatusEditing: false,
            modal: false,
            toggleModal: false,
            jenkinsBuildLink: '',
            editReleaseStatusOptions: [TABLE_OPTIONS.EDIT],
            basic: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {} },
            qaStrategy: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false, collapseOpen: { SetupsUsed: false, Engineers: false } }

        });
    }
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
                let obj = null;
                if (checked && this.state.selectedPriority) {
                    obj = [...this.state.selectedPriority, value];
                }
                if (checked && !this.state.selectedPriority) {
                    obj = [value];
                }
                if (!checked && this.state.selectedPriority) {
                    let array = this.state.selectedPriority;
                    array.splice(array.indexOf(value), 1);
                    obj = array;
                }
                this.props.updateSelectedPriority({selectedPriority: obj});
                this.setState({ selectedPriority: obj  },this.getTCForStatuss);
    }
    popoverToggle = () => this.setState({ popoverOpen: !this.state.popoverOpen});
    popoverToggleGUI = () => this.setState({ popoverOpengui: !this.state.popoverOpengui});
    save() {
        let data = { ...this.props.selectedRelease, ...this.state.basic.updated, ...this.state.qaStrategy.updated }
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};

        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]).toISOString().split('T');
                formattedDates[item] = `${date[0]} ${date[1].substring(0, date[1].length - 1)}`;
            }
        })
        data = { ...data, ...formattedDates };
        let arrays = [
            'ServerType', 'CardType', 'BuildNumberList', 'SetupsUsed', 'UpgradeMetrics', 'Customers', 'Engineers'
        ]
        let formattedArrays = {};

        arrays.forEach(item => {
            if (!data[item]) {
                formattedArrays[item] = [];
            }
            if (data[item] && !Array.isArray(data[item])) {
                formattedArrays[item] = data[item].split(',');
            }
        })
        data.ParentRelease = this.props.ParentRelease
        data = { ...data, ...formattedArrays };
        if (isNaN(data.QARateOfProgress)) {
            data.QARateOfProgress = 0;
        } else {
            data.QARateOfProgress = parseInt(data.QARateOfProgress);
        }
        if (!data.QARateOfProgress) {
            data.QARateOfProgress = 0;
        }
       
        data.Priority = 'P0' // if not set then giving error to update basic info 
        axios.put(`/api/release/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
                this.reset();
                window.location.reload()
                // this.history.push('/release/summary')
            }, error => {
                alert('error in updating');
            });
        if (this.state.modal) {
            this.toggle();
        }
        if (this.state.momModal) {
            this.momToggle();
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal },()=>{

    });
    momToggle = () => this.setState({ momModal: !this.state.momModal });
    getFeatureDetails(dws) {
        axios.post('/rest/featuredetail', { data: dws }).then(res => {
            this.props.saveSingleFeature({ data: res.data });
            this.props.history.push('/release/status')
        }, err => {

        })
    }
    //  componentDidMount(){
    //  }
    getTCForStatuss() {
        if (!this.state.release) {
            return;
        }
        if (!this.state.release.TcAggregate) {
            return;
        }
        let p = {};
        let pGUI = {};
        ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(item => p[item] = { Total:0,Pass: 0, Skip: 0, Fail: 0, NotTested: 0,Blocked:0 });
        ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(item => pGUI[item] = { Total:0,Pass: 0, Skip: 0, Fail: 0, NotTested: 0,Blocked:0 });
        let visibleP = { Total:0,Pass: 0, Skip: 0, Fail: 0, NotTested: 0 ,Blocked:0};
        let visibleGUIP = { Total:0,Pass: 0, Skip: 0, Fail: 0, NotTested: 0 ,Blocked:0};
        if (this.state.release.TcAggregate.Priority) {
            p = { ...p, ...this.state.release.TcAggregate.Priority }
            
        }
        
        //let pGUI = {}
        if (this.state.release.TcAggregate.PriorityGui) {
            pGUI = { ...pGUI, ...this.state.release.TcAggregate.PriorityGui}
        }
        
        if (this.state.selectedPriority) {
            this.state.selectedPriority.forEach(item => {
                visibleP.Pass += p[item].Pass;
                visibleP.Skip += p[item].Skip;
                visibleP.Fail += p[item].Fail;
                visibleP.NotTested += p[item].NotTested;
                visibleP.Blocked += p[item].Blocked;
    
            })
        }
    
       
    
        if(this.state.selectedPriority){
            //if (this.props.selectedRelease.ReleaseNumber == "DMC-3.0" || this.props.selectedRelease.ReleaseNumber == "DMC Master" ) {
                this.state.selectedPriority.forEach(item => {
                    //if(item){
                        visibleGUIP.Pass += pGUI[item].Pass;
                        visibleGUIP.Skip += pGUI[item].Skip;
                        visibleGUIP.Fail += pGUI[item].Fail;
                        visibleGUIP.NotTested += pGUI[item].NotTested;
                        visibleGUIP.Blocked += pGUI[item].Blocked;
    
                    //}
                   
                })
            //}
        }
        let PriorityLabel = this.state.selectedPriority;
        let str = ""
        
        if(this.props.selectedRelease.ReleaseNumber == "DCX-3.0"){
            str = "P0"
        }
        else{
            for(let i=0;i<PriorityLabel.length;i++){
                str += PriorityLabel[i] + " "
            }
        }
        let data = [{
            labels: ['Total', str],
            datasets: [
            
            {
                label: 'Pass',
                backgroundColor: '#01D251',
                borderColor: 'white',
                borderWidth: 1,
                data: [(this.state.release.TcAggregate.all.Tested.auto.Pass + this.state.release.TcAggregate.all.Tested.manual.Pass), visibleP.Pass]
            },
            // {
            //     label: 'Skipped (Testing)',
            //     backgroundColor: '#FFCE56',
            //     borderColor: 'white',
            //     borderWidth: 1,
            //     data: [(release.TcAggregate.all.Tested.auto.Skip + release.TcAggregate.all.Tested.manual.Skip), visibleP.Skip]
            // },
            {
                label: 'Fail',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [(this.state.release.TcAggregate.all.Tested.auto.Fail + this.state.release.TcAggregate.all.Tested.manual.Fail), visibleP.Fail]
            },
            {
                label: 'Not Tested',
                backgroundColor: 'rgba(128,128,128,0.3)',
                borderColor: 'white',
                borderWidth: 1,
                data: [this.state.release.TcAggregate.all.NotTested, visibleP.NotTested]
            },
            {
                label: 'Blocked',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [this.state.release.TcAggregate.all.Blocked, visibleP.Blocked]
            },
            ]
        }];
    
    
        data.push({
            labels: ['Total', str],
            datasets: [
           
            {
                label: 'Pass',
                backgroundColor: '#01D251',
                borderColor: 'white',
                borderWidth: 1,
                data: [(this.state.release.TcAggregate.allGUI.Pass), visibleGUIP.Pass]
            },
            // {
            //     label: 'Skipped (Testing)',
            //     backgroundColor: '#FFCE56',
            //     borderColor: 'white',
            //     borderWidth: 1,
            //     data: [(release.TcAggregate.allGUI.SkippedWhileTesting), visibleGUIP.Skip]
            // },
            {
                label: 'Fail',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [(this.state.release.TcAggregate.allGUI.Fail), visibleGUIP.Fail]
            },
            {
                label: 'Not Tested',
                backgroundColor: 'rgba(128,128,128,0.3)',
                borderColor: 'white',
                borderWidth: 1,
                data: [this.state.release.TcAggregate.allGUI.NotTested, visibleGUIP.NotTested]
            },
            {
                label: 'Blocked',
                backgroundColor: '#d9534f',
                borderColor: 'white',
                borderWidth: 1,
                data: [this.state.release.TcAggregate.allGUI.Blocked, visibleGUIP.Blocked]
            },
           
            ]
        })
        
        if (this.props.selectedRelease.ReleaseNumber === '2.3.0') {
            data.push({
                labels: [''],
                datasets: [{
                    label: 'Pass',
                    backgroundColor: '#01D251',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [3643]
                },
                // {
                //     label: 'Skipped (Testing)',
                //     backgroundColor: '#FFCE56',
                //     borderColor: 'white',
                //     borderWidth: 1,
                //     data: [0]
                // },
                {
                    label: 'Fail',
                    backgroundColor: '#d9534f',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [189]
                },
                {
                    label: 'Not Tested',
                    backgroundColor: 'rgba(128,128,128,0.3)',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [0]
                },
                ]
            })
        } else {
            data.push({
                labels: [''],
                datasets: [{
                    label: 'Pass',
                    backgroundColor: '#01D251',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [0]
                },
                {
                    label: 'Skipped (Testing)',
                    backgroundColor: '#FFCE56',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [0]
                },
                {
                    label: 'Fail',
                    backgroundColor: '#d9534f',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [0]
                },
                {
                    label: 'Not Tested',
                    backgroundColor: 'rgba(128,128,128,0.3)',
                    borderColor: 'white',
                    borderWidth: 1,
                    data: [this.state.release.TcAggregate.all.GUI]
                    // data: [0]
                },
                ]
            })
        }
    
        const options = {
            legend: {
                position: 'right',
                display: true,
                labels: {
                    fontColor: '#003168',
                    fontFamily: 'Open Sans, sans-serif',
                }
            },
        }
        
        let total = [this.state.release.TcAggregate.all.All - (this.state.release.TcAggregate.all.NotApplicable + this.state.release.TcAggregate.all.Skip)];
        if (this.props.selectedRelease.ReleaseNumber === '2.3.0') {
            total.push(3876)
        } else {
            let temp =this.state.release.TcAggregate.allGUI.All - (this.state.release.TcAggregate.allGUI.NotApplicable + this.state.release.TcAggregate.allGUI.Skip)
            total.push(temp);
        }
        let length = 3
        let tcSummaryy = {data,total,options,length}
        this.setState({tcSummary : tcSummaryy})
    }
    
    render() {
        if(this.state.release.TcAggregate){
            var allGUI = this.state.release.TcAggregate.allGUI
            var allCLI = this.state.release.TcAggregate.all
            var needToRun = this.state.release.TcAggregate.all.Tested.auto.Fail + this.state.release.TcAggregate.all.Tested.manual.Fail + this.state.release.TcAggregate.all.NotTested

        }
        // if(this.props.selectedRelease.TcAggregate){
        //     var allGUI = this.props.selectedRelease.TcAggregate.allGUI
        // }
        let featuresCount = 0;
        let featuresStatusDict = {'Open': { total: 0 },'Resolved': { total: 0 },'Others': { total: 0 } }
        let statusScenarios = { Open: { total: 0 }, Resolved: { total: 0 }};
        if (this.props.feature && this.props.feature.issues) {
            featuresCount = this.props.feature.issues.length;
            this.props.feature.issues.forEach(item => {
                if(item.fields.status.name !== 'In Progress'){
                    if (statusScenarios[item.fields.status.name]) {
                        statusScenarios[item.fields.status.name].total += 1;
                    } else {
                        statusScenarios[item.fields.status.name] = { total: 1 }
                    }

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

        let priorities = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(item => ({ value: item, selected: this.state.selectedPriority && this.state.selectedPriority.includes(item) }));
        let multiselect = { 'Priorities': priorities, };
            
        let tcSkipped = `CLI: ${this.props.tcStrategy ? this.props.tcStrategy.skipped : 0 } GUI: 0`;
        let tcNA = `CLI: ${this.props.tcStrategy ? this.props.tcStrategy.notApplicable : 0 } GUI: 0`;
        let tcAutomated = `CLI: ${this.props.tcStrategy ? this.props.tcStrategy.totalAutomated : 0 } GUI: 0`;
        if(this.state.tableApi)
        {
            return (
                <div className="main-container">
        
                    <Row>
                        <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            {
                                <div className='rp-app-table-header'>

                                    <div className='rp-app-table-title'>
                                        <div className='rp-icon-button'><i className="fa fa-gg-circle"></i></div><span>Basic Info</span>
                                        {
                                            this.props.currentUser && this.props.currentUser.isAdmin && this.state.basic.editOptions && this.state.basic.editOptions.length ?
                                                this.state.basic.editing ?
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                            <i className="fa fa-save"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right" onClick={() => this.reset()} >
                                                            <i className="fa fa-undo"></i>
                                                        </Button>
                                                    </Fragment>
                                                    :
                                                    <Button size="md" color="transparent" className="float-right" onClick={() => this.setState({ basic: { ...this.state.basic, editing: true } })} >
                                                        <i className="fa fa-pencil-square-o"></i>
                                                    </Button>
                                                : null
                                        }
                                    </div>
                                </div>
                            }

                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>

                                    {

                                        [
                                            { key: 'Target Date', field: 'TargetedReleaseDate', value: this.props.selectedRelease.TargetedReleaseDate, type: 'date' },
                                            { key: 'Actual Date', field: 'ActualReleaseDate', value: this.props.selectedRelease.ActualReleaseDate, type: 'date' },
                                            { key: 'Server Type Supported', field: 'ServerType', value: this.props.selectedRelease.ServerType ? this.props.selectedRelease.ServerType.join(',') : '' },
                                            { key: 'Card Type Supported', field: 'CardType', value: this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.join(',') : '' },
                                            { key: 'Intended Customers', field: 'Customers', value: this.props.selectedRelease.Customers ? this.props.selectedRelease.Customers.join(',') : '' },
                                            { key: 'Total Features', restrictEdit: true, field: 'Total Features', value: featuresCount },
                                            { key: 'Operating System', value: this.props.selectedRelease.FinalOS, field: 'FinalOS' },
                                            { key: 'Kubernetes', value: this.props.selectedRelease.KubernetesVersion , field: 'KubernetesVersion' },
                                            { key: 'Docker', value: this.props.selectedRelease.DockerVersion , field: 'DockerVersion' },
                                            { key: 'Helm', value: this.props.selectedRelease.HelmVersion , field: 'HelmVersion' },
                                            { key: 'fixVersion', value: this.props.selectedRelease.fixVersion , field: 'fixVersion' },
                                            { key: 'epicLink', value: this.props.selectedRelease.epicLink , field: 'epicLink' },
                                        ].map((item, index) => {
                                            return (
                                                <tr>
                                                    <React.Fragment>
                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {this.state.basic.editing && !item.restrictEdit &&
                                                            <td>
                                                                <Input
                                                                    type={item.type ? item.type : 'text'}
                                                                    key={index}
                                                                    onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                    placeholder={this.props.selectedRelease[item.field]}
                                                                    value={this.state.basic.updated[item.field] !== undefined ?
                                                                        this.state.basic.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}
                                                                />
                                                            </td>
                                                        }

                                                        {
                                                            !this.state.basic.editing && !item.restrictEdit &&
                                                            this.props.selectedRelease[item.field] !== undefined &&
                                                            Array.isArray(this.props.selectedRelease[item.field]) &&
                                                            <td>{
                                                                this.props.selectedRelease[item.field].map((_item, index) => {
                                                                    return index === this.props.selectedRelease[item.field].length - 1 ?
                                                                        <span className=''>{_item}</span> :
                                                                        <span className=''>{_item + " , "}</span>
                                                                })
                                                            }</td>
                                                        }
                                                        {!this.state.basic.editing && !item.restrictEdit &&
                                                            <td>{this.props.selectedRelease[item.field] !== undefined && !Array.isArray(this.props.selectedRelease[item.field]) && this.props.selectedRelease[item.field]}</td>
                                                        }
                                                        {!this.state.basic.editing && !item.restrictEdit &&
                                                            <td>{this.props.selectedRelease[item.field] === undefined && ''}</td>
                                                        }

                                                        {
                                                            item.restrictEdit && <td>{item.value}</td>
                                                        }
                                                    </React.Fragment>

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                            {
                                !this.state.basic.open &&
                                <div style={{ textAlign: 'right' }}>
                                    <i className="fa fa-angle-down rp-rs-down-arrow" onClick={() => this.setState({ basic: { ...this.state.basic, open: !this.state.basic.open } })}> More</i>
                                </div>
                            }
                            {
                                this.state.basic.open &&
                                <div style={{ textAlign: 'right' }}>
                                    <i className="fa fa-angle-up rp-rs-down-arrow" onClick={() => this.setState({ basic: { ...this.state.basic, open: !this.state.basic.open } })}> Less</i>
                                </div>
                            }



                            <Collapse isOpen={this.state.basic.open}>
                                <Table scroll responsive style={{ overflow: 'scroll', }}>
                                    <tbody>
                                        {
                                            [
                                                { key: 'Final Build Number', field: 'BuildNumber', value: this.props.selectedRelease.BuildNumber ? this.props.selectedRelease.BuildNumber : '' },
                                                { key: 'UBoot Number', value: this.props.selectedRelease.UbootVersion, field: 'UbootVersion' },
                                                { key: 'Docker Core RPM Number', value: this.props.selectedRelease.FinalDockerCore, field: 'FinalDockerCore' },
                                                
                                            ].map((item, index) => {
                                                return (
                                                    <tr>

                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {this.state.basic.editing &&
                                                            <td>
                                                                <Input
                                                                    type={item.type ? item.type : 'text'}
                                                                    key={index}
                                                                    onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                    placeholder={this.props.selectedRelease[item.field]}
                                                                    value={this.state.basic.updated[item.field] !== undefined ?
                                                                        this.state.basic.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}

                                                                />
                                                            </td>
                                                        }
                                                        {
                                                            !this.state.basic.editing && !item.restrictEdit &&
                                                            this.props.selectedRelease[item.field] !== undefined &&
                                                            Array.isArray(this.props.selectedRelease[item.field]) &&
                                                            <td>{
                                                                this.props.selectedRelease[item.field].map(item => <Badge className='rp-array-badge'>{item}</Badge>)
                                                            }</td>
                                                        }
                                                        {!this.state.basic.editing && !item.restrictEdit &&
                                                            <td>{this.props.selectedRelease[item.field] !== undefined && !Array.isArray(this.props.selectedRelease[item.field]) && this.props.selectedRelease[item.field]}</td>
                                                        }
                                                        {!this.state.basic.editing && !item.restrictEdit &&
                                                            <td>{this.props.selectedRelease[item.field] === undefined && ''}</td>
                                                        }

                                                        {
                                                            item.restrictEdit && <td>{item.value}</td>
                                                        }


                                                    </tr>
                                                )
                                            })
                                        }
                                    
                                    </tbody>
                                </Table>
                            </Collapse>
                        </Col>
                        <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            <div className='rp-app-table-header'>
                                <div className='rp-icon-button'><i className="fa fa-bars"></i></div><span className='rp-app-table-title'>Release Status</span>
                            </div>

                            <Table scroll responsive style={{ overflow: 'hidden', }}>
                                <tbody>
                                    <tr style={{ cursor: 'pointer' }} onClick={() => {
                                        this.props.statusPage({ featureOpen: false, buildOpen: false, bugOpen: true, graphsOpen: false });
                                        this.props.history.push('/release/status');

                                    }}>
                                        <td className='rp-app-table-key' style={{ maxWidth: '3rem', width: '0%' }}>
                                            Bug Status
                                        </td>
                                        <td style={{ width: '0%', }}>
                                            <div class="row">
                                                {
                                                    this.props.bug && this.props.bug.bugCount && Object.keys(this.props.bug.bugCount.all).map((item, index) =>
                                                        <div class="col-sm-3">
                                                            <div className={`c-callout c-callout-${item.toLowerCase()}`}>
                                                                <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                                <strong class="h4">{this.props.bug.bugCount.all[item]}</strong>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Table scroll responsive style={{ overflow: 'hidden', }}>
                                <tbody>
                                    <tr style={{ cursor: 'pointer' }} onClick={() => this.setState({ featureOpen: !this.state.featureOpen })}>
                                        <td className='rp-app-table-key' style={{ maxWidth: '3rem', width: '0%' }}>
                                            Feature Status
                                        </td>
                                        <td style={{ width: '0%' }}>
                                            {
                                                <div class="row">
                                                    <div class="col-sm-3">
                                                        <div className={`c-callout c-callout-total`}>
                                                            <small class="text-muted">TOTAL</small><br></br>
                                                            <strong class="h4">{featuresCount}</strong>
                                                        </div>
                                                    </div>
                                                    {
                                                        Object.keys(featuresStatusDict).map(item =>
                                                            <div class="col-sm-3">
                                                                <div className={`c-callout c-callout-${item.toLowerCase()}`}  >
                                                                    <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                                    <strong class="h4">{featuresStatusDict[item].total}</strong>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            }

                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Collapse isOpen={this.state.featureOpen}>
                                <Table scroll responsive style={{ overflow: 'scroll', }}>
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
                                                    <tr style={{ cursor: 'pointer' }} onClick={() => {
                                                        this.getFeatureDetails(item.self)

                                                    }}>
                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        <td>{item.fields.summary}</td>
                                                        <td>
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
                            </Collapse>
                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>
                                    <tr>
                                        <td className='rp-app-table-key' style={{ maxWidth: '2rem' }}>
                                            Current Build Number
                                        </td>
                                        <td>
                                            {this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber === '2.3.0' ? 101 : 'Not Available'}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Row>
                        {/* <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            <div className='rp-app-table-header'>
                                <Link to={'/release/qastrategy'}>
                                    <div className='rp-icon-button'><i className="fa fa-cogs"></i></div><span className='rp-app-table-title'>QA Strategy</span>
                                </Link>
                                {
                                    this.props.currentUser && this.props.currentUser.isAdmin && this.state.qaStrategy.editOptions && this.state.qaStrategy.editOptions.length ?
                                        this.state.qaStrategy.editing ?
                                            <Fragment>
                                                <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                    <i className="fa fa-save"></i>
                                                </Button>
                                                <Button size="md" color="transparent" className="float-right" onClick={() => this.reset()} >
                                                    <i className="fa fa-undo"></i>
                                                </Button>
                                            </Fragment>
                                            :
                                            <Button size="md" color="transparent" className="float-right" onClick={() => this.setState({ qaStrategy: { ...this.state.qaStrategy, editing: true } })} >
                                                <i className="fa fa-pencil-square-o"></i>
                                            </Button>
                                        : null
                                }
                            </div>
                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>
                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases (All)</td>
                                        
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>

                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0}</span></td>
                                            
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI  ? allGUI.All : 0}</span></td>
                                            
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Not Applicable</td>
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>
                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.notApplicable : 0}</span></td>
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.NotApplicable : 0}</span></td>
                                            
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                                                                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Skipped from Release</td>
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>
                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.skipped : 0}</span></td>
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.Skip : 0}</span></td>
                                                
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                                                                                                                    {
                                        // <tr>
                                        //     <td className='rp-app-table-key'>Test Cases Skipped while Testing</td>
                                        //     <td>
                                        //         <table>
                                        //             <tbody>
                                        //                 <tr>
                                        //                     <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.SkipAndTested : 0}</span></td>
                                        //                     <td style={{ borderTop: '0px'}}><span>GUI: {allGUI ? allGUI.SkippedWhileTesting : 0}</span></td>
                                        //                 </tr>
                                        //             </tbody>
                                        //         </table>
                                        //     </td>
                                        // </tr>
                                    }
                                                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Automated</td>
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.totalAutomated : 0}</span></td>
                                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.Automated : 0}</span></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    }
                                    {
                                        [
                                            { key: 'QA Start Date', field: 'QAStartDate', value: this.props.selectedRelease.QAStartDate, type: 'date' },
                                            { key: 'Target Code Freeze Date', field: 'TargetedCodeFreezeDate', value: this.props.selectedRelease.TargetedCodeFreezeDate, type: 'date' },

                                        ].map((item, index) => {
                                            return (
                                                <tr>
                                                    <React.Fragment>

                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {this.state.qaStrategy.editing && !item.restrictEdit ?
                                                            <td>
                                                                <Input
                                                                    type={item.type ? item.type : 'text'}
                                                                    key={index}
                                                                    onChange={(e) => this.setState({ qaStrategy: { ...this.state.qaStrategy, updated: { ...this.state.qaStrategy.updated, [item.field]: e.target.value } } })}
                                                                    placeholder={this.props.selectedRelease[item.field]}
                                                                    value={

                                                                        this.state.qaStrategy.updated[item.field] !== undefined ?
                                                                            this.state.qaStrategy.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}

                                                                />
                                                                {
                                                                    item.field === 'QARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.state.qaStrategy.updated[item.field]} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </td> :
                                                            <td>

                                                                {
                                                                    !this.state.basic.editing && !item.restrictEdit &&
                                                                    this.props.selectedRelease[item.field] !== undefined &&
                                                                    Array.isArray(this.props.selectedRelease[item.field]) &&
                                                                    <span>{
                                                                        this.props.selectedRelease[item.field].map(item => <Badge className='rp-array-badge'>item</Badge>)
                                                                    }</span>
                                                                }
                                                                {!this.state.basic.editing && !item.restrictEdit &&
                                                                    <span>{this.props.selectedRelease[item.field] !== undefined && !Array.isArray(this.props.selectedRelease[item.field]) && this.props.selectedRelease[item.field]}</span>
                                                                }
                                                                {!this.state.basic.editing && !item.restrictEdit &&
                                                                    <span>{this.props.selectedRelease[item.field] === undefined && ''}</span>
                                                                }

                                                                {item.restrictEdit && item.value}
                                                                {
                                                                    item.field === 'QARateOfProgress' && <span>%</span>
                                                                }
                                                                {
                                                                    item.field === 'QARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.props.selectedRelease[item.field]} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </td>
                                                        }
                                                    </React.Fragment>

                                                </tr>
                                            )
                                        })
                                    }
                                    {
                                        [
                                            { key: 'Setups Used', restrictEdit: false, field: 'SetupsUsed', value: this.props.selectedRelease.SetupsUsed ? this.props.selectedRelease.SetupsUsed.length : 0 },
                                            { key: 'Engineers', restrictEdit: false, field: 'Engineers', value: this.props.selectedRelease.Engineers ? this.props.selectedRelease.Engineers.length : 0 },
                                            { key: 'Upgrade Metrics', restrictEdit: false, field: 'UpgradeMetrics', value: this.props.selectedRelease.UpgradeMetrics ? this.props.selectedRelease.UpgradeMetrics.length : 0 }
                                        ].map(item =>
                                            <React.Fragment>
                                                <tr>
                                                    <td className='rp-app-table-key'>{item.key}
                                                        {
                                                            !this.state.qaStrategy.editing &&
                                                            <span style={{ 'marginLeft': '0.5rem' }}>(Total: {item.value})</span>
                                                        }
                                                    </td>
                                                    {
                                                        this.state.qaStrategy.editing &&
                                                        <td>
                                                            <Input type='textarea' rows='2'
                                                                value={
                                                                    this.state.qaStrategy.updated[item.field] !== undefined ?
                                                                        this.state.qaStrategy.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}
                                                                onChange={(e) => this.setState({ qaStrategy: { ...this.state.qaStrategy, updated: { ...this.state.qaStrategy.updated, [item.field]: e.target.value } } })}
                                                            >
                                                            </Input>
                                                        </td>
                                                    }
                                                    {
                                                        !this.state.qaStrategy.editing &&
                                                        <td style={{ wordBreak: 'break-word' }}>
                                                            <span >{Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : ''}</span>
                                                        </td>
                                                    }

                                                </tr>
                                            </React.Fragment>
                                        )

                                    }
                                </tbody>
                            </Table>
                            
                        </Col> */}
                        <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            <div className='rp-app-table-header'>
                                <Link to={'/release/qastrategy'}>
                                    <div className='rp-icon-button'><i className="fa fa-cogs"></i></div><span className='rp-app-table-title'>QA Strategy</span>
                                </Link>
                                {
                                    this.props.currentUser && this.props.currentUser.isAdmin && this.state.qaStrategy.editOptions && this.state.qaStrategy.editOptions.length ?
                                        this.state.qaStrategy.editing ?
                                            <Fragment>
                                                <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                    <i className="fa fa-save"></i>
                                                </Button>
                                                <Button size="md" color="transparent" className="float-right" onClick={() => this.reset()} >
                                                    <i className="fa fa-undo"></i>
                                                </Button>
                                            </Fragment>
                                            :
                                            <Button size="md" color="transparent" className="float-right" onClick={() => this.setState({ qaStrategy: { ...this.state.qaStrategy, editing: true } })} >
                                                <i className="fa fa-pencil-square-o"></i>
                                            </Button>
                                        : null
                                }
                            </div>
                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>
                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases (All)</td>
                                        
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>

                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {allCLI ? allCLI.All : 0}</span></td>
                                            
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI  ? allGUI.All : 0}</span></td>
                                            
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Not Applicable</td>
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>
                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {allCLI ? allCLI.NotApplicable : 0}</span></td>
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.NotApplicable : 0}</span></td>
                                            
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                                                                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Skipped from Release</td>
                                            <td>
                                            <table>
                                            <tbody>
                                            <tr>
                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {allCLI ? allCLI.Skip : 0}</span></td>
                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.Skip : 0}</span></td>
                                                
                                                </tr>
                                            </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                    }
                                                                                                                                    {
                                        // <tr>
                                        //     <td className='rp-app-table-key'>Test Cases Skipped while Testing</td>
                                        //     <td>
                                        //         <table>
                                        //             <tbody>
                                        //                 <tr>
                                        //                     <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {this.props.tcStrategy ? this.props.tcStrategy.SkipAndTested : 0}</span></td>
                                        //                     <td style={{ borderTop: '0px'}}><span>GUI: {allGUI ? allGUI.SkippedWhileTesting : 0}</span></td>
                                        //                 </tr>
                                        //             </tbody>
                                        //         </table>
                                        //     </td>
                                        // </tr>
                                    }
                                                                    {
                                        <tr>
                                            <td className='rp-app-table-key'>Test Cases Automated</td>
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ borderTop: '0px', width: '7rem'}}><span>CLI: {allCLI ? allCLI.Automated : 0}</span></td>
                                                            <td style={{ borderTop: '0px'}}><span>UI: {allGUI ? allGUI.Automated : 0}</span></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    }
                                    {
                                        [
                                            { key: 'QA Start Date', field: 'QAStartDate', value: this.props.selectedRelease.QAStartDate, type: 'date' },
                                            { key: 'Target Code Freeze Date', field: 'TargetedCodeFreezeDate', value: this.props.selectedRelease.TargetedCodeFreezeDate, type: 'date' },

                                        ].map((item, index) => {
                                            return (
                                                <tr>
                                                    <React.Fragment>

                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {this.state.qaStrategy.editing && !item.restrictEdit ?
                                                            <td>
                                                                <Input
                                                                    type={item.type ? item.type : 'text'}
                                                                    key={index}
                                                                    onChange={(e) => this.setState({ qaStrategy: { ...this.state.qaStrategy, updated: { ...this.state.qaStrategy.updated, [item.field]: e.target.value } } })}
                                                                    placeholder={this.props.selectedRelease[item.field]}
                                                                    value={

                                                                        this.state.qaStrategy.updated[item.field] !== undefined ?
                                                                            this.state.qaStrategy.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}

                                                                />
                                                                {
                                                                    item.field === 'QARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.state.qaStrategy.updated[item.field]} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </td> :
                                                            <td>

                                                                {
                                                                    !this.state.basic.editing && !item.restrictEdit &&
                                                                    this.props.selectedRelease[item.field] !== undefined &&
                                                                    Array.isArray(this.props.selectedRelease[item.field]) &&
                                                                    <span>{
                                                                        this.props.selectedRelease[item.field].map(item => <Badge className='rp-array-badge'>item</Badge>)
                                                                    }</span>
                                                                }
                                                                {!this.state.basic.editing && !item.restrictEdit &&
                                                                    <span>{this.props.selectedRelease[item.field] !== undefined && !Array.isArray(this.props.selectedRelease[item.field]) && this.props.selectedRelease[item.field]}</span>
                                                                }
                                                                {!this.state.basic.editing && !item.restrictEdit &&
                                                                    <span>{this.props.selectedRelease[item.field] === undefined && ''}</span>
                                                                }

                                                                {item.restrictEdit && item.value}
                                                                {
                                                                    item.field === 'QARateOfProgress' && <span>%</span>
                                                                }
                                                                {
                                                                    item.field === 'QARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.props.selectedRelease[item.field]} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </td>
                                                        }
                                                    </React.Fragment>

                                                </tr>
                                            )
                                        })
                                    }
                                    {
                                        [
                                            { key: 'Setups Used', restrictEdit: false, field: 'SetupsUsed', value: this.props.selectedRelease.SetupsUsed ? this.props.selectedRelease.SetupsUsed.length : 0 },
                                            { key: 'Engineers', restrictEdit: false, field: 'Engineers', value: this.props.selectedRelease.Engineers ? this.props.selectedRelease.Engineers.length : 0 },
                                            { key: 'Upgrade Metrics', restrictEdit: false, field: 'UpgradeMetrics', value: this.props.selectedRelease.UpgradeMetrics ? this.props.selectedRelease.UpgradeMetrics.length : 0 }
                                        ].map(item =>
                                            <React.Fragment>
                                                <tr>
                                                    <td className='rp-app-table-key'>{item.key}
                                                        {
                                                            !this.state.qaStrategy.editing &&
                                                            <span style={{ 'marginLeft': '0.5rem' }}>(Total: {item.value})</span>
                                                        }
                                                    </td>
                                                    {
                                                        this.state.qaStrategy.editing &&
                                                        <td>
                                                            <Input type='textarea' rows='2'
                                                                value={
                                                                    this.state.qaStrategy.updated[item.field] !== undefined ?
                                                                        this.state.qaStrategy.updated[item.field] : (this.props.selectedRelease[item.field] ? Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : this.props.selectedRelease[item.field] : '')}
                                                                onChange={(e) => this.setState({ qaStrategy: { ...this.state.qaStrategy, updated: { ...this.state.qaStrategy.updated, [item.field]: e.target.value } } })}
                                                            >
                                                            </Input>
                                                        </td>
                                                    }
                                                    {
                                                        !this.state.qaStrategy.editing &&
                                                        <td style={{ wordBreak: 'break-word' }}>
                                                            <span >{Array.isArray(this.props.selectedRelease[item.field]) ? this.props.selectedRelease[item.field].join(',') : ''}</span>
                                                        </td>
                                                    }

                                                </tr>
                                            </React.Fragment>
                                        )

                                    }
                                </tbody>
                            </Table>
                            
                        </Col>
                        {/* <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            <div className='rp-app-table-header'>
                                <Link to={'/release/qastatus'}>
                                    <div className='rp-icon-button'><i className="fa fa-area-chart"></i></div><span className='rp-app-table-title'>QA Status</span>
                                </Link>
                            </div>
                                <div className="chart-wrapper" style={{ textAlign: "center" }}>
                                    <div class='row'>
                                        
                                        <div class='col-md-6'>
                                            {
                                                this.props.tcSummary &&
                                                <div className='rp-app-table-key'>
                                                    <span>CLI ({this.props.tcSummary.total[0]})</span>
                                                    <span>
                                                            <Button  size="sm" style={{backgroundColor: '#2eb85c', borderRadius: '50%', marginLeft: '0.5rem'}} id="PopoverAssign" type="button">
                                                                P
                                                            </Button>
                                                            <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign" id="PopoverAssignButton"  toggle={() => this.popoverToggle()} isOpen={this.state.popoverOpen}>
                                                                <PopoverBody>
                                                                <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect('Priorities', e, checked, select)}
                                                data={multiselect['Priorities']} multiple /></div>
                                                                    </PopoverBody>
                                                                    </UncontrolledPopover>
                                                                    </span>
                                                </div>
                                            }
                                            
                                            <Link to={'/release/qastatus'}>
                                            <div>
                                                <HorizontalBar height={180} data={this.props.tcSummary && this.props.tcSummary.data[0]} options={stackedBarChartOptions} label="2345"></HorizontalBar>
                                            </div>
                                            </Link>
                                            </div>
                                        
                                        <div class='col-md-6'>
                                            {
                                                this.props.tcSummary &&
                                                <div className='rp-app-table-key'>
                                                    <span>UI ({this.props.tcSummary.total[1]})</span>
                                                    <span>
                                                            <Button  size="sm" style={{backgroundColor: '#2eb85c', borderRadius: '50%', marginLeft: '0.5rem'}} id="PopoverAssign1" type="button">
                                                                P
                                                            </Button>
                                                            <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign1" id="PopoverAssignButton1"  toggle={() => this.popoverToggleGUI()} isOpen={this.state.popoverOpengui}>
                                                                <PopoverBody>
                                                                <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect('Priorities', e, checked, select)}
                                                data={multiselect['Priorities']} multiple /></div>
                                                                    </PopoverBody>
                                                                    </UncontrolledPopover>
                                                                    </span>
                                                </div>
                                            }
                                            <Link to={'/release/qastatus'}>
                                                <div>
                                                    <HorizontalBar height={180} data={this.props.tcSummary && this.props.tcSummary.data[1]} options={stackedBarChartOptions}></HorizontalBar>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>  
                                </div>

                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>
                                    {
                                        [
                                            { key: 'Test Cases required to run again', restrictEdit: true, field: 'run', value: this.props.tcStrategy ? this.props.tcStrategy.needToRun : 0 },
                                        ].map((item, index) => {
                                            return (
                                                <tr>
                                                    <React.Fragment>

                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {
                                                            
                                                            <td style={{ width: '10rem' }}>

                                                                {item.value}
                                                                {
                                                                    item.field === 'ActualQARateOfProgress' && <span>%</span>
                                                                }
                                                                {
                                                                    item.field === 'ActualQARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.props.selectedRelease.ReleaseNumber === '2.3.0' ? 87.85 : 0} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </td>
                                                        }
                                                    </React.Fragment>

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                            {
                                this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber === '2.3.0' &&
                                <React.Fragment>
                                    <div className="chart-wrapper mx-3" style={{ height: '15rem' }}>
                                        <Line data={chartData[this.state.cardType]} options={chartOptions[this.state.cardType]} height={250} />
                                    </div>
                                    <div class='row'>
                                        <div class='col-md-3'>
                                            <FormGroup style={{ marginLeft: '0.5rem' }}>
                                                <Label htmlFor="selectRelease" className='rp-app-table-key'>Card Type</Label>

                                                <Input onChange={(e) => this.setState({ cardType: e.target.value })} type="select" name="selectRelease" id="selectRelease">
                                                    <option value='BOS'>BOS</option>
                                                    <option value='NYNJ'>NYNJ</option>
                                                    <option value='COMMON'>COMMON</option>
                                                </Input>


                                            </FormGroup>
                                        </div>
                                        <div class='col-md-5'>
                                            <div className='rp-app-table-key' style={{
                                                marginLeft: '0.5rem',
                                                textAlign: 'center',
                                                marginTop: '0.2rem',
                                                marginBottom: '0.5rem'
                                            }}>Weekly Rate of Progress (%)</div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            }
                        </Col> */}
                    <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                            <div className='rp-app-table-header'>
                                <Link to={'/release/qastatus'}>
                                    <div className='rp-icon-button'><i className="fa fa-area-chart"></i></div><span className='rp-app-table-title'>QA Status</span>
                                </Link>
                            </div>
                                <div className="chart-wrapper" style={{ textAlign: "center" }}>
                                {
                                    this.state.tcSummary.length ?
                                    <div class='row'>
                                    
                                        <div class='col-md-6'>
                                            {
                                                this.state.tcSummary &&
                                                <div className='rp-app-table-key'>
                                                    <span>CLI ({this.state.tcSummary.total[0]})</span>
                                                    <span>
                                                            <Button  size="sm" style={{backgroundColor: '#2eb85c', borderRadius: '50%', marginLeft: '0.5rem'}} id="PopoverAssign" type="button">
                                                                P
                                                            </Button>
                                                            <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign" id="PopoverAssignButton"  toggle={() => this.popoverToggle()} isOpen={this.state.popoverOpen}>
                                                                <PopoverBody>
                                                                <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect('Priorities', e, checked, select)}
                                                data={multiselect['Priorities']} multiple /></div>
                                                                    </PopoverBody>
                                                                    </UncontrolledPopover>
                                                                    </span>
                                                </div>
                                            }
                                            
                                            <Link to={'/release/qastatus'}>
                                            <div>
                                                <HorizontalBar height={180} data={this.state.tcSummary.data[0] } options={stackedBarChartOptions} label="2345"></HorizontalBar>
                                            </div>
                                            </Link>
                                            </div>
                                        
                                        <div class='col-md-6'>
                                            {
                                                this.state.tcSummary &&
                                                <div className='rp-app-table-key'>
                                                    <span>UI ({this.state.tcSummary.total[1]})</span>
                                                    <span>
                                                            <Button  size="sm" style={{backgroundColor: '#2eb85c', borderRadius: '50%', marginLeft: '0.5rem'}} id="PopoverAssign1" type="button">
                                                                P
                                                            </Button>
                                                            <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign1" id="PopoverAssignButton1"  toggle={() => this.popoverToggleGUI()} isOpen={this.state.popoverOpengui}>
                                                                <PopoverBody>
                                                                <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect('Priorities', e, checked, select)}
                                                data={multiselect['Priorities']} multiple /></div>
                                                                    </PopoverBody>
                                                                    </UncontrolledPopover>
                                                                    </span>
                                                </div>
                                            }
                                            <Link to={'/release/qastatus'}>
                                                <div>
                                                    <HorizontalBar height={180} data={this.state.tcSummary.data[1]} options={stackedBarChartOptions}></HorizontalBar>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>: 0
                                }
                                </div>
                                

                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                <tbody>
                                    {
                                        [
                                            { key: 'Test Cases required to run again', restrictEdit: true, field: 'run', value: needToRun ? needToRun : 0 },
                                        ].map((item, index) => {
                                            return (
                                                <tr>
                                                    <React.Fragment>

                                                        <td className='rp-app-table-key'>{item.key}</td>
                                                        {
                                                            
                                                            <td style={{ width: '10rem' }}>

                                                                {item.value}
                                                                {
                                                                    item.field === 'ActualQARateOfProgress' && <span>%</span>
                                                                }
                                                                {
                                                                    item.field === 'ActualQARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.props.selectedRelease.ReleaseNumber === '2.3.0' ? 87.85 : 0} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </td>
                                                        }
                                                    </React.Fragment>

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                            {
                                this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber === '2.3.0' &&
                                <React.Fragment>
                                    <div className="chart-wrapper mx-3" style={{ height: '15rem' }}>
                                        <Line data={chartData[this.state.cardType]} options={chartOptions[this.state.cardType]} height={250} />
                                    </div>
                                    <div class='row'>
                                        <div class='col-md-3'>
                                            <FormGroup style={{ marginLeft: '0.5rem' }}>
                                                <Label htmlFor="selectRelease" className='rp-app-table-key'>Card Type</Label>

                                                <Input onChange={(e) => this.setState({ cardType: e.target.value })} type="select" name="selectRelease" id="selectRelease">
                                                    <option value='BOS'>BOS</option>
                                                    <option value='NYNJ'>NYNJ</option>
                                                    <option value='COMMON'>COMMON</option>
                                                </Input>


                                            </FormGroup>
                                        </div>
                                        <div class='col-md-5'>
                                            <div className='rp-app-table-key' style={{
                                                marginLeft: '0.5rem',
                                                textAlign: 'center',
                                                marginTop: '0.2rem',
                                                marginBottom: '0.5rem'
                                            }}>Weekly Rate of Progress (%)</div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            }
                        </Col>
                    </Row>

                    <Row>

                    </Row>
                    <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
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
            )
        }
        else{
            return(
                <div>
                            <div class="container" style={{ 'margin-top': '1rem' }}>
                                <h5>Loading...</h5>
                            </div>
                </div>
               )
        }
    }
}

const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    //tcSummary: getTCForStatus(state, state.release.current.id),
    //tcStrategy: getTCForStrategy(state, state.release.current.id),
    feature: state.feature.all[state.release.current.id],
    bug: state.bug.all[state.release.current.id],
}
)


export default connect(mapStateToProps, { updateSelectedPriority, saveReleaseBasicInfo, statusPage, saveFeatures, saveBugs, saveSingleFeature })(ReleaseSummary);
