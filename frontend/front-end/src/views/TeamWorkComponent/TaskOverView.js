import React,{ Component } from 'react';
import { Row,Col,Input,Collapse,Table } from 'reactstrap';
import './dropdownButton.css';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import axios from 'axios';

//Employee wise View
import PersonViewTest from './PersonViewTest';

//Project Wise View
import TaskDetails from './TaskDetails';

//constant variable declaration
const API_URL = 'https://diamanti.teamwork.com';
const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h'
const password = 'a'
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')


function daysInThisMonth() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
}

let month = new Date().getMonth() + 1;
let year = new Date().getFullYear();
let dayInCurrentMonth = daysInThisMonth();

let tempDateStart = ''
let tempDateEnd = ''
let tempDateStartAPI = ''
let tempDateEndAPI = ''

if(month >= '10'){

    tempDateStart = year +"-"+ month +"-"+ "01"
    tempDateEnd = year +"-"+ month +"-"+ dayInCurrentMonth

    tempDateStartAPI = tempDateStartAPI.concat(year,month,"01")
    tempDateEndAPI = tempDateEndAPI.concat(year,month,dayInCurrentMonth)
}
else{

    tempDateStart = year + "-" + "0" + month + "-" + "01"
    tempDateEnd =year + "-" + "0" + month + "-" + dayInCurrentMonth

    tempDateStartAPI = tempDateStartAPI.concat(year,month,"01")
    tempDateEndAPI = tempDateEndAPI.concat(year,month,dayInCurrentMonth)
   
}


class TaskOverView extends Component{
    constructor(){
        super();
       

        this.state = {

            taskList : [],
            tasks : [],
            selectedTaskList : '',
            selectedTask : '',
            userData: [],
            taskListID : '',
           
            showMenu:false,
            showEmployeeView:false,
            startDate : tempDateStartAPI,
            endDate : tempDateEndAPI,
            startDateToShow : tempDateStart,
            endDateToShow : tempDateEnd,
            
            userUpdated:[],
            usersInProject : [],
            projectUsers:[],

            ReleaseMenu : [
                {'releaseName' : ' DMC-3.1 ','releaseID' : 507522},
                {'releaseName' : ' DCX-3.1 ','releaseID' : 507574},
                {'releaseName' : ' OCP-4.5 ','releaseID' : 507537},
                {'releaseName' : ' DSS ','releaseID' : 507533},
            ],

            users : [
                {'id' : 180688,'name' : "Yatish Devadiga"},
                {'id' : 291557,'name' : "Swapnil Sonawane"},
                {'id' : 239362,'name' : "Tanya Singh"},
                {'id' : 207091,'name' : "Vishal Anarse"},
                {'id' : 294619,'name' : "Arati Jadhav"},
                {'id' : 295961,'name' : "Aditya Nilkanthwar"},
                {'id' : 295639,'name' : "Ketan Divekar"},
                {'id' : 180684,'name' : "Kiran Zarekar"},
                {'id' : 258125,'name' : "Kiran Kothule"},
                {'id' : 215417,'name' : "Mukesh Shinde"},
                {'id' : 239361,'name' : "Priyanka Birajdar"},
                {'id' : 258126,'name' : "Rajat Gupta"},
                {'id' : 286258,'name' : "Shubham Khatri"},
                {'id' : 291556,'name' : "Varsha Suryawanshi"},
                {'id' : 268433 ,'name' : "Yogesh Thosare"},
                {'id' : 180687,'name' : "Bharati Bhole"},
                {'id' : 180680,'name' : "Rahul Soman"},
                {'id' : 297431,'name' : "Prachee Ahire"},
                {'id' : 297430 , 'name' : "Ashutosh Das" },
                {'id' : 295640 , 'name' : "Chetan Noginahal"},
                {'id' : 295641 , 'name' : "Pankaj Badge"},
            ],
        }
    }

    handleUserUpdation = (params) =>{
        this.setState({
            userUpdated:params
        })
    }

    selectedOption = (option) =>{
        this.setState({
            projectID  : option
        });
        this.getTaskList(option);
    }

    selectedTaskList = (taskListID) =>{
        let tempUserData = []
        this.setState({
            taskListID : taskListID,
            userUpdated : []
        })

        let userInTaskListTotalTimeURL =  `${API_URL}/tasklists/${taskListID}/time/total.json`
            this.state.usersInProject.forEach(item=>{

                axios.get(userInTaskListTotalTimeURL,{
                    params: {
                        userId : item.id,
                        fromDate : this.state.startDate,
                        toDate : this.state.endDate 
                        },
                    headers: {
                        'Authorization': `Basic ${token}`
                    }   
                })
                .then(response=>{
                    let temp = parseFloat(response.data['projects'][0]['tasklist']['time-totals']['non-billable-hours-sum'])
                    if(temp!=0){
                        tempUserData.push({
                            'EmpName' : item.name,
                            'workingHours':temp
                        })
                    }
                    this.handleUserUpdation(tempUserData)
                })
            })
    }

    getTaskList = (projectID) => {

        let tempTaskListArray = [];
        let tempEmpArray = [];

        let tempUserData = []

        this.setState({
            taskList : []
        })
        
        let userInProjectURL = `${API_URL}/projects/${projectID}/people.json`;
        
        axios.get(userInProjectURL,{
            params: {
                startdate:this.state.startDate 
                },
            headers: {
                'Authorization': `Basic ${token}`
            }   
        })
        .then(response=>{
            let peopleArray = response.data["people"]
            peopleArray.map((emp)=>{
                tempEmpArray.push({
                    'id' : emp.id,
                    'name' : emp["full-name"]
                })
            })
           
            let userInProjectTotalTimeURL =  `${API_URL}/projects/${projectID}/time/total.json`
            tempEmpArray.forEach(item=>{

                axios.get(userInProjectTotalTimeURL,{
                    params: {
                        userId : item.id,
                        fromDate : this.state.startDate,
                        toDate : this.state.endDate 
                        },
                    headers: {
                        'Authorization': `Basic ${token}`
                    }   
                })
                .then(response=>{
                    let temp = parseFloat(response.data['projects'][0]['time-totals']['non-billable-hours-sum'])
                    if(temp!=0){
                        tempUserData.push({
                            'EmpName' : item.name,
                            'workingHours':temp
                        })
                    }
                    this.handleUserUpdation(tempUserData)
                })
            })

            this.setState({
                usersInProject : tempEmpArray
            })

        })
        .catch(Error=>{
            console.log("error getting people data")
        })
        
        let taskListURL = `${API_URL}/projects/${projectID}/tasklists.json`;

        axios.get(taskListURL,{
            params: {
                startdate:this.state.startDate 
                },
            headers: {
                'Authorization': `Basic ${token}`
            }   
        })
        .then(response=>{
            response.data.tasklists.map((ele)=>{
                tempTaskListArray.push(
                    {
                        "taskListID" : ele.id,
                        "taskListName" : ele.name
                    }
                )
            })
            this.setState({
                taskList : tempTaskListArray
            })
        })
        .catch(error=>{
            console.log("Error Getting TaskList Data",error)
        })
    }
   
    renderTableData  = () => {
        return this.state.userUpdated == 0 ? (
            <tr>
                <td>No Rows To Show</td>
            </tr>
        ) : (
            this.state.userUpdated.map((e, i) => {
            return (
                    <tr key={i}> 
                        <td style={{padding:'1rem'}}>{e.EmpName}</td>
                        <td>{e.workingHours}</td>
                    </tr>    
                );
            })
        )
    }

   
    selectedStartDate = (startDate) =>{

        tempDateStart = startDate['StartDate']
        
        let tempDate = startDate['StartDate'].split("-");
        let tempDate1 = tempDate[0] + tempDate[1] + tempDate[2];
        let tempDate2 = tempDate[2] + " - " + tempDate[1] + " - " + tempDate[0]

        this.setState({
            startDate : tempDate1,
            startDateToShow : tempDate2,
        })
    }

    selectedEndDate = (endDate) =>{
       
        tempDateEnd = endDate['EndDate']

        let tempDate = endDate['EndDate'].split("-");
        let tempDate1 = tempDate[0] + tempDate[1] + tempDate[2];
        let tempDate2 = tempDate[2] + " - " + tempDate[1] + " - " + tempDate[0]

        this.setState({
            endDate : tempDate1,
            endDateToShow : tempDate2,
        })
    }

   
    render(){
        //set value for calender input box
        let DATE1 = tempDateStart     
        let DATE2 = tempDateEnd  

        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ showMenu: !this.state.showMenu })} style={{ display: 'inlineBlock' }}>
                                        
                                        {
                                            !this.state.showMenu &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.showMenu &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Task Overview</span>
                                      
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Collapse isOpen={this.state.showMenu}>
                            <div>
                                
                                <div style={{ width: (window.screen.width * (1 - 0.218)) + 'px', height: '550px', marginBottom: '6rem' }}>
                                
                                    <div class="row">

                                        <div class="col-md-3">
                                                <Input onChange={(e) => this.selectedOption(e.target.value)} type="select" name="selectOption" id="selectOption" >
                                                    <option value=''>Select Release</option>
                                                    {
                                                        this.state.ReleaseMenu.map(item => <option value={item.releaseID}>{item.releaseName}</option>)
                                                    }
                                                </Input>
                                        </div>
                                       
                                        <div class="col-md-3"> 
                                            {
                                                this.state.taskList  ? (
                                                
                                                    <Input onChange={(e) => this.selectedTaskList(e.target.value)} type="select" name="selectedTaskList" id="selectedTaskList" >
                                                        <option value=''>Select TaskList</option>
                                                            {
                                                                this.state.taskList.map(item => <option value={item.taskListID}>{item.taskListName}</option>)
                                                            }
                                                    </Input> 
                                                 ):(null)
                                            } 
                                        </div>

                                        <div class="col-md-3"> 
                                            {
                                                this.state.taskListID ?(
                                                    <TaskDetails  {...this.state} userUpdated={this.handleUserUpdation}/>
                                                ):null

                                            }
                                        </div>
                                    </div>

                                    <div class="row"  style={{marginTop:'1rem'}}>
                                        <div class="col-md-3">
                                            From Date<Input  type="date" id="StartDate" value={DATE1} onChange={(e) => this.selectedStartDate({ StartDate: e.target.value })} ></Input>
                                        </div> 

                                        <div class="col-md-3">
                                            To Date<Input  type="date" id="EndDate" value={DATE2} onChange={(e) => this.selectedEndDate({ EndDate: e.target.value })} />
                                        </div>         
                                        
                                    </div>
                                    
                                    {
                                        this.state.userUpdated ? (
                                            <div style={{ marginRight: '4rem' , marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                                <Table scroll responsive style={{ overflow: 'scroll' }}>
                                                    <thead>
                                                        <tr>
                                                            {/* <th>Task Name</th> */}
                                                            <th style={{padding:'1rem'}}>Name</th>
                                                            <th>Working hours</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                        this. renderTableData()
                                                        }
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (null)
                                    }
                                </div>
                            </div>
                        </Collapse>
                    </Col>
                </Row>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ showEmployeeView: !this.state.showEmployeeView })} style={{ display: 'inlineBlock' }}>
                                        {
                                            !this.state.showEmployeeView &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.showEmployeeView &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Employee View</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Collapse isOpen={this.state.showEmployeeView}>
                            <div>
                                <div style={{ width: (window.screen.width * (1 - 0.218)) + 'px', height: '1500px', marginBottom: '8rem' }}>
                                    <PersonViewTest {...this.state} />
                                </div>
                            </div>
                        </Collapse>                                           
                    </Col>
                </Row>
            </div>
        )
    }
}

export default TaskOverView;
