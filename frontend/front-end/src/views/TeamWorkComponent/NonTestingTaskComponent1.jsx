import React,{ Component } from 'react';
import { Input,Table } from 'reactstrap';
import './taskList.css';
import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';


class NonTestingTaskComponent1 extends Component{
    constructor(props){
        super(props);

        this.state = {
            selectedTask:'',
            employeeData:[],
            NonTestingTaskSpektra : ['Identify Test Cases For Spektra','Spektra Discussions / Meetings','Spektra Documentation',
                                    'Reading docs / Watching videos / Researching for Spektra'],
            NonTestingTaskDCX : [],
            NonTestingTaskOthers : [],
            userData:[],
            rowData:[]
        }
    }

    selectedTask = (tasks) =>{
        this.setState({selectedTask:tasks},()=>{

            switch(this.state.selectedTask){
                case 'Identify Test Cases For Spektra':
                    this.Identify_Test_Cases_For_Spektra()
                    break;
                case 'Spektra Discussions / Meetings':
                    this.Spektra_Discussions_Meetings()
                    break;
                case 'Spektra Documentation':
                    this.Spektra_Documentation()
                    break;
                case 'Reading docs / Watching videos / Researching for Spektra':
                    this.Reading_Docs()
                    break;
            }
        }) 
    }

   
    Identify_Test_Cases_For_Spektra = () =>{
        this.setState({userData :[]})
        const url = `${API_URL}/tasks/18617624/time/total.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        this.props.users.map((user)=>{
            axios.get(url, {
                params: {
                    userId:user.id,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data
                let temp = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                if(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum']!= 0.0){

                    this.state.userData.push({'userID':user.id,'EmpName':user.name,'workingHours':temp})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
                   
              

            })
            .catch(error => { 
                console.log("Error",error)
            })
        })    
    }

    Spektra_Discussions_Meetings = () =>{
        this.setState({userData :[]})

        const url = `${API_URL}/tasks/19129278/time/total.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        this.props.users.map((user)=>{
            axios.get(url, {
                params: {
                    userId:user.id,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data
                let temp = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                if(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum']!= 0.0){

                    this.state.userData.push({'userID':user.id,'EmpName':user.name,'workingHours':temp})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
               

            })
            .catch(error => { 
                console.log("Error",error)
            })
        })
    }


    Spektra_Documentation = () =>{
        this.setState({userData :[]})

        const url = `${API_URL}/tasks/19129284/time/total.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        this.props.users.map((user)=>{
            axios.get(url, {
                params: {
                    userId:user.id,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data
                    
                let temp = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                if(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum']!= 0.0){

                    this.state.userData.push({'userID':user.id,'EmpName':user.name,'workingHours':temp})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }


            })
            .catch(error => { 
                console.log("Error",error)
            })
        })
    }


    Reading_Docs = () =>{
        this.setState({userData :[]})
        const url = `${API_URL}/tasks/19377512/time/total.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        this.props.users.map((user)=>{
            axios.get(url, {
                params: {
                    userId:user.id,
                    fromDate:20200501 
                    },
                headers: {
                'Authorization': `Basic ${token}`
            }})
            .then(response => {
                let data = response.data
                let temp = parseFloat(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum'])
                if(data['projects'][0]['tasklist']['task']['time-totals']['non-billable-hours-sum']!= 0.0){

                    this.state.userData.push({'userID':user.id,'EmpName':user.name,'workingHours':temp})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
            })
            .catch(error => { 
                console.log("Error",error)
            })
        })
    }

    

    render(){

        return(
                <div>
                    {
                        this.props.selectedTaskList === 'DCX' && this.state.NonTestingTaskDCX.length != 0  ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                            <option value=''>Select Type</option>
                                {
                                    this.state.NonTestingTaskDCX.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 

                        ):(null) 
                    }

                    {
                        this.props.selectedTaskList === 'Spektra' &&  this.state.NonTestingTaskSpektra.length != 0 ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                                <option value=''>Select Type</option>
                                {
                                    this.state.NonTestingTaskSpektra.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 

                        ):(null)
                    }

                    {
                        this.props.selectedTaskList === 'Other' &&  this.state.NonTestingTaskOthers.length != 0 ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                                <option value=''>Select Type</option>
                                {
                                    this.state.NonTestingTaskOthers.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 
                        ):(null)
                    }
               
                </div> 
        )
    }
}
export default NonTestingTaskComponent1;

