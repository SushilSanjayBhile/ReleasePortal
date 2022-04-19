import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Col,Row, Table, Button,
    UncontrolledPopover, PopoverBody,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Collapse
} from 'reactstrap';
import './CustomerBugs.scss';
import { AllCommunityModules, Promise } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import MoodEditor from "../TestCasesAll/moodEditor";
import MoodRenderer from "../TestCasesAll/moodRenderer";
import NumericEditor from "../TestCasesAll/numericEditor";
import SelectionEditor from '../TestCasesAll/selectionEditor';
import DatePickerEditor from '../TestCasesAll/datePickerEditor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Line, Pie} from 'react-chartjs-2';
const OneJan = new Date("2022-01-01T00:00:00.000-0700").getTime();
class Graphs extends Component {
    isApiUnderProgress = false;
    allTCsToShow = [];
    allClosedDefectsToShow = [];
    allPendingDefectsToShow = [];
    allPendingDefectsToShowBar = [];
    week = {};
    //lineweek = {};
    newOptions = {};
    cloOptions = {};
    xcord = [];
    lastWeek = this.subDays(new Date(), new Date().getDay());
    lastMonth = this.subDays(this.lastWeek, 83);
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
        this.lastWeek.setDate(this.lastWeek.getDate());
        this.lastWeek = this.lastWeek.toISOString().split("T")[0];
        this.lastMonth.setDate(this.lastMonth.getDate());
        this.lastMonth = this.lastMonth.toISOString().split("T")[0];
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
        // for(let i = 0; i < 5; i = i + 2){
        //     this.xcord.push(this.getDate(this.addDays(this.xcord[i], 6)))
        //     this.xcord.push(this.getDate(this.addDays(this.xcord[i], 7)))
        // }
        // this.xcord.push(this.getDate(this.addDays(this.xcord[6], 6)))
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
        this.week = {customer: { labels: [], datasets: [],}, sevp1: { labels: [], datasets: []}, "sevp2+": { labels: [], datasets: [],}, Pending: { labels: [], datasets: [],}};
        //this.lineweek = {New: { labels: [], datasets: [],}, Closed: { labels: [], datasets: [],}};
        for (let i = 0; i < this.xcord.length ; i = i + 2) {
            let dlabel = ''
            // if ( i == 0 || i == this.xcord.length - 2 ){
            //     dlabel = `${new Date(this.xcord[i].split("T")[0]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`+'-'+`${new Date(this.xcord[i+1].split("T")[0]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`;
            // }
            //else {
            dlabel = `${new Date(this.xcord[i].split("T")[0]).toLocaleDateString(undefined, { month: 'short',day: 'numeric'})}`;
            //}
            this.week["customer"]["labels"].push(dlabel)
            this.week["sevp1"]["labels"].push(dlabel)
            this.week["sevp2+"]["labels"].push(dlabel)
            this.week["Pending"]["labels"].push(dlabel)
            // this.lineweek["New"]["labels"].push(dlabel)
            // this.lineweek["Closed"]["labels"].push(dlabel)
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
                xAxes: [{
                    barPercentage: 0.7
                }],
                yAxes: [{
                    display: true,
                    stacked: false,
                    beginAtZero: true,
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
                xAxes: [{
                    barPercentage: 0.7
                }],
                yAxes: [{
                    display: true,
                    stacked: false,
                    beginAtZero: true,
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
        this.allPendingDefectsToShowBar = [];
        axios.get(`/rest/NewDefectsCount`,{params: {"sdate": sdate,"edate": edate,"flag": "graph",}}).then(all => {
            let MaxResult = all.data.total
            for(let i = 0; i <= MaxResult; i=i+100){
                promises1.push(axios.get(`/rest/NewDefects`,{
                    params: {
                        "startAt": i,
                        "sdate": sdate,
                        "edate": edate,
                        "flag": "graph",
                    }
                }).then(all => {
                    this.allTCsToShow = [...this.allTCsToShow, ...all.data.issues];
                }).catch(err => {
                    //this.cusgridOperations(true);
                }))
            }
            Promise.all(promises1).then(result => {
                this.getClosedDefects()
            })
        }).catch(err => {
            //this.cusgridOperations(true);
        })
    }
    // getClosedDefects(sdate, edate){
    //     let promises2 = []
    //     axios.get(`/rest/ClosedDefectsCount`,{params: {"sdate": sdate,"edate": edate,"flag": "graph",}}).then(all => {
    //         let MaxResult = all.data.total
    //         for(let i = 0; i <= MaxResult; i=i+100){
    //             promises2.push(axios.get(`/rest/ClosedDefects`,{
    //                 params: {
    //                     "startAt": i,
    //                     "sdate": sdate,
    //                     "edate": edate,
    //                     "flag": "graph",
    //                 }
    //             }).then(all => {
    //                 this.allClosedDefectsToShow = [...this.allClosedDefectsToShow, ...all.data.issues];
    //             }).catch(err => {
    //                 //this.cgridOperations(true);
    //             }))
    //         }
    //         Promise.all(promises2).then(result => {
    //             this.getPendingDefectsForBar();
    //             //this.getDefectsToShow();
    //     })
    //     }).catch(err => {
    //         //this.cgridOperations(true);
    //     })
    // }
    getClosedDefects(){
        let promises3 = []
        let outerPromise = []
        for(let j = 0, k = 0; j < this.xcord.length; j = j + 2, k++){
            outerPromise.push(axios.get(`/rest/ClosedDefectsCount`,{params: {"edate": this.xcord[j].split("T")[0],"sdate": this.xcord[j+1].split("T")[0]},"flag": "graph"}).then(all => {
                let MaxResult = all.data.total
                let templist = []
                promises3 = []
                for(let i = 0; i <= MaxResult; i=i+100){
                    promises3.push(axios.get(`/rest/ClosedDefects`,{
                        params: {
                            "startAt": i,
                            "edate": this.xcord[j].split("T")[0],
                            "sdate": this.xcord[j+1].split("T")[0],
                            "flag": "graph"
                        }
                    }).then(all => {
                        templist = [...templist, ...all.data.issues];
                    }).catch(err => {
                        //this.pgridOperations(true);
                    }))
                }
                Promise.all(promises3).then(result => {
                    this.allClosedDefectsToShow[k] = [...templist]
                    })
            }).catch(err => {
                //this.pgridOperations(true);
            }))
        }
        Promise.all(outerPromise).then(result => {
            Promise.all(promises3).then(result => {
                this.getPendingDefectsForBar()
            })
            })
    }
    getPendingDefectsForBar(){
        let promises3 = []
        let outerPromise = []
        for(let j = 0, k = 0; j < this.xcord.length; j = j + 2, k++){
            outerPromise.push(axios.get(`/rest/PendingDefectsCount`,{params: {"edate": this.xcord[j].split("T")[0],"sdate": this.xcord[j+1].split("T")[0]}}).then(all => {
                let MaxResult = all.data.total
                let templist = []
                promises3 = []
                for(let i = 0; i <= MaxResult; i=i+100){
                    promises3.push(axios.get(`/rest/PendingDefects`,{
                        params: {
                            "startAt": i,
                            "edate": this.xcord[j].split("T")[0],
                            "sdate": this.xcord[j+1].split("T")[0],
                        }
                    }).then(all => {
                        templist = [...templist, ...all.data.issues];
                    }).catch(err => {
                        //this.pgridOperations(true);
                    }))
                }
                Promise.all(promises3).then(result => {
                    this.allPendingDefectsToShowBar[k] = [...templist]
                    })
            }).catch(err => {
                //this.pgridOperations(true);
            }))
        }
        Promise.all(outerPromise).then(result => {
            Promise.all(promises3).then(result => {
                this.getPendingDefects()
                })
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
        for(let i = 0; i < this.xcord.length - 1; i = i + 2) {
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
        let bu = false;
        let week = {
            Pending: { Customer:{ data: [], backgroundColor: 'rgb(255, 99, 132)',}, "Dev P1":{ data: [], backgroundColor: 'rgb(75, 192, 192)',}, "Dev P2+":{ data: [], backgroundColor: 'rgb(53, 162, 235)',},},
            customer: { Filed:{ data: [], backgroundColor: 'rgb(255, 99, 132)',}, Closed:{ data: [], backgroundColor: 'rgb(75, 192, 192)',},},
            sevp1: { Filed:{ data: [], backgroundColor: 'rgb(255, 99, 132)',}, Closed:{ data: [], backgroundColor: 'rgb(75, 192, 192)',},},
            "sevp2+": { Filed:{ data: [], backgroundColor: 'rgb(255, 99, 132)',}, Closed:{ data: [], backgroundColor: 'rgb(75, 192, 192)',},},
        }
        for(let i = 0 ; i < this.xcord.length / 2; i++){
            week["Pending"]["Customer"]["data"].push(0)
            week["Pending"]["Dev P1"]["data"].push(0)
            week["Pending"]["Dev P2+"]["data"].push(0)
            week["customer"]["Filed"]["data"].push(0)
            week["customer"]["Closed"]["data"].push(0)
            week["sevp1"]["Filed"]["data"].push(0)
            week["sevp1"]["Closed"]["data"].push(0)
            week["sevp2+"]["Filed"]["data"].push(0)
            week["sevp2+"]["Closed"]["data"].push(0)
        }
        let pie1 = {
            Customer:{
                data: 0,
                backgroundColor: 'rgb(255, 99, 132)',
            },
            "Dev P1":{
                data: 0,
                backgroundColor: 'rgb(75, 192, 192)',
            },
            "Dev P2+":{
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
            this.allTCsToShow[i]["fields"]["labels"].some(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer") || loLabel.includes("active")) {
                    if(increaseCusDCount){
                        week["customer"]["Filed"]["data"][num] = week["customer"]["Filed"]["data"][num] + 1
                        increaseCusDCount = false
                        return true;
                    }
                }
            })
            if(increaseCusDCount){
                if(this.allTCsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                    week["sevp1"]["Filed"]["data"][num] = week["sevp1"]["Filed"]["data"][num] + 1
                }
                else if(this.allTCsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                    week["sevp2+"]["Filed"]["data"][num] = week["sevp2+"]["Filed"]["data"][num] + 1
                }
            }
        }
        // for(let i = 0; i < this.allClosedDefectsToShow.length; i++){
        //     let increaseCusDCount = true
        //     num = this.calculateWeek(new Date(this.allClosedDefectsToShow[i]["fields"]["updated"]))
        //     this.allClosedDefectsToShow[i]["fields"]["labels"].some(label => {
        //         let loLabel = label.toLowerCase()
        //         if(loLabel.includes("customer-") || loLabel.includes("customer")) {
        //             if(increaseCusDCount){
        //                 week["Closed"]["Customer"]["data"][num] = week["Closed"]["Customer"]["data"][num] + 1
        //                 increaseCusDCount = false
        //                 return true;
        //             }
        //         }
        //     })
        //     if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
        //         week["Closed"]["SEVP1"]["data"][num] = week["Closed"]["SEVP1"]["data"][num] + 1
        //     }
        //     else if(this.allClosedDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
        //         week["Closed"]["SEVP2+"]["data"][num] = week["Closed"]["SEVP2+"]["data"][num] + 1
        //     }
        // }
        for(let i = 0; i < this.allClosedDefectsToShow.length; i++){
            for(let j = 0; j < this.allClosedDefectsToShow[i].length; j++){
                let increaseCusDCount = true
                this.allClosedDefectsToShow[i][j]["fields"]["labels"].some(label => {
                    let loLabel = label.toLowerCase()
                    if(loLabel.includes("customer-") || loLabel.includes("customer") || loLabel.includes("active")) {
                        if(increaseCusDCount){
                            week["customer"]["Closed"]["data"][i] = week["customer"]["Closed"]["data"][i] + 1
                            increaseCusDCount = false
                            return true;
                        }
                    }
                })
                if(increaseCusDCount){
                    if(new Date(this.allClosedDefectsToShow[i][j]["fields"]["created"]).getTime() >= OneJan){
                        if(this.allClosedDefectsToShow[i][j]["fields"]["priority"]["name"] == "Highest") {
                            week["sevp1"]["Closed"]["data"][i] = week["sevp1"]["Closed"]["data"][i] + 1
                        }
                        else if(this.allClosedDefectsToShow[i][j]["fields"]["priority"]["name"] != "Highest"){
                            week["sevp2+"]["Closed"]["data"][i] = week["sevp2+"]["Closed"]["data"][i] + 1
                        }
                    }
                }
            }
        }
        for(let i = 0; i < this.allPendingDefectsToShowBar.length; i++){
            for(let j = 0; j < this.allPendingDefectsToShowBar[i].length; j++){
                let increaseCusDCount = true
                this.allPendingDefectsToShowBar[i][j]["fields"]["labels"].some(label => {
                    let loLabel = label.toLowerCase()
                    if(loLabel.includes("customer-") || loLabel.includes("customer") || loLabel.includes("active")) {
                        if(increaseCusDCount){
                            week["Pending"]["Customer"]["data"][i] = week["Pending"]["Customer"]["data"][i] + 1
                            increaseCusDCount = false
                            return true;
                        }
                    }
                })
                if(increaseCusDCount){
                    if(new Date(this.allPendingDefectsToShowBar[i][j]["fields"]["created"]).getTime() >= OneJan){
                        if(this.allPendingDefectsToShowBar[i][j]["fields"]["priority"]["name"] == "Highest") {
                            week["Pending"]["Dev P1"]["data"][i] = week["Pending"]["Dev P1"]["data"][i] + 1
                        }
                        else if(this.allPendingDefectsToShowBar[i][j]["fields"]["priority"]["name"] != "Highest"){
                            week["Pending"]["Dev P2+"]["data"][i] = week["Pending"]["Dev P2+"]["data"][i] + 1
                        }
                    }
                }
            }
        }
        for(let i = 0; i < this.allPendingDefectsToShow.length; i++){
            let increaseCusDCount = true;
            bu = true;
            if(new Date(this.allPendingDefectsToShow[i]["fields"]["created"]).getTime() >= OneJan){
                bu = false;
            }
            let ue = false, ua = false, sp = false;
            this.allPendingDefectsToShow[i]["fields"]["labels"].forEach(label => {
                let loLabel = label.toLowerCase()
                if(loLabel.includes("customer-") || loLabel.includes("customer") || loLabel.includes("active")) {
                    if(increaseCusDCount){
                        pie1["Customer"]["data"] = pie1["Customer"]["data"] + 1
                        increaseCusDCount = false
                    }
                }
                else if (bu == false){
                    if(loLabel.includes("ultima-software")) {
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
                }
            })
            if (!bu){
                proPie["Unclassified"]["data"] = proPie["Unclassified"]["data"] + 1
            }
            if(increaseCusDCount){
                if(new Date(this.allPendingDefectsToShow[i]["fields"]["created"]).getTime() >= OneJan){
                    if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] == "Highest") {
                        pie1["Dev P1"]["data"] = pie1["Dev P1"]["data"] + 1
                    }
                    else if(this.allPendingDefectsToShow[i]["fields"]["priority"]["name"] != "Highest"){
                        pie1["Dev P2+"]["data"] = pie1["Dev P2+"]["data"] + 1
                    }
                }
            }
        }
        Object.keys(week).forEach(type => {
            Object.keys(week[type]).forEach( ele => {
                this.week[type]["datasets"].push({data: week[type][ele]["data"], label: ele, backgroundColor: week[type][ele]["backgroundColor"]})
                //this.lineweek[type]["datasets"].push({data: week[type][ele]["data"], fill: false, lineTension: 0, label: ele, borderColor: week[type][ele]["backgroundColor"]})
            })
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
        this.weekCust = this.week["customer"]
        this.weekSevp1 = this.week["sevp1"]
        this.weekSevp2 = this.week["sevp2+"]
        this.weekPen = this.week["Pending"]
        this.cusgridOperations(true);
    }
    render() {
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                    <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => {this.setState({ tcOpen: !this.state.tcOpen }, () => {if(this.state.tcOpen){this.allTCsToShow = []; this.allClosedDefectsToShow = []; this.allPendingDefectsToShow = []; this.allPendingDefectsToShowBar = []; this.xcord = []; this.cusDateStart = this.lastMonth; this.cusDateEnd = this.getDate(this.addDays(new Date(this.lastWeek),1)); this.calXCoordinate();this.getTcs(this.cusDateEnd, this.cusDateStart);}})}}>
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
                                <div class="col" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '25rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Customer New Defects Filed Vs Closed </span>
                                            </div>
                                        </div>
                                    </div>
                                        {
                                            !this.state.isApiUnderProgress &&
                                            <Bar options={this.newOptions} data={this.weekCust}/>
                                        }
                                        {
                                            this.state.isApiUnderProgress &&
                                            <span className='rp-app-table-value'>Loading...</span>
                                        }
                                </div>
                            </div >
                            <div class="row">
                                <div class="col" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Dev P1 New Defects Filed Vs Closed </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Bar options={this.cloOptions} data={this.weekSevp1}/>
                                    }
                                    {
                                        this.state.isApiUnderProgress &&
                                        <span className='rp-app-table-value'>Loading...</span>
                                    }
                                </div>
                            </div >
                            <div class="row">
                                <div class="col" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Dev P2+ New Defects Filed Vs Closed </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Bar options={this.cloOptions} data={this.weekSevp2}/>
                                    }
                                    {
                                        this.state.isApiUnderProgress &&
                                        <span className='rp-app-table-value'>Loading...</span>
                                    }
                                </div>
                            </div >
                            <div class="row">
                                <div class="col" style={{ width: '100%', height: '100%', marginBottom: '6rem' }}>
                                    <div class="test-header">
                                        <div class="row">
                                            <div style={{ width: '20rem', marginTop: '2.5rem', marginLeft: '1rem' }}>
                                                    <span className='rp-app-table-title'>Defects Pending Verification</span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !this.state.isApiUnderProgress &&
                                        <Bar options={this.cloOptions} data={this.weekPen}/>
                                    }
                                    {
                                        this.state.isApiUnderProgress &&
                                        <span className='rp-app-table-value'>Loading...</span>
                                    }
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