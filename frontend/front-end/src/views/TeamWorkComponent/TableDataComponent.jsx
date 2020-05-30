import React,{ Component } from 'react';
import './taskList.css';

class Table extends Component{
    constructor(props){
        super(props);
        // console.log("props".this.props)
    }
    
   
   renderTableData  = () => {
       console.log("hekfhfjmd",this.props)
        // return this.props.userData.length === 0 ? (
        //     <div>Loading...</div>
        // ) : (
            this.props.userData.map((e, i) => {
                console.log(e)
            return (
                    
                         <tr key={i}> 
                            <td>{i+1}</td>
                            <td>{e.userID}</td> 
                            <td>{e.EmpName}</td>
                            <td>{e.workingHours}</td>   
                        </tr>    
                         
            );
            })
        // )

    }
    render(){
        if(!this.props.userData.length)
            return null;

        
        return(
                <table id='users' style={{marginTop:'50%'}}>
                        <tbody>
                            <th>Sr No</th>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Working Hours</th>
                            {this.renderTableData()
                            //    this.props.userData.map((e, i) => {
                            //     <tr key={i}> 
                            //        <td>{i+1}</td>
                            //        <td>{e.userID}</td> 
                            //        <td>{e.EmpName}</td>
                            //        <td>{e.workingHours}</td>   
                            //     </tr>   
                            //    }) 
                            }
                        </tbody>
                    </table>
               
           
        )
    }
}

export default Table;