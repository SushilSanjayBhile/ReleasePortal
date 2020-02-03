// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label
} from 'reactstrap';
import { connect } from 'react-redux';
class ReleaseHardwareAndSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newHardware: [],
            newSetup: []
        }
    }
    reset() {
        this.setState({
            isEditing: false,
            updatedHardware: {},
            updatedSetup: {},
        });
    }
    save() {
        // if(this.props.releaseInfo.HardwareSupport && this.props.releaseInfo.HardwareSupport.length) {
        //     this.props.releaseInfo.HardwareSupport.forEach(item => {

        //     })
        // }
        let data = { ...this.props.basicReleaseInfo }
        console.log('saved data ', data);
        axios.post(`api/release/${this.props.basicReleaseInfo.ReleaseNumber}`, { data })
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
    add = () => {
        this.setState({ newHardware: [...this.state.newHardware, ''] })
    }
    update = (id, value) => {

    }
    remove = (id) => {
        let newHardware = this.state.newHardware.splice(id, 1);
        this.setState({ newHardware: [...this.state.newHardware] });
    }
    render() {
        return (
            <div>
                <Row>
                    <Col xs="12" lg="6">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-align-justify"></i> Hardware Support
                                {/* {
                                    
                                    this.props.currentUser && this.props.currentUser.isAdmin ?
                                        this.state.isEditing ?
                                            <Fragment>
                                                <Button size="sm" color="primary" className="float-right" onClick={() => this.reset()} >Reset</Button>
                                                <Button size="sm" color="primary" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >Save</Button>
                                            </Fragment>
                                            :
                                            <Button size="sm" color="primary" className="float-right" onClick={() => this.setState({ isEditing: true })} >Edit</Button>
                                        : null
                                } */}
                            </CardHeader>
                            <CardBody>
                                {
                                    this.props.currentUser && this.props.currentUser.isAdmin && this.state.isEditing ?
                                        <Fragment>
                                            <Row>
                                                <Col xs="4">
                                                    <FormGroup>
                                                        <Label htmlFor="deleteHw">Delete Hardware</Label>
                                                        <Input onChange={(e) => this.setState({ deleteHardwares: e.target.value })} type="select" name="selectRelease" id="selectRelease" multiple>
                                                            {
                                                                this.props.releaseInfo.HardwareSupport && this.props.releaseInfo.HardwareSupport.map(item => <option value={item}>{item}</option>)
                                                            }
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col xs="8">

                                                    <Input disabled={true} type="text" name="hw" id="hw" placeholder='No hardware selected' values={this.state.deleteHardwares}>
                                                        {
                                                            this.props.releaseInfo.HardwareSupport && this.props.releaseInfo.HardwareSupport.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="12">
                                                    <Button size="sm" color="primary" className="float-right" onClick={() => this.add()} >Add</Button>
                                                </Col>
                                            </Row>
                                            {
                                                this.state.newHardware.map((item, index) => {
                                                    return (
                                                        <Row>
                                                            <Col xs="8">
                                                                <Input type="text" onChange={(e) => { this.setState() }} />
                                                            </Col>
                                                            <Col xs="4">
                                                                <Button size="sm" color="primary" className="float-right" onClick={() => this.remove(index)} >Remove</Button>
                                                            </Col>
                                                        </Row>
                                                    )
                                                })

                                            }

                                        </Fragment>
                                        : null
                                }
                                {

                                }
                                <Table responsive striped>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Date Registered</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.props.releaseInfo.HardwareSupport && this.props.releaseInfo.HardwareSupport.map((item, index) => {
                                                if (this.state.isEditing) {
                                                    return (
                                                        <tr>
                                                            <td>
                                                                <Input type="text" key={index} onChange={(e) => this.setState({ updatedHardware: { ...this.state.updatedHardware, [item]: e.target.value } })}
                                                                    placeholder={item} />
                                                            </td>
                                                            <td>2019/01/01</td>
                                                            <td>
                                                                <Badge color="success">Active</Badge>
                                                            </td>
                                                        </tr>
                                                    )
                                                } else {
                                                    return (
                                                        <tr>
                                                            <td>{item}</td>
                                                            <td>2019/01/01</td>
                                                            <td>
                                                                <Badge color="success">Active</Badge>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            })
                                        }
                                    </tbody>
                                </Table>
                                <Pagination>
                                    <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                                    <PaginationItem active>
                                        <PaginationLink tag="button">1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                                </Pagination>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs="12" lg="6">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-align-justify"></i> Setups Used
                                {/* <Button size="sm" color="primary" className="float-right">Edit</Button> */}
                            </CardHeader>
                            <CardBody>
                                <Table responsive striped>
                                    <thead>
                                        <tr>
                                            <th>Number</th>
                                            <th>Date Registered</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.props.releaseInfo.SetupsUsed && this.props.releaseInfo.SetupsUsed.map(item => {
                                                return (
                                                    <tr>
                                                        <td>{item}</td>
                                                        <td>2019/01/01</td>
                                                        <td>
                                                            <Badge color="success">Success</Badge>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                <Pagination>
                                    <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                                    <PaginationItem active>
                                        <PaginationLink tag="button">1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                                    <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                                </Pagination>
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
    }
}
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
export default connect(mapStateToProps, {})(ReleaseHardwareAndSetup);