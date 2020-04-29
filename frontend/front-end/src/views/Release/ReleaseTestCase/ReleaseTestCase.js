// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress
} from 'reactstrap';
import { connect } from 'react-redux';
import AppTable from '../../../components/AppTable/AppTable';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { getEachTCStatusScenario } from '../../../reducers/testcase.reducer';
import { getTCStatusForUIDomains, getTCStatusForUISubDomains, alldomains, getTCStatusForSunburst } from '../../../reducers/release.reducer';
import { TABLE_OPTIONS } from '../../../constants';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import SunburstComponent from '../components/SunburstComponent';
import './ReleaseTestCase.scss'
// import sunburst from '../../../reducers/domains.js'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import Sunburst from '../components/Sunburst';
import sunburstData from './constants';
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
            domains: getTCStatusForSunburst(this.props.selectedRelease),
            tcSummaryTitleStyle: window.screen.availWidth > 1400 ?
                { position: 'absolute', top: '41%', left: '47%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' } :
                { position: 'absolute', top: '42%', left: '46%', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#003168' },
        }
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            // let dough = getTCStatusForUIDomains(newProps.selectedRelease.ReleaseNumber);
            // let dom = getTCStatusForSunburst(newProps.selectedRelease.ReleaseNumber);
            // this.setState({
            //     cntr: this.state.cntr +1,
            //     component: 'all',
            //     result: 'all',
            //     svgKey: 0,
            //     selected: 'Domains',
            //     addTC: {},
            //     qaStrategy: {},
            //     domainSelected: false,
            //     doughnuts: dough && dough.length>0 ? [...dough]:null,
            //     domains: dom && Object.keys(dom).length>0 ? {...getTCStatusForSunburst(newProps.selectedRelease.ReleaseNumber)}:null,
            // })
            this.props.history.push('/release/summary');
        }
    }
    componentDidMount() {
        this.setState({ metricsOpen: true })
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

    render() {
        return (
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
                                            <span className='rp-app-table-title'>Test Case Status</span>
                                
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
                                    
                                        {/* <div className="main-container">
                                            <div>
                                                <SunburstComponent key={this.state.svgKey} sectionSelect={(e) => this.sectionSelect(e)} data={sunburstData[this.state.selected]}></SunburstComponent>
                                            </div>
                                        </div> */}

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
                                            {
                                                !this.state.domainSelected &&
                                                this.state.doughnuts &&
                                                this.state.doughnuts.map((item, index) => {
                                                    if (index < 4) {
                                                        return (
                                                            <Col xs="12" sm="12" md="6" lg="6">
                                                                <div className="chart-wrapper">
                                                                    <div class='row' style={{ padding: '10px', margin: 'auto' }}>
                                                                        {/* <div style={this.state.tcSummaryTitleStyle}>
                                                                            <div>Total</div>
                                                                            <div style={{ fontSize: '15px' }}>{item.data.datasets[0].data[0] + item.data.datasets[0].data[1] + item.data.datasets[0].data[2] + item.data.datasets[0].data[3]}</div>
                                                                        </div> */}

                                                                        <Doughnut data={item.data} style={{ textAlign: 'center' }} 
                                                                            options = {{
                                                                                legend: {
                                                                                    onClick: (e) => this.newLegendClickHandler(e)
                                                                                }
                                                                            }}
                                                                        />

                                                                    </div>
                                                                    {/* <div style={this.state.tcSummaryTitleStyle}>
                                                                <div>Total</div>
                                                                <div>{item.data.datasets[0].data[0] + item.data.datasets[0].data[1] + item.data.datasets[0].data[2] + item.data.datasets[0].data[3]}</div>
                                                            </div>
                                                            <Doughnut data={item.data} /> */}
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
                                                            {/* <div style={this.state.tcSummaryTitleStyle}>
                                                                <div>Total</div>
                                                                <div>{item.data.datasets[0].data[0] + item.data.datasets[0].data[1] + item.data.datasets[0].data[2] + item.data.datasets[0].data[3]}</div>
                                                            </div> */}
                                                            <Doughnut data={item.data} />
                                                        </div>
                                                        {/* <div className='rp-tc-dougnut-text'>
                                                            {item && item.title}
                                                        </div> */}
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

                {/* <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-rs-hw-support'>Automation Syncup and Meetings</div>
                        <Input readOnly={true} type="textarea" name="risksRedFlags" id="risksRedFlags" rows="5"
                            placeholder="Content..." value={this.props.selectedRelease && this.props.selectedRelease.AutomationSyncUp} />
                    </Col>
                </Row> */}

                {/* {
                    this.state.domainSelected &&
                    <div>
                        <div>
                            <Button style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }} className='rp-any-button' onClick={() => this.setState({ open: !this.state.open })}>{this.state.open ? 'Close' : 'Create Test Case'}</Button>
                        </div>
                        <Collapse isOpen={this.state.open}>
                            <Row style={{ marginLeft: '1rem', marginTop: '0.2rem' }}>
                                <Col xs="12" sm="12" lg="10" className="rp-summary-tables" >
                                    <div className='rp-app-table-header'>
                                        <span className='rp-app-table-title'>Add Test Case</span>
                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.confirmToggle()} >
                                            <i className="fa fa-check-square-o"></i>
                                        </Button>
                                    </div>

                                    <Row>
                                        <Col xs="12" sm="12" md="5" lg="5">
                                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                                <tbody>
                                                    {
                                                        [
                                                            { field: 'Domain', header: 'Domain *', type: 'text' },
                                                            { field: 'SubDomain', header: 'Sub Domain *', type: 'text' },
                                                            { field: 'Setup', header: 'Setup', type: 'text' },
                                                            { field: 'TcID', header: 'Tc ID *', type: 'text', },
                                                            { field: 'TcName', header: 'Tc Name', type: 'text', restrictWidth: false },
                                                            { field: 'Scenario', header: 'Scenario', type: 'text' },
                                                            { field: 'OrchestrationPlatform', header: 'Orchestration Platform', type: 'text' },
                                                            { field: 'Status', header: 'Status', type: 'text' }
                                                        ].map((item, index) => (
                                                            <tr>
                                                                <td className='rp-app-table-key'>{item.header}</td>
                                                                <td>
                                                                    {
                                                                        item.field === 'Domain' &&
                                                                        <td className='rp-app-table-key'>{this.state.domainSelected}</td>
                                                                    }
                                                                    {
                                                                        item.field !== 'Domain' &&
                                                                        <Input
                                                                            type="text"
                                                                            key={index}
                                                                            onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value } })}
                                                                            placeholder={'Add ' + item.header}
                                                                            value={this.state.addTC[item.field]}
                                                                        />
                                                                    }

                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col xs="12" sm="12" md="5" lg="5">
                                            <Table scroll responsive style={{ overflow: 'scroll', }}>
                                                <tbody>
                                                    {
                                                        [

                                                            { field: 'Description', header: 'Description', type: 'text' },
                                                            { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                                            { field: 'Notes', header: 'Notes', type: 'text' },

                                                        ].map((item, index) => (
                                                            <tr>
                                                                <td className='rp-app-table-key'>{item.header}</td>
                                                                <td>
                                                                    <Input
                                                                        type="textarea"
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value } })}
                                                                        placeholder={'Add ' + item.header}
                                                                        value={this.state.addTC[item.field]}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>

                                </Col>
                            </Row>
                        </Collapse>
                    </div>
                } */}
                {/* {
                    this.state.domainSelected &&
                    <Row>
                        <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>

                            <AppTable
                                // onUpdate={(values) => this.updateTestCase(values)}
                                // editOptions={this.props.currentUser && this.props.currentUser.isAdmin ? [TABLE_OPTIONS.ADD] : []}
                                title={`Test cases`}
                                currentUser={this.props.currentUser}
                                fieldAndHeader={[

                                    { field: 'TcID', header: 'Tc ID', type: 'text', },
                                    { field: 'TcName', header: 'Tc Name', type: 'text', restrictWidth: false, },
                                    { field: 'Build', header: 'Build', type: 'text' },
                                    { field: 'Result', header: 'Result', type: 'text' },
                                    // { field: 'Description', header: 'Description', type: 'text', restrictWidth: false },
                                    // { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text', restrictWidth: false },
                                    // { field: 'Notes', header: 'Notes', type: 'text' },
                                    { field: 'Date', header: 'Date', type: 'text' },
                                    { field: 'Domain', header: 'Domain', type: 'text', },
                                    { field: 'SubDomain', header: 'Sub Domain', type: 'text' },
                                ]}
                                data={
                                    this.props.selectedTC
                                }
                                restrictHeight="rp-app-table-medium"
                                addOnTop={true}
                            />

                        </Col>
                    </Row>

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

        // <Pagination>
        //                         <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
        //                         <PaginationItem active>
        //                             <PaginationLink tag="button">1</PaginationLink>
        //                         </PaginationItem>
        //                         <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
        //                         <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
        //                         <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
        //                         <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
        //                     </Pagination>
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












/* <div className="ag-theme-balham" style={{ height: '200px', width: '600px' }}>
                            <AgGridReact
                                columnDefs={[
                                    { field: 'Domain', headerName: 'Domain', sortable: true, filter: true },
                                    { field: 'SubDomain', headerName: 'Sub Domain', sortable: true, filter: true },
                                    { field: 'Setup', headerName: 'Setup', sortable: true, filter: true },
                                    { field: 'TcID', headerName: 'Name', sortable: true, filter: true },
                                    { field: 'TcName', headerName: 'Tc Name', sortable: true, filter: true },
                                    { field: 'Scenario', headerName: 'Scenario', sortable: true, filter: true },
                                    { field: 'Description', headerName: 'Description', sortable: true, filter: true },
                                    { field: 'ExpectedBehaviour', headerName: 'Expected Behaviour', sortable: true, filter: true },
                                    { field: 'Notes', headerName: 'Notes', sortable: true, filter: true },
                                    { field: 'OrchestrationPlatform', headerName: 'Orchestration Platform', sortable: true, filter: true },
                                    { field: 'Status', headerName: 'Status', sortable: true, filter: true }]}
                                rowData={this.props.testcases
                                }
                            >
                            </AgGridReact>
                        </div> */