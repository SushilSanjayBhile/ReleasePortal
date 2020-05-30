{/* <div style={{margin:'10px',textAlign:'center',fontWeight:"bold"}} >Home Page For TaskList</div>
                
               <div class="dropdown">
                    <Navbar light expand="md">
                    <button class="dropbtn" onClick={this.showMenu} >Type</button>
                    </Navbar>
                    
                    {/* </Navbar> */}

                
                    {
                        this.state.showMenu
                            ? (
                            <div class="dropdown-content">
                                
                                <a onClick={this.manualSelected}> Manual</a>
                            
                                <a onClick={this.automationSelected}> Automation</a>
                            
                                <a onClick={this.nonTestingTaskelected}> Non Testing Task</a>
                            </div>
                            )
                            : (
                            null
                            )
                        }
    
                        {
                        this.state.manual
                            ? (
                            <div>
                                <Navbar light expand="md">
                                <button class="dropbtnTaskList" onClick={this.showTaskList} >TaskList</button>
                                </Navbar>
                                {this.state.showTaskList?(
                                    <div class="dropdown-content" style="left:0">
                                        <button> DCX </button>
                                        <button> Spektra </button>
                                        <button> Others </button>
                                    </div>
                                ):(null)}
                                
                            </div>
                            )
                            : (
                            null
                            )
                        }
    
                        {
                        this.state.automation
                            ? (
                            <div>
                                <button> DCX </button>
                                <button> Spektra </button>
                                <button> Others </button>
                            </div>
                            )
                            : (
                            null
                            )
                        }
    
                        {
                        this.state.nonTestingTask
                            ? (
                            <div>
                                <button> DCX </button>
                                <button> Spektra </button>
                                <button> Others </button>
                            </div>
                            )
                            : (
                            null
                            )
                        }
                    </div> */}




                     //     <div className="ag-theme-alpine" style={ {height: '200px', width: '600px','marginTop':'50px'} }>
                    //     <AgGridReact
                    //         columnDefs={this.state.columnDefs}
                    //         rowData={this.state.rowData}>
                    //     </AgGridReact>
                    // </div>