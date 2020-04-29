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
      icon: 'fa fa-bars',
    },
    {
      name: 'QA Updates',
      url: '/release/qastrategy',
      icon: 'fa fa-cogs',
    },
    {
      name: 'QA Status',
      url: '/release/qastatus',
      icon: 'fa fa-area-chart',
    },
    {
      name: 'Test Metrics',
      url: '/release/testmetrics',
      icon: 'fa fa-compass',
    },
    {
      name: 'Gui Test Metrics',
      url: '/release/guitestmetrics',
      icon: 'fa fa-compass',
    },
    {
      name: 'Other Test Result',
      url: '/release/sanityresults',
      icon: 'fa fa-compass',
    },
    {
      name: 'Documents',
      url: '/release/docs',
      icon: 'fa fa-file'
    },
    {
      name: 'Jira Dashboard',
      url: 'https://diamanti.atlassian.net/secure/Dashboard.jspa?selectPageId=12600',
      // url: 'http://dwsjira1.eng.diamanti.com:8080/secure/Dashboard.jspa?selectPageId=11803',
      attributes: { target: '_blank' },
      icon: 'fa fa-bug',
      class: 'rp-jira'
    },


  ],
};

// 3.0.0: 11602
//2.4.0:  12600
//2.3.0: 11803
