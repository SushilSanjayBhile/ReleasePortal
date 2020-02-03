import React, { Component } from 'react';
import axios from 'axios';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Fade,
    Form,
    FormGroup,
    FormText,
    FormFeedback,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    InputGroupText,
    Label,
    Row,
    Modal, ModalHeader, ModalBody, ModalFooter,
    Table
} from 'reactstrap';
import { connect } from 'react-redux';
import { saveReleaseBasicInfo, deleteRelease, releaseChange } from '../../actions';
import BasicReleaseInfo from './components/BasicReleaseInfo';
import './ManageRelease.scss';
import { api } from '../../utils/API.utils';

class ManageRelease extends Component {
    constructor(props) {
        super(props);
        this.state = {
            release: this.props.allReleases[0] ? this.props.allReleases[0].ReleaseNumber : '',
            updatedValues: {},
            basic: { editing: false, updated: {}, open: false },
        }
        if (!this.props.currentUser || (this.props.currentUser && !this.props.currentUser.isAdmin)) {
            this.props.history.push('/');
        }
    }
    reset() {
        this.setState({
            release: this.props.allReleases[0] ? this.props.allReleases[0].ReleaseNumber : '',
            updatedValues: {},
            basic: { editing: false, updated: {}, open: false },
        })
    }
    delete() {
        axios.delete(`/api/release/${this.state.release}`)
            .then(res => {
                alert(`successfully deleted ${this.state.release}`);
                this.props.deleteRelease({ id: this.state.release });
            }, error => {
                alert('error deleting release');
            });
        this.delToggle();
    }
    // save() {
    //     let data = { ...this.state.updatedValues }
    //     console.log('saved data ', data);
    //     // axios.post(`/api/release`, { ...data })
    //     //     .then(res => {
    //     //         alert('success');
    //     //         this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
    //     //         this.reset();
    //     //     }, error => {
    //     //         alert('error adding new release');
    //     //     });
    //     if (this.state.modal) {
    //         this.toggle();
    //     }
    //     if (this.state.momModal) {
    //         this.momToggle();
    //     }
    // }
    // save() {
    //     let data = { ...this.state.updatedValues }
    //     let dates = [
    //         'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
    //         'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
    //     ]
    //     let formattedDates = {};
    //     dates.forEach(item => {
    //         if (data[item]) {
    //             let date = new Date(data[item]);
    //             formattedDates[item] = date.toISOString()
    //         }
    //     })
    //     data = { ...data, ...formattedDates };
    //     console.log('saved data ', data);
    //     axios.post(`/api/release`, { ...data })
    //         .then(res => {
    //             alert('success');
    //             this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
    //             this.setState({ isEditing: false });
    //         }, error => {
    //             alert('error in updating');
    //         });
    //     if (this.state.modal) {
    //         this.toggle();
    //     }
    //     if (this.state.momModal) {
    //         this.momToggle();
    //     }
    // }
    confirm() {
        this.save();
    }
    confirmToggle() {
        let data = { ...this.props.selectedRelease, ...this.state.basic.updated }
        if (!data || (data && !data.ReleaseNumber)) {
            alert('Please Add Release Number');
            return;
        }
        this.toggle();
    }
    save() {
        let data = { ...this.props.selectedRelease, ...this.state.basic.updated }
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};
        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]).toISOString().split('T');
                formattedDates[item] = `${date[0]} ${date[1].substring(0, date[1].length-1)}`;
            }
        });
        data = { ...data, ...formattedDates };
        let arrays = [
            'ServerType', 'CardType', 'BuildNumberList', 'SetupsUsed', 'UpgradeMetrics', 'Customers', 'Engineers',
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
        console.log('priority ')
        data = { ...data, ...formattedArrays };
        if (isNaN(data.QARateOfProgress)) {
            data.QARateOfProgress = 0;
        } else {
            data.QARateOfProgress = parseInt(data.QARateOfProgress);
        }
        if (!data.QARateOfProgress) {
            data.QARateOfProgress = 0;
        }
        axios.post(`/api/release`, { ...data })
            .then(single => {
                alert('successfully added the release');
                this.props.history.push('/release/summary');
                axios.get(`/api/release/all`)
                    .then(res => {
                        
                        res.data.forEach(item => {
                            // this.props.updateNavBar({ id: item.ReleaseNumber });

                            this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
                        });
                        this.props.releaseChange({ id: data.ReleaseNumber })
                        // if (res.data[res.data.length - 1]) {
                        //     this.props.releaseChange({ id: res.data[res.data.length - 1].ReleaseNumber });
                        // }
                       
                        this.reset();
                    }, error => {
                    });
            }, error => {
                alert('error in updating');
            });
        if (this.state.modal) {
            this.toggle();
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    delToggle = () => this.setState({ delModal: !this.state.delModal });
    render() {
        return (
            (
                <div style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    <Row>
                        <Col xs="4">
                            <FormGroup>
                                <Label htmlFor="selectRelease">Release</Label>
                                <Input onChange={(e) => this.setState({ release: e.target.value })} type="select" name="selectRelease" id="selectRelease">
                                    {
                                        this.props.allReleases.map(release => <option value={release.ReleaseNumber}>{release.ReleaseNumber}</option>)
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col xs="4">
                            <Button onClick={() => this.delToggle()} size="sm" color="danger" className="rp-mr-del-button"><i className="fa fa-ban" style={{
                                'color': 'white',
                                'marginRight': '0.5rem'
                            }}></i> Delete</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" sm="12" lg="10" className="rp-summary-tables" style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                            <div className='rp-app-table-header'>
                                <span className='rp-app-table-title'>Add Release</span>
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
                                                    { key: 'Release Number', value: '', field: 'ReleaseNumber' },
                                                    { key: 'Operating System', value: '', field: 'FinalOS' },
                                                    { key: 'Docker Core RPM Number', value: '', field: 'FinalDockerCore' },
                                                    { key: 'Build Number', field: 'BuildNumber', value: '' },

                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>

                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>


                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                    <div className='rp-rs-hw-support'>Hardware Support</div>
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'Server Type', field: 'ServerType', value: '' },
                                                    { key: 'Card Type', field: 'CardType', value: '' },
                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>
                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>
                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col xs="12" sm="12" md="5" lg="5">
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'UBoot Number', value: '', field: 'UbootVersion' },
                                                    { key: 'Customers', field: 'Customers', value: '' },
                                                    { key: 'Target Date', field: 'TargetedReleaseDate', value: '', type: 'date' },

                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <React.Fragment>
                                                                <td className='rp-app-table-key'>{item.key}</td>

                                                                <td>
                                                                    <Input
                                                                        type={item.type ? item.type : 'text'}
                                                                        key={index}
                                                                        onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, [item.field]: e.target.value } } })}
                                                                        placeholder={'Add ' + item.key}
                                                                        value={this.state.basic.updated[item.field]}
                                                                    />
                                                                </td>


                                                            </React.Fragment>

                                                        </tr>
                                                    )
                                                })
                                            }
                                            {/* <tr>
                                                <React.Fragment>
                                                    <td className='rp-app-table-key'>Priority</td>

                                                    <td>
                                                        <Input type="select" id="Priority" name="Priority" value={this.state.basic.updated.Priority}
                                                            onChange={(e) => this.setState({ basic: { ...this.state.basic, updated: { ...this.state.basic.updated, Priority: e.target.value } } })}>
                                                            <option value=''>Select Priority</option>
                                                            {

                                                                ['P0','P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map(item =>
                                                                    <option value={item}>{item}</option>
                                                                )
                                                            }
                                                        </Input>
                                                    </td>


                                                </React.Fragment>

                                            </tr> */}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            {/* <Card>
                                <CardHeader>
                                    <strong>Add New Release</strong>
                                </CardHeader>
                                <CardBody>
                                    <FormGroup>
                                        <Label htmlFor="release">Release</Label>
                                        <Input type="text" id="release" placeholder="Enter Release Name" value={this.state.updatedValues.ReleaseNumber} onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, ReleaseNumber: e.target.value } })} />
                                    </FormGroup>
                                    <BasicReleaseInfo id={this.props.id} isEditing={true} handleUpdate={(value) => this.setState({ updatedValues: { ...this.state.updatedValues, ...value } })} />
                                </CardBody>
                                <CardFooter>
                                    <div className="form-actions">
                                        <Button color="primary" onClick={() => this.toggle()}>Save changes</Button>
                                    </div>
                                </CardFooter>
                            </Card> */}
                        </Col>
                    </Row>
                    <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                        <ModalHeader toggle={() => this.toggle()}>Confirmation</ModalHeader>
                        <ModalBody>
                            Are you sure you want to make the changes?
                    </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.confirm()}>Ok</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.delModal} toggle={() => this.delToggle()}>
                        <ModalHeader toggle={() => this.delToggle()}>Confirmation</ModalHeader>
                        <ModalBody>
                            {`Are you sure you want to delete release ${this.state.release}?`}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.delete()}>Delete</Button>{' '}
                            <Button color="secondary" onClick={() => this.delToggle()}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </div >
            )
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    allReleases: state.release.all
})

export default connect(mapStateToProps, { saveReleaseBasicInfo, deleteRelease, releaseChange })(ManageRelease);