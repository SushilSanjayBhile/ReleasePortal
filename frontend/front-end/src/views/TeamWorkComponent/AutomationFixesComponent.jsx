import React,{ Component } from 'react';
import axios from 'axios';

//Other Component Imports
import Table from './TableDataComponent';


const API_URL = 'https://diamanti.teamwork.com';


class AutomationFixesComponent extends Component {
    constructor(props){
        super(props);

        // this.totalHoursSpentByEachPerson = this.totalHoursSpentByEachPerson.bind(this);
        // this.dataManuplation = this.dataManuplation.bind(this);
    }
    state = {
        dataObj : [],
        totalHoursSpent : [],
        // totalHoursSpentByEachPerson : [],
        // nonBillableHours1:[],
        // filteredArr:[]
    }
    componentDidMount() {
        // this.getListOfAllFolks();
        this.totalHoursSpent();
        this.totalHoursSpentByEachPerson();   
    }
    // getListOfAllFolks = () => {
    //     const url = `${API_URL}/projects/444222/people.json`;
    //     const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC'
    //     const password = 'a'
    //     const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
    //     axios.get(url, {
    //         headers: {
    //           'Authorization': `Basic ${token}`
    //     }})
    //     .then(response => response.data)
    //     .then((data) => {
    //         this.setState({ users: data['people'] })
    //         console.log("All People working in E2E Automation",this.state.users);
    //         console.log("Total Count Of Employee Working",this.state.users.length)

    //         this.totalHoursSpentByEachPerson();

    //     })
    // }

    totalHoursSpent = () => {
        // https://diamanti.teamwork.com/tasklists/1579939/time/total.json
        const url = `${API_URL}/tasklists/1446909/time/total.json`;
        const username = 'twp_G6fSnkomwhmBJatDUfmENnfAroHC' //Yatish's Token
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            headers: {
              'Authorization': `Basic ${token}`
        }})
        .then(response => response.data)
        .then((data) => {
            this.setState({ totalHoursSpent:data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"]})
            console.log("Total Hours Spent In e2E Automation",this.state.totalHoursSpent);            
        })
        .catch(error => { 
            console.log("Error",error)
        })

    }
    
    totalHoursSpentByEachPerson = () => {
        console.log("coming")
        // https://diamanti.teamwork.com/tasklists/1579939/time/total.json?userId=180688
        // https://diamanti.teamwork.com/people/268433/loggedtime.json (yogesg Data)
        // const url = `${API_URL}/people/180688/loggedtime.json`; //Arati Team Work Data
        const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h' //yatish token
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

       
        this.props.users.map((key,index)=>
        axios.get(`${API_URL}/tasklists/1446909/time/total.json`, {
            params: {
                userId:key['id']
                },
            headers: {
            'Authorization': `Basic ${token}`
        }
        })
            .then(response => response.data)
            .then((data) => {
                // console.log("data coming",data);
                if(data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"] != 0){
                console.log("data Automation Fixes",key['id'],key["name"],data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"])
                this.state.dataObj.push({'id':key['id'],'name':key["name"],'workingHours':data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"]})
                } 
            })
            .catch(error => { 
                console.log("Error",error)
            })
        )

        // }
        
        
    }

    
   
    render(){
        return (
            <div> 
                <div>
                    <h4>Total Employee Working On Automation Fixes : {this.props.users.length}</h4>
                    <h4>Total Hours Spent On Automation Fixes : {this.state.totalHoursSpent}</h4>
                </div>
                
                <div>
                    <Table {...this.state}/>
                </div>
               

               

            </div>
        )
    }
}
export default AutomationFixesComponent;