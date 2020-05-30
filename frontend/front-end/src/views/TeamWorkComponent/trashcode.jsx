// totalHoursSpentByEachPerson = () => {
    //         // https://diamanti.teamwork.com/people/268433/loggedtime.json (yogesg Data)

    //         let nonBillableHours = [];
           
    //         let nonBillableHoursByPerson = [];
    //         let filteredArr = []
    //         // const url = `${API_URL}/people/180688/loggedtime.json`; //Arati Team Work Data
    //         const username = 'twp_0UY04jI8DHxw88bzxe0DbStT9U0h' //yatish token
    //         const password = 'a'
    //         const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

    //         this.state.users.map((key,index)=>
    //             axios.get(`${API_URL}/people/${key['id']}/loggedtime.json`, {
    //                 headers: {
    //                 'Authorization': `Basic ${token}`
    //             }})
    //             .then(response => response.data)
    //             .then((data) => {
    //                 this.setState({ totalHoursSpentByEachPerson:data['user']})
    //                 let u1 = 0
    //                 if(this.state.totalHoursSpentByEachPerson.nonbillable.length!=0){
    //                     nonBillableHours.push({'id':this.state.totalHoursSpentByEachPerson.id,'workingHours':this.state.totalHoursSpentByEachPerson.nonbillable}) 
    //                     nonBillableHours.map((key1)=>{
    //                         nonBillableHoursByPerson = []
    //                         key1['workingHours'].map((key)=>{
    //                             nonBillableHoursByPerson.push(parseFloat(key[1]));
    //                             u1 = nonBillableHoursByPerson.reduce((prev,curr)=>prev + curr,0)
    //                             // console.log("u1",nonBillableHoursByPerson);
    //                         });
    //                         this.state.nonBillableHours1.push({'id':key1.id,'workingHours':u1})
    //                         this.state.filteredArr = this.state.nonBillableHours1.reduce((acc, current) => {
    //                             const x = acc.find(item => item.id === current.id);
    //                             if (!x) {
    //                               return acc.concat([current]);
    //                             } else {
    //                               return acc;
    //                             }
    //                           }, []);

    //                           this.dataManuplation(this.state.filteredArr);
    //                     }); 
    //                 }
                    
    //             })
    //             .catch(error => { 
    //                 console.log("Error",error)
    //             })
    //         )
            
    //     }

    //     dataManuplation = (param) =>{
            
    //         for(let user = 0 ; user < this.state.users.length; user++){
    //             for(let par = 0 ; par < param.length; par++){
    //                 if(this.state.users[user].id == param[par].id){
    //                     this.state.users[user]['totalworkingHrs'] = param[par].workingHours

    //                 }
    //             }
    //         }
    //     console.log("12345",this.state.users,param);

        // }