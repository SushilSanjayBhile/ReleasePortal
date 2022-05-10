import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Input, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import '../QaReport/QaAnalysis.scss'
import CustomerTickets from '../../../components/CustomerBugs/CustomerTickets';
import CustomerClosed from '../../../components/CustomerBugs/CustomerClosed';
import PendingMajorRelease from '../../../components/CustomerBugs/PendingMajorRelease';
import PendingPostRelease from '../../../components/CustomerBugs/PendingPostRelease';
import NewClosedInQaTickets from '../../../components/CustomerBugs/NewClosedInQaTickets';
import Graphs from '../../../components/CustomerBugs/Graphs';
const devManager = {"Vivek Gupta":["Vivek Gupta", "Rajat Gupta", "Samiksha Bagmar", "Sunil Barhate", "Pravinkumar", "Mayur Shinde", "Swapnil Shende", "Yatish Devadiga", "Ketan Divekar"],
                          "Kshitij Gunjikar":["Kshitij Gunjikar","Kiran Zarekar", "Sushil Bhile", "Sourabh Shukla", "Joel Wu","Abhijeet Chavan", "Narendra Raigar"],
                          "Naveen Seth":["Naveen Seth","Tanya Singh", "Alex Bahel", "Dinesh Radhakrishnan", "Diksha Tambe", "Rahul Soman", "Vinod Lohar", "Atirek Goyal", "Rajesh Borundia", "Sandeep Zende"],
                          "Quentin Finck":["Quentin Finck", "Chetan Noginahal", "Raghunandan Sahoo"],
                          "Arvind Krishnan":["Arvind Krishnan"],
                          "Yatish Devadiga":["Bharati Bhole", "Aditya Nilkanthwar", "Shweta Burte", "Rahul Pawar", "Ashutosh Das"],
                          "Ketan Divekar":["Varsha Suryawanshi", "Arati Jadhav", "Bhakti Gholap", "Priyanka Birajdar", "Mukesh Shinde", "Rakshitha Umesh"],
                          "Jaganathan Jeyapaul":["Jaganathan Jeyapaul","David Taylor"],
                          "David Taylor":["Randy Watler", "Jay Eno", "Josh Taylor", "Chris Aakre", "Doniphan Pattison"],
                          "Unclassified":["Unclassified"]
};
const Ulist = ["Vivek Gupta", "Nikhil Temgire", "Samiksha Bagmar", "Sunil Barhate", "Mayur Shinde", "Pravinkumar",
                "Kshitij Gunjikar","Kiran Zarekar", "Sushil Bhile", "Sourabh Shukla", "Joel Wu","Abhijeet Chavan", "Narendra Raigar", "Swapnil Shende",
                "Naveen Seth","Tanya Singh", "Alex Bahel", "Dinesh Radhakrishnan", "Diksha Tambe", "Rahul Soman", "Vinod Lohar", "Atirek Goyal", "Rajesh Borundia", "Sandeep Zende",
                "Quentin Finck", "Arvind Krishnan", "Abdul Zafar", "Jaganathan Jeyapaul"]
const QAs = {"Prachee Ahire":'', "Mukesh Shinde":'', "Chetan Noginahal":'', "Dinesh":'', "Rajat Gupta":'',
"Shweta Burte":'', "Aditya Nilkanthwar":'', "Arati Jadhav":'', "Varsha Suryawanshi":'', "Priyanka Birajdar":'',
"Ashutosh Das":'', "Yatish Devadiga":'', "Ketan Divekar":'', "Bharati Bhole":'', "Rahul Pawar":'', "Bhakti Gholap":'', "Rakshitha Umesh": ''}
class CustomerTicketsAnalysis extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {
                    this.props.currentUser &&
                    <div>
                        {
                            <CustomerTickets QAs = {QAs} Ulist = {Ulist} devManager = {devManager}/>                      }
                        {
                            <PendingMajorRelease QAs = {QAs} Ulist = {Ulist} devManager = {devManager}/>
                        }
                        {
                            <PendingPostRelease QAs = {QAs} Ulist = {Ulist} devManager = {devManager}/>
                        }
                        {
                            <NewClosedInQaTickets QAs = {QAs} Ulist = {Ulist} devManager = {devManager}/>
                        }
                        {
                            <Graphs></Graphs>
                        }
                        {
                            <CustomerClosed QAs = {QAs} Ulist = {Ulist} devManager = {devManager}/>                        }
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
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(CustomerTicketsAnalysis);
