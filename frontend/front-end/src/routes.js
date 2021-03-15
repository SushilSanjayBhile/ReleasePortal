import React from 'react';

// const Breadcrumbs = React.lazy(() => import('./views/Base/Breadcrumbs'));
// const Cards = React.lazy(() => import('./views/Base/Cards'));
// const Carousels = React.lazy(() => import('./views/Base/Carousels'));
// const Collapses = React.lazy(() => import('./views/Base/Collapses'));
// const Dropdowns = React.lazy(() => import('./views/Base/Dropdowns'));
// const Forms = React.lazy(() => import('./views/Base/Forms'));
// const Jumbotrons = React.lazy(() => import('./views/Base/Jumbotrons'));
// const ListGroups = React.lazy(() => import('./views/Base/ListGroups'));
// const Navbars = React.lazy(() => import('./views/Base/Navbars'));
// const Navs = React.lazy(() => import('./views/Base/Navs'));
// const Paginations = React.lazy(() => import('./views/Base/Paginations'));
// const Popovers = React.lazy(() => import('./views/Base/Popovers'));
// const ProgressBar = React.lazy(() => import('./views/Base/ProgressBar'));
// const Switches = React.lazy(() => import('./views/Base/Switches'));
// const Tables = React.lazy(() => import('./views/Base/Tables'));
// const Tabs = React.lazy(() => import('./views/Base/Tabs'));
// const Tooltips = React.lazy(() => import('./views/Base/Tooltips'));
// const BrandButtons = React.lazy(() => import('./views/Buttons/BrandButtons'));
// const ButtonDropdowns = React.lazy(() => import('./views/Buttons/ButtonDropdowns'));
// const ButtonGroups = React.lazy(() => import('./views/Buttons/ButtonGroups'));
// const Buttons = React.lazy(() => import('./views/Buttons/Buttons'));
// const Charts = React.lazy(() => import('./views/Charts'));
// const Dashboard = React.lazy(() => import('./views/Dashboard'));
// const CoreUIIcons = React.lazy(() => import('./views/Icons/CoreUIIcons'));
// const Flags = React.lazy(() => import('./views/Icons/Flags'));
// const FontAwesome = React.lazy(() => import('./views/Icons/FontAwesome'));
// const SimpleLineIcons = React.lazy(() => import('./views/Icons/SimpleLineIcons'));
// const Alerts = React.lazy(() => import('./views/Notifications/Alerts'));
// const Badges = React.lazy(() => import('./views/Notifications/Badges'));
// const Modals = React.lazy(() => import('./views/Notifications/Modals'));
// const Colors = React.lazy(() => import('./views/Theme/Colors'));
// const Typography = React.lazy(() => import('./views/Theme/Typography'))
// const Widgets = React.lazy(() => import('./views/Widgets/Widgets'));
// const Users = React.lazy(() => import('./views/Users/Users'));
// const User = React.lazy(() => import('./views/Users/User'));

const ReleaseSummary = React.lazy(() => import('./views/Release/ReleaseSummary/ReleaseSummary'));
const ManageRelease = React.lazy(() => import('./views/Release/ManageRelease'));
const ReleaseTestCase = React.lazy(() => import('./views/Release/ReleaseTestCase/ReleaseTestCase'));
const ReleaseQAStrategy = React.lazy(() => import('./views/Release/ReleaseQAStrategy/ReleaseQAStrategy'));
const ReleaseTestMetrics = React.lazy(() => import('./views/Release/ReleaseTestMetrics/ReleaseTestMetrics'));
const ReleaseStatus = React.lazy(() => import('./views/Release/ReleaseStatus/ReleaseStatus'));
const ReleaseAdmin = React.lazy(() => import('./views/Release/ReleaseAdmin/ReleaseAdmin'));
const ReleaseDocs = React.lazy(() => import('./views/Release/ReleaseDocs/ReleaseDocs'));
const ReleaseBuilds = React.lazy(() => import('./views/Release/ReleaseBuilds/ReleaseBuilds'));
const Settings = React.lazy(() => import('./views/Release/Settings/createUser'));
const ReleaseTestMetricsGUI = React.lazy(() => import('./views/Release/ReleaseTestMetricsGUI/ReleaseTestMetricsGUI'))
const ReleaseSanityResult = React.lazy(() => import('./views/Release/ReleaseSanityResult/ReleaseSanityResult'))
const teamwork = React.lazy(() => import('./views/TeamWorkComponent/TaskOverView'))
const MyTestMetrics = React.lazy(() => import('./views/Release/MyTestMetrics/MyTestMetrics'));
const adminDashboard = React.lazy(() => import('./views/Release/adminDashboard/adminDashboard'));
const adminDashboardGUI = React.lazy(() => import('./views/Release/adminDashboard/adminDashboardGUI'));


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Release Portal' },

  { path: '/release/summary', name: 'Summary', exact: true, component: ReleaseSummary },
  { path: '/release/qastatus', name: 'Test Case', exact: true, component: ReleaseTestCase },
  { path: '/release/manage', exact: true, name: 'Manage', component: ManageRelease },
  { path: '/release/qastrategy', name: 'QA Strategy', exact: true, component: ReleaseQAStrategy },
  { path: '/release/testmetrics', name: 'QA Strategy', exact: true, component: ReleaseTestMetrics },
  { path: '/release/guitestmetrics', name: 'QA Strategy', exact: true, component: ReleaseTestMetricsGUI },
  { path: '/release/status', name: 'Release Status', exact: true, component: ReleaseStatus },
  { path: '/release/user', name: 'Admin Panel', exact: true, component: ReleaseAdmin },
  { path: '/release/docs', name: 'Documentation Panel', exact: true, component: ReleaseDocs },
  { path: '/release/builds', name: 'Release Build', exact: true, component: ReleaseBuilds },
  { path: '/release/settings', name: 'settings', exact: true, component: Settings },
  { path: '/release/sanityresults', name: 'sanityresults', exact: true, component: ReleaseSanityResult },
  { path: '/release/teamwork', name: 'teamwork', exact: true, component: teamwork },
  { path: '/release/mytestmatrics', name: 'MyTestMetrics', exact: true, component: MyTestMetrics },
  { path: '/release/adminDashboard', name: 'adminDashboard', exact: true, component: adminDashboard },
  { path: '/release/adminDashboardGUI', name: 'adminDashboardGUI', exact: true, component: adminDashboardGUI },

];

export default routes;
