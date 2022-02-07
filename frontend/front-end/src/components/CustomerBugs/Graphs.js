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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar} from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import  CheckBox  from '../TestCasesAll/CheckBox';
import { element } from 'prop-types';
import { CSVLink } from 'react-csv';
import { timeThursdays } from 'd3-time';
import { stack } from 'd3-shape';
//   i = mid(list)
// while(f != true){
// 	if (ele == list[i])
// 	{
// 		//work to done
// 		f = true;
// 	}
// 	else if (ele < list[i]){
// 		if (i > = list[i] - 7){
// 			//work to done
// 			f = true;
// 		}
// 		else {
// 			i = i/2;
// 		}
// 	}
// 	else ( ele > list[i]){
// 		if(i <= list[i] + 7 ){
// 			//work to done
// 			f =true;
// 		}
// 		else{
// 			i = len(list) - i/2
// 		}
// 	}
//}
class Graphs extends Component {
    isApiUnderProgress = false;
    allTCsToShow = [];
    allClosedDefectsToShow = [];
    allPendingDefectsToShow = [];
    week = [];
    newOptions = {};
    cloOptions = {};
    xcord = [];
    today = new Date();
    lastWeek = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7);
    lastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 26);
    constructor(props) {
        super(props);
        this.csvLink = React.createRef();
        this.state = {
            sevstr: '',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center"><font color = "red">Please wait while table is loading</font></span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center"><font color = "red">No rows to show</font></span>',
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
        this.today.setDate(this.today.getDate());
        this.today = this.today.toISOString().split("T")[0];
        this.lastWeek.setDate(this.lastWeek.getDate());
        this.lastWeek = this.lastWeek.toISOString().split("T")[0];
        this.lastMonth.setDate(this.lastMonth.getDate());
        this.lastMonth = this.lastMonth.toISOString().split("T")[0];
        this.cusDateStart = this.lastMonth;
        this.cusDateEnd = this.today;
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
        this.xcord.push(this.lastMonth)//0
        for(let i = 0; i < 5; i = i + 2){
            this.xcord.push(this.getDate(this.addDays(this.xcord[i], 6)))//1
            this.xcord.push(this.getDate(this.addDays(this.xcord[i], 7)))//1
        }
        this.xcord.push(this.getDate(this.addDays(this.xcord[6], 6)))//7
        for(let i = 0; i < 8; i++){
            if ( i%2 == 0){
                this.xcord[i] = this.xcord[i] + "T00:00:00.000-0800"
            }
            else {
                this.xcord[i] = this.xcord[i] + "T23:59:59.999-0800"
            }
        }
        this.week = [];
        for (let i = this.xcord.length - 2; i >= 0; i = i - 2) {
            let dlabel = `${new Date(this.xcord[i]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`+'-'+`${new Date(this.xcord[i+1]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`;
            let temp = {
                New: {
                    labels: [dlabel],
                    datasets: []
                },
                Closed: {
                    labels: [dlabel],
                    datasets: []
                },
            }
            this.week.push(temp)
        }
        this.pie1 = {
            labels: [],
            datasets: [ { data: [], backgroundColor: []}],
        };
        this.proPie = {
            labels: [],
            datasets: [ { data: [], backgroundColor: []}],
        };
        this.newOptions = {
            plugins: {
              title: {
                display: true,
              },
              ChartDataLabels: {
                display: true,
                color: "black",
                align: "end",
                anchor: "top",
                font: { size: "20" }
              },
            },
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
                x: {
                    stacked: true ,
                },
                yAxes: [{
                    display: true,
                    stacked: false,
                    ticks: {
                        min: 0, // minimum value
                        max: 500 // maximum value
                    }
                }]
            },
          };
        this.cloOptions = {
            plugins: {
              title: {
                display: true,
              },
              ChartDataLabels: {
                display: true,
                color: "black",
                align: "end",
                anchor: "top",
                font: { size: "20" }
              },
            },
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
                x: {
                    stacked: true ,
                },
                yAxes: [{
                    display: true,
                    stacked: false,
                    ticks: {
                        min: 0, // minimum value
                        max: 500 // maximum value
                    }
                }]
            },
          };
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
        this.allPendingDefectsToShow = [];
        console.log("sdete",edate,sdate)
        axios.get(`/rest/NewDefectsCount`,{params: {"sdate": sdate,"edate": edate,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises1.push(axios.get(`/rest/NewDefects`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
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
        axios.get(`/rest/ClosedDefectsCount`,{params: {"sdate": sdate,"edate": edate,}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises2.push(axios.get(`/rest/ClosedDefects`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                    }
                }).then(all => {
                    this.allClosedDefectsToShow = [...this.allClosedDefectsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cgridOperations(true);
                }))
            }
            Promise.all(promises2).then(result => {
                this.getPendingDefects();
                //this.getDefectsToShow();
        })
        }).catch(err => {
            //this.cgridOperations(true);
        })
    }
    getPendingDefects(){
        let promises3 = []
        axios.get(`/rest/AllOpenBugCountNoImprovement`).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises3.push(axios.get(`/rest/AllOpenBugsNoImprovement`,{
                    params: {
                        "startAt": i,
                    }
                }).then(all => {
                    this.allPendingDefectsToShow = [...this.allPendingDefectsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.pgridOperations(true);
                }))
            }
            Promise.all(promises3).then(result => {
                this.getDefectsToShow();
                })
        }).catch(err => {
            //this.pgridOperations(true);
        })
    }
    calculateWeek(date){
        let dtime = date.getTime()
        for(let i = 0; i < 7; i = i + 2) {
            if(dtime >= new Date(this.xcord[i]).getTime() && dtime <= new Date(this.xcord[i+1]).getTime()){
                //console.log("i",i)
                // if((6-i)/2 == 0){
                // console.log("d1d2**",this.xcord[i],new Date(this.xcord[i]).getTime(),this.xcord[i+1],new Date(this.xcord[i+1]).getTime())
                // console.log("suspe",dtime,sus)
                // console.log("pstdate",new Date(this.xcord[i]).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}), new Date(new Date(this.xcord[i]).toISOString({timeZone: "America/Los_Angeles"})), new Date(new Date(this.xcord[i]).toDateString({timeZone: "America/Los_Angeles"})))
                // }
                return (6 - i) / 2;
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
        let bu = false;
        let week = { New: [], Closed: [], }
        for (let i = 0; i < 4; i++){
            week["New"].push({ Customer:{ data: 0, backgroundColor: 'rgb(255, 99, 132)',}, SEVP1:{ data: 0, backgroundColor: 'rgb(75, 192, 192)',}, 'SEVP2+':{ data: 0, backgroundColor: 'rgb(53, 162, 235)',},})
            week["Closed"].push({ Customer:{ data: 0, backgroundColor: 'rgb(255, 99, 132)',}, SEVP1:{ data: 0, backgroundColor: 'rgb(75, 192, 192)',}, 'SEVP2+':{ data: 0, backgroundColor: 'rgb(53, 162, 235)',},})
        }
        let pie1 = {
            Customer:{
                data: 0,
                backgroundColor: 'rgb(255, 99, 132)',
            },
            SEVP1:{
                data: 0,
                backgroundColor: 'rgb(75, 192, 192)',
            },
            'SEVP2+':{
                data: 0,
                backgroundColor: 'rgb(53, 162, 235)',
            },
        }
        let proPie = {
            Spektra:{
                data: 0,
                backgroundColor: 'rgb(255, 99, 132)',
            },
            Ultima:{
                data: 0,
                backgroundColor: 'rgb(75, 192, 192)',
            },
            "Ultima-Software":{
                data: 0,
                backgroundColor: 'rgb(53, 162, 235)',
            },
            "Unclassified":{
                data: 0,
                backgroundColor: 'rgb(255, 159, 64)',
            },
        }
        for(let i = 0; i < this.allTCsToShow.length; i++){
            let increaseCusDCount = true
            num = this.calculateWeek(new Date(this.allTCsToShow[i]["fields"]["created"]))
            //console.log(new Date(this.allTCsToShow[i]["fields"]["created"]).toISOString())
            this.allTCsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                //console.log("num, date",num, this.allTCsToShow[i]["fields"]["created"].split("T")[0])
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        week["New"][num]["Customer"]["data"] = week["New"][num]["Customer"]["data"] + 1
                        increaseCusDCount = false
                        return true;
                    }
                }
            })
            if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                //console.log("numsevp1, date",num, this.allTCsToShow[i]["fields"]["created"],this.allTCsToShow[i].key,)
                week["New"][num]["SEVP1"]["data"] = week["New"][num]["SEVP1"]["data"] + 1
                //console.log("week num",week[sp1num])
            }
            else if(this.allTCsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                //console.log("numsevp2+, date",num, this.allTCsToShow[i]["fields"]["created"].split("T")[0])
                week["New"][num]["SEVP2+"]["data"] = week["New"][num]["SEVP2+"]["data"] + 1
            }
        }
        for(let i = 0; i < this.allClosedDefectsToShow.length; i++){
            let increaseCusDCount = true
            num = this.calculateWeek(new Date(this.allClosedDefectsToShow[i]["fields"]["updated"]))
            //console.log(new Date(this.allClosedDefectsToShow[i]["fields"]["updated"]).toISOString())
            this.allClosedDefectsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        week["Closed"][num]["Customer"]["data"] = week["Closed"][num]["Customer"]["data"] + 1
                        increaseCusDCount = false
                        return true;
                    }
                }
            })
            if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                week["Closed"][num]["SEVP1"]["data"] = week["Closed"][num]["SEVP1"]["data"] + 1
            }
            else if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                week["Closed"][num]["SEVP2+"]["data"] = week["Closed"][num]["SEVP2+"]["data"] + 1
            }
        }
        for(let i = 0; i < this.allPendingDefectsToShow.length; i++){
            let increaseCusDCount = true;
            bu = false;
            let ue = false, ua = false, sp = false;
            this.allPendingDefectsToShow[i]["fields"]["labels"].forEach(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer")) {
                    if(increaseCusDCount){
                        pie1["Customer"]["data"] = pie1["Customer"]["data"] + 1
                        increaseCusDCount = false
                    }
                }
                else if(loLabel.includes("ultima-software")) {
                    if(ue == false){
                       proPie['Ultima-Software']["data"] =  proPie['Ultima-Software']["data"] + 1
                        ue = true
                        bu = true
                    }
                }
                else if(loLabel.includes("ultima")) {
                    if(ua == false){
                        proPie["Ultima"]["data"] = proPie["Ultima"]["data"] + 1
                        ua = true
                        bu = true
                    }
                }
                else if(loLabel == "spektra") {
                    if(sp == false){
                        proPie["Spektra"]["data"] = proPie["Spektra"]["data"] + 1
                        sp = true
                        bu = true
                    }
                }
            })
            if (!bu){
                console.log(this.allPendingDefectsToShow[i].key,this.allPendingDefectsToShow[i]["fields"]["labels"])
                proPie["Unclassified"]["data"] = proPie["Unclassified"]["data"] + 1
            }
            if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                pie1["SEVP1"]["data"] = pie1["SEVP1"]["data"] + 1
            }
            else if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                pie1["SEVP2+"]["data"] = pie1["SEVP2+"]["data"] + 1
            }
        }
        let data = {
            New: [],
            Closed: []
        }
        Object.keys(week).forEach(type => {
            for (let i = 0; i < week[type].length; i++)
            {
                Object.keys(week[type][i]).forEach(key => {
                    this.week[i][type]["datasets"].push({ label: key, data: this.week[i][type]["labels"].map(() => {return week[type][i][key]["data"]}), backgroundColor: week[type][i][key]["backgroundColor"]})
                    data[type].push(week[type][i][key]["data"])
                })
            }
        })
        Object.keys(pie1).forEach(key => {
            this.pie1.labels.push(key)
            this.pie1.datasets[0].data.push(pie1[key]["data"])
            this.pie1.datasets[0].backgroundColor.push(pie1[key]["backgroundColor"])
        })
        Object.keys(proPie).forEach(key => {
            this.proPie.labels.push(key)
            this.proPie.datasets[0].data.push(proPie[key]["data"])
            this.proPie.datasets[0].backgroundColor.push(proPie[key]["backgroundColor"])
        })
        this.newOptions["scales"]["yAxes"][0]["ticks"]["min"] = this.getArrayMin(data["New"])
        this.newOptions["scales"]["yAxes"][0]["ticks"]["max"] = this.getArrayMax(data["New"])
        this.cloOptions["scales"]["yAxes"][0]["ticks"]["min"] = this.getArrayMin(data["Closed"])
        this.cloOptions["scales"]["yAxes"][0]["ticks"]["max"] = this.getArrayMax(data["Closed"])
        this.week0New = this.week[0].New
        this.week1New = this.week[1].New
        this.week2New = this.week[2].New
        this.week3New = this.week[3].New
        this.week0Clo = this.week[0].Closed
        this.week1Clo = this.week[1].Closed
        this.week2Clo = this.week[2].Closed
        this.week3Clo = this.week[3].Closed
        this.cusgridOperations(true);
    }
getData(){
    let temp = ''
    if(this.gridApi){
        temp = temp + "Customer-Weekly-JIRA-Report\n" + this.gridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.custGridApi){
        temp = temp + "SEV_P1_Weekly-JIRA-Report\n" + this.custGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    if(this.proGridApi){
        temp = temp + "SEV_P2+_Weekly-JIRA-Report\n" + this.proGridApi.getDataAsCsv({ allColumns: true, onlySelected: false}) + "\n";
    }
    this.setState({sevstr: temp}, () => {
        setTimeout(() => {
            this.csvLink.current.link.click();
        });
    })
}
cusStartDate = (startDate) =>{
    this.cusDateStart = startDate['StartDate']
        this.setState({
            cusStartDate : this.cusDateStart
        })
}
cusEndDate = (endDate) =>{
    this.cusDateEnd = endDate['EndDate']
    if(!this.state.cusStartDate){
        this.state.cusStartDate = this.cusDateStart
    }
    this.setState({
        cusEndDate : this.cusDateEnd
    }, () => {
        this.setState({disableShowButton : false})
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
        if (this.custGridApi) {
            if (this.state.isApiUnderProgress) {
                this.custGridApi.showLoadingOverlay();
            } else if (this.TicketsByCustomer.length === 0) {
                this.custGridApi.showNoRowsOverlay();
            } else {
                this.custGridApi.hideOverlay();
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
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                    <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = []; this.allClosedDefectsToShow = []; this.allPendingDefectsToShow = []; this.xcord = []; this.cusDateStart = this.lastMonth; this.cusDateEnd = this.today; this.calXCoordinate(this.today);this.getTcs(this.cusDateEnd, this.cusDateStart);}})}}>
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
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '10rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>New Defects Filed </span>
                                            </div>
                                        </div>
                                    </div>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.newOptions} data={this.week3New} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.newOptions} data={this.week2New} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.newOptions} data={this.week1New} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.newOptions} data={this.week0New} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                            </div >
                            <div class="row">
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '10rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Defects Closed </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Bar options={this.cloOptions} data={this.week3Clo} height={300}/>
                                    }
                                    {
                                        this.state.isApiUnderProgress &&
                                        <span className='rp-app-table-value'>Loading...</span>
                                    }
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.cloOptions} data={this.week2Clo} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.cloOptions} data={this.week1Clo} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                                <div class="col-sm-3" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div style={{ marginTop: '4rem'}}>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.cloOptions} data={this.week0Clo} height={300}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                    </div>
                                </div>
                            </div >
                            <div class="row">
                                <div class="col-sm-6" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '10rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Total Open Bugs</span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Pie data={this.pie1} />
                                    }
                                    {
                                        this.state.isApiUnderProgress &&
                                        <span className='rp-app-table-value'>Loading...</span>
                                    }
                                </div>
                                <div class="col-sm-6" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '15rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Total Open Bugs by Product</span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Pie data={this.proPie} />
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
export default (Graphs);