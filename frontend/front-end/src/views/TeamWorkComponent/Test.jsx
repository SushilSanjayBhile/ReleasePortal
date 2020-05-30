import React,{ Component } from 'react';
import { Row,Col,Input,Collapse } from 'reactstrap';
import './dropdownButton.css';
import { AgGridReact } from 'ag-grid-react';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';

import TaskListComponent from './TaskListComponent';
import ManualComponent from './ManualComponent';
import AutomationComponent from './AutomationComponent';
import NonTestingTaskComponent1 from './NonTestingTaskComponent1';
import PersonwiseView from './PersonwiseView';
import PersonViewForOther from './PersonViewForOther';


class Test extends Component{
    constructor(){
        super();
       
        this.state = {
           
            showMenu:false,
            showEmployee:false,
            personView:false,
            selectedType:'',
            selectedTaskList:'',
            selectedTask:'',
            Menu:['Manual','Automation','NonTestingTask'],
            TaskList:['DCX','Spektra','Other'],
            PersonViewMenu:['Spektra','Others'],
            PersonViewMenu1:['Spektra Manual Testing','Spektra Automation','Spektra Non Testing Task','Non Testing Task'],

            selectedPersonViewType:'',
            // AutomationSpektra : ['DMCTL Testing','KUBECTL Testing','Application Migration'],
            // NonTestingTaskTaSpektra : ['Discussions & Meetings','Documentations','Reading Docs / Research'],
            
            users : [
                {'id':180688,'name':"Yatish Devadiga"},
                {'id':291557,'name':"Swapnil Sonawane"},
                {'id':239362,'name':"Tanya Singh"},
                {'id':207091,'name':"Vishal Anarse"},
                {'id':294619,'name':"Arati Jadhav"},
                {'id':295961,'name':"Aditya Nilkanthwar"},
                {'id':295639,'name':"Ketan Divekar"},
                {'id':180684,'name':"Kiran Zarekar"},
                {'id':258125,'name':"Kiran Kothule"},
                {'id':215417,'name':"Mukesh Shinde"},
                {'id':239361,'name':"Priyanka Birajdar"},
                {'id':258126,'name':"Rajat Gupta"},
                {'id':286258,'name':"Shubham Khatri"},
                {'id':291556,'name':"Varsha Suryawanshi"},
                {'id':268433,'name':"Yogesh Thosare"},
                {'id':180687,'name':"Bharati Bhole"},
                {'id':180680,'name':"Rahul Soman"},
            ],
            
            
            userUpdated:[],
            personUpdated:[],

            modules: [ClientSideRowModelModule],

            columnDefs: [
                   
                {
                    headerName: "ID", 
                    field: "userID",
                    width: 150,
                    sortable: true,
                    suppressSizeToFit: true,
                }, 
                
                {
                    headerName: "Name", 
                    field: "EmpName",
                    width: 150,
                    sortable: true,
                    suppressSizeToFit: true,
                }, 
                
                {
                    headerName: "Working Hours", 
                    field: "workingHours",
                    width: 150,
                    sortable: true,
                    suppressSizeToFit: true,
                }], 
            
            
            personcolumnDefs: [
                {
                  headerName: "taskName", 
                  field: "taskName",
                  width: 350,
                  suppressSizeToFit: true,
               }, 
                  
                {
                    headerName: "Working Hours", 
                    field: "working hours",
                    minWidth: 250,
                    suppressSizeToFit: true,
                    
                }],
        }
       
    }


    handleUserUpdation = (params) =>{
        console.clear();
        this.setState({userUpdated:params})
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };
      

  
    handlePersonUpdation = (params) =>{
        this.setState({personUpdated:params})
    }

    // personView = (empID) =>{
    //     console.clear();
    //     this.setState({personView:empID})
    // }

    selectedOption = (option) =>{
        this.setState({selectedType:option});
        // console.log("option selected ",option);
    }
    
    
    selectedTaskList = (taskList) =>{
        this.setState({selectedTaskList:taskList})
        // console.log("taskList selected ",taskList);

    }

    

    render(){
        
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ showMenu: !this.state.showMenu })} style={{ display: 'inlineBlock' }}>
                                        
                                        {
                                            !this.state.showMenu &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.showMenu &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Task Overview</span>
                                      
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Collapse isOpen={this.state.showMenu}>
                            <div>
                                
                                <div style={{ width: (window.screen.width * (1 - 0.218)) + 'px', height: '500px', marginBottom: '6rem' }}>
                                
                                    <div class="row">

                                        <div class="col-md-3">
                                                <Input onChange={(e) => this.selectedOption(e.target.value)} type="select" name="selectOption" id="selectOption" >
                                                    <option value=''>Select Type</option>
                                                    {
                                                            this.state.Menu.map(item => <option value={item}>{item}</option>)
                                                    }
                                                </Input>
                                        </div>

                                        <div class="col-md-3">
                                            {
                                                    this.state.selectedType === 'Manual' || this.state.selectedType === 'Automation' || this.state.selectedType === 'NonTestingTask'
                                                    ? (
                                                            <Input onChange={(e) => this.selectedTaskList(e.target.value)} type="select" name="selectTaskList" id="selectTaskList" >
                                                                <option value=''>Select TaskList</option>
                                                                {
                                                                        this.state.TaskList.map(item => <option value={item}>{item}</option>)
                                                                }
                                                            </Input>
                                                    
                                                    ) 
                                                    : (
                                                        null
                                                    )
                                            }
                                        </div>

                                        <div class="col-md-3">
                                            {
                                                this.state.selectedType === 'Manual' && this.state.selectedTaskList
                                                ?(
                                                <ManualComponent  {...this.state} userUpdated={this.handleUserUpdation}/>
                                                ):(
                                                    null
                                                )
                                            }

                                            {
                                                this.state.selectedType === 'Automation' && this.state.selectedTaskList
                                                ?(
                                                <AutomationComponent {...this.state} userUpdated={this.handleUserUpdation} />
                                                ):(
                                                    null
                                                )
                                            }


                                            {
                                                this.state.selectedType === 'NonTestingTask' && this.state.selectedTaskList
                                                ?(
                                                <NonTestingTaskComponent1 {...this.state} userUpdated={this.handleUserUpdation} />
                                                ):(
                                                    null
                                                )
                                            }
                                        </div>

                                    </div>


                                    <div style={{ width: "100%", height: "100%" }}>
                                                        
                                    <div id="grid" className="ag-theme-alpine" style={ {height: "400px", width: "800px"} }>
                                        <AgGridReact
                                            modules={this.state.modules}
                                            columnDefs={this.state.columnDefs}
                                            rowData={this.state.userUpdated} 
                                            onGridReady={(params) => this.onGridReady(params)}
                                            >
                                        </AgGridReact>
                                    </div>
                                </div>
                                </div>
                            </div>
                            
                        </Collapse>
                    </Col>
                </Row>

                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div onClick={() => this.setState({ showEmployee: !this.state.showEmployee })} style={{ display: 'inlineBlock' }}>
                                        
                                        {
                                            !this.state.showEmployee &&
                                            <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                        }
                                        {
                                            this.state.showEmployee &&
                                            <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                        }
                                        <div className='rp-icon-button'></div>
                                        <span className='rp-app-table-title'>Employee View</span>
                                      
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Collapse isOpen={this.state.showEmployee}>
                            <div>
                                <div style={{ width: (window.screen.width * (1 - 0.218)) + 'px', height: '1300px', marginBottom: '8rem' }}>
                                    <PersonwiseView {...this.state} />
                                </div>
                            </div>
                        </Collapse>                                           
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Test;
