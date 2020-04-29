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
import { alldomains, getTCStatusForSunburst } from '../../../reducers/release.reducer';
import { TABLE_OPTIONS } from '../../../constants';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveSingleFeature } from '../../../actions';
import './ReleaseStatus.scss'
// import sunburst from '../../../reducers/domains.js'
import Sunburst from '../components/Sunburst';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
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
            graphsOpen: false
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
    }
    componentDidMount() {
        this.initialize();
    }
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.history.push('/release/summary')
            // this.initialize();
        }
    }

    getFeatureDetails(dws) {
        axios.post('/rest/featuredetail', { data: dws }).then(res => {
            this.props.saveSingleFeature({ data: res.data });
        }, err => {

        })
    }
    render() {
        let featuresCount = 0;
        let statusScenarios = { Open: { total: 0 }, Resolved: { total: 0 } };
        if (this.props.feature && this.props.feature.issues) {
            featuresCount = this.props.feature.issues.length;
            this.props.feature.issues.forEach(item => {
                if (statusScenarios[item.fields.status.name]) {
                    statusScenarios[item.fields.status.name].total += 1;
                } else {
                    statusScenarios[item.fields.status.name] = { total: 1 }
                }
            })
        }
        return (
            <div>
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
                                        {
                                            this.props.bug && Object.keys(this.props.bug.bugCount.all).map(item =>
                                                <div class='col-md-2'>
                                                    <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }}>
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
                        <Collapse isOpen={this.state.bugOpen}>
                            <Row style={
                                {
                                    marginRight: '0',
                                    marginLeft: '0'
                                }
                            }>
                                <Col xs="12" sm="12" md="12" lg="12">
                                    {/* <div class='row' style={
                                        {

                                            borderStyle: 'solid',
                                            borderWidth: '2px 0px 0px 0px',
                                            paddingTop: '11px',
                                            borderTop: '1px solid #c8ced3'
                                        }
                                    }>
                                        <div class='col-md-1 rp-app-table-title' style={{ marginLeft: '1rem' }}>Priority</div>
                                        {
                                            this.props.bug && Object.keys(this.props.bug.bugCount.category).map(item =>
                                                // <Badge className={`rp-priority-${item}-status-badge`}>
                                                //     <span>{item} : </span>
                                                //     <span>{this.props.bug.bugCount.category[item].total}</span>
                                                // </Badge>
                                                <div class='col-md-1'>
                                                    <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }}>
                                                        <small class="text-muted">{item}</small><br></br>
                                                        <strong class="h5">{this.props.bug.bugCount.category[item].total}</strong>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div> */}
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
                                                    this.props.bug.bug.issues.map(item => {
                                                        console.log('item here')
                                                        console.log(item);
                                                        return (
                                                            <tr style={{ cursor: 'pointer' }}>
                                                                <td style={{ width: '250px' }} className='rp-app-table-key'><span onClick={() => window.open(`https://diamanti.atlassian.net/browse/${item.key}`)}>{item.key}</span></td>
                                                                <td>{item.fields.summary}</td>
                                                                {/* <td><Badge className={`rp-bug-${item.fields.status.name}-status-badge`}>{item.fields.status.name}</Badge></td> */}
                                                                <td style={{width:'250px'}}> <div className={`c-callout c-callout-${item.fields.status.name.toLowerCase()} rp-new-badge`}>
                                                                    <strong class="h5">{item.fields.status.name}</strong>
                                                                </div></td>
                                                                {/* <td><Badge className={`rp-priority-${item.fields.status.name}-status-badge`}>{item.fields.status.name}</Badge></td> */}
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
                                            Object.keys(statusScenarios).map(item =>
                                                <div class="col-sm-2">
                                                    <div className={`c-callout c-callout-${item.toLowerCase()}`} style={{ marginTop: '0', marginBottom: '0' }}>
                                                        <small class="text-muted">{item.toUpperCase()}</small><br></br>
                                                        <strong class="h4">{statusScenarios[item].total}</strong>
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
                                        this.props.singleFeature && !this.props.singleFeature.fields
                                        && loading()

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



                {/* <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ graphsOpen: !this.state.graphsOpen })}>
                            {
                                !this.state.graphsOpen &&
                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                            }
                            {
                                this.state.graphsOpen &&
                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                            }
                            <span className='rp-app-table-title'>Statistics</span>
                        </div>
                        <Collapse isOpen={this.state.graphsOpen}>
                            <Row>
                                <Col xs="11" sm="11" md="11" lg="8">
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem', overflowY: 'scroll', maxHeight: '30rem' }}>

                                    </div>
                                </Col>
                                <Col xs="11" sm="11" md="11" lg="4">
                                </Col>
                            </Row>
                        </Collapse>
                    </Col>
                </Row> */}

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








