import React,{Component} from 'react';
import {Input} from 'reactstrap';

import './taskList.css';
import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';



var manualSpektraTaskData = []
var automationSpektaTaskData = []
var nonTestingSpektraTaskTaskData = []
var nonTestingDCXTaskTaskData = []
// var DatePicker = require("react-bootstrap-date-picker");



export default class PersonwiseView extends Component{
    constructor(props){
        super(props);
        this.state = {
            personView:false,
            taskId:[],
            taskListId : [1579939,1579938,1503197],
            PersonViewMenu1:['Spektra Manual Testing','Spektra Automation','Spektra Non Testing Task',
                             'DCX Manual Task','DCX Automation Testing Task','DCX Non Testing Task'],


            manualDCXTaskList:[],
            manualSpektraTaskList:[],
            manualOtherTaskList:[],

            automationDCXTaskList:[],
            automationSpektaTaskList:[],
            automationOtherTaskList:[],
            
           
            nonTestingDCXTaskTaskList:[],
            nonTestingSpektraTaskTaskList:[],
            nonTestingOtherTaskList:[],

            show:false,
           
            manualWorkingHours:0,
            automationWorkingHours:0,
            nonTestingTaskWorkingHours:0,


            nonTestingTaskDCXWorkingHours:0,

           
            value:new Date().toISOString()
                

          }
    }



    sortTaskListOfEmp = (list) =>{
        return list.sort(function(a, b){
            return b.workinghours - a.workinghours
        })
    }
    
    personView = (empID) =>{
        this.setState({personView:empID},()=>{
            console.log("empID",this.state.personView)
            this.getSPEK_Manual_Testing_Data()
            this. getSPEK_Automation_Testing_Data()
            this.getSPEK_Non_Testing_Data()
            this.getDCX_Manual_Testing_Data()
            this.getDCX_Automation_Testing_Data()
            this.getDCX_Non_Testing_Data()
            // this.setState({manualSpektraTaskList:[]})
            // this.setState({automationSpektraTaskList:[]})
            // this.setState({nonTestingSpektraTaskTaskList:[]})
            // this.setState({nonTestingDCXTaskTaskList:[]})
        })
        
    }

    selectedOptionForPersonView = (option) =>{
        this.setState({selectedPersonViewType:option},()=>{

            switch(this.state.selectedPersonViewType){
                case 'Spektra Manual Testing':
                    this.getSPEK_Manual_Testing_Data()
                    console.log("Spektra Manual Testing")
                    break;
                case 'Spektra Automation':
                    this. getSPEK_Automation_Testing_Data()
                    console.log("Spektra Automation")
                    break;
                case 'Spektra Non Testing Task':
                    this.getSPEK_Non_Testing_Data()
                    console.log('Spektra Non Testing Task')
                    break;
                
                case 'DCX Manual Task':
                    this.getDCX_Manual_Testing_Data()
                    console.log('Manual Testing Task')
                case 'DCX Automation Testing Task':
                    this.getDCX_Automation_Testing_Data()
                    console.log('Automation Testing Task')
                case 'DCX Non Testing Task':
                    this.getDCX_Non_Testing_Data()
                    console.log('Non Testing Task')
                    break;
            }
        })
    }

    
    getSPEK_Manual_Testing_Data() {
        this.setState({manualSpektraTaskList:[]})
        const url = `${API_URL}/tasklists/1579939/tasks.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            params: {
                startdate:20200501 
                },
            headers: {
            'Authorization': `Basic ${token}`
        }})
        .then(response => {
            let data = response.data;
            let taskIdArray = []
            for(let i = 0 ; i < data["todo-items"].length; i++ )
            {
            taskIdArray.push(data["todo-items"][i]['id'])
            }
            taskIdArray.map((taskID)=>{
            const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
            axios.get(taskurl, {
                params: {
                    userId:this.state.personView,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data;
                
                let taskListName = data['projects'][0]['tasklist']['name']
                let taskName = data['projects'][0]['tasklist']['task']['name']
                let workingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                
            
                var getData = []
                let totalmanualWorkingHours = 0
                manualSpektraTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                this.setState({manualSpektraTaskList:manualSpektraTaskData},()=>{
                    getData = this.sortList(this.state.manualSpektraTaskList)
                })
                this.setState({manualSpektraTaskList:getData})

                for(let i = 0; i < this.state.manualSpektraTaskList.length ; i++ ){
                    totalmanualWorkingHours = totalmanualWorkingHours + this.state.manualSpektraTaskList[i]['workinghours']
                }
                this.setState({manualWorkingHours:totalmanualWorkingHours})
                
                
                
            })
            .catch(error => { 
                console.log("Error",error)
            })
            })
        })

        .catch(error => { 
            console.log("Error",error)
        })
    }



    getSPEK_Automation_Testing_Data() {
        this.setState({automationSpektraTaskList:[]})
        const url = `${API_URL}/tasklists/1579938/tasks.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            params: {
                startdate:20200501 
                },
            headers: {
            'Authorization': `Basic ${token}`
        }})
        .then(response => {
            let data = response.data;
            let taskIdArray = []
            for(let i = 0 ; i < data["todo-items"].length; i++ )
            {
            taskIdArray.push(data["todo-items"][i]['id'])
            }
            
            taskIdArray.map((taskID)=>{
            const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
            axios.get(taskurl, {
                params: {
                    userId:this.state.personView,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data; 
                let taskListName = data['projects'][0]['tasklist']['name']
                let taskName = data['projects'][0]['tasklist']['task']['name']
                let workingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                
                
                var getData = []
                let totalautomationWorkingHours = 0
                automationSpektaTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                this.setState({automationSpektraTaskList:automationSpektaTaskData},()=>{
                    getData = this.sortList(this.state.automationSpektraTaskList)
                })
                this.setState({automationSpektraTaskList:getData})
                
                for(let i = 0; i < this.state.automationSpektraTaskList.length ; i++ ){
                    totalautomationWorkingHours = totalautomationWorkingHours + this.state.automationSpektraTaskList[i]['workinghours']
                }
                this.setState({automationWorkingHours:totalautomationWorkingHours})   
                

                
            })
            .catch(error => { 
                console.log("Error",error)
            })
            })
        })

        .catch(error => { 
            console.log("Error",error)
        })
       
        

    }

    getSPEK_Non_Testing_Data() {
        
        this.setState({nonTestingSpektraTaskTaskList:[]})
        const url = `${API_URL}/tasklists/1503197/tasks.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            params: {
                startdate:20200501 
                },
            headers: {
            'Authorization': `Basic ${token}`
        }})
        .then(response => {
            let data = response.data;
            let taskIdArray = []
            for(let i = 0 ; i < data["todo-items"].length; i++ )
            {
            taskIdArray.push(data["todo-items"][i]['id'])
            }
            taskIdArray.map((taskID)=>{
            const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
            axios.get(taskurl, {
                params: {
                    userId:this.state.personView,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data;
                
                
                let taskListName = data['projects'][0]['tasklist']['name']
                let taskName = data['projects'][0]['tasklist']['task']['name']
                let workingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                
                var getData = []
                let totalnonTestingTaskWorkingHours = 0
                nonTestingSpektraTaskTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                this.setState({nonTestingSpektraTaskTaskList:nonTestingSpektraTaskTaskData},()=>{
                    getData = this.sortList(this.state.nonTestingSpektraTaskTaskList)
                })
                this.setState({nonTestingSpektraTaskTaskList:getData})
                for(let i = 0; i < this.state.nonTestingSpektraTaskTaskList.length ; i++ ){
                    totalnonTestingTaskWorkingHours = totalnonTestingTaskWorkingHours + this.state.nonTestingSpektraTaskTaskList[i]['workinghours']
                }
                this.setState({nonTestingTaskWorkingHours:totalnonTestingTaskWorkingHours})

                
            })
            .catch(error => { 
                console.log("Error",error)
            })
            })
        })

        .catch(error => { 
            console.log("Error",error)
        })
    }


    getDCX_Manual_Testing_Data = () =>{
        console.log("DCX Manual Testing Data")
    }

    getDCX_Automation_Testing_Data = () =>{
        console.log("DCX Automation Testing Data")
    }

    getDCX_Non_Testing_Data () {
        
        this.setState({nonTestingDCXTaskTaskList:[]})
        
          const url = `${API_URL}/tasklists/1433012/tasks.json`;
          const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
          const password = 'a'
          const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
          axios.get(url, {
              params: {
                  startdate:20200501 
                  },
              headers: {
              'Authorization': `Basic ${token}`
          }})
          .then(response => {
              let data = response.data;
              let taskIdArray = []
              for(let i = 0 ; i < data["todo-items"].length; i++ )
              {
                taskIdArray.push(data["todo-items"][i]['id'])
              }
              
              taskIdArray.map((taskID)=>{
                const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
                axios.get(taskurl, {
                    params: {
                        userId:this.state.personView,
                        fromDate:20200501 
                        },
                    headers: {
                    'Authorization': `Basic ${token}`
                }})
                .then(response => {
                    let data = response.data;
                    let taskListName = data['projects'][0]['tasklist']['name']
                    let taskName = data['projects'][0]['tasklist']['task']['name']
                    let workingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])

                    var getData = []
                    let totalNonTestingTaskWorkingHours = 0
                    nonTestingDCXTaskTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                    this.setState({nonTestingDCXTaskTaskList:nonTestingDCXTaskTaskData},()=>{
                        getData = this.sortList(this.state.nonTestingDCXTaskTaskList)
                    })
                    this.setState({nonTestingDCXTaskTaskList:getData})
                    for(let i = 0; i < this.state.nonTestingDCXTaskTaskList.length ; i++ ){
                        totalNonTestingTaskWorkingHours = totalNonTestingTaskWorkingHours + this.state.nonTestingDCXTaskTaskList[i]['workinghours']
                    }
                    this.setState({nonTestingTaskDCXWorkingHours:totalNonTestingTaskWorkingHours})
                })
                .catch(error => { 
                    console.log("Error",error)
                })
              })
          })

          .catch(error => { 
              console.log("Error",error)
          })
    }

    


    sortList = (testList) =>{
    var result3 = this.sortTaskListOfEmp(testList);
        result3 = result3.slice(0,5);
        return result3;
    }

    renderTableData  = (list1) => {
        
        return list1.length === 0 ? (
            <div>Loading...</div>
        ) : (
            list1.map((e, i) => {
            return (
                        <tr key={i}> 
                            <td width="100px" height="50px" >{e.taskListName}</td>
                            <td width="100px" height="50px" >{e.taskName}</td> 
                            <td width="100px" height="50px" >{e.workinghours}</td>
                        </tr>    
                );
            })
        )
 
     }

    render(){


        return(
            <div>


                <div class="row">

                    <div class="col-md-3">
                        <Input onChange={(e) => this.personView(e.target.value)} type="select" name="personView" id="personView" >
                            <option value=''>Select Person</option>
                                {
                                    this.props.users.map(item => <option value={item.id}>{item.name}</option>)
                                }            
                        </Input>
                    </div>

                    {
                        this.state.personView ? 
                        (
                            <div class="col-md-3">
                                <Input onChange={(e) => this.selectedOptionForPersonView(e.target.value)} type="select" name="selectedOptionForPersonView" id="selectedOptionForPersonView" >
                                    <option value=''>Select Type</option>
                                    {
                                            this.state.PersonViewMenu1.map(item => <option value={item}>{item}</option>)
                                    }
                                </Input>
                            </div>    
                        )
                        :(null)
                    }

                    
                 

                    {/* <DatePicker id="example-datepicker" value={this.state.value} onChange={this.handleChange} /> */}

                   

                </div>

                    {
                        this.state.personView ? (
                            <div>
                                <p style={{fontWeight:'bold',marginTop:'5px'}}> Manaul Spektra Total Hours:{this.state.manualWorkingHours ? this.state.manualWorkingHours : 0}</p>
                                <p style={{fontWeight:'bold',marginTop:'5px'}}>Automation Spektra Total Hours:{this.state.automationWorkingHours ? this.state.automationWorkingHours : 0 }</p>
                                <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task Spektra Total Hours   :   {this.state.nonTestingTaskWorkingHours ? this.state.nonTestingTaskWorkingHours : 0}</p>
                               
                                <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task DCX Total Hours   :   {this.state.nonTestingTaskDCXWorkingHours ?  this.state.nonTestingTaskDCXWorkingHours : 0 }</p>
                                {/* <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task DCX Total Hours   :   {this.state.nonTestingTaskDCXWorkingHours ?  this.state.nonTestingTaskDCXWorkingHours : 0 }</p>
                                <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task DCX Total Hours   :   {this.state.nonTestingTaskDCXWorkingHours ?  this.state.nonTestingTaskDCXWorkingHours : 0 }</p> */}

                                    {/* <table width ="90%" height = "100%" id='users'>
                                        <tbody>
                                            <th width="100px" height="50px" >Task List Name</th>
                                            <th width="100px" height="50px" >Total Hours Spent</th>
                                            <td>
                                               
                                            </td>
                                        </tbody>
                                    </table> */}
                            </div>
                            
                        ) : (null)
                    }

               
                    {/* {
                        this.state.personView ? (
                            <div>

                                {

                                    this.state.selectedPersonViewType === 'Spektra Manual Testing' ? 
                                        <div>
                                        <p style={{fontWeight:'bold', marginTop:'5px'}}>Manaul Spektra Total Hours   :   {this.state.manualWorkingHours}</p>
                                            <table width ="90%" height = "100%" id='users'>
                                                <tbody>
                                                    <th width="100px" height="50px" >Task List Name</th>
                                                    <th width="100px" height="50px" >Task Name</th>
                                                    <th width="100px" height="50px" >Working Hours</th>
                                                        {
                                                            this.state.manualSpektraTaskList ? this.renderTableData(this.state.manualSpektraTaskList) : null
                                                        }
                                                </tbody>
                                            </table>
                                        </div>
                                    : null

                                }
                               

                                {
                                    this.state.selectedPersonViewType === 'Spektra Automation' ?
                                        <div>
                                            <p style={{fontWeight:'bold',marginTop:'5px'}}>Automation Spektra Total Hours   :   {this.state.automationWorkingHours}</p>
                                                <table width ="90%" height = "100%" id='users'>
                                                        <tbody>
                                                            <th width="100px" height="50px" >Task List Name</th>
                                                            <th width="100px" height="50px" >Task Name</th>
                                                            <th width="100px" height="50px" >Working Hours</th>
                                                            {
                                                                this.state.automationSpektraTaskList ? this.renderTableData(this.state.automationSpektraTaskList) : null
                                                            }
                                                        </tbody>
                                                </table>
                                        </div>
                                    :null

                                }


                                {
                                    this.state.selectedPersonViewType === 'Spektra Non Testing Task' ?
                                        <div>
                                            <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task Spektra Total Hours   :   {this.state.nonTestingTaskWorkingHours}</p>
                                                <table width ="90%" height = "100%" id='users'>
                                                        <tbody>
                                                            <th width="100px" height="50px" >Task List Name</th>
                                                            <th width="100px" height="50px" >Task Name</th>
                                                            <th width="100px" height="50px" >Working Hours</th>
                                                            {
                                                                this.state.nonTestingSpektraTaskTaskList ? this.renderTableData(this.state.nonTestingSpektraTaskTaskList) : null
                                                            }
                                                        </tbody>
                                                </table>
                                        </div>
                                    :null


                                }



                                {
                                    this.state.selectedPersonViewType === 'DCX Non Testing Task' ?
                                        <div>
                                            <p style={{fontWeight:'bold',marginTop:'5px'}}>Non Testing Task DCX Total Hours   :   {this.state.nonTestingTaskDCXWorkingHours}</p>
                                                <table width ="90%" height = "100%" id='users'>
                                                        <tbody>
                                                            <th width="100px" height="50px" >Task List Name</th>
                                                            <th width="100px" height="50px" >Task Name</th>
                                                            <th width="100px" height="50px" >Working Hours</th>
                                                            {
                                                                this.state.nonTestingDCXTaskTaskList ? this.renderTableData(this.state.nonTestingDCXTaskTaskList) : null
                                                            }
                                                        </tbody>
                                                </table>
                                        </div>
                                    :null


                                }
                                
                            </div>
                        ) : (null)

                    }  */}
            </div>
        )
    }

}