// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress, Popover, PopoverBody, FormGroup, Label
} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { saveE2E, updateE2EEdit } from '../../../actions';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import Multiselect from 'react-bootstrap-multiselect';
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class CreateResult extends Component {
    // [field] : {old,new}
    changeLog = {};
    constructor(props) {
        super(props);
        this.state = {
            addTC: { Master: true },
            open: false,
            edited: {},
            errors: {}
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });


    textFields = [
        'Build', 'Result', 'Notes', 'E2EFocus','E2ESkipList', 'NoOfTCsPassed', 'Bugs', 'Type', 'NoOfIteration', 'CfgFileUsed', 'LinkFlap', 'NoOfDuration',
        'Tag', 'Setup', 'Date', 'Jenkin'
    ];
    arrayFields = ['CardType']
    whichFieldsUpdated(old, latest) {
        let changes = {};
        this.textFields.forEach(item => {
            if (old[item] !== latest[item]) {
                changes[item] = { old: old[item], new: latest[item] }
            }
        });
        this.arrayFields.forEach(item => {
            if (!old[item] && latest[item]) {
                changes[item] = { old: '', new: latest[item] }
            } else if (!latest[item] && old[item]) {
                changes[item] = { old: old[item], new: '' }
            } else if (old[item] && latest[item]) {
                let arrayChange = latest[item].filter(each => old[item].includes(each));
                if (arrayChange.length > 0) {
                    changes[item] = { old: old[item], new: latest[item] }
                }
            }
        });
        return changes;
    }
    joinArrays(array) {
        if (!array) {
            array = [];
        }
        if (array && !Array.isArray(array)) {
            array = array.split(',');
        }
        return array;
    }

    save() {
        this.setState({ isUnderProgress : true});
        let data = {};
        // tc info meta fields
        // data.Role = 'QA';
        // tc info fields
        this.textFields.map(item => data[item] = this.state.addTC[item]);
        // this.arrayFields.forEach(item => data[item] = this.joinArrays(this.state.addTC[item]));
        data.CardType = [this.state.addTC.CardType];
        
        // let date = new Date().toISOString().split('T');
        // data.Date = `${date[0]} ${date[1].substring(0, date[1].length - 1)}`;
        
        if(data.Jenkin) {
            data.User='Jenkin'
        } else {
            data.User = this.props.currentUser.email;
        }
        this.setState({ toggleMessage: null })
        let type = 'e2e';
        if (this.state.addTC.Type === 'Longevity') {
            type = 'longevity'
        }
        if (this.state.addTC.Type === 'Stress') {
            type = 'stress'
        }
        axios.post(`/api/sanity/${type}/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {

                // this.getTcs();
                // this.setState({ addTC: { Master: true, Domain: '' }, errors: {}, toggleMessage: `TC ${this.state.addTC.TcID} Added Successfully` });
                // this.toggle();
                if(this.state.addTC.Type === 'E2E') {
                    this.props.close(`${this.state.addTC.Type}${this.state.addTC.Tag}`)
                } else {
                    this.props.close(`${this.state.addTC.Type}`)
                }
                this.setState({ isUnderProgress: false });
            }, error => {
                // this.toggle();
                this.setState({ isUnderProgress: false });
                alert('failed to create TC');
            });
        this.setState({ toggleMessage: null })
        this.toggle();
    }
    confirmToggle() {
        let errors = null;
        this.changeLog = {};
        ['Type', 'Setup', 'CardType','Date', 'Result', 'Build']
            .forEach(item => {
                if (!errors) {
                    let valid = this.state.addTC[item] && this.state.addTC[item].length > 0;
                    if (!valid) {
                        errors = { ...this.state.errors, [item]: 'Cannot be empty' };
                    }
                }
            });
        if (!errors && this.state.addTC.Type === 'Stress') {
            ['NoOfIteration', 'LinkFlap']
                .forEach(item => {
                    if (!errors) {
                        let valid = this.state.addTC[item] && this.state.addTC[item].length > 0;
                        if (!valid) {
                            errors = { ...this.state.errors, [item]: 'Cannot be empty' };
                        }
                    }
                });
            if (!errors && isNaN(this.state.addTC['NoOfIteration'])) {
                errors = { ...this.state.errors, NoOfIteration: 'Should be a number' };
            }
        }
        if (!errors && this.state.addTC.Type === 'E2E') {
            ['NoOfTCsPassed', 'E2EFocus', 'Tag']
                .forEach(item => {
                    if (!errors) {
                        let valid = this.state.addTC[item] && this.state.addTC[item].length > 0;
                        if (!valid) {
                            errors = { ...this.state.errors, [item]: 'Cannot be empty' };
                        }
                    }
                });
            if (!errors && isNaN(this.state.addTC['NoOfTCsPassed'])) {
                errors = { ...this.state.errors, NoOfTCsPassed: 'Should be a number' };
            }
        }
        if (!errors && this.state.addTC.Type === 'Longevity') {
            if (!errors && isNaN(this.state.addTC['NoOfDuration'])) {
                errors = { ...this.state.errors, NoOfDuration: 'Should be a number' };
            }
        }

        if (!errors) {
            // this.changeLog = this.whichFieldsUpdated({}, this.state.addTC);
            this.setState({ toggleMessage: null })
            this.toggle();
        } else {
            this.setState({ errors: errors })
        }
    }
    componentWillReceiveProps(newProps) {
        console.log('called')
        if (newProps && this.props && this.props.counter && newProps.counter !== this.props.counter) {
            console.log('inside')
            this.confirmToggle();
        }
    }
    selectMultiselect(field, event, checked, select) {
        let value = event.val();
        switch (field) {
            case 'CardType':
                let cardType = null;
                if (checked && this.state.addTC.CardType) {
                    cardType = [...this.state.addTC.CardType, value];
                }
                if (checked && !this.state.addTC.CardType) {
                    cardType = [value];
                }
                if (!checked && this.state.addTC.CardType) {
                    let array = this.state.addTC.CardType;
                    array.splice(array.indexOf(value), 1);
                    cardType = array;
                }
                this.setState({ addTC: { ...this.state.addTC, CardType: cardType }, errors: { ...this.state.errors, CardType: null } });
                break;
            default:
                break;
        }
        console.log('cards ', this.state.addTC.CardType)
    }
    render() {

        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE').map(item => item.email);
        let cards = ['BOS', 'NYNJ', 'COMMON', 'SOFTWARE'].map(item => ({ value: item, selected: this.state.addTC.CardType && this.state.addTC.CardType.includes(item) }));
        let multiselect = { 'CardType': cards, };
        return (
            <div>
                <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                <Col xs="6" md="6" lg="4">
                    <FormGroup check inline>
                        <Input className="form-check-input" type="checkbox" id="inline-checkbox1" name="inline-checkbox1" onChange={(e) => {
                            console.log(e.target.checked)
                            this.setState({ addTC: { ...this.state.addTC, Jenkin: e.target.checked }, errors: { ...this.state.errors, Jenkin: null } })} }
                        value={this.state.addTC && this.state.addTC.Jenkin} />
                        <Label className="form-check-label" htmlFor="inline-checkbox1">Is Jenkins Build?</Label>
                      </FormGroup>
                        {/* <FormGroup className='rp-app-table-value'>
                            <Label className='rp-app-table-label' htmlFor='Type'>Is Jenkin Build? {
                                this.state.errors.Jenkin &&
                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors.Jenkin}</i>
                            }</Label>
                            {
                                <Input style={{ borderColor: this.state.errors.Jenkin ? 'red' : '' }} className='rp-app-table-value' type="checkbox" value={this.state.addTC && this.state.addTC.Jenkin}
                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Jenkin: e.target.value }, errors: { ...this.state.errors, Jenkin: null } })} >
                                </Input>
                            }
                        </FormGroup> */}
                    </Col>
                </FormGroup>
                <FormGroup row className="my-0">

                    <Col xs="6" md="6" lg="4">
                        <FormGroup className='rp-app-table-value'>
                            <Label className='rp-app-table-label' htmlFor='Type'>Type {
                                this.state.errors.Type &&
                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors.Type}</i>
                            }</Label>
                            {
                                <Input style={{ borderColor: this.state.errors.Type ? 'red' : '' }} className='rp-app-table-value' type="select" id="Type" name="Type" value={this.state.addTC && this.state.addTC.Type}
                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Type: e.target.value }, errors: { ...this.state.errors, Type: null } })} >
                                    <option value=''>Select Type</option>
                                    <option value='E2E'>E2E</option>
                                    <option value='Longevity'>Longevity</option>
                                    <option value='Stress'>Stress</option>
                                </Input>
                            }
                        </FormGroup>
                    </Col>
                    {/* {

                        this.state.addTC.Type &&

                        [
                            { field: 'CardType', header: 'Card Type' },
                        ].map(item => (
                            <Col xs="6" md="6" lg="4">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}
                                        {
                                            this.state.errors[item.field] &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                        }</Label>
                                    {
                                        <div><Multiselect buttonClass='rp-app-multiselect-button' onChange={(e, checked, select) => this.selectMultiselect(item.field, e, checked, select)}
                                            data={multiselect[item.field]} multiple /></div>
                                    }
                                </FormGroup>
                            </Col>
                        ))

                    } */} {
                        
                            this.state.addTC.Type &&
                    
                              <Col xs="6" md="6" lg="4">
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor='Setup'>Setup  {
                                                this.state.errors['Setup'] &&
                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors['Setup']}</i>
                                            }</Label>
                                            {
                                                <Input style={{ borderColor: this.state.errors['Setup'] ? 'red' : '' }} className='rp-app-table-value' type="text" placeholder={`Add Setup`} id='Setup' name='Setup' value={this.state.addTC && this.state.addTC['Setup']}
                                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, ['Setup']: e.target.value }, errors: { ...this.state.errors, ['Setup']: null } })} >

                                                </Input>
                                            }
                                        </FormGroup>
                                    </Col>
    }
                    {
                        this.state.addTC.Type &&
                        [
                            { field: 'CardType', header: 'Card Type' },
                        ].map((item, index) => (
                            <Col xs="6" md="6" lg="4">
                                <FormGroup className='rp-app-table-value'>
                                    <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                        this.state.errors[item.field] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                    }</Label>
                                    <Input style={{ borderColor: this.state.errors['CardType'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="CardType" name="CardType" value={this.state.addTC && this.state.addTC.CardType}
                                        onChange={(e) => this.setState({ addTC: { ...this.state.addTC, CardType: e.target.value }, errors: { ...this.state.errors, CardType: null } })} >
                                        <option value=''>Select Card Type</option>
                                        <option value='BOS'>BOS</option>
                                        <option value='NYNJ'>NYNJ</option>
                                        <option value='SOFTWARE'>SOFTWARE</option>
                                    </Input>
                                </FormGroup>
                            </Col>))
                    }
                                                            {
                        this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 && this.state.addTC.Type === 'E2E' &&
                        <React.Fragment>
                            {
                                [
                                    { field: 'Tag', header: 'Tag', type: 'text', SanityType: 'E2E' },
                                ].map((item, index) => (
                                    <Col xs="6" md="6" lg="4">
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                this.state.errors[item.field] &&
                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                            }</Label>
                                            <Input style={{ borderColor: this.state.errors['Tag'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="Tag" name="Tag" value={this.state.addTC && this.state.addTC.Tag}
                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Tag: e.target.value }, errors: { ...this.state.errors, Tag: null } })} >
                                                <option value=''>Select Tag</option>
                                                <option value='SANITY'>SANITY</option>
                                                <option value='DAILY'>DAILY</option>
                                                <option value='WEEKLY'>WEEKLY</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>))
                            }
                        </React.Fragment>
                    }
                    {
                        this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 &&
                        <Col xs="6" md="6" lg="4">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Result">Date
                                                {
                                        this.state.errors['Date'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors['Date']}</i>
                                    }
                                </Label>
                                {
                                    <Input style={{ borderColor: this.state.errors['Date'] ? 'red' : '', width: '10rem'}} className='rp-app-table-value' type="date" id="Date" name="Date" value={this.state.addTC && this.state.addTC.Date}
                                        onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Date: e.target.value }, errors: { ...this.state.errors, Date: null } })} >
                                    </Input>
                                }
                            </FormGroup>
                        </Col>
                    }
                    {
                        this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 &&
                        <Col xs="6" md="6" lg="4">
                            <FormGroup className='rp-app-table-value'>
                                <Label className='rp-app-table-label' htmlFor="Result">Result
                                                {
                                        this.state.errors['Result'] &&
                                        <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors['Result']}</i>
                                    }
                                </Label>
                                {
                                    <Input style={{ borderColor: this.state.errors['Result'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="User" name="User" value={this.state.addTC && this.state.addTC.Result}
                                        onChange={(e) => this.setState({ addTC: { ...this.state.addTC, Result: e.target.value }, errors: { ...this.state.errors, Result: null } })} >
                                        <option value=''>Select Result</option>
                                        <option value='Pass'>Pass</option>
                                        <option value='Fail'>Fail</option>
                                    </Input>
                                }
                            </FormGroup>
                        </Col>
                    }
                    {
                        this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 &&
                        <React.Fragment>
                            {
                                [
                                    { field: 'Build', header: 'Build Number', type: 'text', SanityType: this.state.addTC.Type },
                                  
                                    { field: 'NoOfTCsPassed', header: 'No of Tcs Passed', type: 'number', SanityType: 'E2E' },
                                    { field: 'CfgFileUsed', header: 'Cfg File Used', type: 'text', SanityType: 'Stress' },
                                    // { field: 'LinkFlap', header: 'Link Flap', type: 'text', SanityType: 'Stress' },
                                    { field: 'NoOfIteration', header: 'No of Iterations', type: 'number', SanityType: 'Stress' },
                                    { field: 'NoOfDuration', header: 'Successful Duration (days)', type: 'number', SanityType: 'Longevity' },
                                    { field: 'Bugs', header: 'Bug Number', type: 'text', SanityType: this.state.addTC.Type },

                                ].map((item, index) => (

                                    item.SanityType === this.state.addTC.Type &&
                                    <Col xs="6" md="6" lg="4">
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                this.state.errors[item.field] &&
                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                            }</Label>
                                            {
                                                <Input style={{ borderColor: this.state.errors[item.field] ? 'red' : '' }} key={index} className='rp-app-table-value' type="text" placeholder={`Add ${item.header}`} id={item.field} name={item.field} value={this.state.addTC && this.state.addTC[item.field]}
                                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value }, errors: { ...this.state.errors, [item.field]: null } })} >

                                                </Input>
                                            }
                                        </FormGroup>
                                    </Col>
                                ))
                            }
                        </React.Fragment>
                    }

                    {
                        this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 && this.state.addTC.Type === 'Stress' &&
                        <React.Fragment>
                            {
                                [
                                    { field: 'LinkFlap', header: 'Link Flap', type: 'text', SanityType: 'Stress' },
                                ].map((item, index) => (
                                    <Col xs="6" md="6" lg="4">
                                        <FormGroup className='rp-app-table-value'>
                                            <Label className='rp-app-table-label' htmlFor={item.field}>{item.header}  {
                                                this.state.errors[item.field] &&
                                                <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                            }</Label>
                                            <Input style={{ borderColor: this.state.errors['LinkFlap'] ? 'red' : '' }} className='rp-app-table-value' type="select" id="LinkFlap" name="LinkFlap" value={this.state.addTC && this.state.addTC.LinkFlap}
                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, LinkFlap: e.target.value }, errors: { ...this.state.errors, LinkFlap: null } })} >
                                                <option value=''>Select Link-Flap</option>
                                                <option value='Yes'>Yes</option>
                                                <option value='No'>No</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>))
                            }
                        </React.Fragment>
                    }
                </FormGroup>
                {
                    this.state.addTC.Type && this.state.addTC.CardType && this.state.addTC.CardType.length > 0 &&
                    <FormGroup row className="my-0" style={{ marginTop: '1rem' }}>
                        {
                            [
                                { field: 'E2ESkipList', header: 'E2ESkipList', type: 'text', SanityType: 'E2E' },
                                { field: 'E2EFocus', header: 'E2EFocus', type: 'text', SanityType: 'E2E' },
                                { field: 'Notes', header: 'Notes', type: 'text', SanityType: this.state.addTC.Type },
                            ].map((item, index) => (
                                item.SanityType === this.state.addTC.Type &&
                                <Col xs="6" md="12" lg="12">
                                    <FormGroup className='rp-app-table-value'>
                                        <Label className='rp-app-table-label' htmlFor={item.field}>{item.header} {
                                            this.state.errors[item.field] &&
                                            <i className='fa fa-exclamation-circle rp-error-icon'>{this.state.errors[item.field]}</i>
                                        }</Label>
                                        {
                                            <Input className='rp-app-table-value' placeholder={'Add ' + item.header} type="textarea" rows='3' id={item.field} value={this.state.addTC && this.state.addTC[item.field]}
                                                onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value }, errors: { ...this.state.errors, [item.field]: null } })} >

                                            </Input>
                                        }
                                    </FormGroup>
                                </Col>
                            ))
                        }
                    </FormGroup>
                }
                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    {
                        !this.state.toggleMessage &&
                        <ModalHeader toggle={() => this.toggle()}>{
                            'Confirmation'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        {
                            this.state.toggleMessage ? this.state.toggleMessage : `Are you sure you want to make the changes?`
                        }
                    </ModalBody>
                    <ModalFooter>
                        {
                            !this.state.isUnderProgress &&
                            <Button color="primary" onClick={() => this.state.toggleMessage ? this.toggle() : this.save()}>Ok</Button>
                        }
                        {
                            !this.state.toggleMessage &&
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        }
                        
                    </ModalFooter>
                </Modal>
            </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    E2EEdit: state.testcase.e2eEdit //E2EEdit
})
export default connect(mapStateToProps, { saveE2E, getCurrentRelease, updateE2EEdit })(CreateResult);








