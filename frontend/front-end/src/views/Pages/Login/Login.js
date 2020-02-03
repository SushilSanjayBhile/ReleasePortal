import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { logInSuccess } from '../../../actions';
import { connect } from 'react-redux';
import axios from 'axios';
import { gapi } from 'gapi-script';
import logo from '../../../assets/img/brand/diamanti_full.png'
/* global gapi */
class Login extends Component {
  GoogleAuth
  loginBackend(user) {
    let email = user.w3.U3;
    let name = user.w3.ig;
    axios.post('/user/login', { email: email, name: name })
      .then(res => {
        if (res.data && res.data.role === 'ADMIN') {
          this.props.logInSuccess({ email: email, name: name, isAdmin: true, role: res.data.role });
        } else {
          this.props.logInSuccess({ email: email, name: name, isAdmin: false, role: res.data.role });
        }
        this.props.history.push('/');
      })
      .catch(err => { })
  }

  loadSignInButton() {
    gapi.load('signin2', () => {
      // Method 3: render a sign in button
      // using this method will show Signed In if the user is already signed in
      var opts = {
        width: 200,
        height: 50,
        client_id: '271454306292-fnma4vrg7dssj2opv4jovof9v8uq8n1l.apps.googleusercontent.com',
        onsuccess: (data) => this.setSigninStatus(data),
        onfail: (err) => this.onLoginFailed(err)
      }
      gapi.signin2.render('loginButton', opts)
    })
  }
  componentDidMount() {
    window.gapi.load('auth2', () => {

      this.auth2 = gapi.auth2.init({
        'apiKey': 'AIzaSyAxV1LfUI_TIjiQ2b8rW0fVYdMwHPeKQTYY',
        client_id: '271454306292-fnma4vrg7dssj2opv4jovof9v8uq8n1l.apps.googleusercontent.com',
        'scope': this.SCOPE,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      }).then(() => {
        this.setSigninStatus();
      });
    });
    this.loadSignInButton()
  }
  setSigninStatus(isSignedIn) {
    this.GoogleAuth = gapi.auth2.getAuthInstance();
    let user = this.GoogleAuth.currentUser.get();
    let isAuthorized = user.hasGrantedScopes(this.SCOPE);
    if (isAuthorized) {
      this.loginBackend(user)
    } else {
      console.log('could not login')
    }
  }


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
                    {/* <p>You are not signed in. Click here to sign in.</p> */}
                    <div style={{
                      backgroundImage: `url(${logo})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      width: '200px',
                      height: '48px'
                    }}></div>
                    <div id="loginButton">Login with Google</div>
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

export default connect(mapStateToProps, { logInSuccess })(Login);

