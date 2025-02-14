// Issues faced on customer side and reported by QA (jira - list)
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Col,Row, Table, Button,
    UncontrolledPopover, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './CustomerBugs.scss';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import MoodEditor from "../TestCasesAll/moodEditor";
import MoodRenderer from "../TestCasesAll/moodRenderer";
import NumericEditor from "../TestCasesAll/numericEditor";
import SelectionEditor from '../TestCasesAll/selectionEditor';
import DatePickerEditor from '../TestCasesAll/datePickerEditor';
import  CheckBox  from '../TestCasesAll/CheckBox';
import { element } from 'prop-types';
import { CSVLink } from 'react-csv';
import {projects, projectToManagerMap, projectsList, devManagers, status,getBusinessDaysCount} from "../../constants";
const OneJan = new Date("2022-01-01T00:00:00.000-0800").getTime();
class PendingPostReleaseByReleases extends Component {
    startAt = 0;
    isApiUnderProgress = false;
    allTCsToShow = [];
    TicketsBySeverity = [];
    TicketsByProduct = [];
    TicketsByDevManager = [];
    TicketsByDeveloper = [];
    AvgAgeBySeverity = [];
    maxResult= 0;
    ApplicableTcsCR = [];
    devList = [];
    fixStr = '';
    manList = [];
    bugsToShowCR = [];
    constructor(props) {
        super(props);
        this.csvLink = React.createRef();
        let bugColumnDefDictCR = {
            'BugNo' : {
                headerName: "Bug No", field: "BugNo", sortable: true, filter: true,
                editable: false,
                width: '130',
                cellRenderer: function(params) {
                    let keyData = params.data.BugNo;
                    let newLink = `<a href= https://diamanti.atlassian.net/browse/${keyData} target= "_blank">${keyData}</a>`;
                    return newLink;
                },
            },
            'BU' : {
                headerCheckboxSelection: (params) => {
                    if (this.bugGridApiCR) {
                        this.setState({ bugSelectedRowsCR: this.bugGridApiCR.getSelectedRows().length })
                    }
                    return true;
                  },
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                headerName: "BU", field: "BU", sortable: true, filter: true,
                width: '130',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Summary': {
                headerName: "Summary", field: "Summary", sortable: true, filter: true,
                width: '250',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Severity' : {
                headerName: "Severity", field: "Severity", sortable: true, filter: true,
                width: '50',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'QAName' : {
                headerName: "QA Name", field: "QAName", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'ReportedBy' : {
                headerName: "Reported By", field: "ReportedBy", sortable: true, filter: true,
                width: '90',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'Developer' : {
                headerName: "Assigned To", field: "Developer", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'DevManager' : {
                headerName: "Dev Manager", field: "DevManager", sortable: true, filter: true,
                width: '90',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'ReportedDate' : {
                headerName: "Reported Date", field: "ReportedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'OpenDays' : {
                headerName: "Open Days", field: "OpenDays", sortable: true, filter: true,
                width: '80',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'DaysWithoutDueDate' : {
                headerName: "Days Without Due Date", field: "DaysWithoutDueDate", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'DaysPassedDueDate' : {
                headerName: "Days Passed Due Date", field: "DaysPassedDueDate", sortable: true, filter: true,
                width: '150',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'ETA' : {
                headerName: "Due Date", field: "ETA", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
            'QAValidatedDate' : {
                headerName: "QA Validated Date", field: "QAValidatedDate", sortable: true, filter: true,
                width: '100',
                editable: false,
                cellClass: 'cell-wrap-text',
            },
        }
        let columnDefDict = {
            'Severity' : {
                headerName: "Severity", field: "Severity", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.Total;
                    let priority = params.data.Severity;
                    if(priority == "P2"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20in%20(High)%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20in%20(High)%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(priority != "Total"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20in%20(Low%2CLowest%2CMedium)%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20in%20(Low%2CLowest%2CMedium)%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
        }
        let devmColumnDefDict = {
            'DevManager' : {
                headerName: "Dev Manager", field: "DevManager", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'WithDueDate' : {
                headerName: "With Due Date", field: "WithDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.WithDueDate;
                    let Manager = params.data.DevManager;
                    if(Manager != "Total"){
                        let proj = ''
                        let newLink = ''
                        if (Manager != 'Unclassified'){
                            for (let i = 0; i < projectToManagerMap[Manager].length -1; i++){
                                proj = proj + projectToManagerMap[Manager][i] + '\, '
                            }
                            proj = proj + projectToManagerMap[Manager][projectToManagerMap[Manager].length - 1]
                            proj = encodeURIComponent(proj);
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        else {
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'WithOutDueDate' : {
                headerName: "Without Due Date", field: "WithOutDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.WithOutDueDate;
                    let Manager = params.data.DevManager;
                    if(Manager != "Total"){
                        let proj = ''
                        let newLink = ''
                        if (Manager != 'Unclassified'){
                            for (let i = 0; i < projectToManagerMap[Manager].length -1; i++){
                                proj = proj + projectToManagerMap[Manager][i] + '\, '
                            }
                            proj = proj + projectToManagerMap[Manager][projectToManagerMap[Manager].length - 1]
                            proj = encodeURIComponent(proj);
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            }
                        else {
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'PassedDueDate' : {
                headerName: "Passed Due Date", field: "PassedDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.PassedDueDate;
                    let Manager = params.data.DevManager;
                    if(Manager != "Total"){
                        let proj = ''
                        let newLink = ''
                        if (Manager != 'Unclassified'){
                            for (let i = 0; i < projectToManagerMap[Manager].length -1; i++){
                                proj = proj + projectToManagerMap[Manager][i] + '\, '
                            }
                            proj = proj + projectToManagerMap[Manager][projectToManagerMap[Manager].length - 1]
                            proj = encodeURIComponent(proj);
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%3C%20now()%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%3C%20now()%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        else {
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%3C%20now()%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%3C%20now()%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'AvgDaysWithoutDueDate' : {
                headerName: "Average Days Without Due Date", field: "AvgDaysWithoutDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.Total;
                    let Manager = params.data.DevManager;
                    if(Manager != "Total"){
                        let proj = ''
                        let newLink = ''
                        if (Manager != 'Unclassified'){
                            for (let i = 0; i < projectToManagerMap[Manager].length -1; i++){
                                proj = proj + projectToManagerMap[Manager][i] + '\, '
                            }
                            proj = proj + projectToManagerMap[Manager][projectToManagerMap[Manager].length - 1]
                            proj = encodeURIComponent(proj);
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${proj})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        else {
                            //newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                            newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        }
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
        }
        let proColumnDefDict = {
            'Product' : {
                headerName: "Product", field: "Product", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'P2' : {
                headerName: "P2", field: "P2", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.P2;
                    let Product = params.data.Product
                    if (Product == "Unclassified"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(Product != "Total"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'P3' : {
                headerName: "P3", field: "P3", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.P3;
                    let Product = params.data.Product
                    if (Product == "Unclassified"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20priority%20!%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20priority%20!%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(Product != "Total"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20priority%20!%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20priority%20!%3D%20High%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.Total;
                    let Product = params.data.Product
                    if (Product == "Unclassified"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20not%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else if(Product != "Total"){
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${Product})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
        }
        let devColumnDefDict = {
            'Developer' : {
                headerName: "Developer", field: "Developer", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'WithDueDate' : {
                headerName: "With Due Date", field: "WithDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.WithDueDate;
                    if (params.data.Developer.trim() != "Total"){
                        let dev = encodeURIComponent(params.data.Developer.trim());
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20assignee%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20%20AND%20duedate%20%20is%20not%20EMPTY%20AND%20assignee%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'WithOutDueDate' : {
                headerName: "Without Due Date", field: "WithOutDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.WithOutDueDate;
                    if (params.data.Developer.trim() != "Total"){
                        let dev = encodeURIComponent(params.data.Developer.trim());
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20is%20EMPTY%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'PassedDueDate' : {
                headerName: "Passed Due Date", field: "PassedDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.PassedDueDate;
                    if (params.data.Developer.trim() != "Total"){
                        let dev = encodeURIComponent(params.data.Developer.trim());
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20%3C%20now()%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20duedate%20%20%3C%20now()%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
            'AvgWithoutDueDate' : {
                headerName: "Average Days Without Due Date", field: "AvgWithoutDueDate", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'Total' : {
                headerName: "Total", field: "Total", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
                cellRenderer: (params) => {
                    let keyData = params.data.Total;
                    if (params.data.Developer.trim() != "Total"){
                        let dev = encodeURIComponent(params.data.Developer.trim());
                        //let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20AND%20created%20%3E%3D%202022-01-01%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        let newLink = `<a href= https://diamanti.atlassian.net/issues/?jql=project%20in%20(${projects})%20AND%20issuetype%20in%20(Bug)%20AND%20status%20in%20(${status})%20AND%20(duedate%20is%20EMPTY%20OR%20duedate%20is%20not%20empty)%20AND%20assignee%20%3D%20%22${dev}%22%20AND%20priority%20!%3D%20Highest%20AND%20(labels%20not%20in%20(active)%20OR%20labels%20is%20EMPTY)%20AND%20fixVersion%20in%20(${encodeURIComponent(this.props.parentData)})%20ORDER%20BY%20created%20DESC target= "_blank">${keyData}</a>`;
                        return newLink;
                    }
                    else{
                        return keyData;
                    }
                },
            },
        }
        let avgAgeColumnDefDict = {
            'Severity' : {
                headerName: "Severity", field: "Severity", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
            'AvgOpenDays' : {
                headerName: "Average Open Days", field: "AvgOpenDays", sortable: true, filter: true,
                width: '150',
                cellClass: 'cell-wrap-text',
                editable: false,
            },
        }

        this.state = {
            selectedRows: 0,
            proSelectedRows: 0,
            devmSelectedRows: 0,
            devSelectedRows: 0,
            bugSelectedRowsCR: 0,
            avgSelectedRows: 0,
            buisnessUnitCR: null,
            customerCR: null,
            managerCR: null,
            developerCR: null,
            sevstr: '',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',

            columnDefs: [
                columnDefDict['Severity'],
                columnDefDict['Total'],
            ],
            proColumnDefs: [
                proColumnDefDict['Product'],
                proColumnDefDict['P2'],
                proColumnDefDict['P3'],
                proColumnDefDict['Total'],
            ],
            devmColumnDefs: [
                devmColumnDefDict['DevManager'],
                devmColumnDefDict['WithDueDate'],
                devmColumnDefDict['WithOutDueDate'],
                devmColumnDefDict['PassedDueDate'],
                devmColumnDefDict['AvgDaysWithoutDueDate'],
                devmColumnDefDict['Total'],
            ],
            devColumnDefs: [
                devColumnDefDict['Developer'],
                devColumnDefDict['WithDueDate'],
                devColumnDefDict['WithOutDueDate'],
                devColumnDefDict['PassedDueDate'],
                devColumnDefDict['AvgWithoutDueDate'],
                devColumnDefDict['Total'],
            ],
            bugColumnDefsCR: [
                bugColumnDefDictCR['BU'],
                bugColumnDefDictCR['Developer'],
                bugColumnDefDictCR['DevManager'],
                bugColumnDefDictCR['ReportedDate'],
                bugColumnDefDictCR['OpenDays'],
                bugColumnDefDictCR['DaysWithoutDueDate'],
                bugColumnDefDictCR['DaysPassedDueDate'],
                bugColumnDefDictCR['Severity'],
                bugColumnDefDictCR['BugNo'],
                bugColumnDefDictCR['Summary'],
                bugColumnDefDictCR['ETA'],
                bugColumnDefDictCR['ReportedBy'],
                bugColumnDefDictCR['QAName'],
                bugColumnDefDictCR['QAValidatedDate'],
            ],
            statusColumnCR:[
                {id:1,value:'P1', isChecked: false},
                {id:2,value:'P2', isChecked: true},
                {id:3,value:'P3', isChecked: true},
            ],
            avgAgeColumnDefs: [
                avgAgeColumnDefDict['Severity'],
                avgAgeColumnDefDict['AvgOpenDays'],
            ],
            defaultColDef: { resizable: true },
            modules: AllCommunityModules,
            frameworkComponents: {
                moodRenderer: MoodRenderer,
                moodEditor: MoodEditor,
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },
        }
    }
    popoverToggle2CR = () => this.setState({ popoverOpen2CR: !this.state.popoverOpen2CR });
    getRowHeight = (params) => {
        if (params.data && params.data.Description) {
            return 28 * (Math.floor(params.data.Description.length / 60) + 2);
        }
        // assuming 50 characters per line, working how how many lines we need
        return 100;
    }
    // onRowSelected = (params) => {
    //     if (this.gridApi) {
    //         if (params.column && params.column.colId !== "BugNo") {
    //             return false
    //         } else {
    //             return true
    //         }
    //     }
    //     return false;
    // }
    handleAllCheckedStatusTCsCR = (event) => {
        let statusColumnCR = this.state.statusColumnCR
        statusColumnCR.forEach(columnName => columnName.isChecked = event.target.checked)
        this.setState({statusColumnCR: statusColumnCR})
    }

    handleCheckChieldElementStatusTcsCR = (event) => {
        let statusColumnCR = this.state.statusColumnCR
        statusColumnCR.forEach(columnName => {
            if (columnName.value === event.target.value)
                columnName.isChecked =  event.target.checked
        })
        this.setState({statusColumnCR: statusColumnCR})
    }
    onBugSelectionChangedCR = (event) => {
        this.setState({ bugSelectedRowsCR: event.api.getSelectedRows().length })
    }
    onBugGridReadyCR = params => {
        this.bugGridApiCR = params.api;
        this.bugGridColumnApiCR = params.columnApi;
        const sortModelCR = [
            {colId: 'ReportedDate', sort: 'desc'}
        ];
        this.bugGridApiCR.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    onSelectionChanged = (event) => {
        this.setState({ selectedRows: event.api.getSelectedRows().length })
    }
    onProSelectionChanged = (event) => {
        this.setState({ proSelectedRows: event.api.getSelectedRows().length })
    }
    onDevmSelectionChanged = (event) => {
        this.setState({ devmSelectedRows: event.api.getSelectedRows().length })
    }
    onDevSelectionChanged = (event) => {
        this.setState({ devSelectedRows: event.api.getSelectedRows().length })
    }
    onAvgOpenDaysSelectionChanged = (event) => {
        this.setState({ avgSelectedRows: event.api.getSelectedRows().length })
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onProGridReady = params => {
        this.proGridApi = params.api;
        this.proGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
    };
    onDevmGridReady = params => {
        this.devmGridApi = params.api;
        this.devmGridColumnApi = params.columnApi;
        // const sortModelCR = [
        //     {colId: 'DevManager', sort: 'asc'}
        // ];
        // this.devmGridApi.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    onDevGridReady = params => {
        this.devGridApi = params.api;
        this.devGridColumnApi = params.columnApi;
        // const sortModelCR = [
        //     {colId: 'Developer', sort: 'asc'}
        // ];
        // this.devGridApi.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
    onAvgOpenDaysGridReady = params => {
        this.avgOpenDaysGridApi = params.api;
        this.avgOpenDaysGridApiColumnApi = params.columnApi;
        // const sortModelCR = [
        //     {colId: 'Developer', sort: 'asc'}
        // ];
        // this.devGridApi.setSortModel(sortModelCR);
        params.api.sizeColumnsToFit();
    };
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
    onSelectBUCR(bu) {
        if (bu === '') {
            bu = null;
        }
        this.setState({buisnessUnitCR:bu})
        this.filterBugsCR(bu, this.state.customerCR, this.state.managerCR, this.state.developerCR);
    }
    // onSelectCustomerCR(cus) {
    //     if (cus === '') {
    //         cus = null;
    //     }
    //     this.setState({customerCR:cus})
    //     this.filterBugsCR(this.state.buisnessUnitCR, cus, this.state.managerCR, this.state.developerCR);
    // }
    onSelectManagerCR(man) {
        if (man === '') {
            man = null;
        }
        this.setState({managerCR: man})
        this.filterBugsCR(this.state.buisnessUnitCR, this.state.customerCR, man, this.state.developerCR);
    }
    onSelectDeveloperCR(dev) {
        if (dev === '') {
            dev = null;
        }
        this.setState({developerCR: dev})
        this.filterBugsCR(this.state.buisnessUnitCR, this.state.customerCR, this.state.managerCR, dev);
    }
    showSelectedTCsCR = () =>{
        this.filterBugsCR(this.state.buisnessUnitCR, this.state.customerCR, this.state.managerCR, this.state.developerCR)
        this.setState({ popoverOpen2CR: !this.state.popoverOpen2CR });
    }
    getTcs() {
        this.props.parentCallbackP2("p2p");
        this.gridOperations(false);
        let promises = []
        this.allTCsToShow = []
        axios.get(`/rest/AllOpenBugCountNoImprovement`, {params: {flag: "P2ByRelease", fixVersions: this.props.parentData}}).then(all => {
            this.maxResult = all.data.total
            for(let i = 0; i <= this.maxResult; i=i+100){
                promises.push(axios.get(`/rest/AllOpenBugsNoImprovement`,{
                    params: {
                        "startAt": i,
                        "flag": "P2ByRelease",
                        "fixVersions": this.props.parentData,
                    }
                }).then(all => {
                    this.allTCsToShow = [...this.allTCsToShow, ...all.data.issues];
                }).catch(err => {
                    this.gridOperations(true);
                }))
            }
            Promise.all(promises).then(result => {
                this.getTcsToShow();
                })
        }).catch(err => {
            this.gridOperations(true);
        })
    }
    getTcsToShow(){
        this.TicketsBySeverity = []
        this.TicketsByProduct = []
        this.TicketsByDevManager = []
        this.TicketsByDeveloper = []
        this.AvgAgeBySeverity = []


        this.ApplicableTcsCR = []
        this.bugsToShowCR = []
        this.devList = [];
        this.manList = [];
        let devDict = {};
        let severity = {"High":"P2","Medium":"P3","Low":"P4", "Lowest":"P5"}
        let today = new Date()
        today.setDate(today.getDate())
        today = today.toISOString().split("T")[0]
        const MS_PER_DAY = 1000 * 60 * 60 * 24

        let severityDictP2 = { Severity: "P2", Total: 0, Age: 0}, severityDictP3 = { Severity: "P3", Total: 0, Age: 0}, severityDictTotal = {Severity: "Total", Total: 0, Age: 0};
        let product = {"Unclassified": {P2: 0, P3: 0,}};
        let devM = {}
        let dev = {}
        projectsList.forEach(item => {
            product[item] = {P2: 0, P3: 0,}
        })
        devManagers.forEach(item => {
            devM[item] = { WithDueDate: 0, WithOutDueDate: 0, PassedDueDate: 0, DaysWithoutDueDate: 0 }
        })
        for(let i = 0; i < this.allTCsToShow.length; i++){
            let temp = {
                BugNo: this.allTCsToShow[i].key,
                ReportedBy: "QA",
                BU: this.allTCsToShow[i]["fields"]["project"]["key"],
                Summary: this.allTCsToShow[i]["fields"]["summary"],
                Severity: severity[this.allTCsToShow[i]["fields"]["priority"]["name"]],
                QAName: this.allTCsToShow[i]["fields"]["creator"]["displayName"],
                Developer: this.allTCsToShow[i]["fields"].assignee ? this.allTCsToShow[i]["fields"]["assignee"]["displayName"] : "NA",
                OpenDays: 0,
                DaysWithoutDueDate: "NA",
                DaysPassedDueDate: "NA",
                ETA: this.allTCsToShow[i]["fields"]["duedate"] ? this.allTCsToShow[i]["fields"]["duedate"].split("T")[0] : "NA",
                ReportedDate: this.allTCsToShow[i]["fields"]["created"].split("T")[0],
                QAValidatedDate: "NA",
                DevManager: "Unclassified",
            }

            let developer = this.allTCsToShow[i]["fields"].assignee ? this.allTCsToShow[i]["fields"]["assignee"]["displayName"] : "NA"
            let project = this.allTCsToShow[i]["fields"]["project"]["key"]
            let manager = "Unclassified"
            Object.keys(projectToManagerMap).some(key => {
                projectToManagerMap[key].some(value => {
                    if(project == value){
                        manager = key
                    }
                });
            })
            temp.DevManager = manager
            if(developer == "NA"){
                console.log("No developer Name-",developer, temp.BugNo)
            }
            if(manager == "Unclassified"){
                console.log("No manager Name-",developer, temp.BugNo)
            }
            if(!devDict[temp.Developer]){
                devDict[temp.Developer] = ''
            }

            if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "High") {
                try {
                    product[project]["P2"] = product[project]["P2"] + 1
                }
                catch{
                    product["Unclassified"]["P2"] = product["Unclassified"]["P2"] + 1
                }
            }
            else {
                try {
                    product[project]["P3"] = product[project]["P3"] + 1
                }
                catch{
                    product["Unclassified"]["P3"] = product["Unclassified"]["P3"] + 1
                }
            }

            if(this.allTCsToShow[i]["fields"]["duedate"]) {
                temp.DaysPassedDueDate = 0
                devM[manager]["WithDueDate"] = devM[manager]["WithDueDate"] + 1
                if(!dev[developer])
                {
                    dev[developer] = {WithDueDate: 0, WithOutDueDate: 0, PassedDueDate: 0, DaysWithOutDueDate: 0}
                    dev[developer]["WithDueDate"] = dev[developer]["WithDueDate"] + 1
                }
                else {
                    dev[developer]["WithDueDate"] = dev[developer]["WithDueDate"] + 1
                }
                let duedate = new Date(this.allTCsToShow[i]["fields"]["duedate"])
                let today = new Date()
                if(today.getTime() > duedate.getTime()){
                    // let diff = today.getTime() - duedate.getTime()
                    // temp.DaysPassedDueDate = Math.round(diff / MS_PER_DAY)
                    temp.DaysPassedDueDate = Math.round(getBusinessDaysCount(duedate, today))
                    if(temp.DaysPassedDueDate <= 0){
                        temp.DaysPassedDueDate = 1
                    }
                    devM[manager]["PassedDueDate"] = devM[manager]["PassedDueDate"] + 1
                    dev[developer]["PassedDueDate"] = dev[developer]["PassedDueDate"] + 1
                }
            }
            else{
                let cdate = new Date(this.allTCsToShow[i]["fields"]["created"])
                let today = new Date()
                // let diff = today.getTime() - cdate.getTime()
                // temp.DaysWithoutDueDate = Math.round(diff / MS_PER_DAY)
                temp.DaysWithoutDueDate = Math.round(getBusinessDaysCount(cdate, today))
                if(temp.DaysWithoutDueDate <= 0){
                    temp.DaysWithoutDueDate = 1
                }
                devM[manager]["WithOutDueDate"] = devM[manager]["WithOutDueDate"] + 1
                devM[manager]["DaysWithoutDueDate"] = devM[manager]["DaysWithoutDueDate"] + temp.DaysWithoutDueDate
                if(!dev[developer])
                {
                    dev[developer] = {WithDueDate: 0, WithOutDueDate: 0, PassedDueDate: 0, DaysWithOutDueDate: 0}
                    dev[developer]["WithOutDueDate"] = dev[developer]["WithOutDueDate"] + 1
                    dev[developer]["DaysWithOutDueDate"] = dev[developer]["DaysWithOutDueDate"] + temp.DaysWithoutDueDate
                }
                else {
                    dev[developer]["WithOutDueDate"] = dev[developer]["WithOutDueDate"] + 1
                    dev[developer]["DaysWithOutDueDate"] = dev[developer]["DaysWithOutDueDate"] + temp.DaysWithoutDueDate
                }
            }

            if (temp.BU == "NA"){
                if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "High") {
                    product["Unclassified"]["P2"] = product["Unclassified"]["P2"] + 1
                }
                else {
                    product["Unclassified"]["P3"] = product["Unclassified"]["P3"] + 1
                }
            }
            if(temp.OpenDays == 0) {
                let date1 = new Date()
                let date2 = new Date(this.allTCsToShow[i]["fields"]["created"])
                // let diff = date1.getTime() - date2.getTime()
                // temp.OpenDays = Math.round(diff / MS_PER_DAY)
                temp.OpenDays = Math.round(getBusinessDaysCount(date2, date1))
                if(temp.OpenDays == 0){
                    temp.OpenDays = 1
                }
            }
            if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "High") {
                severityDictP2.Total =severityDictP2.Total + 1
                severityDictP2.Age = severityDictP2.Age + temp.OpenDays
            }
            else {
                severityDictP3.Total =severityDictP3.Total + 1
                severityDictP3.Age = severityDictP3.Age + temp.OpenDays
            }
            if(temp.Severity != "P2"){
                temp.Severity = "P3"
            }
            this.bugsToShowCR.push(temp)
        }
        Object.keys(devDict).forEach(key => {
            this.devList.push(key)
        })
        let Pr2 = 0, Pr3 = 0, prtotal = 0;
        Object.keys(product).forEach(key => {
            if(key != "NA"){
                this.TicketsByProduct.push({Product: key, P2: product[key]["P2"], P3: product[key]["P3"], Total: product[key]["P2"] + product[key]["P3"]});
                Pr2 = Pr2 + product[key]["P2"];
                Pr3 = Pr3 + product[key]["P3"];
                prtotal = prtotal + product[key]["P2"] + product[key]["P3"];
            }
        })
        this.TicketsByProduct.push({Product: "Total", P2: Pr2, P3: Pr3, Total: prtotal})
        let wd = 0, wod = 0, pd = 0, dtotal = 0, dividend = 0, divisor = 0;
        Object.keys(devM).forEach(key => {
            if(key != "NA"){
                let temp = devM[key]["WithOutDueDate"] == 0 ? 0 : Math.round(devM[key]["DaysWithoutDueDate"] / devM[key]["WithOutDueDate"])
                this.TicketsByDevManager.push({DevManager: key, WithDueDate: devM[key]["WithDueDate"], WithOutDueDate: devM[key]["WithOutDueDate"], PassedDueDate: devM[key]["PassedDueDate"], AvgDaysWithoutDueDate: temp, Total: devM[key]["WithDueDate"] + devM[key]["WithOutDueDate"]})
                wd = wd + devM[key]["WithDueDate"];
                wod = wod + devM[key]["WithOutDueDate"];
                pd = pd + devM[key]["PassedDueDate"];
                dividend = dividend + devM[key]["DaysWithoutDueDate"]
                divisor = divisor + devM[key]["WithOutDueDate"]
                dtotal = dtotal + devM[key]["WithDueDate"] + devM[key]["WithOutDueDate"];
            }
        })
        this.Sort(this.TicketsByDevManager, "devm");
        this.TicketsByDevManager.push({DevManager: "Total", WithDueDate: wd, WithOutDueDate: wod, PassedDueDate: pd, AvgDaysWithoutDueDate: divisor == 0 ? 0 : Math.round(dividend/divisor), Total: dtotal})
        let dewd = 0, dewod = 0, depd = 0, detotal = 0;
        dividend = 0
        divisor = 0
        Object.keys(dev).forEach(key => {
            if(key != "NA"){
                let temp = dev[key]["WithOutDueDate"] == 0 ? 0 : Math.round(dev[key]["DaysWithOutDueDate"] / dev[key]['WithOutDueDate'])
                this.TicketsByDeveloper.push({Developer: key, WithDueDate: dev[key]["WithDueDate"], WithOutDueDate: dev[key]["WithOutDueDate"], PassedDueDate: dev[key]["PassedDueDate"], AvgWithoutDueDate: temp, Total: dev[key]["WithDueDate"] + dev[key]["WithOutDueDate"]})
                dewd = dewd + dev[key]["WithDueDate"];
                dewod = dewod + dev[key]["WithOutDueDate"];
                depd = depd + dev[key]["PassedDueDate"];
                dividend = dividend + dev[key]["DaysWithOutDueDate"]
                divisor = divisor + dev[key]['WithOutDueDate']
                detotal = detotal + dev[key]["WithDueDate"] + dev[key]["WithOutDueDate"];
            }
        })
        this.Sort(this.TicketsByDeveloper,"dev");
        this.TicketsByDeveloper.push({Developer: "Total", WithDueDate: dewd, WithOutDueDate: dewod, PassedDueDate: depd, AvgWithoutDueDate: divisor == 0 ? 0 : Math.round(dividend/divisor), Total: detotal})
        severityDictTotal["Total"] = severityDictP2["Total"] + severityDictP3["Total"]
        severityDictTotal["Age"] = severityDictP2["Age"] + severityDictP3["Age"]
        let d2 = {Severity: severityDictP2["Severity"], TotalBugs: severityDictP2["Total"], TotalOpenDays: severityDictP2["Age"], AvgOpenDays: severityDictP2["Total"] == 0 ? 0 : Math.round(severityDictP2["Age"] / severityDictP2["Total"])}
        let d3 = {Severity: severityDictP3["Severity"], TotalBugs: severityDictP3["Total"], TotalOpenDays: severityDictP3["Age"], AvgOpenDays: severityDictP3["Total"] == 0 ? 0 : Math.round(severityDictP3["Age"] / severityDictP3["Total"])}
        this.AvgAgeBySeverity.push(d2, d3)
        this.TicketsBySeverity.push(severityDictP2, severityDictP3, severityDictTotal)
        this.filterBugsCR(this.state.buisnessUnitCR, this.state.customerCR, this.state.managerCR, this.state.developerCR);
        this.props.parentCallbackP2("p2c");
    }
    Sort(list, flag){
        let namelist = []
        let devList = []
        switch(flag){
            case "dev":
                list.forEach(ele =>{
                    namelist.push(ele["Developer"])
                })
                namelist.sort();
                namelist.forEach(ele => {
                    list.some(item => {
                        if(item["Developer"] == ele){
                            devList.push(item)
                        }
                        return;
                    })
                })
                this.TicketsByDeveloper = devList
            break;
            case "devm":
                list.forEach(ele =>{
                    namelist.push(ele["DevManager"])
                })
                namelist.sort();
                namelist.forEach(ele => {
                    list.some(item => {
                        if(item["DevManager"] == ele){
                            devList.push(item)
                        }
                        return;
                    })
                })
                this.TicketsByDevManager = devList
            break;
        }
    }
    filterBugsCR(bu, cus, man, dev){
        if(bu == null && cus == null && man == null && dev == null){
            this.ApplicableTcsCR = []
            this.ApplicableTcsCR = this.bugsToShowCR
        }
        else if(bu == null && cus == null && man == null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus == null && man != null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["DevManager"] === man){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus == null && man != null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["DevManager"] === man && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus != null && man == null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["Customer"] === cus){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus != null && man == null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus != null && man != null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["DevManager"] === man){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu == null && cus != null && man != null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["DevManager"] === man && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus == null && man == null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus == null && man == null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus == null && man != null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["DevManager"] === man){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus == null && man != null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["DevManager"] === man && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus != null && man == null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["Customer"] === cus){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus != null && man == null && dev != null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else if(bu != null && cus != null && man != null && dev == null){
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["DevManager"] === man){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
        else{
            this.ApplicableTcsCR = []
            for(let i = 0; i < this.bugsToShowCR.length; i++){
                if(this.bugsToShowCR[i]["BU"] === bu && this.bugsToShowCR[i]["Customer"] === cus && this.bugsToShowCR[i]["DevManager"] === man && this.bugsToShowCR[i]["Developer"] === dev){
                    this.ApplicableTcsCR.push(this.bugsToShowCR[i])
                }
            }
        }
    let temp = []
    let priority = {}
    this.state.statusColumnCR.forEach(item => {
        if(item.isChecked == true){
            priority[item.value] = true
        }
    })
    this.ApplicableTcsCR.forEach(bug => {
        if(priority[bug["Severity"]] == true) {
            temp.push(bug)
        }
    })
    this.ApplicableTcsCR = temp
    this.gridOperations(true);
}
getData(){
    let temp = ''
    if(this.gridApi){
        temp = temp + "Tickets-By-Severity\n" + this.gridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.proGridApi){
        temp = temp + "Tickets-By-Product\n" + this.proGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.devmGridApi){
        temp = temp + "Tickets-By-DevManager\n" + this.devmGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.devGridApi){
        temp = temp + "Tickets-By-Developer\n" + this.devGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.avgOpenDaysGridApi){
        temp = temp + "AvgOpenDays-By-Severity\n" + this.avgOpenDaysGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.bugGridApiCR){
        temp = temp + "Bug-List\n" + this.bugGridApiCR.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    this.setState({sevstr: temp}, () => {
        setTimeout(() => {
            this.csvLink.current.link.click();
        });
    })
}
    render() {
        if (this.gridApi) {
            if (this.state.isApiUnderProgress) {
                this.gridApi.showLoadingOverlay();
            } else if (this.TicketsBySeverity.length === 0) {
                this.gridApi.showNoRowsOverlay();
            } else {
                this.gridApi.hideOverlay();
            }
        }
        if (this.proGridApi) {
            if (this.state.isApiUnderProgress) {
                this.proGridApi.showLoadingOverlay();
            } else if (this.TicketsByProduct.length === 0) {
                this.proGridApi.showNoRowsOverlay();
            } else {
                this.proGridApi.hideOverlay();
            }
        }
        if (this.devmGridApi) {
            if (this.state.isApiUnderProgress) {
                this.devmGridApi.showLoadingOverlay();
            } else if (this.TicketsByDevManager.length === 0) {
                this.devmGridApi.showNoRowsOverlay();
            } else {
                this.devmGridApi.hideOverlay();
            }
        }
        if (this.devGridApi) {
            if (this.state.isApiUnderProgress) {
                this.devGridApi.showLoadingOverlay();
            } else if (this.TicketsByDeveloper.length === 0) {
                this.devGridApi.showNoRowsOverlay();
            } else {
                this.devGridApi.hideOverlay();
            }
        }
        if (this.avgOpenDaysGridApi) {
            if (this.state.isApiUnderProgress) {
                this.avgOpenDaysGridApi.showLoadingOverlay();
            } else if (this.AvgAgeBySeverity.length === 0) {
                this.avgOpenDaysGridApi.showNoRowsOverlay();
            } else {
                this.avgOpenDaysGridApi.hideOverlay();
            }
        }
        if (this.bugGridApiCR) {
            if (this.state.isApiUnderProgress) {
                this.bugGridApiCR.showLoadingOverlay();
            } else if (this.ApplicableTcsCR.length === 0) {
                this.bugGridApiCR.showNoRowsOverlay();
            } else {
                this.bugGridApiCR.hideOverlay();
            }
        }
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = []; this.getTcs();}})}}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {
                                                !this.state.tcOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.tcOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            }
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>Dev P2+ issues</span>
                                            {/* {
                                                this.state.tcOpen &&
                                                <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                                    <span className='rp-app-table-value'>Selected: {this.state.selectedRows}</span>
                                                </div>
                                            } */}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Tickets By Severity</span>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.gridApi) {
                                                        this.gridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "Post_Pending_Tickets_by_Severity.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="myAllGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.columnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsBySeverity}
                                                onGridReady={(params) => this.onGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsBySeverity.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Tickets By Product</span>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.proGridApi) {
                                                        this.proGridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "Post_Pending_Tickets_by_Product.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                            {/* <div style={{ marginLeft: '13rem' }}>
                                                <Button disabled={this.state.isApiUnderProgress} id="PopoverAssignRp" type="button"><i class="fa fa-check-square-o" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssignRp" id="PopoverAssignButtonRp" toggle={() => this.popoverToggleRp()} isOpen={this.state.popoverOpenRp}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
                                                            <ul>
                                                            {
                                                            this.state.fixVersions.map((columnName) => {
                                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElement}  {...columnName} />)
                                                            })
                                                            }
                                                            </ul>
                                                            <Button onClick={() => {this.setState({ popoverOpenRp: !this.state.popoverOpenRp });this.showForSelectedRelease();}}>Show</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div> */}
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="proGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onProSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.proColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsByProduct}
                                                onGridReady={(params) => this.onProGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsByProduct.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Tickets By Dev Manger</span>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.devmGridApi) {
                                                        this.devmGridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "Post_Pending_Tickets_by_Dev_Manager.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="devMGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onDevmSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.devmColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsByDevManager}
                                                onGridReady={(params) => this.onDevmGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsByDevManager.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                                <div class="col-sm-6" style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Tickets By Developer</span>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.devGridApi) {
                                                        this.devGridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "Post_Pending_Tickets_by_Developer.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="devGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onDevSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.devColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.TicketsByDeveloper}
                                                onGridReady={(params) => this.onDevGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.TicketsByDeveloper.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '300px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Average Open Days By Severity</span>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.avgOpenDaysGridApi) {
                                                        this.avgOpenDaysGridApi.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "Post_Pending_Tickets_Avg_Open_Days_By_Severity.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="avgGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onAvgOpenDaysSelectionChanged(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.avgAgeColumnDefs}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.AvgAgeBySeverity}
                                                onGridReady={(params) => this.onAvgOpenDaysGridReady(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.AvgAgeBySeverity.length}</span>
                                                </div>
                                            }
                                    </div>
                                </div>
                            </div >
                            <div>
                                <div style={{ width: '100%', height: '600px', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Bug List</span>
                                            </div>
                                            {
                                                [
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'BU', onChange: (e) => this.onSelectBUCR(e), values: [{ value: '', text: 'Select Buisness Unit' }, ...(projectsList.map(each => ({ value: each, text: each })))] },
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'DevManager', onChange: (e) => this.onSelectManagerCR(e), values: [{ value: '', text: 'Select Dev Manager' }, ...(devManagers.map(each => ({ value: each, text: each })))] },
                                                    { style: { width: '8rem', marginLeft: '1rem' }, field: 'Developer', onChange: (e) => this.onSelectDeveloperCR(e), values: [{ value: '', text: 'Select Developer' }, ...(this.devList.map(each => ({ value: each, text: each })))] },
                                                ].map(item => (
                                                    <div style={item.style}>
                                                        <Input disabled={this.state.isApiUnderProgressCR} style={{ fontSize: '12px' }} value={this.state[item.field]} onChange={(e) => item.onChange(e.target.value)} type="select" name={`select${item.field}`} id={`select${item.field}`}>
                                                            {
                                                                item.values.map(each => <option value={each.value}>{each.text}</option>)
                                                            }
                                                        </Input>
                                                    </div>
                                                ))
                                            }
                                            <div style={{ width: '2.5rem', marginLeft: '0.5rem' }}>
                                                <Button disabled={this.state.isApiUnderProgressCR} id="PopoverAssign2CR3" type="button"><i class="fa fa-filter" aria-hidden="true"></i></Button>
                                                <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAssign2CR3" id="PopoverAssignButton2CR3" toggle={() => this.popoverToggle2CR()} isOpen={this.state.popoverOpen2CR}>
                                                    <PopoverBody>
                                                        <div>
                                                            <input type="checkbox" onClick={this.handleAllCheckedStatusTCsCR}  value="checkedall" /> Check / Uncheck All
                                                            <ul>
                                                            {
                                                            this.state.statusColumnCR.map((columnName) => {
                                                                return (<CheckBox handleCheckChieldElement={this.handleCheckChieldElementStatusTcsCR}  {...columnName} />)
                                                            })
                                                            }
                                                            </ul>
                                                            <Button onClick={() => this.showSelectedTCsCR()}>Show Selected Bugs</Button>
                                                        </div>
                                                    </PopoverBody>
                                                </UncontrolledPopover>
                                            </div>
                                            <div style={{ width: '5rem'}}>
                                                <Button disabled={this.state.isApiUnderProgress} title="Only selected bugs will be downloaded" size="md" className="rp-rb-save-btn" onClick={() => {
                                                    if (this.bugGridApiCR) {
                                                        this.bugGridApiCR.exportDataAsCsv({ allColumns: true, onlySelected: false, fileName: "AllPostPending_Bugs.csv" });
                                                    }
                                                }} >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "100%" }}>
                                        <div
                                            id="bugGrid"
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            className="ag-theme-balham"
                                        >
                                            <AgGridReact
                                                suppressScrollOnNewData={true}
                                                onSelectionChanged={(e) => this.onBugSelectionChangedCR(e)}
                                                rowStyle={{ alignItems: 'top' }}
                                                enableCellTextSelection={true}
                                                //onRowClicked={(e) => this.getTC(e)}
                                                modules={this.state.modules}
                                                columnDefs={this.state.bugColumnDefsCR}
                                                rowSelection='multiple'
                                                getRowHeight={this.getRowHeight}
                                                defaultColDef={this.state.defaultColDef}
                                                //rowData={this.props.data}
                                                rowData={this.ApplicableTcsCR}
                                                onGridReady={(params) => this.onBugGridReadyCR(params)}
                                                //onCellEditingStarted={this.onCellEditingStarted}
                                                frameworkComponents={this.state.frameworkComponents}
                                                stopEditingWhenGridLosesFocus={true}
                                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                rowMultiSelectWithClick={true}
                                            // onRowSelected={(params) => this.onRowSelected(params)}
                                            // onCellFocused={(e) => this.onCellFocused(e)}
                                            // suppressCopyRowsToClipboard = {true}
                                            />
                                        </div>
                                    </div>
                                        <div style={{ display: 'inline' }}>
                                            {
                                                <div style={{ display: 'inline' }}>
                                                    <span style={{ marginLeft: '0.5rem' }} className='rp-app-table-value'>Total: {this.ApplicableTcsCR.length}</span>
                                                    <span style={{ marginLeft: '5rem' }} className='rp-app-table-value'>Selected: {this.state.bugSelectedRowsCR}</span>

                                                </div>
                                            }
                                    </div>
                                    <CSVLink style={{ textDecoration: 'none' }} data={this.state.sevstr} ref={this.csvLink} filename={'Tickets_Pending_Post_Release(SEV P2-P3).csv'} target="_blank"/>
                                    <div style={{ display: 'inline', position: 'absolute', marginTop: '0.5rem', right: '1.5rem' }}>
                                        <Button disabled={this.state.isApiUnderProgress} size="md" className="rp-rb-save-btn" onClick={(e) => {this.getData()}} >
                                                Download All
                                        </Button>
                                    </div>
                                </div>
                            </div >
                        </Collapse>
                    </Col>
                </Row>
            </div >
        )
    }
}
export default (PendingPostReleaseByReleases);