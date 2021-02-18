// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { saveUserPendingApproval, saveSingleTestCase, saveTestCase, updateTCEdit } from '../../../actions';
import {Col, Row, Button,Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse, UncontrolledPopover, PopoverHeader, PopoverBody
} from 'reactstrap';
import './PendingForApproval.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import EditPendingForApproval from './EditPendingForApproval';
// import EditTC from '../../views/Release/ReleaseTestMetrics/EditTC';
import { wsPA } from '../../../constants';

class PendingForApproval extends Component {
    workingStatusOptions = [{ value: 'Select Status', text: 'Select Status' },{ value: 'APPROVED', text: 'APPROVED' }, { value: 'UNAPPROVED', text: 'UNAPPROVED' }];
    editedRows = {};
    isAnyChanged = false;

    constructor(props) {
        super(props);
        this.state = {
            approveState: 'CREATED',
            reasonForUnapproval: '',
            rowsChecked: {},

            showData:[],
            rowSelect: false,
            isEditing: false,
            delete: false,
            editColumnDefs: [
                {
                    headerName: "Date", field: "Date", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "SubDomain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Scenario", field: "Scenario", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell,

                },
                {
                    headerName: "Server Type", field: "ServerType", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Status", field: "Status", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "OrchestrationPlatform", field: "OrchestrationPlatform", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Description", field: "Description", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Notes", field: "Notes", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Steps", field: "Steps", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "ExpectedBehavior", field: "ExpectedBehavior", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Master", field: "Master", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Assignee", field: "Assignee", editable: true, sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },
                {
                    headerName: "Tag", field: "Tag", sortable: true, filter: true, cellStyle: this.renderEditedCell,
                },

            ],
            columnDefs: [
                // { headerName: '', field: 'checked', cellRenderer: "checkboxRenderer" },
                {
                    headerCheckboxSelection: (params) => {
                        if (this.gridApi) {
                            this.setState({ selectedRows: this.gridApi.getSelectedRows().length })
                        }
                        return true;
                    },
                    headerCheckboxSelectionFilteredOnly: true,
                    checkboxSelection: true,
                    headerName: "Tc ID", field: "TcID", sortable: true, filter: true, cellStyle: this.renderEditedCell
                },
                {
                    headerName: "Tc Name", field: "TcName", sortable: true, filter: true, cellStyle: this.renderEditedCell
                },
                {
                    headerName: "Card Type", field: "CardType", sortable: true, filter: true, cellStyle: this.renderEditedCell, 
                },
                {
                    headerName: "Domain", field: "Domain", sortable: true, filter: true, cellStyle: this.renderEditedCell, 
                },
                {
                    headerName: "Sub Domain", field: "SubDomain", sortable: true, filter: true, cellStyle: this.renderEditedCell, 
                },
                
                // {
                //     headerName: "Assignee", field: "Assignee", sortable: true, filter: true, cellStyle: this.renderEditedCell, width: '100'
                // },
                // {
                //     headerName: "Server Type", field: "ServerType", sortable: true, filter: true, cellStyle: this.renderEditedCell
                // }
            ],
            defaultColDef: { resizable: true },

            e2eColumnDefs: [{
                headerName: "Build", field: "e2eBuild", sortable: true, filter: true,
            },
            {
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Result", field: "Result", sortable: true, filter: true,
            },
            {
                headerName: "URL", field: "logURL", sortable: true, filter: true,
            },
            {
                headerName: "Notes", field: "Notes", sortable: true, filter: true,
            },
            ],
            activityColumnDefs: [{
                headerName: "Date", field: "Date", sortable: true, filter: true,
            },
            {
                headerName: "Summary", field: "Header", sortable: true, filter: true,
            },
            {
                headerName: "Comments", field: "StatusChangeComments", sortable: true, filter: true,
            },
            ],
            modules: AllCommunityModules
        }

        this.getNotificationToAdmin();
    }

    getNotificationToAdmin = () =>{
        if(this.props.user){
           
            // console.clear();
            console.log("coming in function",this.props.user.role,this.props)
            let release = this.props.selectedRelease.ReleaseNumber;
            let url = `/api/wholetcinfo/${release}?`;
            url += ('&WorkingStatus=' + 'CREATED');

            console.log("url for admin to approve tc",url)
            axios.get(url)
            .then(response => {
                if(response.data){
                    console.log("data for cli tc",response.data.length)
                    if(response.data.length >= 1){
                        this.setState({PendingForApprovalDataList : true })
                    }
                    else{
                        this.setState({PendingForApprovalDataList : false})
                    }
                }
                console.log("changing state ",this.state.PendingForApprovalDataList)
            }).catch(err => {
                console.log("Error",err);
            })
            }
       
    }

    renderEditedCell = (params) => {
        let editedInRow = this.editedRows[`${params.data.TcID}_${params.data.CardType}`] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field].originalValue !== params.value;
        // let restored = this.editedRows[`${params.data.TcID}_${params.data.CardType}`] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] && this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field].originalValue === params.value;
        if (editedInRow) {
            this.editedRows[`${params.data.TcID}_${params.data.CardType}`].Changed = true;
            return {
                backgroundColor: 'rgb(209, 255, 82)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'rgb(255, 166, 0)'
            };
        }
        return { backgroundColor: '' };
    }

    onCellEditingStarted = params => {
        if (this.editedRows[`${params.data.TcID}_${params.data.CardType}`]) {
            if (this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field]) {
                this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field] =
                    { ...this.editedRows[`${params.data.TcID}_${params.data.CardType}`][params.colDef.field], oldValue: params.value }
            } else {
                this.editedRows[`${params.data.TcID}_${params.data.CardType}`] =
                    { ...this.editedRows[`${params.data.TcID}_${params.data.CardType}`], [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
            }
        } else {
            this.editedRows[`${params.data.TcID}_${params.data.CardType}`] = { [params.colDef.field]: { oldValue: params.value, originalValue: params.value } }
        }
    }

    onCellEditing = (params, field, value) => {
        if (this.editedRows[`${params.TcID}_${params.CardType}`]) {
            if (this.editedRows[`${params.TcID}_${params.CardType}`][field]) {
                this.editedRows[`${params.TcID}_${params.CardType}`][field] =
                    { ...this.editedRows[`${params.TcID}_${params.CardType}`][field], oldValue: params[field], newValue: value }

            } else {
            this.editedRows[`${params.TcID}_${params.CardType}`] =
                { ...this.editedRows[`${params.TcID}_${params.CardType}`], [field]: { oldValue: params[field], originalValue: params[field], newValue: value } }
            }

        } else {
            this.editedRows[`${params.TcID}_${params.CardType}`] = {
                TcID: { oldValue: `${params.TcID}`, originalValue: `${params.TcID}`, newValue: `${params.TcID}` },
                CardType: { oldValue: `${params.CardType}`, originalValue: `${params.CardType}`, newValue: `${params.CardType}` },
                [field]: { oldValue: params[field], originalValue: params[field], newValue: value }
            }
        }
    }

    getTC(e) {
        axios.get(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}/id/${e.TcID}/card/${e.CardType}`)
            .then(res => {
                this.props.saveSingleTestCase(res.data);
                this.props.updateTCEdit({ ...res.data, errors: {}, original: res.data });
            })
            .catch(err => {
                this.deselect();
            })
    }
    deselect() {
        this.gridApi.deselectAll();
        this.props.saveSingleTestCase({});
        this.props.updateTCEdit({ Master: true, errors: {}, original: null });
    }
    // renderEditedCell = (params) => {
    //     return { backgroundColor: '' };
    // }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onStatusGridReady = params => {
        this.statusGridApi = params.api;
        this.statusGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    }
    gridOperations(enable) {
        if (enable) {
            if (this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: false, loading: false });
            }
        } else {
            if (!this.state.isApiUnderProgress) {
                this.setState({ isApiUnderProgress: true });
            }
        }
    }
    onFilterTextBoxChanged(value) {
        this.deselect();
        this.setState({ domain: null, subDomain: null, CardType: null, rowSelect: false });
        this.gridApi.setQuickFilter(value);
    }
    filterData({ Domain, SubDomain, CardType }) {
        return this.props.data.filter(item => {
            let domain = Domain && Domain !== '' ? Domain : item.Domain;
            let subdomain = SubDomain && SubDomain !== '' ? SubDomain : item.SubDomain;
            let card = CardType && CardType !== '' ? CardType : item.CardType;
            if (domain === item.Domain && subdomain === item.SubDomain && card === item.CardType) {
                return true;
            }
            return false;
        })
    }
    toggleDelete = () => {
        this.setState({ delete: !this.state.delete })
    };

    // SELECTION BOX
    onSelectDomain(domain) {
        if (domain === '') {
            domain = null;
        } else {
            this.getTcByDomain(domain);
        }
        // let data = this.filterData({ Domain: domain, SubDomain: null, CardType: this.state.CardType });
        this.setState({ domain: domain, subDomain: '' });
        this.getTcs(this.state.CardType, domain, '', this.state.Priority);
    }
    onSelectSubDomain(subDomain) {
        if (subDomain === '') {
            subDomain = null;
        }
        // let data = this.filterData({ Domain: this.state.domain, SubDomain: subDomain, CardType: this.state.CardType })
        this.setState({ subDomain: subDomain });
        this.getTcs(this.state.CardType, this.state.domain, subDomain, this.state.Priority);
    }
    onSelectCardType(cardType) {
        if (cardType === '') {
            cardType = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ CardType: cardType });
        this.getTcs(cardType, this.state.domain, this.state.subDomain, this.state.Priority);
    }
    onSelectPriority(priority) {
        if (priority === '') {
            priority = null;
        }
        //let data = this.filterData({ Domain: this.state.domain, SubDomain: this.state.subDomain, CardType: cardType });
        this.setState({ Priority: priority });
        this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, priority);
    }

    getTcByDomain(domain) {
        this.gridOperations(false);
        axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcinfo/domain/' + domain)
        .then(all => {
            if (all && all.data.length) {
                axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + domain)
                    .then(res => {
                        this.gridOperations(true);
                        // this.setState({ doughnuts: getEachTCStatusScenario({ data: res.data, domain: domain, all: all.data }) })
                    }, error => {
                        this.gridOperations(true);
                    });
            }
        }, error => {
            this.gridOperations(true);
        })
    }
    getTcs(CardType, domain, subDomain, priority, selectedRelease) {
        let release = selectedRelease ? selectedRelease : this.props.selectedRelease.ReleaseNumber;
        if (!release) {
            return;
        }
        this.gridOperations(false);
        let url = `/api/wholetcinfo/${release}?`;
        if (CardType || domain || subDomain || priority) {
            url = `/api/wholetcinfo/${release}?`;
            if (CardType) url += ('&CardType=' + CardType);
            if (domain) url += ('&Domain=' + domain);
            if (subDomain) url += ('&SubDomain=' + subDomain);
            if (priority) url += ('&Priority=' + priority);
        }
        url += ('&WorkingStatus=' + 'CREATED');

        console.clear();
        console.log("props for user",this.props.user,this.props.users)
        this.getNotificationToAdmin();

        if (this.props.user && this.props.user.role != 'ADMIN') {
            let user = this.props.user.name;
            url += ('&Assignee=' + user)
        }

        axios.get(url)
        .then(response => {
            this.setState({
                showData : response.data
            })
        }).catch(err => {
            console.log("Error",err);
        })
    }
    rowSelect(e) {
        this.setState({ rowSelect: true, toggleMessage: null })
        this.props.updateTCEdit({ Master: true, errors: {} });
        this.getTC(e.data);
    }
    toggle = () => this.setState({ modal: !this.state.modal,rowSelect:false });
    toggleMultiple = () => this.setState({ modalMultiple: !this.state.modalMultiple });
    toggleAllSAVE = () => {
        this.setState({ multipleChanges: !this.state.multipleChanges })
    };
    popoverToggleSAVE = () => this.setState({ popoverOpenSAVE: !this.state.popoverOpenSAVE });
    popoverToggleCREATED = () => this.setState({ popoverOpenCREATED: !this.state.popoverOpenCREATED });
    reset() {
        this.props.updateTCEdit({ ...this.props.tcDetails, errors: {} });
        this.setState({ isEditing: false });
    }
    textFields = [
        'Domain', 'SubDomain', 'Scenario', 'TcID', 'TcName', 'Tag', 'Assignee',
        'Description', 'Steps', 'ExpectationBehavior', 'Notes','CardType',
    ];
    arrayFields = [ 'ServerType', 'OrchestrationPlatform']
    whichFieldsUpdated(old, latest) {
        let changes = {};
        this.textFields.forEach(item => {
            if(old[item] !== latest[item]) {
                changes[item] = {old: old[item], new: latest[item]}
            }
        });
        this.arrayFields.forEach(item => {
            if(!old[item] && latest[item]) {
                changes[item] = {old: '', new: latest[item]}
            } else if(!latest[item] && old[item]) {
                changes[item] = {old: old[item], new: ''}
            } else if(old[item] && latest[item]){
                let arrayChange = latest[item].filter(each => old[item].includes(each));
                if(arrayChange.length > 0) {
                    changes[item] = {old: old[item], new: latest[item]}
                }
            }
        });
        return changes;
    }
    joinArrays(array) {
        if (!array) {
            array = [];
        }
        if (array && !Array.isArray(array)) {
            array = array.split(',');
        }
        return array;
    }

    // Save Multiple TC
    saveAll() {
        this.gridOperations(false);
        let items = [];
        let currentUser = "UNKNOWN"
        let tcResult = ''
        let tcName = 'TC NOT AUTOMATED'
        if(this.props.currentUser){
            currentUser = this.props.currentUser.name
        }
        let selectedRows = this.gridApi.getSelectedRows();
        selectedRows.forEach(item => {
            tcResult = item.CurrentStatus.Result;
            tcName = item.TcName;
            console.log("selected row",item.CurrentStatus.Result,item)
            let pushable = {
                TcID: item.TcID,
                CardType: item.CardType,
                Activity: {
                    Release: this.props.selectedRelease.ReleaseNumber,
                    "TcID": item.TcID,
                    CardType: item.CardType,
                    "UserName": this.props.user.email,
                    LogData: ``,
                    "RequestType": 'PUT',
                    "URL": `/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`
                }
            };
            ['WorkingStatus'].map(each => {
                if (item[each]) {
                    pushable[each] = item[each]
                    let old = item[each];
                    if (this.editedRows[`${item.TcID}_${item.CardType}`] && this.editedRows[`${item.TcID}_${item.CardType}`][each]) {
                        old = `${this.editedRows[`${item.TcID}_${item.CardType}`][each].originalValue}`
                    }
                    pushable.Activity.LogData += `${each}:{old: ${old}, new: ${item[each]}}, `

                    if(item[each] ==  'APPROVED'){
                        if(tcResult === ""){
                            console.log("coming in tcresult",tcResult)
                            // pushable.stateUserMapping =  {"Manual Assignee" : item.Assignee,"Manual WorkingStatus" : "Inprogress","Automation Assignee" : "-","Automation WorkingStatus":"AUTO_ASSIGNED"}
                            pushable.stateUserMapping =  {"Manual Assignee" : item.Assignee,"Manual WorkingStatus" : "Inprogress"}
                            pushable["Manual WorkingStatus"] = "Inprogress"
                            pushable["Manual Assignee"] = item.Assignee
                            // pushable["Automation WorkingStatus"] = "AUTO_ASSIGNED"
                            // pushable["Automation Assignee"] = "-"

                        }
                        else{
                            // pushable.stateUserMapping =  {"Manual Assignee" : item.Assignee,"Manual WorkingStatus" : "MANUAL_COMPLETED","Automation Assignee" : "-","Automation WorkingStatus":"AUTO_ASSIGNED"}
                            pushable.stateUserMapping =  {"Manual Assignee" : item.Assignee,"Manual WorkingStatus" : "MANUAL_COMPLETED"}
                            pushable["Manual WorkingStatus"] = "MANUAL_COMPLETED"
                            pushable["Manual Assignee"] = item.Assignee
                            // pushable["Automation WorkingStatus"] = "AUTO_ASSIGNED"
                            // pushable["Automation Assignee"] = "-"
                        }

                        // if(tcName !== 'TC NOT AUTOMATED'){

                        //     pushable.stateUserMapping =  {"Automation Assignee" : item.stateUserMapping["Automation Assignee"],"Automation WorkingStatus":item.stateUserMapping["Automation WorkingStatus"]}
                        //     pushable["Automation WorkingStatus"] = item.stateUserMapping["Automation WorkingStatus"]
                        //     pushable["Automation Assignee"] = item.stateUserMapping["Automation Assignee"]
                        // }
                        
                    }
                    if(item[each] == 'UNAPPROVED'){
                        pushable.stateUserMapping = {'UNAPPROVED':`${currentUser}`}
                    }
                }
            })
            items.push(pushable);
        })
        console.log("before put request data",items)
        axios.put(`/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`, items)
        .then(res => {
            this.gridOperations(true);
            this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain, false, false, false, true)
            alert('Tc Added Successfully');
        }, error => {
            this.gridOperations(true);
            alert('Failed To Add TC ',error);
        });
    }

    // Save Single Tc
    save() {
        let data = {};
        data.OldWorkingStatus = this.props.tcDetails.WorkingStatus;
        // tc info fields
        this.textFields.map(item => data[item] = this.props.testcaseEdit[item]);
        this.arrayFields.forEach(item => data[item] = this.joinArrays(this.props.testcaseEdit[item]));
        data.Assignee = data.Assignee ? data.Assignee : 'ADMIN';
        data.WorkingStatus = this.state.approveState;
        data.Activity={
            "Date": new Date().toISOString(),
            "Header": `${data.WorkingStatus}: ${this.props.selectedRelease.ReleaseNumber}, master, REPORTER: ${this.props.user.email} `,
            "Details": this.changeLog,
            "StatusChangeComments": data.WorkingStatus === 'UNAPPROVED' ? this.state.reasonForUnapproval : ''
        };

        let currentUser = "UNKNOWN"
        if(this.props.user.currentUser){
            currentUser = this.props.user.currentUser.name
        }

        if(this.state.approveState == 'APPROVED'){

            // data.stateUserMapping = {'APPROVED':`${currentUser}`}
            // data.stateUserMapping = {"Manual Assignee":data.Assignee,"Manual WorkingStatus":"Inprogress","Automation Assignee":"-","Automation WorkingStatus":"AUTO_ASSIGNED"}
            data.stateUserMapping = {"Manual Assignee":data.Assignee,"Manual WorkingStatus":"Inprogress"}
            data["Manual WorkingStatus"] = "Inprogress"
            data["Manual Assignee"] = data.Assignee
            // data["Automation WorkingStatus"] = "AUTO_ASSIGNED"
            // data["Automation Assignee"] = "-"
        }

        if(this.state.approveState == 'UNAPPROVED'){
            data.stateUserMapping = {"UNAPPROVED":`${currentUser}`}
            // data.stateUserMapping = {'Manual Assignee':'','Manual WorkingStatus':'','Automation Assignee':'','Automation WorkingStatus':''}
        }

        if(this.state.approveState == 'CREATED'){
            data.stateUserMapping = {"CREATED":`${currentUser}`}
        }

        data.UnapproveTCReason = this.state.reasonForUnapproval
        console.log("before single tc save",this.props.tcDetails,data)

        axios.put(`/api/tcupdate/${this.props.selectedRelease.ReleaseNumber}`, [data] )
            .then(res => {
                this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.props.testcaseEdit.TcID} Added Successfully` });
                this.getTcs();
            }, error => {
                let message = error.response.data.message;
                let found = false;
                ['Domain', 'SubDomain', 'TcID', 'TcName', 'CardType', 'ServerType', 'Scenario', 'OrchestrationPlatform',
                    'Description', 'ExpectedBehavior', 'Notes', 'Steps', 'Date', 'Master', 'Assignee', 'Created', 'Tag', 'Activity']
                    .forEach((item, index) => {
                        if (!found && message.search(item) !== -1) {
                            found = true;
                            let msg = { [item]: `Invalid ${item} ` };
                            if (item === 'TcID' || item === 'TcName') {
                                msg = { [item]: `Invalid or Duplicate ${item} ` };
                            }
                            this.setState({ errors: msg, toggleMessage: `Error: ${error.message} ` });
                            this.toggle();
                        }
                    });
                if (!found) {
                    this.setState({ errors: {}, toggleMessage: `Error: ${error.message} ` });
                    this.toggle();
                }
            });
        this.setState({ toggleMessage: null, isEditing: false })
        // this.toggle();
    }
    confirmToggle() {
        let errors = null;
        this.changeLog = {};
        ['Domain', 'SubDomain', 'TcID', 'CardType']
            .forEach(item => {
                if (!errors) {
                    let valid = (this.props.testcaseEdit[item] && this.props.testcaseEdit[item].length > 0);
                    if (!valid) {
                        errors = { ...this.props.testcaseEdit.errors, [item]: 'Cannot be empty' };
                    }
                }
            });
            if (!isNaN(this.props.testcaseEdit['TcID'])) {
                errors = { ...this.props.testcaseEdit.errors, TcID: 'Cannot be a number' };
            }
            if (!errors) {
                this.changeLog = this.whichFieldsUpdated(this.props.testcaseDetail, this.props.testcaseEdit);
                this.setState({ toggleMessage: null })
                this.toggle();
            } else {
                this.setState({ errors: errors })
            }
    }
    delete() {
        if (this.props.testcaseEdit.TcID) {
            axios.delete(`/test/${this.props.selectedRelease.ReleaseNumber}/tcinfo/details/id/${this.props.testcaseEdit.TcID} `)
                .then(data => {
                    this.deselect();
                    this.getTcs();
                }, error => {
                    this.setState({ errors: {}, toggleMessage: `Error: ${error.message} ` });
                    this.toggle();
                })
        }
    }
    render() {
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => {
                                            if (!this.state.tcOpen) {
                                                this.getTcs();
                                            }
                                            this.setState({ tcOpen: !this.state.tcOpen })
                                        }} style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.tcOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.tcOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>CLI Test Cases Pending For Approval</span> &nbsp;&nbsp;&nbsp;&nbsp;
                                            {
                                                this.state.PendingForApprovalDataList ? <i class="fa fa-bell" aria-hidden="true"> New Tc's Are Added. Needs to be approve/unapprove </i> : null
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div>
                                <div style={{ width: (window.screen.width * (1 - 0.248)) + 'px', height: '250px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            {
                                                this.props.data &&
                                                <div class="col-md-2">
                                                    <Input value={this.state.CardType} onChange={(e) => this.onSelectCardType(e.target.value)} type="select" name="selectCardType" id="selectCardType">
                                                        <option value=''>Select Card Type</option>
                                                        {
                                                            this.props.selectedRelease.CardType && this.props.selectedRelease.CardType.map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.props.data &&
                                                <div class="col-md-3">
                                                    <Input value={this.state.domain} onChange={(e) => this.onSelectDomain(e.target.value)} type="select" name="selectDomain" id="selectDomain">
                                                        <option value=''>Select Domain</option>
                                                        {
                                                            this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions && Object.keys(this.props.selectedRelease.TcAggregate.AvailableDomainOptions).map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                this.props.data &&
                                                <div class="col-md-3">
                                                    <Input value={this.state.subDomain} onChange={(e) => this.onSelectSubDomain(e.target.value)} type="select" name="subDomains" id="subDomains">
                                                        <option value=''>Select Sub Domain</option>
                                                        {
                                                            this.state.domain && this.props.selectedRelease.TcAggregate && this.props.selectedRelease.TcAggregate.AvailableDomainOptions[this.state.domain].map(item => <option value={item}>{item}</option>)
                                                        }
                                                    </Input>
                                                </div>
                                            }
                                            {
                                                // this.props.user && this.props.user.isAdmin &&
                                                this.props.user &&
                                                <div style={{ width: '8rem', marginLeft: '0.5rem' }}>
                                                    <span>
                                                        <Button  id="PopoverAssignCREATED" type="button">Apply Multiple</Button>
                                                        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssignCREATED" id="PopoverAssignButtonCREATED" toggle={() => this.popoverToggleCREATED()} isOpen={this.state.popoverOpenCREATED}>
                                                            <PopoverBody>
                                                                {
                                                                    [
                                                                        { labels: 'WorkingStatus', values: [{ value: '', text: 'Select Working Status' }, ...(wsPA.map(each => ({ value: each, text: each })))] },
                                                                    ].map(each => <FormGroup className='rp-app-table-value'>
                                                                        
                                                                        <Label className='rp-app-table-label' htmlFor={each.labels}>
                                                                            {each.header}
                                                                        </Label>
                                                                        <Input  value={this.state.multi && this.state.multi[each.labels]} onChange={(e) => {
                                                                            this.isAnyChanged = true;
                                                                            let selectedRows = this.gridApi.getSelectedRows();
                                                                            if (e.target.value && e.target.value !== '') {
                                                                                selectedRows.forEach(item => {
                                                                                    this.onCellEditing(item, each.labels, e.target.value)
                                                                                    item[each.labels] = e.target.value;
                                                                                })
                                                                            }
                                                                            this.setState({ multi: { ...this.state.multi, [each.labels]: e.target.value } })
                                                                            setTimeout(this.gridApi.redrawRows(), 0);
                                                                        }} type="select" id={`select_${each.labels}`}>
                                                                            {
                                                                                each.values.map(item => <option value={item.value}>{item.text}</option>)
                                                                            }
                                                                        </Input>
                                                                    </FormGroup>)
                                                                }
                                                                <div style={{ float: 'right', marginBottom: '0.5rem' }}>
                                                                    <span>
                                                                        {
                                                                            this.isAnyChanged &&
                                                                            <Button  title="Undo" size="md" className="rp-rb-save-btn" onClick={() => this.getTcs(this.state.CardType, this.state.domain, this.state.subDomain)} >
                                                                                Undo
                                                                            </Button>
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            this.isAnyChanged &&
                                                                            <Button  title="Save" size="md" className="rp-rb-save-btn" onClick={() => { this.popoverToggleSAVE(); this.toggleAllSAVE() }} >
                                                                                Save
                                                                            </Button>
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </PopoverBody>
                                                        </UncontrolledPopover>
                                                    </span>
                                                </div>
                                            }

                                            

                                            <div class="col-md-2">
                                                <Input type="text" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onFilterTextBoxChanged(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="myGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                onRowClicked={(e) => this.rowSelect(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefs}
                                                rowSelection='multiple'
                                                defaultColDef={this.state.defaultColDef}
                                                rowData={this.state.showData ? this.state.showData : []}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Collapse isOpen={this.state.rowSelect}>
                                    {
                                        <React.Fragment>
                                            {
                                                this.state.isEditing ?
                                                    <Fragment>
                                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                                            <i className="fa fa-check-square-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.reset()} >
                                                            <i className="fa fa-undo"></i>
                                                        </Button>
                                                    </Fragment>
                                                    :
                                                    <Fragment>

                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggleDelete()} >
                                                            <i className="fa fa-trash-o"></i>
                                                        </Button>
                                                        <Button size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.setState({ isEditing: true })} >
                                                            <i className="fa fa-pencil-square-o"></i>
                                                        </Button>
                                                    </Fragment>
                                            }
                                        </React.Fragment>
                                    }
                                    {
                                        this.props.tcDetails && this.props.tcDetails.TcID &&
                                        <React.Fragment>
                                        <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                                                <Col xs="6" md="4" lg="3">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Label className='rp-app-table-label' htmlFor="CurrentWorkingStatus">
                                                            Current Working Status
                                                        </Label>
                                                        <div className='rp-app-table-value'><span className='rp-edit-TC-span'>{this.props.tcDetails && this.props.tcDetails.WorkingStatus}</span></div>
                                                    </FormGroup>
                                                </Col>
                                                {
                                                    this.state.isEditing &&
                                                    <Col xs="6" md="4" lg="3">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Label className='rp-app-table-label' htmlFor="Approve">
                                                            Approve/UnApprove
                                                        </Label>
                                                        <Input value={this.state.approveState} onChange={(e) => this.setState({approveState: e.target.value})} type="select" name="selectApproval" id="selectApproval">
                                                        {
                                                            this.workingStatusOptions.map(item => <option value={item.value}>{item.text}</option>)
                                                        }
                                                    </Input>
                                                    </FormGroup>
                                                </Col>
                                                }
                                                   {
                                                    this.state.isEditing &&
                                                    <Col xs="6" md="4" lg="3">
                                                    <FormGroup className='rp-app-table-value'>
                                                        <Label className='rp-app-table-label' htmlFor="Reason">
                                                           Reason For UnApproval
                                                        </Label>
                                                        <Input value={this.state.reasonForUnapproval} placeholder='Add Reason' onChange={(e) => this.setState({reasonForUnapproval: e.target.value})} type="text" name="selectReason" id="selectReason">
                                                    </Input>
                                                    </FormGroup>
                                                </Col>
                                                }
                                        </FormGroup>
                                            <FormGroup row className="my-0">
                                                {
                                                    [
                                                        { field: 'Description', header: 'Description', type: 'text' },
                                                        { field: 'Steps', header: 'Steps', type: 'text' },
                                                        { field: 'ExpectedBehaviour', header: 'Expected Behaviour', type: 'text' },
                                                        { field: 'Notes', header: 'Notes', type: 'text' },

                                                    ].map((item, index) => (
                                                        <Col xs="12" md="6" lg="6" className='rp-margin-tp-btm-1'>
                                                            <FormGroup className='rp-app-table-value'>
                                                                <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                                                    this.props.testcaseEdit.errors.Master &&
                                                                    <i className='fa fa-exclamation-circle rp-error-icon'>{this.props.testcaseEdit.errors.Master}</i>
                                                                }</Label>
                                                                {
                                                                    !this.state.isEditing ?
                                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '', backgroundColor: 'white' }} className='rp-app-table-value' type='textarea' rows='9' value={this.props.tcDetails && this.props.tcDetails[item.field]}></Input>
                                                                        :
                                                                        <Input style={{ borderColor: this.props.testcaseEdit.errors[item.field] ? 'red' : '' }} className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows='4' id={item.field} value={this.props.testcaseEdit && this.props.testcaseEdit[item.field]}
                                                                        onChange={(e) => this.props.updateTCEdit({ ...this.props.testcaseEdit, [item.field]: e.target.value, errors: { ...this.props.testcaseEdit.errors, [item.field]: null } })} >

                                                                        </Input>
                                                                }
                                                            </FormGroup>
                                                        </Col>
                                                    ))
                                                }
                                            </FormGroup>
                                            <EditPendingForApproval isEditing={this.state.isEditing}></EditPendingForApproval>
                                            <Row>
                                                <Col lg="6">
                                                    <div className='rp-app-table-title'>Activity</div>
                                                    <div style={{ width: (window.screen.width * ((1 - 0.418) / 2)) + 'px', height: '150px', marginBottom: '3rem' }}>
                                                        <div style={{ width: "100%", height: "100%" }}>
                                                            <div
                                                                id="activityGrid"
                                                                style={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                }}
                                                                className="ag-theme-balham"
                                                            >
                                                                <AgGridReact
                                                                    modules={this.state.modules}
                                                                    columnDefs={this.state.activityColumnDefs}
                                                                    defaultColDef={this.state.defaultColDef}
                                                                    rowData={this.props.tcDetails ? this.props.tcDetails.Activity : []}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </React.Fragment>
                                    }
                                </Collapse>
                            </div >
                        </Collapse>

                    </Col>
                </Row>
                {/* <Modal isOpen={this.state.modalMultiple} toggle={() => this.toggleMultiple()}>
                    {
                        <ModalHeader toggle={() => this.toggleMultiple()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to make the changes?`
                        }
                        {
                            < React.Fragment >
                                <Row>
                                    <Col xs="11" md="11" lg="11">

                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggleMultiple(); this.save() }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleMultiple()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal> */}
                <Modal isOpen={this.state.multipleChanges} toggle={() => this.toggleAllSAVE()}>
                    {
                        <ModalHeader toggle={() => this.toggleAllSAVE()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to update multiple changes ?`
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.toggleAllSAVE(); this.saveAll(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleAllSAVE()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    {
                        !this.state.toggleMessage &&
                        <ModalHeader toggle={() => this.toggle()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            this.state.toggleMessage ? this.state.toggleMessage : `Are you sure you want to make the changes ? `
                        }
                        {
                            !this.state.toggleMessage && this.props.testcaseEdit.original &&
                            < React.Fragment >
                                <Row>
                                    <Col xs="11" md="11" lg="11">
                                        <div>Original</div>
                                        <div style={{ width: '450px', height: '150px', marginBottom: '3rem' }}>
                                            <div style={{ width: "100%", height: "100%" }}>
                                                <div
                                                    id="e2eGrid"
                                                    style={{
                                                        height: "100%",
                                                        width: "100%",
                                                    }}
                                                    className="ag-theme-balham"
                                                >
                                                    <AgGridReact
                                                        modules={this.state.modules}
                                                        columnDefs={this.state.editColumnDefs}
                                                        defaultColDef={this.state.defaultColDef}
                                                        rowData={[this.props.testcaseEdit.original]}

                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs="11" md="11" lg="11">
                                        <div>Updated</div>
                                        <div style={{ width: '450px', height: '150px', marginBottom: '3rem' }}>
                                            <div style={{ width: "100%", height: "100%" }}>
                                                <div
                                                    id="e2eGrid"
                                                    style={{
                                                        height: "100%",
                                                        width: "100%",
                                                    }}
                                                    className="ag-theme-balham"
                                                >
                                                    <AgGridReact
                                                        modules={this.state.modules}
                                                        columnDefs={this.state.editColumnDefs}
                                                        defaultColDef={this.state.defaultColDef}
                                                        rowData={[this.props.testcaseEdit]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.state.toggleMessage ? this.toggle() : this.save()}>Ok</Button>{' '}
                        {
                            !this.state.toggleMessage &&
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.delete} toggle={() => this.toggleDelete()}>
                    {
                        <ModalHeader toggle={() => this.toggleDelete()}>{
                            'Delete Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            `Are you sure you want to delete ${this.props.testcaseEdit.TcID} ?`
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.delete(); this.toggleDelete(); }}>Ok</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleDelete()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div >

        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    user: state.auth.currentUser,
    users: state.user.users,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    data: state.user.pendingApproval,
    tcDetails: state.testcase.testcaseDetail,
    testcaseEdit: state.testcase.testcaseEdit,
})
export default connect(mapStateToProps, { saveUserPendingApproval, saveTestCase, getCurrentRelease, saveSingleTestCase, updateTCEdit })(PendingForApproval);
