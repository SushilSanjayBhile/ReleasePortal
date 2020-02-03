import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Container, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { logInSuccess } from '../../../actions';
import { connect } from 'react-redux';
import axios from 'axios';
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [
        'admin', 'emp', 'exec'
      ]
    }
  }
  register() {
    axios.post(`api/signup`, { email: this.state.email, password: this.state.password, role: this.state.role })
      .then(res => {
        alert('success');
        this.props.logInSuccess({ email: this.state.email, role: this.state.role, isAdmin: this.state.role === 'admin' });
        this.props.history.push('/')
      }, error => {
        alert('error signing up');
      });
  }
  create() {
    if (this.state.newPassword !== this.state.confirmPassword) {
      alert('passwords not matching');
      return;
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)) {
      this.register();
    } else {
      alert('email invalid');
    }
  }
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form>
                    <h1>Register</h1>
                    <p className="text-muted">Create your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Email" onChange={(e) => this.setState({ email: e.target.value })} autoComplete="email" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" onChange={(e) => this.setState({ newPassword: e.target.value })} placeholder="Password" autoComplete="new-password" />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" onChange={(e) => this.setState({ confirmPassword: e.target.value })} placeholder="Repeat password" autoComplete="new-password" />
                    </InputGroup>
                    <FormGroup>
                      <Label htmlFor="selectRole">Role</Label>
                      <Input onChange={(e) => this.setState({ role: e.target.value })} type="select" name="selectRole" id="selectRole">
                        {
                          this.state.roles.map(role => <option value={role}>{role}</option>)
                        }
                      </Input>
                    </FormGroup>
                    <Button color="success" onClick={() => this.create()} block>Create Account</Button>
                  </Form>
                </CardBody>
                {/* <CardFooter className="p-4">
                  <Row>
                    <Col xs="12" sm="6">
                      <Button className="btn-facebook mb-1" block><span>facebook</span></Button>
                    </Col>
                    <Col xs="12" sm="6">
                      <Button className="btn-twitter mb-1" block><span>twitter</span></Button>
                    </Col>
                  </Row>
                </CardFooter> */}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  currentUser: state.auth.currentUser,
})

export default connect(mapStateToProps, { logInSuccess })(Register);
