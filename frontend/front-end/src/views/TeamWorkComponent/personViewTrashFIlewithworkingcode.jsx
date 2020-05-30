import React,{Component} from 'react';
import {Input} from 'reactstrap';
import './taskList.css';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';

import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';


var manualSpektraTaskData = []
var automationSpektaTaskData = []
var nonTestingSpektraTaskTaskData = []

export default class PersonwiseView extends Component{
    constructor(props){
        super(props);
        this.state = {
            personView:false,
            taskId:[],
            taskListId : [1579939,1579938,1503197],
            
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

            modules: [ClientSideRowModelModule],
            columnDefs: [
            {
            headerName: "taskListName", 
            field: "taskListName",
            width: 200,
            // suppressSizeToFit: true,       
            },
           
            {
              headerName: "taskName", 
              field: "taskName",
              width: 500,
            //   suppressSizeToFit: true,
            }, 
              
            {
                headerName: "Working Hours", 
                field: "workinghours",
                width: 200,
                // suppressSizeToFit: true,
                
            }
            ],

            rowData:[],
            
          } 
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
      };

    sortTaskListOfEmp = (list) =>{
        return list.sort(function(a, b){
            return b.workinghours - a.workinghours
        })
    }
    
    // onBtForEachNode = ()=>{
    //     let totalmanualWorkingHours = 0
    //     let totalautomationWorkingHours = 0
    //     let totalnonTestingTaskWorkingHours = 0


    //     this.gridApi.forEachNode(function(rowNode, index) {
    //         console.log("rowNode",rowNode.data.taskListName)

            

    //         if(rowNode.data.taskListName === "Spektra Manual testing"){
    //             manualSpektraTaskData.push({'taskListName':rowNode.data.taskListName,'taskName':rowNode.data.taskName,'workinghours': rowNode.data.working_hours})


    //         }

    //         if(rowNode.data.taskListName === "Spektra Automation"){
    //             automationSpektaTaskData.push({'taskListName':rowNode.data.taskListName,'taskName':rowNode.data.taskName,'workinghours': rowNode.data.working_hours})


    //         }

    //         if(rowNode.data.taskListName === "Spektra Non Testing tasks"){
    //             nonTestingSpektraTaskTaskData.push({'taskListName':rowNode.data.taskListName,'taskName':rowNode.data.taskName,'workinghours': rowNode.data.working_hours})


    //         }

            
    //     });



            
    //         for(let i = 0;i < manualSpektraTaskData.length ; i++){
    //             totalmanualWorkingHours = totalmanualWorkingHours + manualSpektraTaskData[i]['workinghours']   
    //         }
    //         this.setState({manualWorkingHours:totalmanualWorkingHours})
    //         this.setState({manualSpektraTaskList:manualSpektraTaskData});
           

    //         result1 = this.sortTaskListOfEmp(this.state.manualSpektraTaskList);
    //         result1 = result1.slice(0,5);
    //         console.log("result",result1);
            

           
    //         for(let i = 0;i < automationSpektaTaskData.length ; i++){
    //             totalautomationWorkingHours = totalautomationWorkingHours + automationSpektaTaskData[i]['workinghours']
    //         }
            
    //         this.setState({automationWorkingHours:totalautomationWorkingHours})
    //         this.setState({automationSpektaTaskList:automationSpektaTaskData});
          
    //         result2 = this.sortTaskListOfEmp(this.state.automationSpektaTaskList);
    //         result2 = result2.slice(0,5);
    //         console.log("result",result2);
            


            
    //         for(let i = 0;i < nonTestingSpektraTaskTaskData.length ; i++){
    //             totalnonTestingTaskWorkingHours = totalnonTestingTaskWorkingHours + nonTestingSpektraTaskTaskData[i]['workinghours']
    //         }
            
    //         this.setState({nonTestingTaskWorkingHours:totalnonTestingTaskWorkingHours})
    //         this.setState({nonTestingSpektraTaskTaskList:nonTestingSpektraTaskTaskData}); 
            
    //         result3 = this.sortTaskListOfEmp(this.state.nonTestingSpektraTaskTaskList);
    //         result3 = result3.slice(0,5);
    //         console.log("result",result3);
            
    // }

    personView = (empID) =>{
        this.setState({personView:empID},()=>{
          console.log("empID",this.state.personView)
          this.getSPEK_Manual_Testing_Data()
        })
        
    }

    getSPEK_Manual_Testing_Data() {
        this.setState({manualSpektraTaskList:[]})
        this.setState({automationSpektraTaskList:[]})
        this.setState({nonTestingSpektraTaskTaskList:[]})
        // console.clear();
       
        this.state.taskListId.map((taskListID)=>{

          const url = `${API_URL}/tasklists/${taskListID}/tasks.json`;
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
                    
                    if(data['projects'][0]['tasklist']['id'] == "1579938"){
                    // this.setState({rowData:[{ 'taskListName':taskListName,'taskName':taskName,'working_hours': workingHours}]},()=>{
                    //     this.onBtForEachNode()
                    // })
                        var getData = []
                       
                        let totalautomationWorkingHours = 0
   
                        automationSpektaTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                        this.setState({automationSpektraTaskList:automationSpektaTaskData},()=>{
                            getData = this.sortList(this.state.automationSpektraTaskList)
                        })

                        this.setState({automationSpektraTaskList:getData})
                        console.log("getData after slice automationSpektraTaskList",this.state.automationSpektraTaskList)
                        
                        for(let i = 0; i < this.state.automationSpektraTaskList.length ; i++ ){
                            totalautomationWorkingHours = totalautomationWorkingHours + this.state.automationSpektraTaskList[i]['workinghours']
                        }
                        this.setState({automationWorkingHours:totalautomationWorkingHours})   
                    }

                    if(data['projects'][0]['tasklist']['id'] == "1579939"){

                        // this.setState({rowData:[{ 'taskListName':taskListName,'taskName':taskName,'working_hours': workingHours}]},()=>{
                        //     this.onBtForEachNode()
                        // })
                        var getData = []
                        let totalmanualWorkingHours = 0
                        manualSpektraTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                        this.setState({manualSpektraTaskList:manualSpektraTaskData},()=>{
                            getData = this.sortList(this.state.manualSpektraTaskList)
                        })
                        this.setState({manualSpektraTaskList:getData})
                        console.log("getData after slice manualSpektraTaskData",this.state.manualSpektraTaskList)

                        for(let i = 0; i < this.state.manualSpektraTaskList.length ; i++ ){
                            // console.log("12234",this.state.manualSpektraTaskList[i])
                            totalmanualWorkingHours = totalmanualWorkingHours + this.state.manualSpektraTaskList[i]['workinghours']
                        }
                        this.setState({manualWorkingHours:totalmanualWorkingHours})
                    }
                    
                    if(data['projects'][0]['tasklist']['id'] == "1503197"){


                        // this.setState({rowData:[{ 'taskListName':taskListName,'taskName':taskName,'working_hours': workingHours}]},()=>{
                        //     this.onBtForEachNode()
                        // })
                        var getData = []
                        let totalnonTestingTaskWorkingHours = 0
                        nonTestingSpektraTaskTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                        this.setState({nonTestingSpektraTaskTaskList:nonTestingSpektraTaskTaskData},()=>{
                            getData = this.sortList(this.state.nonTestingSpektraTaskTaskList)
                        })
                        this.setState({nonTestingSpektraTaskTaskList:getData})
                        for(let i = 0; i < this.state.nonTestingSpektraTaskTaskList.length ; i++ ){
                            // console.log("12234",this.state.manualSpektraTaskList[i])
                            totalnonTestingTaskWorkingHours = totalnonTestingTaskWorkingHours + this.state.nonTestingSpektraTaskTaskList[i]['workinghours']
                        }
                        this.setState({nonTestingTaskWorkingHours:totalnonTestingTaskWorkingHours})

                    }
                })
                .catch(error => { 
                    console.log("Error",error)
                })
              })
          })

          .catch(error => { 
              console.log("Error",error)
          })
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
                            <td width="200px" height="50px">{e.taskListName}</td>
                            <td width="200px" height="50px">{e.taskName}</td> 
                            <td width="200px" height="50px">{e.workinghours}</td>
                        </tr>    
                );
            })
        )
 
     }

    render(){

        // console.log("inside render function",this.state.manualSpektraTaskList,this.state.automationSpektraTaskList,this.state.nonTestingSpektraTaskTaskList)

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


                </div>

                <div>
                    
                    <div>

                        <p style={{fontWeight:'bold'}}>Manaul Spektra Total Hours   :   {this.state.manualWorkingHours}</p>
                            <table width ="100%" height = "100%">
                                <tbody>
                                    <th width="200px" height="50px">Task List Name</th>
                                    <th width="200px" height="50px">Task Name</th>
                                    <th width="200px" height="50px">Working Hours</th>
                                        {
                                            this.state.manualSpektraTaskList ? this.renderTableData(this.state.manualSpektraTaskList) : null
                                        }
                                </tbody>
                            </table>

                    </div>
                    
                    <div>

                        <p style={{fontWeight:'bold'}}>Automation Spektra Total Hours   :   {this.state.automationWorkingHours}</p>
                        <table width ="100%" height = "100%">
                                <tbody>
                                    <th width="200px" height="50px">Task List Name</th>
                                    <th width="200px" height="50px">Task Name</th>
                                    <th width="200px" height="50px">Working Hours</th>
                                    {
                                        this.state.automationSpektraTaskList ? this.renderTableData(this.state.automationSpektraTaskList) : null
                                    }
                                    
                                </tbody>
                            </table>
                        

                    </div>
                    


                        <div>

                        <p style={{fontWeight:'bold'}}>Non Testing Task Spektra Total Hours   :   {this.state.nonTestingTaskWorkingHours}</p>
                        <table width ="100%" height = "100%">
                                <tbody>
                                    <th width="200px" height="50px">Task List Name</th>
                                    <th width="200px" height="50px">Task Name</th>
                                    <th width="200px" height="50px">Working Hours</th>
                                    {
                                        this.state.nonTestingSpektraTaskTaskList ? this.renderTableData(this.state.nonTestingSpektraTaskTaskList) : null
                                    }
                                </tbody>
                        </table>
                        
                        </div>
                       
                    

                    
                        {/* <div style={{ width: "100%", height: "100%" ,marginTop:'50px'}}>
                            <div id="grid" className="ag-theme-alpine" style={ {height: "500px", width: "950px"} }>
                                <p style={{fontWeight:'bold'}}>Manaul Spektra Total Hours   :   {this.state.manualWorkingHours}</p>

                                <AgGridReact
                                    modules={this.state.modules}
                                    columnDefs={this.state.columnDefs}
                                    rowData={result1} 
                                    
                                    onGridReady={(params) => this.onGridReady(params)}
                                    >
                                </AgGridReact>

                                <table id='users' style={{marginTop:'50%'}}>
                                    <tbody>
                                        <th>Task List Name</th>
                                        <th>Task Name</th>
                                        <th>Working Hours</th>
                                        {this.renderTableData()}
                                    </tbody>
                                </table>

                                <p style={{fontWeight:'bold'}}>Automation Spektra Total Hours   :   {this.state.automationWorkingHours}</p>
                                <AgGridReact
                                    modules={this.state.modules}
                                    columnDefs={this.state.columnDefs}
                                    rowData={this.state.rowData} 
                                    
                                    onGridReady={(params) => this.onGridReady(params)}
                                    >
                                </AgGridReact>
                                
                                <p style={{fontWeight:'bold'}}>Non Testing Task Spektra Total Hours   :   {this.state.nonTestingTaskWorkingHours}</p>

                                <AgGridReact
                                    modules={this.state.modules}
                                    columnDefs={this.state.columnDefs}
                                    rowData={this.state.rowData} 
                                    
                                    onGridReady={(params) => this.onGridReady(params)}
                                >
                            </AgGridReact>

                            </div>
                        </div> */}
                </div>
        
            </div>
        )
    }

}