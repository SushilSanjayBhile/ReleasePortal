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
class GUIReleaseTestCase extends Component {
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
        
            guimetricsOpen:false,
        
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
            
            
            // this.props.history.push('/release/summary');
        }
    }
    componentDidMount() {
        this.setState({ metricsOpen: true })
        this.setState({ guimetricsOpen: true })
        
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
        console.log('clicked node',node);
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

                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'marginLeft': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ guimetricsOpen: !this.state.guimetricsOpen })}>
                                    <div class='row'>
                                        <div class='col-md-6 col-lg-6'>
                                            {
                                                !this.state.guimetricsOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.guimetricsOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }

                                            <div className='rp-icon-button'><i className="fa fa-area-chart"></i></div>
                                            <span className='rp-app-table-title'>GUI Test Case Status</span>
                                
                                        </div>
                                    </div>
                        </div>
                        <Collapse isOpen={this.state.guimetricsOpen}>
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
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(GUIReleaseTestCase);

