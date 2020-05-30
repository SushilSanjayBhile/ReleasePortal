import React,{ Component } from 'react';
import { Input,Table } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import './taskList.css';
import axios from 'axios';
const API_URL = 'https://diamanti.teamwork.com';

class ManualComponent extends Component{
    constructor(props){
        super(props);

        this.state = {
            selectedTask:'',
            employeeData:[],
            ManualSpektra : ['DMCTL Testing','KUBECTL Testing','Application Migration'],
            ManualDCX : [],
            ManualOthers : [],
            userData : [],
            rowData:[]
        }
    }

    selectedTask = (tasks) =>{
        this.setState({selectedTask:tasks},()=>
        {
            switch(this.state.selectedTask){
                case 'DMCTL Testing':
                    this.getDMCTL_TestingData()
                    console.log("this.getDMCTL_TestingData")
                    break;
                case 'KUBECTL Testing':
                    this.getKUBECTL_TestingData()
                    console.log("this.getKUBECTL_TestingData()")
                    break;
                case 'Application Migration':
                    this.getApplication_MigrationData()
                    console.log('Application Migration')
                    break;
            }
        })
    }

   
     getDMCTL_TestingData = () =>{
        this.setState({userData:[]})
        const url = `${API_URL}/tasks/19275371/time/total.json`;
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
                    this.setState({userData:this.state.userData})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)

                }
                
            })
            .catch(error => { 
                console.log("Error",error)
            })
        })
        
    }

    getKUBECTL_TestingData = () =>{
        this.setState({userData:[]})
        const url = `${API_URL}/tasks/19275378/time/total.json`;
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
                    this.setState({userData:this.state.userData})
                    this.props.userUpdated(this.state.rowData)
                    this.props.userUpdated(this.state.userData)
                }
            })
            .catch(error => { 
                console.log("Error",error)
            })
        })
    }


    getApplication_MigrationData = () =>{
        this.setState({userData:[]})
        const url = `${API_URL}/tasks/19275453/time/total.json`;
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
                    this.setState({userData:this.state.userData})
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
                        this.props.selectedTaskList === 'DCX' && this.state.ManualDCX.length != 0  ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                            <option value=''>Select Task</option>
                                {
                                         this.state.ManualDCX.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 

                        ):(null) 
                    }

                    {
                        this.props.selectedTaskList === 'Spektra' &&  this.state.ManualSpektra.length != 0 ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                                <option value=''>Select Task</option>
                                {
                                        this.state.ManualSpektra.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 

                        ):(null)
                    }

                    {
                        this.props.selectedTaskList === 'Other' &&  this.state.ManualOthers.length != 0 ?(
                            <Input onChange={(e) => this.selectedTask(e.target.value)} type="select" name="selectedTask" id="selectedTask" >
                                <option value=''>Select Task</option>
                                {
                                        this.state.ManualOthers.map(item => <option value={item}>{item}</option>)
                                }
                            </Input> 
                        ):(null)
                    }
 
                </div> 
        )
    }
}
export default ManualComponent;