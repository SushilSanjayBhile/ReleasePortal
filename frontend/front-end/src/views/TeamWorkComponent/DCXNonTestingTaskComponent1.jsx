import React,{ Component } from 'react';
import { Input,Table } from 'reactstrap';
import './taskList.css';

import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';

var userData1 = [];
class DCXNonTestingTaskComponent1 extends Component {
    constructor(props){
        super(props);

        this.state = {
            tasklist:['1433012'],
            taskIdArray : [],
            employeeData:[],
            AutomationDCX : [],
            userData : [],
            // userData1 : [],
            rowData : []
        }

        
    }
    componentDidMount(){
        this.DCX_NonTestingTask_Task_Data();
       
    }

    DCX_NonTestingTask_Task_Data = () =>{
        this.setState({userData :[]})
        
        let taskIdArray = []
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
                // console.clear();
                // let userData1 = []
                let data = response.data;
                console.log("tasklist for id",data)
                for(let i = 0 ; i < data["todo-items"].length; i++ ){
                    let id = data["todo-items"][i]['id']
                    const url2 = `${API_URL}/tasks/${id}/time/total.json`;
                    axios.get(url2,{
                        params: {
                                fromDate:20200501 
                            },
                        headers: {
                            'Authorization': `Basic ${token}`
                        }
                    })
                    .then(response=>{
                        let taskdata = response.data
                        // console.log("data",id,,taskdata)
                        let empId = data["todo-items"][i]['responsible-party-id']
                        let empName = data["todo-items"][i]['responsible-party-names']
                        let name = data["todo-items"][i]['todo-list-name']
                        let temp = parseFloat(taskdata['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                        if(temp != 0){
                            this.state.userData.push({
                                'Name': name,
                                'userID' : empId,
                                'EmpName' : empName,
                                'workingHours':temp
                            })
                            this.setState({userData:this.state.userData})
                            this.props.userUpdated(this.state.rowData)
                            this.props.userUpdated(this.state.userData)
                        }
                        // else{
                        //     this.setState({userData:[]})
                        //     this.props.userUpdated(this.state.rowData)
                        //     this.props.userUpdated(this.state.userData)
                        // }
                        // userData1.map((ele)=>{
                        //     console.log("\n\n",userData1,"\n\n")
                        // })
                        // console.log("================================================================")
                        // console.log("================================================================")

                    })
                    .catch(err=>{
                        console.log("error",err);
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
                {/* in dcx automation */}
            </div>
        )
    }
}

export default DCXNonTestingTaskComponent1;