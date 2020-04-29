import React, { Component } from 'react';

class TcSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        return (
            <div class="row">
                <div class='col-md-12'>
                    <div class="row">
                        <div class="col-md-2">
                            <div className={`c-callout c-callout-total`}>
                                <small style={{
                                    fontSize: '13px',
                                    fontWeight: '500'

                                }} class="text-muted">TC ID</small><br></br>
                                <strong style={{ wordWrap: 'break-word' }} class="h5">{this.props.tcDetails.TcID}</strong>
                            </div>
                        </div>
                        {
                            this.props.tcDetails && this.props.tcDetails.StatusList && this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1] ?
                                <div class="col-md-2">
                                    <div className={`c-callout c-callout-${this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Result.toLowerCase()}`}>
                                        <small style={{
                                            fontSize: '13px',
                                            fontWeight: '500'

                                        }} class="text-muted">Current Status</small><br></br>
                                        <strong class="h5">{this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Result}</strong>
                                    </div>
                                </div> :
                                <div class="col-md-2">
                                    <div className={`c-callout c-callout-nottested`}>
                                        <small style={{
                                            fontSize: '13px',
                                            fontWeight: '500'

                                        }} class="text-muted">Current Status</small><br></br>
                                        <strong class="h5">NOT TESTED</strong>
                                    </div>
                                </div>
                        }
                        {this.props.tcDetails && this.props.tcDetails.StatusList && this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1] ?
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-total`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Current Build</small><br></br>
                                    <strong class="h5">{this.props.tcDetails.StatusList[this.props.tcDetails.StatusList.length - 1].Build}</strong>
                                </div>
                            </div> :
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-nottested`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Current Build</small><br></br>
                                    <strong class="h5">NOT AVAILABLE</strong>
                                </div>
                            </div>
                        }
                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.CardType ?
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-total`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Card Type</small><br></br>
                                    <strong class="h5">{this.props.tcDetails.CardType}</strong>
                                </div>
                            </div> :
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-nottested`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">CardType</small><br></br>
                                    <strong class="h5">NOT AVAILABLE</strong>
                                </div>
                            </div>
                        }
                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.ServerType ?
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-total`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Server Type</small><br></br>
                                    <strong class="h5">{this.props.tcDetails.ServerType.join(',')}</strong>
                                </div>
                            </div> :
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-nottested`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Server Type</small><br></br>
                                    <strong class="h5">NOT AVAILABLE</strong>
                                </div>
                            </div>
                        }
                        {this.props.tcDetails && this.props.tcDetails && this.props.tcDetails.WorkingStatus ?
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-total`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Working Status</small><br></br>
                                    <strong class="h5">{this.props.tcDetails.WorkingStatus}</strong>
                                </div>
                            </div> :
                            <div class="col-md-2">
                                <div className={`c-callout c-callout-nottested`}>
                                    <small style={{
                                        fontSize: '13px',
                                        fontWeight: '500'

                                    }} class="text-muted">Working Status</small><br></br>
                                    <strong class="h5">NOT AVAILABLE</strong>
                                </div>
                            </div>
                        }


                    </div>
                </div>
            </div>
        )
    }
}

export default TcSummary;