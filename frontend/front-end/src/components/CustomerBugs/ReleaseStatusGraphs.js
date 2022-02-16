import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Col,Row, Table, Button,
    UncontrolledPopover, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './CustomerBugs.scss';
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../reducers/release.reducer';
import MoodEditor from "../TestCasesAll/moodEditor";
import MoodRenderer from "../TestCasesAll/moodRenderer";
import NumericEditor from "../TestCasesAll/numericEditor";
import SelectionEditor from '../TestCasesAll/selectionEditor';
import DatePickerEditor from '../TestCasesAll/datePickerEditor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, } from 'react-chartjs-2';
class ReleaseStatusGraphs extends Component {
    isApiUnderProgress = false;
    allTCsToShow = [];
    allClosedDefectsToShow = [];
    lineweek = {};
    newOptions = {};
    cloOptions = {};
    xcord = [];
    lastWeek = '';
    lastMonth = '';
    buList = [];
    relNum = '';
    constructor(props) {
        super(props);
        this.state = {
            modules: AllCommunityModules,
            frameworkComponents: {
                moodRenderer: MoodRenderer,
                moodEditor: MoodEditor,
                numericEditor: NumericEditor,
                selectionEditor: SelectionEditor,
                datePicker: DatePickerEditor
            },
        }
        this.lastWeek = this.props.selectedRelease.QAEndDate ? this.props.selectedRelease.QAEndDate.split("T")[0] : null;
        this.lastMonth = this.props.selectedRelease.QAStartDate ? this.props.selectedRelease.QAStartDate.split("T")[0]: null;
        this.buList = this.props.selectedRelease ? this.props.selectedRelease.BuList : [];
        this.relNum = this.props.selectedRelease ? this.props.selectedRelease.fixVersion : '';
        this.cusDateStart = this.lastMonth;
        this.cusDateEnd = this.lastWeek;
    }
    addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }
    subDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
    }
    getDate(date) {
        date.setDate(date.getDate())
        return date.toISOString().split("T")[0];
    }
    getDatee(date) {
        date.setDate(date.getDate())
        return date.toISOString();
    }
    calXCoordinate(currentdate) {
        this.xcord.push(this.lastMonth)
        for(let i = 0; this.addDays(this.xcord[i], 7).getTime() <= new Date(this.lastWeek).getTime(); i = i + 2){
            this.xcord.push(this.getDate(this.addDays(this.xcord[i], 6)))
            this.xcord.push(this.getDate(this.addDays(this.xcord[i], 7)))
        }
        if(new Date(this.lastWeek).getTime() > new Date(this.xcord[this.xcord.length - 1]).getTime()) {
            this.xcord.push(this.lastWeek)
        }
        for(let i = 0; i < this.xcord.length; i++){
            if ( i%2 == 0){
                this.xcord[i] = this.xcord[i] + "T00:00:00.000-0800"
            }
            else {
                    this.xcord[i] = this.xcord[i] + "T23:59:59.999-0800"
            }
        }
        this.lineweek = {labels: [], datasets: []};
        for (let i = 0; i < this.xcord.length - 1 ; i = i + 2) {
            let dlabel = `${new Date(this.xcord[i].split("T")[0]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`;
            this.lineweek["labels"].push(dlabel)
        }
    }
    cusgridOperations(enable) {
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
    getTcs(sdate, edate) {
        this.cusgridOperations(false);
        let promises1 = [];
        this.allTCsToShow = [];
        this.allClosedDefectsToShow = [];
        if (this.buList.length == 0 || this.relNum == 'UNKNOWN' || sdate == '' || edate == '') {
            alert("Business unit or Fix Version or QA start date or QA end date is empty for selected release.")
            this.cusgridOperations(true);
            return;
        }
        axios.get(`/rest/NewDefectsCountByRelease`,{params: {"sdate": sdate,"edate": edate, "bu": this.buList, "fixVersion": this.relNum,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises1.push(axios.get(`/rest/NewDefectsByRelease`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                        "bu": this.buList,
                        "fixVersion": this.relNum,
                    }
                }).then(all => {
                    this.allTCsToShow = [...this.allTCsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cusgridOperations(true);
                }))
            }
            Promise.all(promises1).then(result => {
                //this.getDefectsToShow();
                this.getClosedDefects(sdate, edate)
                })
        }).catch(err => {
            //this.cusgridOperations(true);
        })
    }
    getClosedDefects(sdate, edate){
        let promises2 = []
        axios.get(`/rest/ClosedDefectsCountByRelease`,{params: {"sdate": sdate,"edate": edate, "bu": this.buList, "fixVersion": this.relNum,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises2.push(axios.get(`/rest/ClosedDefectsByRelease`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                        "bu": this.buList,
                        "fixVersion": this.relNum,
                    }
                }).then(all => {
                    this.allClosedDefectsToShow = [...this.allClosedDefectsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cgridOperations(true);
                }))
            }
            Promise.all(promises2).then(result => {
                this.getDefectsToShow();
        })
        }).catch(err => {
            //this.cgridOperations(true);
        })
    }
    calculateWeek(date){
        let dtime = date.getTime()
        for(let i = 0; i < this.xcord.length - 1 ; i = i + 2) {
            if(dtime >= new Date(this.xcord[i]).getTime() && dtime <= new Date(this.xcord[i+1]).getTime()){
                return  i / 2;
            }
        }
        console.log("susdate",this.getDatee(date))
        return null;
    }
    getArrayMax(array){
        return Math.max.apply(null, array);
     }
    getArrayMin(array){
        return Math.min.apply(null, array);
     }
    getDefectsToShow(){
        let num = null;
        let week = {
            Filed: { data: [], backgroundColor: 'rgb(255, 99, 132)', },
            Closed: { data: [], backgroundColor: 'rgb(75, 192, 192)', },
        }
        for(let i = 0 ; i < this.xcord.length / 2; i++){
            week["Filed"]["data"].push(0)
            week["Closed"]["data"].push(0)
        }
         for(let i = 0; i < this.allTCsToShow.length; i++){
            num = this.calculateWeek(new Date(this.allTCsToShow[i]["fields"]["created"]))
                week["Filed"]["data"][num] = week["Filed"]["data"][num] + 1
        }
        for(let i = 0; i < this.allClosedDefectsToShow.length; i++){
            num = this.calculateWeek(new Date(this.allClosedDefectsToShow[i]["fields"]["updated"]))
            week["Closed"]["data"][num] = week["Closed"]["data"][num] + 1
        }
        Object.keys(week).forEach(type => {
                this.lineweek["datasets"].push({data: week[type]["data"], fill: false, lineTension: 0, label: type, borderColor: week[type]["backgroundColor"]})
        })
        this.lineweekNew = this.lineweek
        this.cusgridOperations(true);
    }
    render() {
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                    <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = []; this.allClosedDefectsToShow = []; this.allPendingDefectsToShow = []; this.xcord = []; this.cusDateStart = this.lastMonth; this.cusDateEnd = this.getDate(this.addDays(new Date(this.lastWeek),1)); this.calXCoordinate();this.getTcs(this.cusDateEnd, this.cusDateStart);}})}}>
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
                                            <span className='rp-app-table-title'>Graphs</span>
                                            <br></br>
                                            <br></br>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.tcOpen}>
                            <div class="row">
                                <div class="col" style={{ width: '100%', height: '50%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Defects Filed Vs Closed</span>
                                            </div>
                                        </div>
                                    </div>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Line data={this.lineweekNew}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                </div>
                            </div >
                        </Collapse>
                    </Col>
                </Row>
            </div >
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    selectedRelease: getCurrentRelease(state, state.release.current.id)
})

export default connect(mapStateToProps, {getCurrentRelease})(ReleaseStatusGraphs);