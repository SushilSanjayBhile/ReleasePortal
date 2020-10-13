import React , { Component } from 'react';
import axios from 'axios';
import { Input, Table } from 'reactstrap';

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

var flag = 0
let tempTaskListArray = [];
class PersonViewTest extends Component {
    constructor(props){
        super(props);

        this.state = {
            projectID : ['507644','507522','507574', '507537', '507533'],
            empID : '',
            selectedTaskList : '',
            tasks : [],
            startDate : tempDateStartAPI,
            endDate : tempDateEndAPI,
            startDateToShow : tempDateStart,
            endDateToShow : tempDateEnd,
        }
    }

   
    selectEmployeeID = (empID) => {
        flag = 1;
        this.setState({
            empID : empID,
            
        })
        tempTaskListArray = [];

        this.getData();
    }

    getData = () =>{
        this.setState({
            tasks : []
        })
        let data1 = []
        this.state.projectID.map((ID)=>{
            let tempArray = []
            let url = `${API_URL}/projects/${ID}/people.json`;
            axios.get(url, {
                params: {
                    startdate:this.state.startDate 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response=>{
                let data = response.data['people'];
                data.map((ele)=>{
                    tempArray.push({
                        'Id' : ele.id,
                        'Name' : ele["full-name"]
                    })
                })

                data1.push({
                    'projectId' : ID,
                    'data' : tempArray
                })
                data1.map((ele)=>{
                   ele.data.map((ele1)=>{
                        if(ele1.Id === this.state.empID){
                            this.getTaskList(ele.projectId)
                        }
                   })
                })
            })
        })
    }

    getTaskList = (projectID) => {
        let workingHours = 0
        this.setState({
            taskList : []
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
                workingHours = 0
                let url2 = `${API_URL}/tasklists/${ele.id}/time/total.json`;
                axios.get(url2,{
                    params: {
                        userId:this.state.empID,
                        fromDate:this.state.startDate,
                        toDate:this.state.endDate 
                        },
                    headers: {
                        'Authorization': `Basic ${token}`
                    }   
                })
                .then(response=>{
                    let data = response.data
                    workingHours = parseFloat(data['projects'][0]['tasklist']['time-totals']['non-billable-hours-sum'])
                    tempTaskListArray.push(
                        {
                            "taskListID" : ele.id,
                            "taskName" : ele.name,
                            "workingHours" : workingHours
                        }
                    )
                    this.setState({
                        taskList : tempTaskListArray
                    })
                })
            })
        })
        .catch(error=>{
            console.log("Error Getting TaskList Data",error)
        })
    }

    selectedTaskList = (taskListID) =>{
        this.getTaskDetails(taskListID);
    }

    getTaskDetails = (taskListID) =>{
        let tempTasksArray = [];
        this.setState({
            tasks : []
        })
        let taskListURL = `${API_URL}/tasklists/${taskListID}/tasks.json`;

        axios.get(taskListURL,{
            params: {
                startdate:this.state.startDate
                },
            headers: {
                'Authorization': `Basic ${token}`
            }   
        })
        .then(response=>{
            let data =  response.data['todo-items']
            data.map((ele)=>{
                
                const taskurl = `${API_URL}/tasks/${ele.id}/time/total.json`;
                axios.get(taskurl, {
                    params: {
                        userId:this.state.empID,
                        fromDate:this.state.startDate,
                        toDate:this.state.endDate 
                        },
                    headers: {
                    'Authorization': `Basic ${token}`
                }})
                .then(response=>{
                    let data = response.data
                    let taskName = data['projects'][0]['tasklist']['task']['name']
                    let taskWorkingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                    if(taskWorkingHours != 0){
                        tempTasksArray.push(
                            {
                                "taskName" : taskName,
                                "workingHours" : taskWorkingHours
                            }
                        )
                    }
                    this.setState({
                        tasks : tempTasksArray
                    })
                })
            })
        })
        .catch(error=>{
            console.log("Error Getting TaskList Data",error)
        })
    }

  
    renderTableData  = (list1) => {
        return list1.length === 0 ? (
            <tr>
                <td>No Rows To Show</td>
            </tr>
        ) : (
            list1.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td width="100px" height="50px" onClick={() => this.selectedTaskList(e.taskListID)} >
                                <a href='#' style={{color: 'green'}}>{e.taskName}</a>
                                </td> 
                            <td width="100px" height="50px" >{e.workingHours}</td>
                        </tr>    
                );
            })
        )
    }

    renderTableDataTask  = (list1) => {
        return list1.length === 0 ? (
            <tr>
                <td>No Rows To Show</td>
            </tr>
        ) : (
            list1.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td width="100px" height="50px" onClick={() => this.selectedTaskList(e.taskListID)} >
                                {e.taskName}
                                </td> 
                            <td width="100px" height="50px" >{e.workingHours}</td>
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
            startDateToShow : tempDate2
        })
        if(flag == 1){
            this.selectEmployeeID(this.state.empID)
        }
    }

    selectedEndDate = (endDate) =>{
        tempDateEnd = endDate['EndDate']
        
        let tempDate = endDate['EndDate'].split("-");
        let tempDate1 = tempDate[0] + tempDate[1] + tempDate[2];
        let tempDate2 = tempDate[2] + " - " + tempDate[1] + " - " + tempDate[0]

        this.setState({
            endDate : tempDate1,
            endDateToShow : tempDate2
        })
        if(flag == 1){
            this.selectEmployeeID(this.state.empID)
        }
    }

    render(){
        //set value for calender input box
        let DATE1 = tempDateStart     
        let DATE2 = tempDateEnd  

        let tasklistToShow = []
        if(tempTaskListArray){
            const tempresult = [];
            const result = []
            const map = new Map();
            for (const item of tempTaskListArray) {
                if(!map.has(item.taskListID)){
                    map.set(item.taskListID, true);    // set any value to Map
                    tempresult.push({
                        taskListID: item.taskListID,
                        taskName: item.taskName,
                        workingHours : item.workingHours
                    });
                }
            }
            
            tempresult.map((ele)=>{
                if(ele.workingHours != 0){
                    
                    result.push({
                        taskListID: ele.taskListID,
                        taskName: ele.taskName,
                        workingHours : ele.workingHours
                    });

                }
            })
            tasklistToShow = result
        }
        
        return(
            <div>
                <div class="row">
                    <div class="col-md-3">
                        <Input style={{marginTop:'2rem'}} onChange={(e) => this.selectEmployeeID(e.target.value)} type="select" name="personView" id="personView" >
                            <option value=''>Select Person</option>
                                {
                                    this.props.users.map(item => <option value={item.id}>{item.name}</option>)
                                }            
                        </Input>
                    </div>
                   
                    <div class="col-md-3">
                        Start Date<Input style={{marginTop:'1rem'}} type="date" id="StartDate" value={DATE1} name="StartDate" placeholder="Start Date" onChange={(e) => this.selectedStartDate({ StartDate: e.target.value })} />
                    </div> 

                     <div class="col-md-3">
                        End Date<Input style={{marginTop:'1rem'}} type="date" id="EndDate" value={DATE2} name="EndDate" placeholder="End Date" onChange={(e) => this.selectedEndDate({ EndDate: e.target.value })} />
                    </div>         

                </div>

                <div>
                    {
                        this.state.empID ? (
                            tasklistToShow ?(
                                <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                <Table scroll responsive style={{ overflow: 'scroll' }}>
                                    <tbody>
                                        {/* <th width="100px" height="50px" ><b>Task List Name</b></th> */}
                                        <th width="100px" height="50px" ><b>TaskList Name</b></th>
                                        <th width="100px" height="50px" ><b>Working Hours</b></th>
                                            {
                                                tasklistToShow ? this.renderTableData(tasklistToShow) : null
                                            }
                                    </tbody>
                                </Table>
                            </div>
                            ):(null)
                        ) : (null)
                    }
                            
                </div>
                {
                    this.state.tasks ? (
                        <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                            <Table scroll responsive style={{ overflow: 'scroll' }}>
                                <tbody>
                                    {/* <th width="100px" height="50px" ><b>Task List Name</b></th> */}
                                    <th width="100px" height="50px" ><b>Task Name</b></th>
                                    <th width="100px" height="50px" ><b>Working Hours</b></th>
                                        {
                                            this.state.tasks ? this.renderTableDataTask(this.state.tasks) : null
                                        }
                                </tbody>
                            </Table>
                        </div>

                    ):null
                }
            </div>
        )
    }
}

export default PersonViewTest;