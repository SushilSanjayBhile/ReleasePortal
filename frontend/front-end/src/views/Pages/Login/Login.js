import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { logInSuccess } from '../../../actions';
import { connect } from 'react-redux';
import axios from 'axios';
import { gapi } from 'gapi-script';
import ReactLoginMS from 'react-microsoft-login'
import logo from '../../../assets/img/brand/diamanti_full.png'
import { GoogleLogin } from 'react-google-login';
/* global gapi */
class Login extends Component {
  GoogleAuth
  SCOPE = 'profile';
  // SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
  constructor(props) {
    super(props);
    this.state = {
      googleAuthLoaded: false,
      name: null,
      email: null,
    }
  }
  loginBackend(user) {
    
    localStorage.setItem('user',JSON.stringify(user));

      let email = user.profileObj.email;
      let name = user.profileObj.name;
   
    axios.post('/user/login', { email: email, name: name })
      .then(res => {
        localStorage.setItem('isAuthorized', true);
        if (res.data && res.data.role === 'ADMIN') {
          
          this.props.logInSuccess({ email: email, name: name, isAdmin: true, isExe: false, role: res.data.role });
        }
        else if (res.data && res.data.role === 'EXECUTIVE') {
          this.props.logInSuccess({ email: email, name: name, isAdmin: false, isExe: true, role: res.data.role });
        }
         else {
          this.props.logInSuccess({ email: email, name: name, isAdmin: false, isExe: false, role: res.data.role });
        }
        this.props.history.push('/');
      })
      .catch(err => {
        localStorage.setItem('isAuthorized', false);
        alert('Login Failed')
      })
  }
  onLoginFailed = (err) => {
    console.log('login failed ', err)
  }
  //a1xGwnaKFGC2A55Cy72bxMq1
  componentDidMount() {
      window.gapi.load('auth2', () => {
        this.auth2 = gapi.auth2.init({
          'apiKey': 'AIzaSyCx0M1qs_LyfAgVmkTmDE6qIfgUiDekM-I',
          'client_id': '271454306292-q477q7slv0vpe1gep84habq5m2gv58k3.apps.googleusercontent.com',
          //new token
          // 'apiKey': 'AIzaSyD-ngwn8edSCCFudBTyoxAWz4TB4XNLoQU',
          // 'client_id': '256255355384-c2vb4kqmrg8pgnrn7tdvbvi1g1b9moc3.apps.googleusercontent.com',
          'scope': this.SCOPE
        }).then(() => {
          this.GoogleAuth = gapi.auth2.getAuthInstance();
          //this.setState({ googleAuthLoaded: true })
          this.setSigninStatus();
        })
      });
  }
  setSigninStatus(isSignedIn) {
    if (this.GoogleAuth) {
      let user = this.GoogleAuth.currentUser.get();
      let isAuthorized = user.hasGrantedScopes(this.SCOPE);
      if (isAuthorized) {
        this.loginBackend(user) 
      } else {
        console.log('could not login')
      }
    }
  }
  handleChange = (e) => {
    if(e.target.name == 'name'){
        this.setState({
            name: e.target.value.trim()
        })
    }
    if(e.target.name == 'email'){
        this.setState({
            email: e.target.value.trim()
        })
    }
};

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="4">
              <Card style={{
                width: '16rem',

                boxShadow: '2px 4px 8px 4px rgba(1, 210, 81, 0.4)'
              }}>
                <CardBody>
                
                  <div>
                    <div style={{
                      backgroundImage: `url(${logo})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      width: '200px',
                      height: '48px'
                    }}></div>
                    {
                      this.state.googleAuthLoaded &&
                      <div style={{ textAlign: 'center' }}>
                       
                        <GoogleLogin
                          clientId="271454306292-q477q7slv0vpe1gep84habq5m2gv58k3.apps.googleusercontent.com"
                          buttonText="Login"
                          onSuccess={(d) => this.setSigninStatus(d)}
                          onFailure={(f) => this.onLoginFailed(f)}
                          cookiePolicy={'single_host_origin'}
                        />
                      </div>
                    }
                    {
                      !this.state.googleAuthLoaded &&
                      // <div>Please wait while Google Auth is loading...</div>
                        //this.state.googleAuthLoaded &&
                        <div style={{ textAlign: 'center' }}>
                         <Input type="email" name="email" id = 'email' placeholder="Enter Email"  onChange={this.handleChange} />
                         <Input type="text" name="name" id = 'name' placeholder="Enter User Name"  onChange={this.handleChange} />
                         <Button disabled={this.state.isApiUnderProgress} title="Login" size="md" className="rp-rb-save-btn" onClick={() => {
                          if (this.state.name && this.state.email) {
                            let dict = {"profileObj":{name: this.state.name, email: this.state.email}}
                            this.loginBackend(dict)
                          }
                          else{
                            alert('Enter email and Name');
                                  return
                          }
                          }} >
                          Login
                        </Button>
                        </div>
                    }
                    {/* {
                      <div style={{ textAlign: 'center' }}>
                       <ReactLoginMS
                        clientId="262400a6-0900-416e-a7a9-82b7c137b667"
                        redirectUri="https://localhost:5050"
                        cssClass="ms-login"
                        btnContent="LOGIN"
                        responseType="token"
                        //tenantUrl="https://login.microsoftonline.com/common"
                        tenantUrl="https://login.microsoftonline.com/523a3181-8608-4651-889d-201bae12e39c"
                        useLocalStorageCache={true}
                        authCallback={this.authHandler}
                        //handleLogin={(data) => this.setSigninStatus(data)}
                        />
                      </div>
                    } */}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.auth.currentUser,
})

export default connect(mapStateToProps, { logInSuccess })(withRouter(Login));

