import React, { Component } from "react";
import ReactDOM from "react-dom";
import './selectionEditor.scss';

export default class SelectionEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
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

    render() {
        let mood = {
            maxHeight: '20rem',
            overflow: 'scroll',
            width: '10rem'
        };

        return (
            <div ref="container">
                <input value={this.state.value} type='date' pattern="\d{2}-\d{2}-\d{2}" onChange={(e) => this.setState({ value: e.target.value })} />
            </div>
        );
    }
}