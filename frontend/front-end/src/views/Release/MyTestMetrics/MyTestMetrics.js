import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';

import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import axios from 'axios';

import UNAPPROVEDTC from '../PendingForApproval/UNAPPROVEDTC';
import PendingForApproval from '../PendingForApproval/PendingForApproval';
import AssignToUser from './AssignToUser';
import AssignToUserAutomationTC from './AssignToUserAutomationTC';
import AssignToUserGUI from './AssignToUserGUI';
import PendingForApprovalGUI from '../PendingForApproval/PendingForApprovalGUI';
import AssignToUserAutomationTCGUI from './AssignToUserAutomationTCGUI';
import UNAPPROVEDTCGUI from '../PendingForApproval/UNAPPROVEDTCGUI';

class MyTestMetrics extends Component {
    newCards = {};
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            domainSelected: false,
            metricsOpen: false,
            edited: {},
            PendingForApprovalDataListGUI:false,
            PendingForApprovalDataListCLI:false,
        }
        this.getNotificationToAdmin();
    }

    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.history.push('/release/summary');
        }
    }

    getNotificationToAdmin = () =>{
        if(this.props.currentUser){
           
            // console.clear();
            console.log("coming in function mytestmatrics",this.props.currentUser.role,this.props)
            let release = this.props.selectedRelease.ReleaseNumber;
            let url = `/api/wholetcinfo/${release}?`;
            url += ('&WorkingStatus=' + 'CREATED');

            console.log("url for admin to approve tc",url)
            axios.get(url)
            .then(response => {
                if(response.data){
                    console.log("data for cli tc",response.data.length)
                    if(response.data.length >= 1){
                        alert("Newly Added TC For CLI")
                        this.setState({PendingForApprovalDataListCLI : true })
                    }
                    else{
                        this.setState({PendingForApprovalDataListCLI : false})
                    }
                }
                console.log("changing state ",this.state.PendingForApprovalDataListCLI);
            }).catch(err => {
                console.log("Error",err);
            })

            let url2 = `/api/wholeguitcinfo/${release}?`;
            url2 += ('&WorkingStatus=' + 'CREATED');

            console.log("url for admin to approve tc",url2)
            axios.get(url2)
            .then(response => {
                if(response.data){
                    console.log("data for gui tc",response.data.length)
                    if(response.data.length >= 1){
                        alert("Newly Added TC For GUI")
                        this.setState({PendingForApprovalDataListGUI : true })
                    }
                    else{
                        this.setState({PendingForApprovalDataListGUI : false})
                    }
                }
                console.log("changing state ",this.state.PendingForApprovalDataListGUI)
            }).catch(err => {
                console.log("Error",err);
            })
            }
       
    }
    

    render() {
        return (
            <div>
                {
                    this.props.currentUser &&
                    <AssignToUser></AssignToUser>
                }

                {
                    this.props.currentUser &&
                    <AssignToUserAutomationTC></AssignToUserAutomationTC>
                }
               
                {
                    this.props.currentUser &&
                    <PendingForApproval></PendingForApproval>
                }

                {
                    this.props.currentUser &&
                    <UNAPPROVEDTC></UNAPPROVEDTC>
                }


                {
                    this.props.currentUser &&
                    <AssignToUserGUI></AssignToUserGUI>
                }

                {
                    this.props.currentUser  &&
                    <AssignToUserAutomationTCGUI></AssignToUserAutomationTCGUI>
                } 

                {
                    this.props.currentUser &&
                    <PendingForApprovalGUI></PendingForApprovalGUI>
                }
                
               
                {
                    this.props.currentUser &&
                    <UNAPPROVEDTCGUI></UNAPPROVEDTCGUI>
                }
                 
            </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase,getCurrentRelease })(MyTestMetrics);








