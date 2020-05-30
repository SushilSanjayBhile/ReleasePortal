import React,{Component} from 'react';
import {Input} from 'reactstrap';

import './taskList.css';
import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';




var nonTestingTaskData = []
// var DatePicker = require("react-bootstrap-date-picker");



export default class PersonViewForOther extends Component{
    constructor(props){
        super(props);
        this.state = {
            personView:false,
            taskId:[],
            taskListId : [1433012],
            nonTestingOtherTaskList:[],
            show:false,
            nonTestingTaskWorkingHours:0,
          }
    }


    // handleChange = function(value, formattedValue) {
    //     this.setState({
    //       value: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
    //       formattedValue: formattedValue // Formatted String, ex: "11/19/2016"
    //     });
    //   }

    //   componentDidUpdate = function(){
    //     // Access ISO String and formatted values from the DOM.
    //     var hiddenInputElement = document.getElementById("example-datepicker");
    //     console.log(hiddenInputElement.value); // ISO String, ex: "2016-11-19T12:00:00.000Z"
    //     console.log(hiddenInputElement.getAttribute('data-formattedvalue')) // Formatted String, ex: "11/19/2016"
    //   }


    sortTaskListOfEmp = (list) =>{
        return list.sort(function(a, b){
            return b.workinghours - a.workinghours
        })
    }
    
    personView = (empID) =>{
        this.setState({personView:empID},()=>{
          console.log("empID",this.state.personView)
          this.getNon_Testing_Data()
        })
        
    }

    selectedOption = (option) =>{
        this.setState({selectedType:option});
        // console.log("option selected ",option);
    }
    

    getNon_Testing_Data() {
        this.setState({nonTestingOtherTaskList:[]})
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
                    // console.log("---------------------------------------------------------------------------------------------------------")
                    // console.log("data with tasklistid and taskid with person id",taskListID,taskIdArray,this.state.personView,data);
                    // console.log("---------------------------------------------------------------------------------------------------------")
                    
                    let taskListName = data['projects'][0]['tasklist']['name']
                    let taskName = data['projects'][0]['tasklist']['task']['name']
                    let workingHours = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])  
                    console.log("**********************",taskListName,taskName,workingHours,"**********************")
                    // nonTestingTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                    // this.setState({nonTestingOtherTaskList:nonTestingTaskData})

                    var getData = []
                    let totalnonTestingTaskWorkingHours = 0
                    nonTestingTaskData.push({'taskListName':taskListName,'taskName':taskName,'workinghours':workingHours})
                    this.setState({nonTestingOtherTaskList:nonTestingTaskData},()=>{
                        getData = this.sortList(this.state.nonTestingOtherTaskList)
                    })
                    this.setState({nonTestingOtherTaskList:getData})
                    for(let i = 0; i < this.state.nonTestingOtherTaskList.length ; i++ ){
                        totalnonTestingTaskWorkingHours = totalnonTestingTaskWorkingHours + this.state.nonTestingOtherTaskList[i]['workinghours']
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
        console.log("coming here but not showing you anything",this.state.nonTestingOtherTaskList,this.state.nonTestingTaskWorkingHours);

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

                 

                    {/* <DatePicker id="example-datepicker" value={this.state.value} onChange={this.handleChange} /> */}

                   

                </div>

               
                    {
                        this.state.personView ? (
                            <div>
                                <div>
                                    <p style={{fontWeight:'bold', marginTop:'5px'}}>Total Hours   :   {this.state.nonTestingTaskWorkingHours}</p>
                                        <table width ="90%" height = "100%" id='users'>
                                            <tbody>
                                                <th width="100px" height="50px" >Task List Name</th>
                                                <th width="100px" height="50px" >Task Name</th>
                                                <th width="100px" height="50px" >Working Hours</th>
                                                    {
                                                        this.state.nonTestingOtherTaskList ? this.renderTableData(this.state.nonTestingOtherTaskList) : null
                                                    }
                                            </tbody>
                                        </table>
                                </div>
                            </div>



                        ) : (null)

                    }
                    
                   
                    
                   
                
               
            </div>
        )
    }

}