import React, { Component } from 'react';
import {Col, Row, Table, Button, Collapse, Input, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import '../QaReport/QaAnalysis.scss'
import CustomerTickets from '../../../components/CustomerBugs/CustomerTickets';
import PendingMajorRelease from '../../../components/CustomerBugs/PendingMajorRelease';
import PendingPostRelease from '../../../components/CustomerBugs/PendingPostRelease';
class CustomerTicketsAnalysis extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {
                    this.props.currentUser && (this.props.currentUser.isAdmin || this.props.currentUser.isExe) &&
                    <div>
                        {
                            <CustomerTickets></CustomerTickets>
                        }
                        {
                            <PendingMajorRelease></PendingMajorRelease>
                        }
                        {
                            <PendingPostRelease></PendingPostRelease>
                        }
                    </div >
                }
                {
                    this.props.currentUser && (!this.props.currentUser.isAdmin && !this.props.currentUser.isExe) &&
                    <div class="container" style={{ 'margin-top': '1rem' }}>
                        <h5>You are not allowed to view this page.</h5>
                    </div>
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
