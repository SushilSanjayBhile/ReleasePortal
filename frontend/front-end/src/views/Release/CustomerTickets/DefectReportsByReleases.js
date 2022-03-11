import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Input, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledPopover, PopoverBody,} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import PendingMajorReleaseByReleases from '../../../components/CustomerBugs/PendingMajorReleaseByReleases';
import PendingPostReleaseByReleases from '../../../components/CustomerBugs/PendingPostReleaseByReleases';
import GraphsByReleases from '../../../components/CustomerBugs/GraphsByReleases';
import  CheckBox  from '../../../components/TestCasesAll/CheckBox';
class DefectReportsByRelease extends Component {
    constructor(props) {
        super(props);
        this.state = {
        pfixVersions: [
            {id: 1, value: "3.2.1-ose", isChecked: true},
            {id: 2, value: "3.3.1", isChecked: true},
            {id: 3, value: "Spek 3.3.1", isChecked: true},],
        fixStr: '',
        graphp : false,
        p1p: false,
        p2p:false,
        }
    }
    componentWillMount(){
        this.showForSelectedRelease()
    }
    callbackFunction = (childData) => {
        switch (childData){
            case 'graphp':
                this.setState({ graphp: true });
                break;
            case 'p1p':
                this.setState({ p1p: true });
                break;
            case 'p2p':
                this.setState({ p2p: true });
                break;
            case 'graphc':
                this.setState({ graphp: false });
                break;
            case 'p1c':
                this.setState({ p1p: false });
                break;
            case 'p2c':
                this.setState({ p2p: false });
                break;
            default:
                break;
        }
    };
    popoverToggleR = () => this.setState({ popoverOpenR: !this.state.popoverOpenR });
    handleAllChecked = (event) => {
        let fixVersions = this.state.pfixVersions
        fixVersions.forEach(columnName => columnName.isChecked = event.target.checked)
        this.setState({pfixVersions: fixVersions})

    }
    handleCheckChieldElement = (event) => {
        let fixVersions = this.state.pfixVersions
        fixVersions.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({pfixVersions: fixVersions})
    }
    showForSelectedRelease(){
        //this.sendData()
        let fixList = []
        this.state.fixStr = ''
        this.state.pfixVersions.forEach(item => {
            if(item.isChecked){
                fixList.push(item.value)
            }
        })
        if(fixList.length == 0){
            alert('Please Select at least one fix version');
        }
        else if(fixList.length == 1 ){
            this.state.fixStr = "\""+fixList[0]+"\""
        }
        else {
            for (let i = 0; i < fixList.length - 1; i++){
                this.state.fixStr = this.state.fixStr + "\""+fixList[i]+"\""+","
            }
            this.state.fixStr =  this.state.fixStr + "\""+fixList[fixList.length - 1]+"\""
        }
     }
     disable(){
        if(this.state.graphp == true || this.state.p1p == true || this.state.p2p == true){
             return true;
         }
         else return false;
     }
    render() {
        return (
            <div>
                {
                    this.props.currentUser &&
                        <div>
                            <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                <Button disabled={this.disable()} id="PopoverAssignR" type="button"><i class="fa fa-check-square-o" aria-hidden="true"></i></Button>
                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssignR" id="PopoverAssignButtonR" toggle={() => this.popoverToggleR()} isOpen={this.state.popoverOpenR}>
                                    <PopoverBody>
                                        <div>
                                            <input type="checkbox" onClick={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
                                            <ul>
                                            {
                                            this.state.pfixVersions.map((columnName) => {
                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElement}  {...columnName} />)
                                            })
                                            }
                                            </ul>
                                            <Button onClick={() => {this.setState({ popoverOpenR: !this.state.popoverOpenR });this.showForSelectedRelease();}}>Set</Button>
                                        </div>
                                    </PopoverBody>
                                </UncontrolledPopover>
                            </div>
                            <br></br>
                            <br></br>
                                {
                                    <PendingMajorReleaseByReleases parentData = {this.state.fixStr} parentCallbackP1 = {this.callbackFunction}/>
                                }
                                {
                                    <PendingPostReleaseByReleases parentData = {this.state.fixStr} parentCallbackP2 = {this.callbackFunction}/>
                                }
                                {
                                    <GraphsByReleases parentData = {this.state.fixStr} parentCallbackG = {this.callbackFunction}/>
                                }
                    </div >
                }
            </div>
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    // selectedTCStatus: state.testcase.status[state.release.current.id],
    // doughnuts: getTCStatusForUIDomains(state, state.release.current.id)
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(DefectReportsByRelease);
