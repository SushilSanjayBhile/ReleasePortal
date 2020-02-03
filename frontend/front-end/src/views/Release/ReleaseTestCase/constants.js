

export default {
    'Domains': {
        data: [
            {
                'name': 'Storage',
                'count': 20,
                'flexName': 'testA',
                'device': 'Storage'
            },
            {
                'name': 'Management',
                'count': 30,
                'flexName': 'testA',
                'device': 'Management'
            },
            {
                'name': 'Network',
                'count': 21,
                'flexName': 'testA',
                'device': 'Network'
            },
            {
                'name': 'Others',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
        ],
        componentType: 'Domains'
    },
    'Storage': {
        data: [
            {
                'name': 'Storage-Tests',
                'count': 20,
                'flexName': 'testA',
                'device': 'Storage'
            },
            {
                'name': 'StoragePVC',
                'count': 30,
                'flexName': 'testA',
                'device': 'Management'
            },
            {
                'name': 'StorageRemote-Tests',
                'count': 21,
                'flexName': 'testA',
                'device': 'Network'
            },
            {
                'name': 'StorageMirrored-Tests',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
        ],
        componentType: 'Storage'
    },
    'Network': {
        data: [
            {
                'name': 'Network-Tests',
                'count': 20,
                'flexName': 'testA',
                'device': 'Storage'
            },
        ],
        componentType: 'Network'

    },
    'Management': {

        data: [
            {
                'name': 'ManagementTestcases',
                'count': 20,
                'flexName': 'testA',
                'device': 'Storage'
            },
            {
                'name': 'Rbac',
                'count': 30,
                'flexName': 'testA',
                'device': 'Management'
            }
        ],
        componentType: 'Management'

    },
    'Others': {

        data: [
            {
                'name': 'Upgradetests',
                'count': 20,
                'flexName': 'testA',
                'device': 'Storage'
            },
            {
                'name': 'MultizoneCluster',
                'count': 30,
                'flexName': 'testA',
                'device': 'Management'
            },
            {
                'name': 'QOSTestcases',
                'count': 21,
                'flexName': 'testA',
                'device': 'Network'
            },
            {
                'name': 'KVM',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
            {
                'name': 'HelmTestCases',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
            {
                'name': 'DT',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
            {
                'name': 'Kubernetes-tests',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
            {
                'name': 'Interfacetestcases',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
            {
                'name': 'Additionaltests',
                'count': 38,
                'flexName': 'testA',
                'device': 'Others'
            },
        ],
        componentType: 'Others'
    }

}