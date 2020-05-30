
import React,{ Component } from 'react';
import axios from 'axios';

//Other Component Imports
import Table from './TableDataComponent';


const API_URL = 'https://diamanti.teamwork.com';
var data = []

class E2EAutomationComponent extends Component {
    constructor(props){
        super(props);
        // this.totalHoursSpentByEachPerson = this.totalHoursSpentByEachPerson.bind(this);
        // this.dataManuplation = this.dataManuplation.bind(this);
    }

    state = {
        dataObj : [],
        totalHoursSpent : [],
        totalHoursSpentByEachPerson : [],
        nonBillableHours1:[],
        filteredArr:[]

    }
    componentDidMount() {
        // this.getListOfAllFolks();
        this.totalHoursSpent();
        this.totalHoursSpentByEachPerson();  
         
    }
    totalHoursSpent = () => {
        // https://diamanti.teamwork.com/tasklists/1579939/time/total.json
        const url = `${API_URL}/tasklists/918099/time/total.json`;
        const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h' //Yatish's Token
        const password = 'a'
        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        axios.get(url, {
            headers: {
              'Authorization': `Basic ${token}`
        }})
        .then(response => response.data)
        .then((data) => {
            this.setState({ totalHoursSpent:data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"]})
            // console.log("Total Hours Spent In Spektra Manual Testing",this.state.totalHoursSpent);            
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
        axios.get(`${API_URL}/tasklists/918099/time/total.json`, {
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
                console.log("data E2E Automation",key['id'],key["name"],data['projects'][0]["tasklist"]["time-totals"]["total-hours-sum"])
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
                    <h4>Total Employee Working On E2E Automation : {this.props.users.length}
                    {/* <Button  outline className="float-right">Close</Button> */}

                    </h4>
                    <h4>Total Hours Spent On E2E Automation: {this.state.totalHoursSpent}</h4>
                </div>
                
                <div>
                    <Table {...this.state} />

                </div>
            </div>
        )
    }
}
export default E2EAutomationComponent;