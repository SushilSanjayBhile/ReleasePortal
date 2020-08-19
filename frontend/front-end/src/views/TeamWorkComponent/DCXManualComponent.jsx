



import React,{ Component } from 'react';
import { Input } from 'reactstrap';
import './taskList.css';

import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';

class DCXManualComponent extends Component {
    constructor(props){
        super(props);

        this.state = {
            tasklist:['1620124'],
            selectedTask:'',
            taskDataToShow : [],
            UserDataToShow : [],
            userData : [],
            rowData : []
        }
    }
    
    componentDidMount(){
        this.getTaskListData();
    }

    selectedTask = (taskID) =>{
        this.getTaskDetails(taskID);
    }

    getTaskDetails = (taskID) =>{

        this.setState({userData :[]})

        this.state.UserDataToShow = this.state.UserDataToShow.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id && t.name===v.name))===i)

        this.state.UserDataToShow.map((userEle)=>{
            const url2 = `${API_URL}/tasks/${taskID}/time/total.json`;
            const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
            const password = 'a'
            const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

            axios.get(url2,{
                params: {
                        userId:userEle.id,
                        fromDate:20200501 
                    },
                headers: {
                    'Authorization': `Basic ${token}`
                }
            })
            .then(response=>{
                let taskdata = response.data
                
                let taskName = taskdata['projects'][0]['tasklist']['task']['name']
                let empId = userEle.id;
                let empName = userEle.name
                let temp = parseFloat(taskdata['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
        
                if(temp != 0){
                    this.state.userData.push({
                        'Name': taskName,
                        'userID' : empId,
                        'EmpName' : empName,
                        'workingHours':temp
                    })
                    this.setState({userData:this.state.userData})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
            })
            .catch(err=>{
                console.log("error",err);
            })
        })
    }


    getTaskListData = () =>{
        let UserDataToShow = []
        let taskListTemp = []

        this.state.tasklist.map((tasklistID)=>{
            const url = `${API_URL}/tasklists/${tasklistID}/tasks.json`;
            const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
            const password = 'a'
            const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

            axios.get(url,{
                params: {
                    startdate:20200501 
                    },
                headers: {
                    'Authorization': `Basic ${token}`
                }   
            })
            .then(response=>{
                
                let data = response.data;
                for(let i = 0 ; i < 10; i++ ){
                    let userID = data["todo-items"][i]['responsible-party-ids']
                    if(userID){
                        let userData = ''
                        let userName = ''
                        if(userID.includes(',')){
                            userData = data["todo-items"][i]['responsible-party-ids'].split(",")
                            userName = data["todo-items"][i]['responsible-party-names'].split(",");

                            console.log("in if",userData,userName);
                            for(let i = 0 ; i < userData.length ; i++){
                                UserDataToShow.push({
                                    id:userData[i],
                                    name:userName[i]
                                })
                            }

                        }else{

                            userData = data["todo-items"][i]['responsible-party-ids']
                            userName = data["todo-items"][i]['responsible-party-names']
                            console.log("in else",userData,userName);

                            UserDataToShow.push({
                                id:userData,
                                name:userName
                            })
                        }

                        
                    }

                    taskListTemp.push({
                        taskId : data["todo-items"][i]['id'],
                        taskName : data["todo-items"][i]['content']
                    })
                    console.log("user id in if",taskListTemp,UserDataToShow);
                    this.setState({
                        taskDataToShow : taskListTemp,
                        UserDataToShow : UserDataToShow
                    })
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
                    this.props.selectedTaskList === 'DCX' && this.state.taskDataToShow  ?(
                        <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                        <option value=''>Select Type</option>
                            {
                                this.state.taskDataToShow.map(item => <option value={item.taskId}>{item.taskName}</option>)
                            }
                        </Input> 

                    ):(null) 
                }
            </div>
        )
    }
}

export default DCXManualComponent;



























// import React,{ Component } from 'react';
// import { Input,Table } from 'reactstrap';
// import './taskList.css';

// import axios from 'axios';
// const API_URL = 'https://diamanti.teamwork.com';
// class DCXManualComponent extends Component {
//     constructor(props){
//         super(props);

//         this.state = {
//             tasklist:['918099','1446909'],
//             taskIdArray : [],
//             employeeData:[],
//             userData : [],
//             rowData : []
//         }
//     }

//     componentDidMount(){
//         this.DCX_Manual_Task_Data();
//     }

//     DCX_Manual_Task_Data = () =>{
//         this.setState({userData :[]})
//         let taskIdArray = []

//         // this.state.tasklist.map((tasklistID)=>{
//             const url = `${API_URL}/tasklists/1620124/tasks.json`;
//             const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
//             const password = 'a'
//             const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

//             axios.get(url,{
//                 params: {
//                     startdate:this.props.startDate 
//                     },
//                 headers: {
//                     'Authorization': `Basic ${token}`
//                 }   
//             })
//             .then(response=>{
//                 let data = response.data;
//                 console.log("tasklist for id",data)
//                 for(let i = 0 ; i < data["todo-items"].length; i++ ){
//                     let id = data["todo-items"][i]['id']
//                     const url2 = `${API_URL}/tasks/${id}/time/total.json`;
//                     axios.get(url2,{
//                         params: {
//                                 fromDate:this.props.startDate,
//                                 toDate:this.props.endDate 
//                             },
//                         headers: {
//                             'Authorization': `Basic ${token}`
//                         }
//                     })
//                     .then(response=>{
//                         let taskdata = response.data
//                         // console.log("data",id,,taskdata)
//                         let empId = data["todo-items"][i]['responsible-party-id']
//                         let empName = data["todo-items"][i]['responsible-party-names']
//                         let name = data["todo-items"][i]['todo-list-name']
//                         let temp = parseFloat(taskdata['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
//                         if(temp != 0){
//                             this.state.userData.push({
//                                 'Name': name,
//                                 'userID' : empId,
//                                 'EmpName' : empName,
//                                 'workingHours':temp
//                             })
//                             this.setState({userData:this.state.userData})
//                             this.props.userUpdated(this.state.rowData)
//                             this.props.userUpdated(this.state.userData)
//                         }

//                     })
//                     .catch(err=>{
//                         console.log("error",err);
//                     })
                    
//                 }
                
//             })
//             .catch(err=>{
//                 console.log("error",err);
//             })
//         // })
//     }
//     render(){
//         return(
//             <div>
//                 {/* in dcx manual */}
//             </div>
//         )
//     }
// }

// export default DCXManualComponent;