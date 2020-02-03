import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { Provider } from 'react-redux';
import configureStore from './store';

// Containers
// const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));
import DefaultLayout from './containers/DefaultLayout';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const Register = React.lazy(() => import('./views/Pages/Register'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));
const store = configureStore();
class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <Router>
          <React.Suspense fallback={loading()}>
            <Switch>
              <Route exact path="/login" name="Login Page" render={props => <Login {...props} />} />
              {/* <Route exact path="/register" name="Register Page" render={props => <Register {...props} />} /> */}
              <Route exact path="/404" name="Page 404" render={props => <Page404 {...props} />} />
              <Route exact path="/500" name="Page 500" render={props => <Page500 {...props} />} />
              <Route path="/" name="Release Portal" render={props => <DefaultLayout {...props} />} />
            </Switch>
          </React.Suspense>
        </Router>
      </Provider>
    );
  }
}

export default App;
