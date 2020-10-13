import React, { Component } from 'react';
import { Input,Table } from 'reactstrap';
import './taskList.css';
import axios from 'axios';

//constant variable declaration
const API_URL = 'https://diamanti.teamwork.com';
const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h'
const password = 'a'
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

let flag = 0
let newStartDate = 0
let newEndDate = 0
class TaskDetails extends Component {
    constructor(props){
        super(props);
        
        this.taskListID = this.props.taskListID

        this.state = {
            tasks : [],
            selectedTask : '',
            userData: [],
            taskID : ''
        }
    }

    componentDidMount(){
        this.getTaskDetails(this.taskListID);
    }

   
    componentWillReceiveProps(newProps) {
        if(this.props.projectID && newProps.projectID && this.props.projectID !== newProps.projectID) {
            this.setState({
                taskList : [],
                tasks : [],
                userData: [],
            },()=>{
                this.props.userUpdated(this.state.rowData)
                this.props.userUpdated(this.state.userData)
            })
        }

        if(this.props.startDate && newProps.startDate && this.props.startDate !== newProps.startDate || this.props.endDate && newProps.endDate && this.props.endDate !== newProps.endDate) {
            flag = 1
            newStartDate = newProps.startDate
            newEndDate = newProps.endDate
            this.setState({
                userData: [],
            },()=>{
                this.props.userUpdated(this.state.rowData)
                this.props.userUpdated(this.state.userData)
                this.selectedTask(this.state.taskID)  
            })
                      
        }

        if(this.props.taskListID && newProps.taskListID && this.props.taskListID !== newProps.taskListID) {
            this.taskListID = newProps.taskListID
            this.setState({
                taskList : [],
                tasks : [],
                userData: [],
            },()=>{
                this.props.userUpdated(this.state.rowData)
                this.props.userUpdated(this.state.userData)
                this.getTaskDetails(this.taskListID);
            })
        }
    }


    getTaskDetails = (taskListID) =>{
        let tempTasksArray = [];
        if(flag == 0){

            this.setState({
                tasks : []
            })
        }
        let taskListURL = `${API_URL}/tasklists/${taskListID}/tasks.json`;

        axios.get(taskListURL,{
            params: {
                startdate:this.props.startDate ,
                getSubTasks : 'No',
                includeCompletedTasks : true
                },
            headers: {
                'Authorization': `Basic ${token}`
            }   
        })
        .then(response=>{
            let data =  response.data['todo-items']
            data.map((ele)=>{
                tempTasksArray.push(
                    {
                        "taskID" : ele.id,
                        "taskName" : ele.content
                    }
                )
            })
            this.setState({
                tasks : tempTasksArray
            })
        })
        .catch(error=>{
            console.log("Error Getting TaskList Data",error)
        })
    }

    selectedTask = (taskID) =>{

        let startDate = this.props.startDate
        let endDate = this.props.endDate

        if(flag == 1){
            startDate = newStartDate
            endDate = newEndDate
        }
        
        this.setState({
            userData : [],
            taskID : taskID
        })
        this.props.userUpdated(this.state.rowData)
        this.props.userUpdated(this.state.userData)

        let taskTimeCalculationURL = `${API_URL}/tasks/${taskID}/time/total.json`;

        this.props.usersInProject.map((emp)=>{
            axios.get(taskTimeCalculationURL,{
                params: {
                        userId : emp.id,
                        fromDate : startDate,
                        toDate : endDate 
                    },
                headers: {
                    'Authorization': `Basic ${token}`
                }
            })
            .then(response=>{
                let taskdata = response.data
                let taskName = taskdata['projects'][0]['tasklist']['task']['name']
                let empId = emp.id;
                let empName = emp.name
                let temp = parseFloat(taskdata['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
        
                if(temp != 0){
                    this.state.userData.push({
                        'Name': taskName,
                        'userID' : empId,
                        'EmpName' : empName,
                        'workingHours':temp
                    })
                }
                if(this.state.userData.length > 0){
                    this.setState({userData:this.state.userData})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
                else{
                    this.setState({userData:[]})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
            })
            .catch(err=>{
                console.log("error",err);
            })
        })
    }

    
    render(){
        return(
            <div>
                {
                    this.props.taskListID && this.state.tasks  &&
                    <Input  onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                        <option value=''>Select Task</option>
                            {
                                this.state.tasks.map(item => <option value={item.taskID}>{item.taskName}</option>)
                            }
                    </Input> 
                }
            </div>
        )
    }
}

export default TaskDetails;
