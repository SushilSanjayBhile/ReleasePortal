import React,{ Component } from 'react';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import { Navbar, Nav,DropdownToggle,Dropdown,DropdownMenu,DropdownItem,ButtonDropdown } from 'reactstrap';
import {FormGroup, Label, FormText} from 'reactstrap';
import './dropdown.css';
//Other Components Imports
import SpektraAutomationComponent from './spektraAutomationComponent';
import SpektraManualTestComponent from './spektraManualTestComponent';
import SpektraNonTestingComponent from './spektraNonTestingComponent';
import E2EAutomationComponent from './E2E_AutomationComponent';
import AutomationFixesComponent from './AutomationFixesComponent';
import NonTestingTaskComponent from './NonTestingTaskComponent';
import Release_2_3_0_Component from './Release_2_3_0_Component';
import MonthComponent from './MonthComponent';
// var DatePicker = require("reactstrap-date-picker");
import DatePicker from 'reactstrap-date-picker';

import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';

class taskListHomeComponent extends Component {
    constructor(){
        super();
        // this.totalHoursSpentByEachPerson = this.totalHoursSpentByEachPerson.bind(this);
        // this.dataManuplation = this.dataManuplation.bind(this);
       
    }
    state = {
        users : [
            {'id':180688,'name':"Yatish Devadiga"},
            {'id':291557,'name':"Swapnil Sonawane"},
            {'id':239362,'name':"Tanya Singh"},
            {'id':207091,'name':"Vishal Anarse"},
            {'id':294619,'name':"Arati Jadhav"},
            {'id':295961,'name':"Aditya Nilkanthwar"},
            {'id':295639,'name':"Ketan Divekar"},
            {'id':180684,'name':"Kiran Zarekar"},
            {'id':258125,'name':"Kiran Kothule"},
            {'id':215417,'name':"Mukesh Shinde"},
            {'id':239361,'name':"Priyanka Birajdar"},
            {'id':258126,'name':"Rajat Gupta"},
            {'id':286258,'name':"Shubham Khatri"},
            {'id':291556,'name':"Varsha Suryawanshi"},
            {'id':268433,'name':"Yogesh Thosare"},
            {'id':180687,'name':"Bharati Bhole"},
            {'id':180680,'name':"Rahul Soman"},
        ],
        isOpen1 : false,
        isOpen2 : false,
        isOpen3 : false,
        isOpen4 : false,
        isOpen5 : false,
        isOpen6 : false,
        isOpen7 : false,
        isOpen10 : false,
        dropdownOpenForTask:false,
        dropdownOpenForProject:false,
        totalHoursSpentByEachPerson : [],
        nonBillableHours1:[],
        filteredArr:[],
        value: new Date().toISOString(),
        test:[]
    }

    componentDidMount() {
        // this.getListOfAllFolks();
    }
    getListOfAllFolks = () => {
        const url = `${API_URL}/projects/444222/people.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            headers: {
              'Authorization': `Basic ${token}`
        }})
        .then(response => response.data)
        .then((data) => {
            this.setState({ users: data['people'] })
            // console.log("All People working",this.state.users);
            // console.log("Total Count Of Employee Working",this.state.users.length)
            // this.totalHoursSpentByEachPerson();
        })
        .catch(error => { 
            console.log("Error",error)
        })
    }
    toggleForProject = () => {
        this.setState({dropdownOpenForProject:!this.state.dropdownOpenForProject})
    }

    toggleForTask = () => {
        this.setState({dropdownOpenForTask:!this.state.dropdownOpenForTask})
    }
    closeAll = () =>{

        this.setState({isOpen1:false})
        this.setState({isOpen2:false})
        this.setState({isOpen3:false})
        this.setState({isOpen4:false})
        this.setState({isOpen5:false})
        this.setState({isOpen6:false})
        this.setState({isOpen7:false})
    }

    // totalHoursSpentByEachPerson = () => {
    //     c2+=1;
    //     // https://diamanti.teamwork.com/tasklists/1579939/time/total.json?userId=180688
    //     // https://diamanti.teamwork.com/people/268433/loggedtime.json (yogesg Data)

    //     let nonBillableHours = [];
       
    //     let nonBillableHoursByPerson = [];
    //     // const url = `${API_URL}/people/180688/loggedtime.json`; //Arati Team Work Data
    //     const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h' //yatish token
    //     const password = 'a'
    //     const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

    //     this.state.users.map((key,index)=>
    //         axios.get(`${API_URL}/tasklists/1579939/time/total.json`, {
    //             params: {
    //                 userId:key['id']
    //               },
    //             headers: {
    //             'Authorization': `Basic ${token}`
    //         }
    //     })
    //         .then(response => response.data)
    //         .then((data) => {
    //             if(data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"] != 0){
    //             console.log("data",key['id'],key["first-name"],data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"])
    //             }

    //             // this.setState({ totalHoursSpentByEachPerson:data['user']})
    //             // let u1 = 0
    //             // if(this.state.totalHoursSpentByEachPerson.nonbillable.length!=0){
    //             //     nonBillableHours.push({'id':this.state.totalHoursSpentByEachPerson.id,'workingHours':this.state.totalHoursSpentByEachPerson.nonbillable}) 
    //             //     nonBillableHours.map((key1)=>{
    //             //         nonBillableHoursByPerson = []
    //             //         key1['workingHours'].map((key)=>{
    //             //             nonBillableHoursByPerson.push(parseFloat(key[1]));
    //             //             u1 = nonBillableHoursByPerson.reduce((prev,curr)=>prev + curr,0)
    //             //             // console.log("u1",nonBillableHoursByPerson);
    //             //         });
    //             //         this.state.nonBillableHours1.push({'id':key1.id,'workingHours':u1})
    //             //         this.state.filteredArr = this.state.nonBillableHours1.reduce((acc, current) => {
    //             //             const x = acc.find(item => item.id === current.id);
    //             //             if (!x) {
    //             //               return acc.concat([current]);
    //             //             } else {
    //             //               return acc;
    //             //             }
    //             //           }, []);

    //             //           this.dataManuplation(this.state.filteredArr);
    //             //     }); 
    //             // }
                
    //         })
    //         .catch(error => { 
    //             console.log("Error",error)
    //         })
    //     )
        
    // }

    // dataManuplation = (param) =>{
        
    // //     for(let user = 0 ; user < this.state.users.length; user++){
    // //         for(let par = 0 ; par < param.length; par++){
    // //             if(this.state.users[user].id == param[par].id){
    // //                 this.state.users[user]['totalworkingHrs'] = param[par].workingHours
    // //                 this.state.test.push(this.state.users[user])

    // //             }
    // //         }
    // //     }
    // // console.log("12345",this.state.test);
    // c3+=1;
    // }

    // handleChange(value, formattedValue) {
    //     this.setState({
    //       value: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
    //       formattedValue: formattedValue // Formatted String, ex: "11/19/2016"
    //     })
    //   }
    //   componentDidUpdate() {
    //     // Access ISO String and formatted values from the DOM.
    //     var hiddenInputElement = document.getElementById("example-datepicker");
    //     console.log(hiddenInputElement.value); // ISO String, ex: "2016-11-19T12:00:00.000Z"
    //     console.log(hiddenInputElement.getAttribute('data-formattedvalue')) // Formatted String, ex: "11/19/2016"
    //   }
    render(){
        console.log(this.state.isOpen1,this.state.isOpen2,this.state.isOpen3,
            this.state.isOpen4,this.state.isOpen5,this.state.isOpen6,this.state.isOpen7);
        return (
            <div> 
                <div style={{margin:'10px',textAlign:'center',fontWeight:"bold"}}>Home Page For TaskList</div>
                <Navbar light expand="md">
                    <ButtonDropdown style={{margin:'2%'}} isOpen={this.state.dropdownOpenForProject} toggle={this.toggleForProject}>
                        <DropdownToggle caret style={{margin:'2%'}}>
                            Select Project
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>
                                Spektra 3.0
                            </DropdownItem>
                            <DropdownItem>
                                2.4.0
                            </DropdownItem>
                            <DropdownItem >
                                2.3.0
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>


                    <ButtonDropdown style={{margin:'2%'}} isOpen={this.state.dropdownOpenForTask} toggle={this.toggleForTask}>
                        <DropdownToggle caret style={{margin:'2%'}}>
                            Select Task List
                        </DropdownToggle>
                        
                        <DropdownMenu>
                            <DropdownItem>
                                <div onClick={() => this.setState({isOpen1:!this.state.isOpen1}) } >Spektra Manual Test</div>
                            </DropdownItem>
                            <DropdownItem >
                                <div onClick={() => this.setState({isOpen2:!this.state.isOpen2})} >Spektra Automation</div>
                            </DropdownItem>
                            <DropdownItem >
                                <div onClick={() => this.setState({isOpen3:!this.state.isOpen3})} >Spektra Non Testing</div>
                            </DropdownItem>
                            <DropdownItem >
                                <div onClick={() => this.setState({isOpen4:!this.state.isOpen4})} >E2E Automation</div>
                            </DropdownItem>
                            <DropdownItem > 
                                <div onClick={() => this.setState({isOpen5:!this.state.isOpen5})} >Automation Fixes</div>
                            </DropdownItem>
                            <DropdownItem >
                                <div onClick={() => this.setState({isOpen6:!this.state.isOpen6})} >Non Testing Tasks </div>
                            </DropdownItem>
                            <DropdownItem >
                                <div onClick={() => this.setState({isOpen7:!this.state.isOpen7})} >2.3.0 </div>
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                    
                    {/* <Button onClick={this.closeAll} >Hello</Button> */}
                   
                       
                            {/* <Label>Date</Label>
                            <DatePicker id      = "example-datepicker" 
                                        value   = {this.state.value} 
                                        onChange= {(v,f) => this.handleChange(v, f)} />
                            */}
                       
                    <Button onClick={this.closeAll} style={{margin:"60%"}}>Close</Button>
                </Navbar>
                <div> 
                    <Collapse isOpen={this.state.isOpen1}>
                    <Card>
                        <CardBody>
                            <SpektraManualTestComponent {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                    
                    <Collapse isOpen={this.state.isOpen2}>
                    <Card>
                        <CardBody>
                            <SpektraAutomationComponent {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                
                    <Collapse isOpen={this.state.isOpen3}>
                    <Card>
                        <CardBody>
                            <SpektraNonTestingComponent {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                
                    <Collapse isOpen={this.state.isOpen4}>
                    <Card>
                        <CardBody>
                            <E2EAutomationComponent {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                
                    <Collapse isOpen={this.state.isOpen5}>
                    <Card>
                        <CardBody>
                            <AutomationFixesComponent {...this.state} />
                        </CardBody>
                    </Card>
                    </Collapse>
               
                    <Collapse isOpen={this.state.isOpen6}>
                    <Card>
                        <CardBody>
                            <NonTestingTaskComponent {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                
                    <Collapse isOpen={this.state.isOpen7}>
                    <Card>
                        <CardBody>
                            <Release_2_3_0_Component {...this.state}/>
                        </CardBody>
                    </Card>
                    </Collapse>
                
                </div>
            
            </div>
        )
    }
}
export default taskListHomeComponent;