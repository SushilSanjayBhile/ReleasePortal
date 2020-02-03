import React, { Component } from "react";
import { Input } from "reactstrap";
import { connect } from 'react-redux';
import { saveMultiPendingApproval } from '../../../actions';

class CheckBoxRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: false
        }
    }
    onChange(e) {
        console.log('props')
        console.log(this.props);
        console.log(e.target.checked);
        this.setState({ value: e.target.checked })
        this.props.saveMultiPendingApproval({ [`${this.props.data.TcID}_${this.props.data.CardType}`]: { checked: e.target.checked, TcID: this.props.data.TcID, CardType: this.props.data.CardType } });
    }
    // formatValueToCurrency(currency, value) {
    //     return `${currency}${value}`
    // }

    // noinspection JSUnusedGlobalSymbols
    // refresh(params) {
    //     if(params.value !== this.state.value) {
    //         this.setState({
    //             value: params.value.toFixed(2)
    //         })
    //     }
    //     return true;
    // }
    getValue() {
        return this.state.value;
    }
    render() {
        return (
            <Input style={{ margin: 'auto' }} type='checkbox' value={this.state.value ? 'checked' : ''} onChange={(e) => this.onChange(e)} />
            // <span>{this.formatValueToCurrency('EUR', this.state.value)}</span>
        );
    }
};
const mapStateToProps = (state, ownProps) => ({
    multi: state.app.multiPendingApproval
})
export default connect(mapStateToProps, { saveMultiPendingApproval })(CheckBoxRenderer);
