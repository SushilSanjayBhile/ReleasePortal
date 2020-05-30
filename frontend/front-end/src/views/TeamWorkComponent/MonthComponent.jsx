import React from 'react';
import {FormGroup, Label, FormText} from 'reactstrap'
var DatePicker = require("reactstrap-date-picker");
 
class MonthComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state= {
      value: new Date().toISOString()
    }
  }
 
  handleChange(value, formattedValue) {
    this.setState({
      value: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
      formattedValue: formattedValue // Formatted String, ex: "11/19/2016"
    })
  }
 
  componentDidUpdate() {
    // Access ISO String and formatted values from the DOM.
    var hiddenInputElement = document.getElementById("example-datepicker");
    console.log(hiddenInputElement.value); // ISO String, ex: "2016-11-19T12:00:00.000Z"
    console.log(hiddenInputElement.getAttribute('data-formattedvalue')) // Formatted String, ex: "11/19/2016"
  }
 
  render() {
    return (
      <FormGroup>
        <Label>My Date Picker</Label>
        <DatePicker id      = "example-datepicker" 
                    value   = {this.state.value} 
                    onChange= {(v,f) => this.handleChange(v, f)} />
        <FormText>Help</FormText>
      </FormGroup>
    )
  }
}

export default MonthComponent;