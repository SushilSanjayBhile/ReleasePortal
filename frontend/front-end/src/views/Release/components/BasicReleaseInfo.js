import React, { Component } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import { connect } from 'react-redux';

class BasicReleaseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        return (
            <div>
                <Card>
                    <CardHeader>
                        Target Dates of Release
                </CardHeader>
                    <CardBody>
                        <FormGroup row className="my-0">
                            <Col xs="12" lg="3">
                                <FormGroup>
                                    <Label htmlFor="targetReleaseDate">Release Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="targetReleaseDate" name="targetReleaseDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.TargetedReleaseDate} /> :
                                            <Input type="date" id="targetReleaseDate" name="targetReleaseDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ TargetedReleaseDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="12" lg="3">
                                <FormGroup>
                                    <Label htmlFor="targetCodeFreezeDate">Code Freeze Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="targetCodeFreezeDate" name="targetCodeFreezeDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.TargetedCodeFreezeDate} /> :
                                            <Input type="date" id="targetCodeFreezeDate" name="targetCodeFreezeDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ TargetedCodeFreezeDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="12" lg="3">
                                <FormGroup>
                                    <Label htmlFor="targetQATestingDate">QA Testing Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="targetQATestingDate" name="targetQATestingDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.TargetedQATestingDate} /> :
                                            <Input type="date" id="targetQATestingDate" name="targetQATestingDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ TargetedQATestingDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="12" lg="3">
                                <FormGroup>
                                    <Label htmlFor="targetUpgradeTestingDate">Upgrade Testing Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="targetUpgradeTestingDate" name="targetUpgradeTestingDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.TargetedUpgradeTestingDate} /> :
                                            <Input type="date" id="targetUpgradeTestingDate" name="targetUpgradeTestingDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ TargetedUpgradeTestingDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                        </FormGroup>
                    </CardBody>
                </Card>
                <div>
                    <Row>
                        <Col xs="12" lg="3">
                            <FormGroup>
                                <Label htmlFor="Operating System">Operating System</Label>
                                {
                                    <Input type="text" id="Operating" name="Operating" onChange={(e) => this.props.handleUpdate({ FinalOS: e.target.value })} />
                                }
                            </FormGroup>
                        </Col>
                        <Col xs="12" lg="3">
                            <FormGroup>
                                <Label htmlFor="UBoot Number">UBoot Number</Label>
                                {

                                    <Input type="text" id="UbootVersion" name="UbootVersion" onChange={(e) => this.props.handleUpdate({ UbootVersion: e.target.value })} />
                                }
                            </FormGroup>
                        </Col>
                        <Col xs="12" lg="3">
                            <FormGroup>
                                <Label htmlFor="Docker Core RPM Number">Docker Core RPM Number</Label>
                                {

                                    <Input type="text" id="FinalDockerCore" name="FinalDockerCore" onChange={(e) => this.props.handleUpdate({ FinalDockerCore: e.target.value })} />
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    basicReleaseInfo: state.release.all.filter(item => {
        if (item.ReleaseNumber === ownProps.id) {
            return true;
        } else {
            return false;
        }
    })[0] //.filter(item => item.name === ownProps.match.params.id)
})

export default connect(mapStateToProps, {})(BasicReleaseInfo);
