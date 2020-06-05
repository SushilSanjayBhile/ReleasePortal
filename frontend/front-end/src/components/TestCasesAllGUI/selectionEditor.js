import React, { Component } from "react";
import ReactDOM from "react-dom";
import './selectionEditor.scss';
import { Input } from 'reactstrap';

export default class SelectionEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        }
    }
    componentDidMount() {
        this.focus();
    }

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        window.setTimeout(() => {
            let container = ReactDOM.findDOMNode(this.refs.container);
            if (container) {
                container.focus();
            }
        })
    }

    getValue() {
        return this.state.value;
    }

    isPopup() {
        return true;
    }

    onSelect(item) {
        this.setState({
            value: item
        },
            () => this.props.api.stopEditing()
        );
    }
    onMultiSelect(event) {
        let values = [];
        for (let i = 0; i < event.target.options.length; i++) {

            if (event.target.options[i].selected) {
                values.push(event.target.options[i].value);
            }
        }
        this.setState({
            value: values
        });
    }

    render() {
        let mood = {
            maxHeight: '20rem',
            overflow: 'scroll',
            width: '10rem'
        };

        let unselected = {
            paddingLeft: 10,
            paddingRight: 10,
            border: "1px solid transparent",
            padding: 4
        };

        let selected = {
            paddingLeft: 10,
            paddingRight: 10,
            border: "1px solid lightgreen",
            padding: 4
        };

        let happyStyle = this.state.happy ? selected : unselected;
        let sadStyle = !this.state.happy ? selected : unselected;
       
        return (
            

            this.props.multiple ?
                <Input type='select' multiple onKeyDown={(e) => {
                    if (e.target.value === 'Enter') {
                        this.setState(() => this.props.api.stopEditing())
                    }
                }} onChange={(e) => this.onMultiSelect(e)}>
                    {
                        this.props.values.map(item => <option value={item}>{item}</option>)
                    }
                </Input> :
                <Input type='select' onChange={(e) => this.onSelect(e.target.value)}>
                    {
                        this.props.values.map(item => <option value={item}>{item}</option>)
                    }
                </Input>



            // </div>
        );
    }
}