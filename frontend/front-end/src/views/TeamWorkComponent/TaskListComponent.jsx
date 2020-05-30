import React,{ Component } from 'react';
import { Navbar, Nav,DropdownToggle,Dropdown,DropdownMenu,DropdownItem,ButtonDropdown } from 'reactstrap';

export default class TaskListComponent extends Component{

    constructor(props){
        super(props);

        this.state = {
            DCXSelected:false,
            SpektraSelected:false,
            OtherSelected:false,
        }

        console.log("props",this.props);    
    }

    


   
    DCXSelected = ()=>{
        this.setState({DCXSelected:!this.state.DCXSelected})
        if(this.props.manual){
            alert("Manual DCX Selected")
        }
        else if(this.props.automation){
            alert("Automation DCX Selected");
        }
        else if(this.props.nonTestingTask){
            alert("Non testing DCX Selected");
        }   
    }
    SpektraSelected = ()=>{
        this.setState({SpektraSelected:!this.state.SpektraSelected})
        if(this.props.manual){
            alert("Manual Spektra Selected")
        }
        else if(this.props.automation){
            alert("Automation Spektra Selected");
        }
        else if(this.props.nonTestingTask){
            alert("Non testing Spektra Selected");
        }
    }
    OtherSelected = ()=>{
        this.setState({OtherSelected:!this.state.OtherSelected})
        if(this.props.manual){
            alert("Manual OtherSelected Selected")
        }
        else if(this.props.automation){
            alert("Automation OtherSelected Selected");
        }
        else if(this.props.nonTestingTask){
            alert("Non testing OtherSelected Selected");
        }
    }


    render(){
        return (
            <div>
                
                    <DropdownToggle caret style={{margin:'2%'}}>
                        Select Task List
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem>
                        <div onClick={this.DCXSelected}>DCX</div>
                        </DropdownItem>
                        
                        <DropdownItem >
                        <div onClick={this.SpektraSelected}>Spektra</div>
                        </DropdownItem>
                        
                        <DropdownItem >
                        <div onClick={this.OtherSelected}>Others</div>
                        </DropdownItem>
                        
                    </DropdownMenu>
                
            </div>
        )
    }
}