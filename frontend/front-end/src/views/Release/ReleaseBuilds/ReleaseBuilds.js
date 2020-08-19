import React,{ Component,Fragment } from 'react';
import axios from 'axios';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { connect } from 'react-redux';

import {
    Col,
    Row,
    Table,
    Button,
    Input,
    FormGroup,Label
} from 'reactstrap';

class ReleaseBuilds extends Component {
    constructor(){
        super();
        this.state = {
            data1:[],
            jobName:'',
            buildNumber:'',
            buildResult:'',
            buildURL:'',
            timestamp:'',
        }
    }

    componentDidMount(){
            this.buildInformation();
    }
    
    componentWillReceiveProps(newProps) {
        if(this.props.selectedRelease && newProps.selectedRelease && this.props.selectedRelease.ReleaseNumber !== newProps.selectedRelease.ReleaseNumber) {
            this.props.history.push('/release/summary')
        }
    }
    
    buildInformation = () =>{
        let buildData = []
        let flag = 0;
        let getDataURL = `/api/jenkinsBuild/`
        axios.get(getDataURL)
        .then(resp=>{
            let data = resp.data.data
            data.forEach(element => {
                if(element.ReleaseNumber == this.props.selectedRelease.ReleaseNumber){
                    flag = 1;
                    let requestURL = '/rest/bldservBuildData/' + element.buildName  
                    axios.get(requestURL)
                    .then(response=>{
                        let data = response.data.response;
                        let jobName = data.url.split("/")
                        jobName = jobName[4]
                        
                        let a = data.url.split("/")
                        let genericURL = a[0] + '//' + a[2] + '/' + a[3] + '/' + a[4]
    
    
                        var timestamp = data.timestamp * 1000;
                        let a11 = new Date(timestamp).toTimeString();
                        let a12 = new Date(timestamp).toDateString();
                        a11 = (a11.split(" ")[0]).split(":")
                        let exactTime = a11[0] + " Hours " + a11[2] + " Minutes "
                        
    
                        var timestamp=new Date(data.timestamp).getTime();
                        var todate=new Date(timestamp).getDate();
                        var tomonth=new Date(timestamp).getMonth()+1;
                        var toyear=new Date(timestamp).getFullYear();
                        var original_date=tomonth+'/'+todate+'/'+toyear;
                        let exactTimeAndDate = original_date + " " + exactTime 

                        if(data.result == 'Null'){
                            data.result = 'In Progress'
                        }
                        
                        buildData.push({
                            'ReleaseNumber':this.props.selectedRelease.ReleaseNumber,
                            'jobName': jobName,
                            'buildNumber': data.number,
                            'buildResult': data.result,
                            'buildURL': genericURL,
                            'timeStamp': exactTimeAndDate,
                            'successCount':element.success,
                            'failureCount' : element.failure,
                            'buildName': jobName
                        })
                        this.setState({
                            data1 : buildData
                        })
                    })
                    .catch(err=>{
                        console.log('Errror',err)
                    })
                }
            });
        })
        .catch(err=>{
            console.log(err)
            alert("Problem Getting Build Information")
        })
    }
    
    save = () =>{
        let buildDataArray = []
        let newValue = document.getElementById('BuildName').value;
        newValue = newValue.split("/")
        newValue = newValue[4]
        let count = 0
        let buildCount = '/rest/bldservBuildCount/' + newValue;
        // buildDataArray.push({'ReleaseNumber':this.props.selectedRelease.ReleaseNumber})
        axios.get(buildCount)
        .then(response=>{
            // console.log("buildCount response data",response.data['response']);
            let builds = response.data['response'].builds;
            builds.forEach((item)=>{
                let a = item.url.split("/")
                let genericURL = a[0] + '//' + a[2] + '/' + a[3] + '/' + a[4]
                buildDataArray.push({
                    'ReleaseNumber':this.props.selectedRelease.ReleaseNumber,
                    'buildNumber': item.number,
                    'buildResult': item.result,
                    'buildURL':genericURL,
                    'buildName':newValue,
                })
                
            })
            let url = `/api/jenkinsBuild/`
               
            axios.post(url,{buildDataArray})
            .then(response => {
                document.getElementById('BuildName').value = '';
                alert("Build Added Successfully" + ' ' + newValue )
                count += 1
                this.buildInformation();
            }).catch(err => {
                console.log("err",err);
            })
        })
        .catch(err=>{
            console.log("err",err)
        })
    }

    delete  = () => {

        console.log(document.getElementById("BuildNameToDelete").value);
        let newValue = document.getElementById('BuildNameToDelete').value;
        newValue = newValue.split("/")
        newValue = newValue[4]
        let url = `/api/jenkinsBuildDelete/`
        let buildDataArray = []
        buildDataArray.push({
            'buildName':newValue,
        })
        axios.delete(url,{data: { data1 : buildDataArray} })
        .then(data => {
            // console.log("data",data.data)
            document.getElementById('BuildNameToDelete').value = '';
            alert('Build Deleted Successfully' + ' ' +  newValue);

                this.buildInformation();
        }, error => {
            alert(`Error: ${error.message}`);
        })
    }
    
    render(){
        return(
            <div className="main-container">
                <div class="container" style={{ 'margin-top': '1rem' }}>
                    <button  style={{ 'margin-left': '56rem' }} type="button" class="btn btn-success"  data-toggle="modal" data-target="#myModal">Add New Build URL</button>

                    <div class="modal fade" id="myModal" role="dialog">
                        <div class="modal-dialog">
                        
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                
                            </div>
                            
                            <div class="modal-body">
                                <FormGroup onSubmit={this.save}>
                                    <Label htmlFor="name">Build URL</Label>
                                        <Input type="text" name="buildName" id = "BuildName" placeholder="Enter Build URL" required/>
                                </FormGroup>
                            </div>
                           
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-dark" data-dismiss="modal"  onClick={this.save}>Save</button>
                                <button type="button" class="btn btn-outline-dark" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                        </div>
                    </div>





                    <button  style={{ 'margin-left': '56rem', 'margin-top':'5px' }} type="button" class="btn btn-success"  data-toggle="modal" data-target="#myModal1">Delete Build </button>

                    <div class="modal fade" id="myModal1" role="dialog">
                        <div class="modal-dialog">
                        
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                
                            </div>
                            
                            <div class="modal-body">
                                <FormGroup onSubmit={this.delete}>
                                    <Label htmlFor="name">Build URL</Label>
                                        <Input type="text" name="buildName" id = "BuildNameToDelete" placeholder="Enter Build URL To Delete" required/>
                                </FormGroup>
                            </div>
                           
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-dark" data-dismiss="modal"  onClick={this.delete}>Delete</button>
                                <button type="button" class="btn btn-outline-dark" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <Row>
                    {
                        this.state.data1 && this.state.data1.map((item1,index)=>{
                            return(
                                <Col xs="12" sm="12" md="5" lg="5" className="rp-summary-tables">
                                    {
                                        <div className='rp-app-table-header'>
                                            <div className='rp-app-table-title'>
                                                <div className='rp-icon-button'><i className="fa fa-gg-circle"></i></div><span>{item1.jobName}</span>
                                            </div>
                                        </div>
                                    }
                                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                                        <tbody>
                                            {
                                                [
                                                    { key: 'Job Name', value: item1.jobName },
                                                    { key: 'Build Number', value: item1.buildNumber  },
                                                    { key: 'Result', value: item1.buildResult },
                                                    { key: 'Build URL', value: item1.buildURL },
                                                    { key: 'Last Build Time', value: item1.timeStamp},
                                                    { key: 'Successfull Builds', value: item1.successCount},
                                                    { key: 'Failed Builds', value: item1.failureCount},
                                                    
                                                ].map((item, index) => {
                                                    return (
                                                        <tr>
                                                            {
                                                                item.key == 'Build URL' ? 
                                                                <React.Fragment>
                                                                    <td className='rp-app-table-key'>{item.key}</td>
                                                                    <td><a href={item.value} target="_blank">{item.value}</a></td>
                                                                </React.Fragment>
                                                                :
                                                                <React.Fragment>
                                                                    <td className='rp-app-table-key'>{item.key}</td>
                                                                    <td>{item.value}</td>
                                                                </React.Fragment>

                                                            }
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        )
    }
}


const mapStateToProps = (state, ownProps) => ({
    selectedRelease: getCurrentRelease(state, state.release.current.id),
})
export default connect(mapStateToProps, {getCurrentRelease })(ReleaseBuilds);
