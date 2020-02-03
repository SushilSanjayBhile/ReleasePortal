
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
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
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { saveReleaseBasicInfo } from '../../../actions';
class ReleaseFinalInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            updatedValues: {}
        }
    }
    componentDidMount() {
        this.reset();
    }
    reset() {
        this.setState({
            isEditing: false,
            updatedValues: {}
        });
    }
    save() {
        let data = { ...this.props.releaseInfo, ...this.state.updatedValues }
        console.log('saved data ', data);
        axios.post(`api/release/${this.props.releaseInfo.ReleaseNumber}`, { data })
            .then(res => {
                this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
                this.setState({ isEditing: false });
            }, error => {
                console.log('error');
                this.props.saveReleaseBasicInfo({ id: data.ReleaseNumber, data: data });
                this.setState({ isEditing: false });
            });
        if (this.state.modal) {
            this.toggle();
        }
        if (this.state.momModal) {
            this.momToggle();
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    render() {
        return (
            (
                <div>
                    <Row>
                        <Col xs="12" sm="12" lg="12">
                            <Card>
                                <CardHeader>
                                    <strong>Final Release Information</strong>
                                    {
                                        this.props.currentUser && this.props.currentUser.isAdmin ?
                                            this.state.isEditing ?
                                                <Fragment>
                                                    <Button size="sm" color="primary" className="float-right" onClick={() => this.reset()} >Reset</Button>
                                                    <Button size="sm" color="primary" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >Save</Button>
                                                </Fragment>
                                                :
                                                <Button size="sm" color="primary" className="float-right" onClick={() => this.setState({ isEditing: true })}  >Edit</Button>
                                            : null
                                    }
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <Col sm="3">
                                            <FormGroup>
                                                <Label htmlFor="finalReleaseBuildNo">Build Number</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <Input readOnly={true} type="text" id="finalReleaseBuildNo" name="finalReleaseBuildNo" placeholder="Enter Build Number" value={this.props.releaseInfo && this.props.releaseInfo.FinalBuild} /> :
                                                        <Input type="text" id="finalReleaseBuildNo" name="finalReleaseBuildNo" placeholder="Enter Build Number" onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, FinalBuild: e.target.value } })} />
                                                }
                                            </FormGroup>
                                        </Col>
                                        <Col sm="3">
                                            <FormGroup>
                                                <Label htmlFor="FinalOS">Operating System</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <Input readOnly={true} type="text" id="FinalOS" name="FinalOS" placeholder="Enter Operating System" value={this.props.releaseInfo && this.props.releaseInfo.FinalOS} /> :
                                                        <Input type="text" id="FinalOS" name="FinalOS" placeholder="Enter Operating System" onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, FinalOS: e.target.value } })} />
                                                }
                                            </FormGroup>
                                        </Col>
                                        <Col sm="3">
                                            <FormGroup>
                                                <Label htmlFor="FinalDockerCore">Docker Core RPM Number</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <Input readOnly={true} type="text" id="FinalDockerCore" name="FinalDockerCore" placeholder="Enter Docker Core RPM" value={this.props.releaseInfo && this.props.releaseInfo.FinalDockerCore} /> :
                                                        <Input type="text" id="FinalDockerCore" name="FinalDockerCore" placeholder="Enter Docker Core RPM" onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, FinalDockerCore: e.target.value } })} />
                                                }
                                            </FormGroup>
                                        </Col>
                                        <Col sm="3">
                                            <FormGroup>
                                                <Label htmlFor="finalUbootNumber">UBoot Number</Label>
                                                {
                                                    !this.state.isEditing ?
                                                        <Input readOnly={true} type="text" id="UbootVersion" name="UbootVersion" placeholder="Enter UBoot Number" value={this.props.releaseInfo && this.props.releaseInfo.UbootVersion} /> :
                                                        <Input type="text" id="UbootVersion" name="UbootVersion" placeholder="Enter UBoot Number" onChange={(e) => this.setState({ updatedValues: { ...this.state.updatedValues, UbootVersion: e.target.value } })} />
                                                }
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
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
                </div>
            )
        )
    }
}
// Final release build number
// OS for Final release build number
// Final release Docker core rpm number
// U-boot version
// Start date
// release date


const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    releaseInfo: state.release.all.filter(item => {
        if (item.ReleaseNumber === ownProps.id) {
            return true;
        } else {
            return false;
        }
    })[0] //.filter(item => item.name === ownProps.match.params.id)
})
export default connect(mapStateToProps, { saveReleaseBasicInfo })(ReleaseFinalInfo);