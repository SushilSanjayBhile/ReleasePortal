
import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container, UncontrolledTooltip } from 'reactstrap';
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

import routes from '../../routes';
import { connect } from 'react-redux';
import { logOut, saveUsers, saveReleaseBasicInfo, releaseChange, saveTestCase, saveTestCaseStatus, logInSuccess, clearUserData, fetchUserNotifications, updateSelectedPriority } from '../../actions';
import { getCurrentRelease } from '../../reducers/release.reducer';
import { thresholdFreedmanDiaconis, timeFormatLocale, timeMillisecond, timeout } from 'd3';
import { element } from 'prop-types';

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));
let selectedRelease1 = [];
  
/* global gapi */
class DefaultLayout extends Component {
  constructor(){
    super();
    this.state={
      releaseChange:true,
      routePath:``,
    }
  }
  allReleases1 = []
  selectedReleaseTest = ''
  GoogleAuth;
  auth2;
  // SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
  SCOPE = 'profile';
  userNotificationsInterval = null;
  userEmail = null;
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  
  signOut(e) {
    localStorage.setItem('user',false);
    localStorage.setItem('isAuthorized',false);
    if (e) {
      e.preventDefault()
    }
    
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
    
    if (newProps.currentUser && newProps.currentUser.email) {
      if (newProps.currentUser.email === this.userEmail) {
        return;
      }
      this.userEmail = newProps.currentUser.email;
     
    }
  }
  componentDidMount() {
    if (this.props.allUsers.length === 0) {
      axios.get(`/api/userinfo`).then(res => {
        this.props.saveUsers(res.data)
      })
      
    }
    // let releaseInfoURL = `/api/release/info`;
    //   axios.get(releaseInfoURL)
    //     .then(res => {
    //       res.data.forEach(item => {
    //         this.allReleases1.push(item.ReleaseNumber)
    //         // this.props.saveReleaseBasicInfo({ id: item.ReleaseNumber, data: item });
    //       });
    //       if (this.allReleases1[0]) {
    //         this.getReleaseData(this.allReleases1[0] )
    //         this.props.releaseChange({ id: this.allReleases1[0]  });
    //       }

    //     }, error => {
          
    //     });
  }
  componentDidUpdate(prevProps, prevState){
    let email = this.props.currentUser ? this.props.currentUser.email : null
    if (prevProps.currentUser !== this.props.currentUser) {
      if (email != null) {
      axios.get(`/api/user1/name/${email}`)
        .then(res => {
          res.data.forEach(item => {
            item.AssignedReleases.forEach(element =>{
              //this.allReleases1.push(element)
              this.allReleases1.push(element)
              if(item.EngineerType == 'GUI'){
                this.setState({routePath: `/release/guitestmetrics`})
              }
              else this.setState({routePath: `/release/testmetrics`});
            })
          })
          if (this.allReleases1[0]) {
            this.getReleaseData(this.allReleases1[0] )
            this.props.releaseChange({ id: this.allReleases1[0]  });
          }
        }, error => {
          
        })
      }
      else alert("User does not have email address")
    }
  }

  getReleaseData = (release) =>{
    this.setState({
      releaseChange:false
    })
    let releaseSpecificURL =  `/api/release/` + release;
    axios.get(releaseSpecificURL)
        .then(res => {
          this.setState({
            releaseChange:true
          })
          this.props.saveReleaseBasicInfo({ id: res.ReleaseNumber, data: res });
          this.props.releaseChange({ id: release });
          this.selectedReleaseTest = res.ReleaseNumber
        }, error => {
          console.log("error while getting data");
        });
  }
  startPolling(email, startTime) {
    this.stopPolling();
    this.userNotificationsInterval = setInterval(
      () => {
        console.log(this.props.notifications)
        
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
   if(this.state.routePath === null)
   {
     return(
      <main className="main">
                <div class="container" style={{ 'margin-top': '1rem' }}>
                    <div class="modal fade" id="myModal" role="dialog">
                        <div class="modal-body">
                        <span>Loading...</span>
                        </div>
                    </div>
                </div>
      </main>
     );
   }
   else {
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader
              user={this.props.currentUser}
              selectedReleaseNumber={this.props.selectedRelease.ReleaseNumber}
              releases={this.allReleases1 &&
                this.allReleases1.map(item => item)
              }
              onReleaseChange={(release) => {
                if (release) {
                  this.getReleaseData(release)
                } else {
                  this.props.releaseChange({ id: null });
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
            <div>
            {
                ! this.state.releaseChange &&
                <div>
                      <div class="container" style={{ 'margin-top': '1rem' }}>
                          <div class="modal fade" id="myModal" role="dialog">
                              <div class="modal-body">
                              <span>Please wait while Data is loading...</span>
                              </div>
                          </div>
                        </div>
                </div>
              }
            </div>
         
            
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>
                  
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
                    to={this.state.routePath} />
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
      </div>
    );
  }
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
