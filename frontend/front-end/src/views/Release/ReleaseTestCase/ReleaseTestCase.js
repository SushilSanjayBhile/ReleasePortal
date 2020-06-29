import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
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
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',


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
                    console.log('for ', this.props.selectedRelease.ReleaseNumber)
                    console.log(res.data)
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
        console.log('saved data ', data);
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
        console.log('clicked node');
        console.log(node);
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
            // console.log("result",res.data,res.data.TcAggregate,res.data.TcAggregate.domain)
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
            // domainData.forEach((item)=>{
            //     console.log("domainData",item)
            // })
            // console.log("Domaindata",domainData);
            this.setState({allTestCaseStatus:domainData})
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }
    getReleaseDataCLI = () =>{
        this.setState({allTestCaseStatusCLI:[]})
        let url  = `/api/release/`  + this.props.selectedRelease.ReleaseNumber
        axios.get(url).then(res=>{
            // console.log("result",res.data,res.data.TcAggregate,res.data.TcAggregate['domain-cli'])
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
            
            console.log("Domaindata cli",domainData);
            this.setState({allTestCaseStatusCLI:domainData})
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }
    getReleaseDataGUI = () =>{
        this.setState({allTestCaseStatusGUI:[]})
        let url  = `/api/release/`  + this.props.selectedRelease.ReleaseNumber
        axios.get(url).then(res=>{
            // console.log("result",res.data,res.data.TcAggregate,res.data.TcAggregate['domain-gui'])
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
            console.log("Domaindata gui",this.props.selectedRelease.ReleaseNumber,domainData);
            this.setState({allTestCaseStatusGUI:domainData})
        },
        error => {
            console.log('Error Getting Release Data',error);
        }) 
    }

    renderTableDataAll  = () => {
        return this.state.allTestCaseStatus === 0 ? (
            <div>Loading...</div>
        ) : (
            this.state.allTestCaseStatus.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td>{e.Domain}</td>
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
                            <td>{e.Domain}</td>
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
                            <td>{e.Domain}</td>
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


    render() {
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'marginLeft': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ metricsOpen: !this.state.metricsOpen },()=>{console.log("state is set or not",this.state.metricsOpen)})}>
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

                {/* {this.props.selectedRelease.ReleaseNumber === 'DMC-3.0' || this.props.selectedRelease == "DMC Master" ?       //TODO 
                        <> */}
                            <div>
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
                            </div>
                    {/* </>
                : null
                } */}

                

                

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

            </div >)
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
