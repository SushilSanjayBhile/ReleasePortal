// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Collapse, Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import AdminGrid from '../../../components/AdminGrid/AdminGrid';
import { saveUserDetails } from '../../../actions';
import { getCurrentRelease } from '../../../reducers/release.reducer';

class ReleaseAdmin extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return null;
    }

}
const mapStateToProps = (state, ownProps) => ({
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    currentUser: state.auth.currentUser,
    notifications: state.user.notifications,
    openWork: state.user.openWork,
    closedWork: state.user.closedWork,
})
export default connect(mapStateToProps, { saveUserDetails })(ReleaseAdmin);