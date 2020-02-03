import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import { Bar, Line } from 'react-chartjs-2';
import {
  ButtonDropdown,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Carousel, CarouselCaption, CarouselControl, CarouselIndicators, CarouselItem
} from 'reactstrap';
import { connect } from 'react-redux';
// import ReleaseBasicCard from './ReleaseSummary/ReleaseBasicCard';
import ReleaseBuildCard from './ReleaseBuild/ReleaseBuildCard';
import ReleaseBugCard from './ReleaseBug/ReleaseBugCard';
import ReleaseTestCaseCard from './ReleaseTestCase/ReleaseTestCaseCard';
import ReleaseFeatureCard from './ReleaseFeature/ReleaseFeatureCard';
import ReleaseHardwareAndSetupCard from './ReleaseHardwareAndSetup/ReleaseHardwareAndSetupCard';
import ReleaseUpgradeMetricCard from './ReleaseUpgradeMetric/ReleaseUpgradeMetricCard';
import ReleaseCustomerCard from './ReleaseCustomer/ReleaseCustomerCard';
import ReleaseResourceInfoCard from './ReleaseResourceInfo/ReleaseResourceInfoCard';
import ReleasePatchCard from './ReleasePatch/ReleasePatchCard';
import ReleaseFinalInfoCard from './ReleaseFinalInfo/ReleaseFinalInfoCard';

import './Release.scss';

import ReleaseSummary from './ReleaseSummary/ReleaseSummary';
import ReleaseBuild from './ReleaseBuild/ReleaseBuild';
import ReleaseFinalInfo from './ReleaseFinalInfo/ReleaseFinalInfo';
import ReleaseCustomer from './ReleaseCustomer/ReleaseCustomer';
import ReleaseHardwareAndSetup from './ReleaseHardwareAndSetup/ReleaseHardwareAndSetup';
import ReleaseTestCase from './ReleaseTestCase/ReleaseTestCase';
import Header from './components/Header';

import { getCurrentRelease } from '../../reducers/release.reducer';
// Release number
// Targeted Release Date (M)
// Targeted Code freeze date (M)
// QA Start date (M)
// Upgrade testing start date (M)
// Risks / Red Flags (M)
// Automation syncup /,and minutes (M)


// Build numbers (link) [latest / all]  (List Group with TabPanes)
// Bug id’s (link) (categorize - high/medium/low) [from jira]
// Bug Graph ( jira- Automatic)
// Progress / TC Coverage (link) (cat - platform / func)
// New features info (list) (sub-tasks)
// Features not to be tested- with reasons (FK) (list) (From feature table of each release)
// Applicable Hardware (NYNJ /Boston) (list)
// Setups used (FK) (auto10, auto8, ..) [done]
// Eng employed (FK - Info to be come from the worksheet) (M) (FK)
// Upgrade metrics (list) (M)
//CUSTOMER
// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to

// Hot patches (list) (M)
// patch (jira number)

// EXTRA INFO (M)
// Final release build number
// OS for Final release build number
// Final release Docker core rpm number
// U-boot version
// Start date
// release date






class Release extends Component {
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: 1,
      activeIndex: 0,
      showDetails: 0
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    console.log(this.props.match.path)
  }
  componentWillReceiveProps(newProps) {

  }

  onExiting() {
    this.animating = true;
  }

  onExited() {
    this.animating = false;
  }

  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === this.items.length - 1 ? 0 : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? this.items.length - 1 : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  selectBuild() {
    this.setState({
      selectedCard: 'build'
    })
  }

  items = [
    () => (
      <Row>
        {/* <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 0 })}>
          <ReleaseBasicCard release={this.props.selectedRelease} />
        </Col> */}
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 1 })}>
          <ReleaseFinalInfoCard release={this.props.selectedRelease} />
        </Col>
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 3 })}>
          <ReleaseBuildCard release={this.props.selectedRelease} />
        </Col>
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 2 })}>
          <ReleaseHardwareAndSetupCard release={this.props.selectedRelease} />
        </Col>

      </Row>
    ),
    () => (
      <Row>

        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 4 })}>
          <ReleaseCustomerCard release={this.props.selectedRelease} />
        </Col>
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 5 })}>
          <ReleaseFeatureCard release={this.props.selectedRelease} />
        </Col>
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 6 })}>
          <ReleaseTestCaseCard release={this.props.selectedRelease} />
        </Col>


        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 7 })}>
          <ReleaseUpgradeMetricCard release={this.props.selectedRelease} />
        </Col>


      </Row>
    ),
    () => (
      <Row>
        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 8 })}>
          <ReleaseResourceInfoCard release={this.props.selectedRelease} />
        </Col>

        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 9 })}>
          <ReleaseBugCard release={this.props.selectedRelease} />
        </Col>

        <Col xs="12" sm="6" lg="3" onClick={() => this.setState({ showDetails: 10 })}>
          <ReleasePatchCard release={this.props.selectedRelease} />
        </Col>

      </Row>
    )
  ]

  render() {
    const slides = this.items.map((item, index) => {
      return (
        <CarouselItem onExiting={this.onExiting} onExited={this.onExited} key={index}>
          {item()}
        </CarouselItem>
      );
    });
    return (
      <React.Fragment>
        {/* {
          this.props.selectedRelease.ReleaseNumber &&
          <Header
            user={this.props.currentUser}
            selectedRelease={this.props.selectedRelease.ReleaseNumber}
            changePage={({ page }) => this.setState({ showDetails: page })}
          />
        } */}
        <Router>
          <div className="animated fadeIn">
            {/* <Row>
              <Col xs="12" xl="12">
                <Card>
                  <CardBody>
                    <Carousel interval="500000" activeIndex={this.state.activeIndex} next={this.next} previous={this.previous} ride="carousel">
                      {slides}
                      <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
                      <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
                    </Carousel>
                  </CardBody>
                </Card>
              </Col>
            </Row> */}
            <Row>
              <Col xs="12" xl="12">
                {/* {
                  (() => {
                    switch (this.state.showDetails) {
                      case 0: return <ReleaseSummary />
                      // case 1: return <ReleaseFinalInfo id={this.props.match.params.id} />
                      // case 2: return <ReleaseHardwareAndSetup id={this.props.match.params.id} />
                      // case 3: return <ReleaseBuild id={this.props.match.params.id} />
                      // case 4: return <ReleaseCustomer id={this.props.match.params.id} />
                      case 1: return <ReleaseTestCase />
                      default: return null
                    }
                  })()
                } */}
                <Switch>
                  <Route path={`/release/summary`}>
                    <ReleaseSummary />
                  </Route>
                  <Route path={`/release/testcase`}>
                    <ReleaseTestCase />
                  </Route>
                  <Redirect from='/:id' to={`/release/summary`} />
                  {/* <Route path={`/release/${this.id}/build`}><ReleaseBuild /></Route>
                  <Route path={`/release/${this.id}/customer`}><ReleaseCustomer /></Route>
                  <Route path={`/release/${this.id}/hardwaresetup`}><ReleaseHardwareAndSetup /></Route>
                  <Route path={`/release/${this.id}/finalinfo`}><ReleaseFinalInfo /></Route> */}
                </Switch>
              </Col>
            </Row>
          </div>
        </Router>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  currentUser: state.auth.currentUser,
  // selectedRelease: state.release.all.filter(item => {
  //   if (item.ReleaseNumber === ownProps.match.params.id) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // })[0], //.filter(item => item.name === ownProps.match.params.id)
  selectedRelease: getCurrentRelease(state)
})

export default connect(mapStateToProps, {})(Release);
