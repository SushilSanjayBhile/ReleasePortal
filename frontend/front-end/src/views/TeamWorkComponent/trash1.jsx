showMenu = (event) => {
    // event.preventDefault();
    this.setState({
        showMenu: true,
    },
        ()=>{
        document.addEventListener('click',this.closeMenu);
    }
    );
    console.log("Show Menu Menu Tasklist",this.state.showMenu,this.state.showTaskList)
}

closeMenu = () =>{
    this.setState({ 
        showMenu: false,
        showTaskList:false, 
    }, 
    () => {
        document.removeEventListener('click', this.closeMenu);
      }
    );
    console.log("Close Menu Menu Tasklist",this.state.showMenu,this.state.showTaskList)
     
}


showTasks = () => {
    this.setState({
        showTasks: true,
    },()=>{
            document.addEventListener('click',this.closeTasks);
        });  
}



closeTasks = (event) =>{
    this.setState({ showTasks: false }, () => {
        document.removeEventListener('click', this.closeTasks);
      });  
}

showTaskList = () => {
    this.setState({
        showTaskList: true,
    },
    ()=>{
            document.addEventListener('click',this.closeTaskList);
        }
        );  
    console.log("showTaskList Menu Tasklist",this.state.showMenu,this.state.showTaskList) 
}



closeTaskList = (event) =>{
    this.setState({ showTaskList: false }, () => {
        document.removeEventListener('click', this.closeTaskList);
      }); 
    console.log("Close TaskList Menu Tasklist",this.state.showMenu,this.state.showTaskList)
     
}



manualSelected = (event) => {
    this.setState({manual:!this.state.manual})
    alert("Manual Selected")
}
automationSelected = (event) => {
    this.setState({automation:!this.state.automation})
    alert("Automation Selected")
}

nonTestingTaskelected = (event) => {
    this.setState({nonTestingTask:!this.state.nonTestingTask})
    alert("Non Testing Task Selected")
}

onChange = () =>{
    if(this.state.manual){
        this.setState({automation:!this.state.automation})
        this.setState({nonTestingTask:!this.state.nonTestingTask})
    }
    else if(this.state.automation){
        this.setState({manual:!this.state.manual})
        this.setState({nonTestingTask:!this.state.nonTestingTask})
    }
    else if(this.state.nonTestingTask){
        this.setState({manual:!this.state.manual})
        this.setState({automation:!this.state.automation})
    }
    
}


// DCXSelected = ()=>{
//     this.setState({DCXSelected:!this.state.DCXSelected})

//     if(this.state.manual){
//         alert("Manual DCX Selected")
//     }
//     else if(this.state.automation){
//         alert("Automation DCX Selected");
//     }
//     else if(this.state.nonTestingTask){
//         alert("Non testing DCX Selected");
//     }
    
// }
// SpektraSelected = ()=>{
//     this.setState({SpektraSelected:!this.state.SpektraSelected})
//     if(this.state.manual){
//         alert("Manual Spektra Selected")
//     }
//     else if(this.state.automation){
//         alert("Automation Spektra Selected");
//     }
//     else if(this.state.nonTestingTask){
//         alert("Non testing Spektra Selected");
//     }
// }
// OtherSelected = ()=>{
//     this.setState({OtherSelected:!this.state.OtherSelected})
//     if(this.state.manual){
//         alert("Manual OtherSelected Selected")
//     }
//     else if(this.state.automation){
//         alert("Automation OtherSelected Selected");
//     }
//     else if(this.state.nonTestingTask){
//         alert("Non testing OtherSelected Selected");
//     }
// }

dmctlTesting = () =>{
    this.setState({dmctlTesting:!this.state.dmctlTesting})
    alert("data Coming from dmctl testing")
}

kubectlTesting = () =>{
    this.setState({kubectlTesting:!this.state.kubectlTesting})
    alert("data coming from kubectl testing")
}

appMigration = () =>{
    this.setState({appMigration:!this.state.appMigration})
    alert("data coming from app migration")
} 