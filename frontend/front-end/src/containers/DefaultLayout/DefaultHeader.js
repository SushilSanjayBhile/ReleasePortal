import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import { Row, Col, Badge, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { AppAsideToggler, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/diamanti_full.png'
import sygnet from '../../assets/img/brand/diamanti_small.jpg'
import userIcon from '../../assets/img/ico-user-circle.svg'
import { connect } from 'react-redux';
import './DefaultContainer.scss';
import { GoogleLogout } from 'react-google-login';
import axios from 'axios';
import { logInSuccess } from '../../actions';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      releaseChange:false,
    };
  }
  componentWillReceiveProps(newProps) {
    if (newProps.selectedReleaseNumber !== this.props.selectedReleaseNumber) {
      this.props.onReleaseChange(newProps.selectedReleaseNumber);
    }
  }
  componentDidMount(){
    this.loginBackend()
  }
 
  loginBackend() {
    if(localStorage.getItem('isAuthorized')){
    let user = localStorage.getItem('user');
    user = JSON.parse(user)
    if(user && user.profileObj){
    let email = user.profileObj.email;
    let name = user.profileObj.name;
   
    axios.post('/user/login', { email: email, name: name })
      .then(res => {
        localStorage.setItem('isAuthorized', true);
        if (res.data && res.data.role === 'ADMIN') {
          this.props.logInSuccess({ email: email, name: name, isAdmin: true, role: res.data.role });
        } else {
          this.props.logInSuccess({ email: email, name: name, isAdmin: false, role: res.data.role });
        }
        this.props.history.push('/');
      })
      .catch(err => {
        localStorage.setItem('isAuthorized', false);
        alert('Login Failed')
      })
    }
    }
  }
    
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    
    return (
      <React.Fragment>
        <AppSidebarToggler display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 150, height: 45, alt: 'Diamanti Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'Diamanti Logo' }}
        />
        {/* <Nav className="d-md-down-none" navbar>
          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <span style={{ fontWeight: 600, marginRight: '1rem' }}> Release : </span>
              {this.props.selectedReleaseNumber ? this.props.selectedReleaseNumber : 'Release...'}
              <i className="fa fa-caret-down" style={{ paddingLeft: '10px' }} aria-hidden="true"></i>
            </DropdownToggle>
            <DropdownMenu>
              {
                this.props.releases
                  .map(release => <DropdownItem onClick={e => {
                    // this.props.history.push('/release/summary')
                    this.props.onReleaseChange(release);
                  }} ><i className="fa fa-file" ></i> {release}</DropdownItem>


                  )
              }
            </DropdownMenu>
          </UncontrolledDropdown>
          {
            this.props.currentUser &&
            <NavItem className="px-3">
              <UncontrolledDropdown nav direction="down">
                <DropdownMenu>
                  {
                    this.props.notifications && this.props.notifications.map(item =>
                      <DropdownItem onClick={() => this.props.history.push('/release/user')}><i className="fa fa-envelope-o"></i>{item.message}<span style={{ float: 'right' }}>{item.date}</span></DropdownItem>
                    )
                  }
                </DropdownMenu>
              </UncontrolledDropdown>

            </NavItem>

          }
        </Nav> */}
        <Nav className="d-md-down-none" navbar>
          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <span style={{ fontWeight: 600, marginRight: '1rem' }}> Release : </span>
              {/* { this.props.selectedReleaseNumber ? this.props.selectedReleaseNumber : 'Release..'  } */}
              {this.props.selectedReleaseNumber }
              <i className="fa fa-caret-down" style={{ paddingLeft: '10px' }} aria-hidden="true"></i>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu pre-scrollable">
              {
                this.props.releases
                  .map(release => <DropdownItem onClick={e => {
                      // this.props.history.push('/release/summary')
                      // this.setState({
                      //   releaseChange:true
                      // })
                      this.props.onReleaseChange(release);
                    }} ><i className="fa fa-file" ></i> {release}</DropdownItem>
                  )
              }
            </DropdownMenu>
          </UncontrolledDropdown>
          {
            this.props.currentUser &&
            <NavItem className="px-3">
              <UncontrolledDropdown nav direction="down">
                <DropdownMenu>
                  {
                    this.props.notifications && this.props.notifications.map(item =>
                      <DropdownItem onClick={() => this.props.history.push('/release/user')}><i className="fa fa-envelope-o"></i>{item.message}<span style={{ float: 'right' }}>{item.date}</span></DropdownItem>
                    )
                  }
                </DropdownMenu>
              </UncontrolledDropdown>

            </NavItem>

          }
        </Nav>
        <Nav className="ml-auto" navbar>
          <span>{this.props.currentUser && this.props.currentUser.name}</span>
          <UncontrolledDropdown nav direction="down">

            <DropdownToggle nav>
              <img src={userIcon} className="img-avatar" alt={this.props.currentUser && this.props.currentUser.email} title={this.props.currentUser && this.props.currentUser.email} />
            </DropdownToggle>
            <DropdownMenu right>
           
              {
                !this.props.user &&
                <DropdownItem onClick={() => this.props.onLogout()}><i className="fa fa-lock"></i> Login</DropdownItem>
              }
              {
                this.props.user &&
                <React.Fragment>

                  <DropdownItem onClick={() => this.props.history.push('/release/user')}><i className="fa fa-user"  aria-hidden="true"></i>{this.props.currentUser && this.props.currentUser.email}</DropdownItem>
                  {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <DropdownItem onClick={() => this.props.history.push('/release/manage')}><i className="fa fa-cog"  aria-hidden="true"></i>Release Settings</DropdownItem>
                  }
                  {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <DropdownItem onClick={() => this.props.history.push('/release/settings')}><i className="fa fa-pencil-square-o"  aria-hidden="true"></i>Manage User</DropdownItem>
                  }
                  {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <DropdownItem onClick={() => this.props.history.push('/release/adminDashboard')}><i className="fa fa-user-secret"  aria-hidden="true"></i>Admin Dashboard For CLI</DropdownItem>
                  }
                  {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <DropdownItem onClick={() => this.props.history.push('/release/adminDashboardGUI')}><i className="fa fa-user-secret"  aria-hidden="true"></i>Admin Dashboard For GUI</DropdownItem>
                  }
                  <DropdownItem onClick={() => this.props.onLogout()}><i className="fa fa-lock"></i>Logout</DropdownItem>
                </React.Fragment>
              }

            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/* </Row> */}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.auth.currentUser,
  notifications: state.user.notifications
  // navigation: state.app.navs,
  // allReleases: state.release.all
})

export default connect(mapStateToProps, { logInSuccess })(withRouter(DefaultHeader));

// export default withRouter(DefaultHeader);