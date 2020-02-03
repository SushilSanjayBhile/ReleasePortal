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

                {/* 
                { key: 'Operating System', value: this.props.selectedRelease.FinalOS },
                                            { key: 'Docker Core RPM Number', value: this.props.selectedRelease.FinalDockerCore },
                                            { key: 'UBoot Number', value: this.props.selectedRelease.UbootVersion },
                                            { key: 'Build Number', value: this.props.selectedRelease.BuildNumber ? this.props.selectedRelease.BuildNumber : '' },
                                            { key: 'Customers', value: this */}
                {/* <Card>
                    <CardHeader>
                        Actual Dates of Release
                                        </CardHeader>
                    <CardBody>
                        <FormGroup row className="my-0">
                            <Col xs="3">
                                <FormGroup>
                                    <Label htmlFor="actualReleaseDate">Release Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="actualReleaseDate" name="actualReleaseDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.ActualReleaseDate} /> :
                                            <Input type="date" id="actualReleaseDate" name="actualReleaseDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ ActualReleaseDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="3">
                                <FormGroup>
                                    <Label htmlFor="actualCodeFreezeDate">Code Freeze Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="actualCodeFreezeDate" name="actualCodeFreezeDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.ActualCodeFreezeDate} /> :
                                            <Input type="date" id="actualCodeFreezeDate" name="actualCodeFreezeDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ ActualCodeFreezeDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="3">
                                <FormGroup>
                                    <Label htmlFor="actualQATestingDate">QA Testing Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="actualQATestingDate" name="actualQATestingDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.QAStartDate} /> :
                                            <Input type="date" id="actualQATestingDate" name="actualQATestingDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ QAStartDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs="3">
                                <FormGroup>
                                    <Label htmlFor="actualUpgradeTestingDate">Upgrade Testing Date</Label>
                                    {
                                        !this.props.isEditing ?
                                            <Input readOnly={true} type="date" id="actualUpgradeTestingDate" name="actualUpgradeTestingDate" placeholder="date" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.UpgradeTestingStartDate} /> :
                                            <Input type="date" id="actualUpgradeTestingDate" name="actualUpgradeTestingDate" placeholder="date" onChange={(e) => this.props.handleUpdate({ UpgradeTestingStartDate: e.target.value })} />
                                    }
                                </FormGroup>
                            </Col>
                        </FormGroup>
                    </CardBody>
                </Card> */}
                {/* <Row>
                    <Col md="6" lg="6">
                        <Label htmlFor="risksRedFlags">Risks/Red Flags</Label>
                        {
                            !this.props.isEditing ?
                                <Input readOnly={true} type="textarea" name="risksRedFlags" id="risksRedFlags" rows="12" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.RedFlagsRisks}
                                    placeholder="Content..." /> :
                                <Input type="textarea" name="risksRedFlags" id="risksRedFlags" rows="5" onChange={(e) => this.props.handleUpdate({ RedFlagsRisks: e.target.value })}
                                    placeholder="Content..." />

                        }
                    </Col>
                    <Col md="6" lg="6">
                        <Label htmlFor="AutomationSyncUp">Automation Sync Up</Label>
                        {
                            !this.props.isEditing ?
                                <Input readOnly={true} type="textarea" name="AutomationSyncUp" id="AutomationSyncUp" rows="12" value={this.props.basicReleaseInfo && this.props.basicReleaseInfo.AutomationSyncUp}
                                    placeholder="Content..." /> :
                                <Input type="textarea" name="AutomationSyncUp" id="AutomationSyncUp" rows="5" onChange={(e) => this.props.handleUpdate({ AutomationSyncUp: e.target.value })}
                                    placeholder="Content..." />

                        }
                    </Col>

                </Row> */}
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
