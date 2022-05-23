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
                            <CustomerTickets/>
                        }
                        {
                            <PendingMajorRelease/>
                        }
                        {
                            <PendingPostRelease/>
                        }
                        {
                            <NewClosedInQaTickets/>
                        }
                        {
                            <Graphs></Graphs>
                        }
                        {
                            <CustomerClosed/>                        }
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
