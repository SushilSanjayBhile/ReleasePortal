getSPEK_Automation_Data = () =>{
    this.setState({taskId :[]})
    const url = `${API_URL}/tasklists/1579938/tasks.json`;
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
        let temp = []
        let data = response.data["todo-items"]
        data.map((key)=>{temp.push(key.id)})
        this.state.taskId.push({'taskListID':1579938,'taskId':temp}) 
        this.setState({taskId:this.state.taskId})

        console.log("all taskID Autoamtion",this.state.taskId[0].taskListID,this.state.taskId[0].taskId) 

    })
    .catch(error => { 
        console.log("Error",error)
    })
    
}

getSPEK_NonTestingTask_Data = () =>{
    this.setState({taskId :[]})
    const url = `${API_URL}/tasklists/1503197/tasks.json`;
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
        let temp = []
        let data = response.data["todo-items"]
        data.map((key)=>{temp.push(key.id)})
        this.state.taskId.push({'taskListID':1503197,'taskId':temp}) 
        this.setState({taskId:this.state.taskId})

        console.log("all taskID Non Testing Task",this.state.taskId[0].taskListID,this.state.taskId[0].taskId) 

    })
    .catch(error => { 
        console.log("Error",error)
    })
    
}