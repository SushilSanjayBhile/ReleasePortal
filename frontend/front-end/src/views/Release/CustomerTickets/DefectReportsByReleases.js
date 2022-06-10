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
import './popover.scss';
class DefectReportsByRelease extends Component {
    constructor(props) {
        super(props);
        this.state = {
        pfixVersions: [],
        updateDisable: false,
        fixStr: '',
        graphp : false,
        loading : true,
        p1p: false,
        p2p:false,
        }
    }
    componentWillMount(){
        let promise = [];
        let tempv = {};
        promise.push(axios.get(`/api/fixVersionsGetPut`).then(all => {
            all.data.fixVList.forEach(ele => {
                tempv[ele] = ''
            })
        }))
        Promise.all(promise).then(result => {
            axios.get(`/rest/jira/bugdata`).then(all => {
                let temp = all.data.rows
                let fixv = []
                temp.forEach(item => {
                    if(item.cells.length > 0){
                        let match = item.cells[0]['markup'].match(/\d/g)
                        if(match != null && match.length > 1 && match[0] >= 3 && match[1] >= 2){
                            if(tempv[item.cells[0]['markup']] == ''){
                                fixv.push({value: item.cells[0]['markup'], isChecked: true})
                            }
                            else{
                                fixv.push({value: item.cells[0]['markup'], isChecked: false})
                            }
                        }
                    }
                })
                let templist = [],nameList = [];
                let set = new Set();
                fixv.forEach(ele => {
                    set.add(ele.value)
                })
                nameList = [...set]
                nameList.sort()
                nameList.forEach(ele => {
                    fixv.some(item => {
                        if(item.value == ele){
                            templist.push(item)
                            return true;
                        }
                    })
                })
                this.setState({pfixVersions: templist},() => { this.setState({loading: false});this.showForSelectedRelease();})
            })
        })
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
     updateInDatabase(){
        this.setState({updateDisable: true})
        let fixList = []
        this.state.pfixVersions.forEach(item => {
            if(item.isChecked){
                fixList.push(item.value)
            }
        })
        if(fixList.length == 0){
            alert('Please Select at least one fix version');
            this.setState({updateDisable: false})
        }
        else{
            let formData = {
                "fixVList": this.state.pfixVersions,
                }
                let url = `/api/fixVersionsGetPut`;
                this.setState({updateDisable: false})
                axios.put(url,formData)
                .then(response=>{
                    alert("Updated successfully");
                    this.setState({updateDisable: false})
                })
                .catch(err=>{
                    console.log("err",err);
                    this.setState({updateDisable: false})
                })
        }
     }
     disable(){
        if(this.state.graphp == true || this.state.p1p == true || this.state.p2p == true){
             return true;
         }
         else return false;
     }
    render() {
        if(this.state.loading == false){
            return (
                <div>
                    {
                        this.props.currentUser &&
                            <div>
                                {/* <div style={{ marginTop: '0.5rem', right: '1.5rem' }}> */}
                                <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '20rem' }}>
                                    <Button disabled={this.disable()} id="PopoverAssignR" type="button"><i class="fa fa-check-square-o" aria-hidden="true"></i></Button>
                                    <UncontrolledPopover className="popover-container" trigger="legacy" placement="bottom" target="PopoverAssignR" id="PopoverAssignButtonR" toggle={() => this.popoverToggleR()} isOpen={this.state.popoverOpenR}>
                                        <PopoverBody>
                                            <div>
                                                <input type="checkbox" onClick={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
                                                <ul style={{columns: 5, width: '700px'}}>
                                                {/* <ul> */}
                                                {
                                                this.state.pfixVersions.map((columnName) => {
                                                    return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElement}  {...columnName} />)
                                                })
                                                }
                                                </ul>
                                                <Button onClick={() => {this.setState({ popoverOpenR: !this.state.popoverOpenR});this.showForSelectedRelease();}}>Set</Button>
                                                &nbsp;&nbsp;
                                                <Button disabled={this.state.updateDisable} onClick={() => {this.setState({ popoverOpenR: !this.state.popoverOpenR});this.updateInDatabase();this.showForSelectedRelease();}}>Update</Button>
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
        else{
            return(
                <div>
                            <div class="container" style={{ 'margin-top': '1rem' }}>
                                <h5>Loading...</h5>
                            </div>
                </div>
               )
        }
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
