export default {
  "name": "domains",
  "children": [{
    "name": "Storage",
    "subtitle": "(P:300, F:600, S:0, NA:1200)",
    "children": [{
      "name": "StoragePVC",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    },
    {
      "name": "Storage-Tests",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    },
    {
      "name": "Remote Storage",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    }
    ]
  },
  {
    "name": "Management",
    "subtitle": "(P:200, F:400, S:0, NA:800)",
    "children": [{
      "name": "ManagementTestCases ",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    },
    {
      "name": "Rbac",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    }
    ]
  },
  {
    "name": "Network",
    "subtitle": "(P:100, F:200, S:0, NA:400)",
    "children": [{
      "name": "NetworkTestCases",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    }]
  },
  {
    "name": "Others",
    "subtitle": " (P:200, F:400, S:0, NA:800)",
    "children": [{
      "name": "NVMECompliance",
      "subtitle": "(P:100, F:200, S:0, NA:400)",
      "size": 700,
    },
    {
      "name": "MultizoneCluster",
      "subtitle": " (P:100, F:200, S:0, NA:400)",
      "size": 700,
    }
    ]
  }
  ]
}
