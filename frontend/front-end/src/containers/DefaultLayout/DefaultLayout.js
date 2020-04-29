
// p9=not applicable
// p8=priority is skipped
// p4 is default priority

// allowing p8 to all test cases on one click
// priority for adding default testcase priority in release create in dropdown 
// tc count for new tc is wrong
// multiselect for tc table, assignee update
//  qa strategy edit option
//  name of build e2e 
//  status should be pass, fail, blocked, etc.
// 
// setinterval, 
// user if in app-server
// yatish checking


import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
import axios from 'axios';
import { gapi } from 'gapi-script';
import {
  AppAside,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
// import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import { connect } from 'react-redux';
import { logOut, saveUsers, saveReleaseBasicInfo, releaseChange, saveTestCase, saveTestCaseStatus, logInSuccess, clearUserData, fetchUserNotifications } from '../../actions';
import { getCurrentRelease } from '../../reducers/release.reducer';

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

/* global gapi */
class DefaultLayout extends Component {
  GoogleAuth;
  auth2;
  // SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
  SCOPE = 'profile';
  userNotificationsInterval = null;
  userEmail = null;
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  loginBackend(user) {
    let email = user.profileObj.email;
    let name = user.profileObj.name;
    axios.post('/user/login', { email: email, name: name })
      .then(res => {
        console.log('received from user')
        console.log(res);
        if (res.data && res.data.role === 'ADMIN') {
          this.props.logInSuccess({ email: email, isAdmin: true, role: res.data.role, name: name });
        } else {
          this.props.logInSuccess({ email: email, isAdmin: false, role: res.data.role, name: name });
        }
      })
      .catch(err => { })
  }
  setSigninStatus(isSignedIn) {
    // this.GoogleAuth = gapi.auth2.getAuthInstance();
    console.log('issigned in')
    console.log(isSignedIn)
    if (this.GoogleAuth) {
      let user = this.GoogleAuth.currentUser.get();
      let isAuthorized = user.hasGrantedScopes(this.SCOPE);
      console.log('got user ', user)
      if (isAuthorized) {
        this.loginBackend(user)
      } else {
        console.log('un authorized')
      }
    }
  }
  signOut(e) {
    if (e) {
      e.preventDefault()
    }
    // this.stopPolling();
    if (this.props.currentUser) {
      this.props.clearUserData();
      this.props.logOut();
      if (this.GoogleAuth) {
        this.GoogleAuth.signOut().then(() => {
          this.props.history.push('/login')
        })
      } else {
        this.props.history.push('/login')
      }

    } else {
      this.props.history.push('/login');
    }
  }
  revokeAccess() {
    this.GoogleAuth.disconnect();
  }

  isUserSignedIn() {
    return this.GoogleAuth ? this.GoogleAuth.isSignedIn.get() : false;
  }
  componentWillReceiveProps(newProps) {
    console.log('new ', newProps);
    if (newProps.currentUser && newProps.currentUser.email) {
      if (newProps.currentUser.email === this.userEmail) {
        return;
      }
      this.userEmail = newProps.currentUser.email;
      // this.startPolling(newProps.currentUser.email, new Date().toISOString());
    }
  }
  componentDidMount() {
    // this.props.logInSuccess({ email: 'yatish@diamati.com', isAdmin: true, role: 'ADMIN', name: 'Yatish' });
    // this.props.logInSuccess({ email: 'ADMIN', name: 'ADMIN', isAdmin: true, role: 'ADMIN' });
    window.gapi.load('auth2', () => {
      gapi.auth2.init({
        'apiKey': 'AIzaSyCx0M1qs_LyfAgVmkTmDE6qIfgUiDekM-I',
        'client_id': '271454306292-q477q7slv0vpe1gep84habq5m2gv58k3.apps.googleusercontent.com',
        'scope': this.SCOPE
      }).then(() => {
        this.GoogleAuth = gapi.auth2.getAuthInstance();
        this.GoogleAuth.isSignedIn.listen((data) => this.setSigninStatus(data));
        // Listen for sign-in state changes.
        // this.GoogleAuth.isSignedIn.listen((data) => this.updateSigninStatus(data));
        // Handle initial sign-in state. (Determine if user is already signed in.)
        this.setSigninStatus();
      }).catch(err => { console.log('cannot get details') });
    });
    if (this.props.allUsers.length === 0) {
      axios.get(`/api/userinfo`).then(res => {
        this.props.saveUsers(res.data)
      })
      // axios.get(`/users`).then(res => {
      //   this.props.saveUsers(res.data)
      // })
    }
    if (this.props.allReleases.length === 0) {
      axios.get(`/api/release/all`)
        .then(res => {
          console.log(res.data);
          res.data.forEach(item => {
            // this.props.updateNavBar({ id: item.ReleaseNumber });

            this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
          });
          if (res.data[0]) {
            this.props.releaseChange({ id: res.data[0].ReleaseNumber });
          }
        }, error => {
        });
    }
  }
  startPolling(email, startTime) {
    this.stopPolling();
    this.userNotificationsInterval = setInterval(
      () => {
        console.log(this.props.notifications)
        // this.props.fetchUserNotifications({ email, startTime })
      },
      6000);
  }
  stopPolling() {
    if (this.userNotificationsInterval) {
      clearInterval(this.userNotificationsInterval)
    }
  }
  componentWillUnmount() {
    this.stopPolling();
  }

  render() {
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader
              user={this.props.currentUser}
              selectedReleaseNumber={this.props.selectedRelease.ReleaseNumber}
              releases={this.props.allReleases &&
                this.props.allReleases.map(item => item.ReleaseNumber)
              }
              onReleaseChange={(release) => {
                console.log(release);
                if (release) {
                  this.props.releaseChange({ id: release });
                  // this.props.history.push(`/release/${release}`);
                } else {
                  this.props.releaseChange({ id: null });
                  // this.props.history.push(`/release/manage`);
                }
              }}
              onLogout={e => this.signOut(e)} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              <AppSidebarNav navConfig={this.props.navigation} {...this.props} router={router} />
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            {/* <AppBreadcrumb appRoutes={routes} router={router} /> */}
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>
                  {/* {
                    !this.props.currentUser &&
                    <Redirect to="/login" />
                  } */}
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => (
                          <route.component {...props} />
                        )} />
                    ) : (null);
                  })}
                  <Redirect from="/"
                    to={`/release/summary`} />
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={this.loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        {/* <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter> */}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.auth.currentUser,
  navigation: state.app.navs,
  allReleases: state.release.all,
  selectedRelease: getCurrentRelease(state),
  allUsers: state.user.users
})

export default connect(mapStateToProps, {
  logOut, logInSuccess, saveReleaseBasicInfo, saveUsers, releaseChange, saveTestCase, saveTestCaseStatus, clearUserData, fetchUserNotifications
})(DefaultLayout);
