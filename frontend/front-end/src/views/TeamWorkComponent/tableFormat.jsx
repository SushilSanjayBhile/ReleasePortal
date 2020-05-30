import React,{Component} from 'react';


export default class Table extends React.Component {
 
    constructor(props){
    super(props);
        // this.getHeader = this.getHeader.bind(this);
        // this.getRowsData = this.getRowsData.bind(this);
        // this.getKeys = this.getKeys.bind(this);

        console.log("props",this.props)
    }
 
 getKeys = function(){
    return Object.keys(this.props.dict1);

 }
 
 getHeader = function(){

    var keys = this.getKeys();
        return keys.map((key, index)=>{
            return <th key={key}>{key.toUpperCase()}</th>
    })
 
 }
 
getRowsData = function(){
    var items = this.props.dict1;
    var keys = this.getKeys();
    return items.map((row, index)=>{
        return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
    })
 }
 
 render() {
     console.log("coming in tabke")
    return (
            <div>
            <table>
            <thead>
            <tr>{this.getHeader()}</tr>
            </thead>
            <tbody>
            {this.getRowsData()}
            </tbody>
            </table>
            </div>
 
        );
    }
}



const RenderRow = (props) =>{
 return props.keys.map((key, index)=>{
 return <td key={props.dict1[key]}>{props.dict1[key]}</td>
 })
}