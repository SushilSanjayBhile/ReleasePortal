import React,{Component} from 'react';
import {Input,Table,FormGroup,Label,Col} from 'reactstrap';

// import './taskList.css';
import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';

var manualSpektraTaskData = []
var automationSpektaTaskData = []
var nonTestingSpektraTaskTaskData = []

var manualDCXTaskData = []
var automationDCXTaskData = []
var nonTestingDCXTaskTaskData = []
var flag = 0
// var DatePicker = require("react-bootstrap-date-picker");

export default class PersonwiseView extends Component{
    constructor(props){
        super(props);
        this.state = {
            personView:false,
            taskId:[],
            startDate:'20200501',
            endDate:'20200531',

            automationTaskList:['918099','1446909'],
           
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

            manualDCXWorkingHours:0,
            automationDCXWorkingHours:0,
            nonTestingTaskDCXWorkingHours:0,


            DMC_Manual:false,
            DMC_Automation:false,
            DMC_NonTesting:false,
            DCX_Manual:false,
            DCX_Automation:false,
            DCX_NonTesting:false,
           
            // value:new Date().toISOString()
          }
    }

    sortTaskListOfEmp = (list) =>{
        return list.sort(function(a, b){
            return b.workinghours - a.workinghours
        })
    }
    
    personView = (empID) =>{
        flag = 1;
        this.setState({
            manualWorkingHours:0,
            automationWorkingHours:0,
            nonTestingTaskWorkingHours:0,

            manualDCXWorkingHours:0,
            automationDCXWorkingHours:0,
            nonTestingTaskDCXWorkingHours:0,

        })
        this.setState({personView:empID},()=>{
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
    
    getSPEK_Manual_Testing_Data() {
        this.setState({manualSpektraTaskList:[]})
        manualSpektraTaskData = []
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
                    fromDate:this.state.startDate,
                    toDate:this.state.endDate 
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
                this.setState({manualWorkingHours:totalmanualWorkingHours.toFixed(2)})
                
                
                
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
        automationSpektaTaskData = []

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
                    fromDate:this.state.startDate,
                    toDate:this.state.endDate
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
                this.setState({automationWorkingHours:totalautomationWorkingHours.toFixed(2)})   
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
        nonTestingSpektraTaskTaskData = []

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
                    fromDate:this.state.startDate,
                    toDate:this.state.endDate
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
                this.setState({nonTestingTaskWorkingHours:totalnonTestingTaskWorkingHours.toFixed(2)})

                
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
        this.setState({manualDCXTaskList:[]})
        manualDCXTaskData = []

            const url = `${API_URL}/tasklists/1620124/tasks.json`;
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
                for(let i = 0 ; i < data["todo-items"].length; i++ )
                {
                    let taskID = data["todo-items"][i]['id']
                    // taskIdArray.push(data["todo-items"][i]['id'])
                    const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
                    axios.get(taskurl, {
                        params: {
                            userId:this.state.personView,
                            fromDate:this.state.startDate,
                            toDate:this.state.endDate 
                            },
                        headers: {
                        'Authorization': `Basic ${token}`
                    }})
                    .then(response => {
                        let data1 = response.data;
                        let taskListName = data1['projects'][0]['tasklist']['name']
                        let taskName = data1['projects'][0]['tasklist']['task']['name']
                        let workingHours = parseFloat(data1['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
        
                        var getData = []
                        let  totalManualTaskWorkingHours = 0
                        manualDCXTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                        this.setState({ manualDCXTaskList:manualDCXTaskData},()=>{
                            getData = this.sortList(this.state.manualDCXTaskList)
                        })
                        this.setState({ manualDCXTaskList:getData})
                        for(let i = 0; i < this.state.  manualDCXTaskList.length ; i++ ){
                             totalManualTaskWorkingHours =  totalManualTaskWorkingHours + this.state.manualDCXTaskList[i]['workinghours']
                        }
                        this.setState({manualDCXWorkingHours: totalManualTaskWorkingHours.toFixed(2)})
                    })
                    .catch(error => { 
                        console.log("Error",error)
                    })
                }
                
            })
        
            .catch(error => { 
                console.log("Error",error)
            })
    
    }


    

    getDCX_Automation_Testing_Data = () =>{
        this.setState({automationDCXTaskList:[]})
        automationDCXTaskData = []

        this.state.automationTaskList.map((tasklistID)=>{
       
            const url = `${API_URL}/tasklists/${tasklistID}/tasks.json`;
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
                for(let i = 0 ; i < data["todo-items"].length; i++ )
                {
                    let taskID = data["todo-items"][i]['id']
                    // taskIdArray.push(data["todo-items"][i]['id'])
                    const taskurl = `${API_URL}/tasks/${taskID}/time/total.json`;
                    axios.get(taskurl, {
                        params: {
                            userId:this.state.personView,
                            fromDate:this.state.startDate,
                            toDate:this.state.endDate 
                            },
                        headers: {
                        'Authorization': `Basic ${token}`
                    }})
                    .then(response => {
                        let data1 = response.data;
                        let taskListName = data1['projects'][0]['tasklist']['name']
                        let taskName = data1['projects'][0]['tasklist']['task']['name']
                        let workingHours = parseFloat(data1['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
        
                        var getData = []
                        let totalAutomationTaskWorkingHours = 0
                        automationDCXTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                        this.setState({automationDCXTaskList:automationDCXTaskData},()=>{
                            getData = this.sortList(this.state.automationDCXTaskList)
                        })
                        this.setState({automationDCXTaskList:getData})
                        for(let i = 0; i < this.state.automationDCXTaskList.length ; i++ ){
                            totalAutomationTaskWorkingHours = totalAutomationTaskWorkingHours + this.state.automationDCXTaskList[i]['workinghours']
                        }
                        this.setState({automationDCXWorkingHours:totalAutomationTaskWorkingHours.toFixed(2)})
                    })
                    .catch(error => { 
                        console.log("Error",error)
                    })
                }
                
            })
        
            .catch(error => { 
                console.log("Error",error)
            })
        })
    }

    getDCX_Non_Testing_Data () {
        this.setState({nonTestingDCXTaskTaskList:[]})
        nonTestingDCXTaskTaskData = []
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
                        fromDate:this.state.startDate,
                        toDate:this.state.endDate 
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
                    this.setState({nonTestingTaskDCXWorkingHours:totalNonTestingTaskWorkingHours.toFixed(2)})
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
        var finalResult = []
        var result3 = this.sortTaskListOfEmp(testList);
        result3 = result3.slice(0,5);
        result3.map((ele)=>{
            if(ele.workinghours!=0){
                finalResult.push(ele)
            }
        })
        return finalResult;
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
                            <td width="100px" height="50px" >{e.taskListName}</td>
                            <td width="100px" height="50px" >{e.taskName}</td> 
                            <td width="100px" height="50px" >{e.workinghours}</td>
                        </tr>    
                );
            })
        )
 
    }

    selectedStartDate = (startDate) =>{
        let tempDate = startDate['StartDate'].split("-");
        tempDate = tempDate[0] + tempDate[1] + tempDate[2];
        this.setState({
            startDate : tempDate
        })
        if(flag == 1){
            this.personView(this.state.personView)
        }
    }

    selectedEndDate = (endDate) =>{
        let tempDate  = endDate['EndDate'].split("-");
        tempDate = tempDate[0] + tempDate[1] + tempDate[2];
        this.setState({
            endDate : tempDate
        })
        if(flag == 1){
            this.personView(this.state.personView)
        }
    }
  
    render(){
        return(
            <div>
                <div class="row">
                    <div class="col-md-3">
                        <Input style={{marginTop:'2rem'}} onChange={(e) => this.personView(e.target.value)} type="select" name="personView" id="personView" >
                            <option value=''>Select Person</option>
                                {
                                    this.props.users.map(item => <option value={item.id}>{item.name}</option>)
                                }            
                        </Input>
                    </div>
                    {/* <div class="col-md-3">
                        <Input style={{marginTop:'1rem'}} onChange={(e) => this.monthView(e.target.value)} type="select" name="monthView" id="monthView" >
                            <option value=''>Select Month</option>
                                {
                                    this.state.months.map(item => <option value={item.id}>{item.name}</option>)
                                }            
                        </Input>
                    </div> */}

                    <div class="col-md-3">
                        Start Date<Input style={{marginTop:'1rem'}} type="date" id="StartDate" name="StartDate" placeholder="Start Date" onChange={(e) => this.selectedStartDate({ StartDate: e.target.value })} />
                    </div> 

                     <div class="col-md-3">
                        End Date<Input style={{marginTop:'1rem'}} type="date" id="EndDate" name="EndDate" placeholder="End Date" onChange={(e) => this.selectedEndDate({ EndDate: e.target.value })} />
                    </div>         
                    

                    <div  style={{marginTop:'1rem'}} class="col-md-5">
                        <p><b>Displayed Data From {this.state.startDate} To {this.state.endDate}</b></p>
                    </div>

                </div>
                    {
                        this.state.personView ? (
                            <div>
                                {/* DMC_Manual */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }} onClick = {()=>{
                                    this.setState({
                                        DMC_Manual:!this.state.DMC_Manual
                                    })
                                }}>
                                    <b>Manual Spektra Total Hours : {this.state.manualWorkingHours ? this.state.manualWorkingHours : 0}</b>
                                </div>
                                {
                                   this.state.DMC_Manual && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.manualSpektraTaskList ? this.renderTableData(this.state.manualSpektraTaskList) : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }

                                {/* DMC_Automation */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }}onClick = {()=>{
                                    this.setState({
                                        DMC_Automation:!this.state.DMC_Automation
                                    })
                                }}>
                                    <b>Automation Spektra Total Hours : {this.state.automationWorkingHours ? this.state.automationWorkingHours : 0 }</b>
                                </div>
                                {
                                   this.state.DMC_Automation && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                   <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.automationSpektraTaskList ? this.renderTableData(this.state.automationSpektraTaskList) : (null)
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }

                                {/* DMC_NonTesting */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }} onClick = {()=>{
                                    this.setState({
                                        DMC_NonTesting:!this.state.DMC_NonTesting
                                    })
                                }}>
                                    <b>Non Testing Task Spektra Total Hours   :   {this.state.nonTestingTaskWorkingHours ? this.state.nonTestingTaskWorkingHours : 0}</b>
                                </div>

                                {
                                   this.state.DMC_NonTesting && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.nonTestingSpektraTaskTaskList ? this.renderTableData(this.state.nonTestingSpektraTaskTaskList) : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }

                                {/* DCX_Manual */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }} onClick = {()=>{
                                    this.setState({
                                        DCX_Manual:!this.state.DCX_Manual
                                    })
                                }}>
                                    <b>Manual DCX Total Hours : {this.state.manualDCXWorkingHours ?  this.state.manualDCXWorkingHours : 0 }</b>
                                </div>

                                {
                                   this.state.DCX_Manual && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.manualDCXTaskList ? this.renderTableData(this.state.manualDCXTaskList) : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }

                                {/* DCX_Automation */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }} onClick = {()=>{
                                    this.setState({
                                        DCX_Automation:!this.state.DCX_Automation
                                    })
                                }}>
                                    <b>Automation DCX Total Hours : {this.state.automationDCXWorkingHours ?  this.state.automationDCXWorkingHours : 0 }</b>
                                </div>

                                {
                                   this.state.DCX_Automation && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.automationDCXTaskList  ? this.renderTableData(this.state.automationDCXTaskList) : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }


                                {/* DCX_NonTesting */}
                                <div style={{ marginTop: '3rem' , overflowY: 'scroll', maxHeight: '30rem' }} onClick = {()=>{
                                    this.setState({
                                        DCX_NonTesting:!this.state.DCX_NonTesting
                                    })
                                }}>
                                    <b>Non Testing Task DCX Total Hours : {this.state.nonTestingTaskDCXWorkingHours ?  this.state.nonTestingTaskDCXWorkingHours : 0 }</b>
                                </div>

                                {
                                   this.state.DCX_NonTesting && 
                                   <div style={{ marginRight: '4rem' , marginTop: '1rem' , overflowY: 'scroll', maxHeight: '30rem' }}>
                                        <Table scroll responsive style={{ overflow: 'scroll' }}>
                                            <tbody>
                                                <th width="100px" height="50px" ><b>Task List Name</b></th>
                                                <th width="100px" height="50px" ><b>Task Name</b></th>
                                                <th width="100px" height="50px" ><b>Working Hours</b></th>
                                                    {
                                                        this.state.nonTestingDCXTaskTaskList ? this.renderTableData(this.state.nonTestingDCXTaskTaskList) : null
                                                    }
                                            </tbody>
                                        </Table>
                                    </div>
                                }
                            </div>
                        ) : (null)
                    }
            </div>
        )
    }

}