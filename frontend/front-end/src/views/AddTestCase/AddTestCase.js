// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Label, Button, FormGroup, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../reducers/release.reducer';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../actions';
// import './AddTestCase.scss'
class AddTestCase extends Component {
    // "TcID": "PVC_Mirrored-3.3",
    // "TcName": "MirroringStaticProvisioning.RebootAllNodes",
    // "Domain": "StoragePVC",
    // "SubDomain": "Mirrored",
    // "Scenario": "Reboot Tests",
    // "Description": "Create fio pods with pvcs for mirrored volumes. Reboot all nodes.",
    // "ExpectedBehaviour": "After rebooting the nodes,\nPod should go into running state and\nvolumes should go into attached state",
    // "Notes": "NOTES NOT PROVIDED",
    // "Setup": [
    //   "BOS",
    //   "NYNJ",
    //   "OS"
    // ],
    // "OrchestrationPlatform": [
    //   "dcx-k8s",
    //   "dcx-k8s",
    //   "oc-k8s"
    // ],
    // "Status": "UNDERWORK"

    // Bugs: "-1"
    // Build: "9.9.1 (151)"
    // Date: "2019-12-13"
    // Result: "Pass"
    // TcID: "PVC_Mirrored-3.0"
    // id: 288
    constructor(props) {
        super(props);
        this.state = {
            fields: [
                "Domain",
                "SubDomain",
                "Setup",
                "TcID",
                "TcName",

                // "TcID",
                // "TcName",
                // "Domain",
                // "SubDomain",
                "Scenario",
                "Description",
                "ExpectedBehaviour",
                "Notes",

                // "Setup",
                "OrchestrationPlatform",

                "Status"
            ],
            addTC: {}
        }
    }
    componentDidMount() {

    }
    toggle = () => this.setState({ modal: !this.state.modal });
    save() {
        let data = this.state.values
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
        console.log('saved data ', data);
        axios.post(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                alert('success');
                this.props.saveSingleTestCase({ id: this.props.selectedRelease.ReleaseNumber, data: data });
                // this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
                this.setState({ isEditing: false });
            }, error => {
                alert('error in updating');
            });
        if (this.state.modal) {
            this.toggle();
        }

    }

    render() {
        let style = {
            textUnderline: true,
            color: 'blue'
        }
        return (
            <div>

                <Row className="rp-summary-tables" style={{ marginLeft: '1rem', marginTop: '0rem' }}>
                    <div>
                        <span className='rp-app-table-title'>Add Test Case</span>
                    </div>

                    <Col xs="12" sm="12" md="12" lg="12">
                        <Row style={{ marginTop: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
                            <Col xs="12" sm="12" md="12" lg="12" style={{ marginRight: '1rem', marginLeft: '1rem' }}>
                                Release Number:  {this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber}
                            </Col>
                        </Row>
                        <Row>
                            {
                                [
                                    { field: 'Domain', header: 'Domain', type: 'text', },
                                    { field: 'SubDomain', header: 'Sub Domain', type: 'text' },
                                    { field: 'Setup', header: 'Setup', type: 'text' },
                                    { field: 'TcID', header: 'Tc ID', type: 'text', },
                                    { field: 'TcName', header: 'Tc Name', type: 'text', restrictWidth: false },
                                    { field: 'Scenario', header: 'Scenario', type: 'text' },
                                    { field: 'Description', header: 'Description', type: 'text' },
                                    { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                    { field: 'Notes', header: 'Notes', type: 'text' },
                                    { field: 'OrchestrationPlatform', header: 'Orchestration Platform', type: 'text' },
                                    { field: 'Status', header: 'Status', type: 'text' }
                                ].map((item, index) => (

                                    <Col xs="12" lg="3">
                                        <FormGroup>
                                            <Label htmlFor={item.header}>{item.header}</Label>
                                            {
                                                <Input type="text" id={item.header} name={item.header} onChange={(e) => this.setState({ values: { ...this.state.values, [item.field]: e.target.value } })} />
                                            }
                                        </FormGroup>
                                    </Col>

                                )
                                )
                            }
                        </Row>
                        {/* <Col xs="12" sm="12" md="5" lg="5" style={{ marginRight: '1rem', marginLeft: '1rem' }}>
                                            {item.header}
                                        </Col>
                                        <Col xs="12" sm="12" md="5" lg="5">
                                            <Input
                                                type="text"
                                                key={index}
                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value } })}
                                                placeholder={'Add ' + item.header}
                                                value={this.state.addTC[item.field]}
                                            />
                                        </Col> */}


                        {/* <AppTable
                            onUpdate={(values) => this.updateTestCase(values)}
                            onlyAdd={true}
                            title={`Test cases`}
                            currentUser={this.props.currentUser}
                            fieldAndHeader={[
                                { field: 'Domain', header: 'Domain', type: 'text', },
                                { field: 'SubDomain', header: 'Sub Domain', type: 'text' },
                                { field: 'Setup', header: 'Setup', type: 'text' },
                                { field: 'TcID', header: 'Tc ID', type: 'text', },
                                { field: 'TcName', header: 'Tc Name', type: 'text', restrictWidth: false },
                                { field: 'Scenario', header: 'Scenario', type: 'text' },
                                { field: 'Description', header: 'Description', type: 'text' },
                                { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                { field: 'Notes', header: 'Notes', type: 'text' },
                                { field: 'OrchestrationPlatform', header: 'Orchestration Platform', type: 'text' },
                                { field: 'Status', header: 'Status', type: 'text' }
                            ]}
                            restrictHeight="rp-app-table-medium"
                            addOnTop={true}
                        /> */}
                    </Col>
                    <div className="form-actions">
                        <Button color="primary" onClick={() => this.toggle()}>Save changes</Button>
                    </div>
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
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(AddTestCase);