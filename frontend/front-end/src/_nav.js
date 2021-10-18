export default {
  items: [
    {
      name: 'Dashboard',
      url: '/release/summary',
      icon: 'fa fa-tachometer',

    },
    {
      name: 'Release Status',
      url: '/release/status',
      icon: 'fa fa-line-chart',
    },
    // {
    //   name: 'QA Updates',
    //   url: '/release/qastrategy',
    //   icon: 'fa fa-cogs',
    // },
    {
      name: 'QA Status',
      url: '/release/qastatus',
      icon: 'fa fa-area-chart',
    },
    {
      name: 'CLI Test Metrics',
      url: '/release/testmetrics',
      icon: 'fa fa-table',
    },
    {
      name: 'GUI Test Metrics',
      url: '/release/guitestmetrics',
      icon: 'fa fa-table',
    },
    {
      name: 'Other Test Result',
      url: '/release/sanityresults',
      icon: 'fa fa-table',
    },
    {
      name: 'Documents',
      url: '/release/docs',
      icon: 'fa fa-file'
    },
    {
      name: 'Builds Information',
      url: '/release/builds',
      icon: 'fa fa-file'
    },
    // {
    //   name: 'Jenkins Build',
    //   url: 'http://172.16.1.30:8080/view/3.0.0/',
    //   attributes: { target: '_blank' }, 
    //   icon: 'fa fa-server'    
    // },
    // {
    //   name: 'Settings',
    //   url: '/release/settings',
    //   icon: 'fa fa-cogs',
    // },
    // {
    //   name: 'Team Work',
    //   url: '/release/teamwork',
    //   icon: 'fa fa-bars',
    // },
    {
      name: 'QA Report',
      url: '/release/qawork',
      icon: 'fa fa-bars',
    },
    {
      name: 'My Test Metrics',
      url: '/release/mytestmatrics',
      icon: 'fa fa-table',
    },
    {
      name: 'E2E Result Update',
      url: '/release/E2EResultUpdate',
      icon: 'fa fa-pencil-square-o',
    },

    // {
    //   name: 'ADMIN Dashboard',
    //   url: '/release/admindashboard',
    //   icon: 'fa fa-table',
    // },

    {
      name: 'Jira Dashboard',
      url: 'https://diamanti.atlassian.net/secure/Dashboard.jspa?selectPageId=12400',
      attributes: { target: '_blank' },
      icon: 'fa fa-bug',
    },

    
   
    
  ],
};
