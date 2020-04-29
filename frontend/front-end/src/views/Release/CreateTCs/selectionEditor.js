import React, { Component } from "react";
import ReactDOM from "react-dom";
import './selectionEditor.scss';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { updateSanityEdit } from '../../../actions';

export default class SelectionEditor extends Component {
    constructor(props) {
        super(props);
        console.log('props for selection')
        console.log(props);

        this.state = {
            value: props.value
        }
    }

    // componentWillMount() {
    //     this.setHappy(this.props.value === "Happy");
    // }

    componentDidMount() {
        // this.refs.container.addEventListener('keydown', this.checkAndToggleMoodIfLeftRight);
        this.focus();
    }

    componentWillUnmount() {
        // this.refs.container.removeEventListener('keydown', this.checkAndToggleMoodIfLeftRight);
    }

    // checkAndToggleMoodIfLeftRight = (event) => {
    //     if ([37, 39].indexOf(event.keyCode) > -1) { // left and right
    //         this.toggleMood();
    //         event.stopPropagation();
    //     }
    // }

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
        // can save old values here
        // let sanity = this.props.data.sanityEdit;
        // if (sanity[this.props.data.Type]) {
        //     sanity[this.props.data.Type] = {
        //         ...sanity[this.props.data.Type],
        //         [this.props.data.id]: { ...this.props.data, [this.props.colDef.field]: item }
        //     }
        // } else {
        //     sanity[this.props.data.Type] = { [this.props.data.id]: { ...this.props.data, [this.props.colDef.field]: item } }
        // }
        // this.props.data.updateSanityEdit(sanity);
        this.setState({
            value: item
        },
            () => { this.props.api.stopEditing(); }
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
        console.log('for ')
        console.log(this.props.multiple)
        return (
            // <div ref="container"
            //     style={mood}
            //     tabIndex={1} // important - without this the keypresses wont be caught
            // >

            this.props.multiple ?
                <Input type='select' multiple onKeyDown={(e) => {
                    console.log('enter ', e.target.value)
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
