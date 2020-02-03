// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label
} from 'reactstrap';
import './AppTable.scss';
import { TABLE_OPTIONS } from '../../constants';
class AppTable extends Component {
    cntr = 0;
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            edit: {},
            delete: {},
            add: [],
            addTC: {}
        }
    }
    updateTC = () => {

    }
    reset() {
        this.setState({
            isEditing: false,
            edit: {},
            delete: {},
            add: [],
            addTC: {}
        });
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    add = () => {
        let newItem = {};
        this.props.fieldAndHeader.forEach(item => { newItem[item.field] = '' });
        this.setState({ add: [...this.state.add, newItem] });
    }

    update = () => {
        let edited = {};
        Object.keys(this.state.edit).forEach(index => {
            if (this.state.edit[index]) {
                edited[index] = { old: this.props.data[index], new: this.state.edit[index] };
            }
        });
        let deleted = {};
        Object.keys(this.state.delete).forEach(index => {
            if (this.state.delete[index]) {
                deleted[index] = { old: this.props.data[index] };
            }
        });

        this.props.onUpdate({
            edit: edited, delete: deleted, add: this.state.add.filter(item => item)
        })
        this.toggle();
    }
    componentWillReceiveProps(newProps) {
        this.reset();
    }
    addOnTop = () => {
        return (
            this.state.isEditing &&
            this.state.add.map((row, rowIndex) => (
                row &&
                <tr>
                    {
                        this.props.fieldAndHeader.map((col) =>
                            <td>
                                <Input type={col.type} key={rowIndex}
                                    onChange={(e) => {
                                        let currentState = this.state.add;
                                        currentState[rowIndex][col.field] = e.target.value;
                                        this.setState({ add: [...currentState] })
                                    }}
                                    value={row[col.field]}
                                    placeholder={row[col.field]} />
                            </td>)
                    }

                    <td style={{ padding: '0.4rem' }}>
                        <Row>
                            <Col xs="12" md="12" lg="12">
                                <span style={{ color: 'green' }}>Added</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="12" md="12" lg="12">
                                {
                                    <Button size="md" color="trsaparent" onClick={() => {
                                        let currentState = this.state;
                                        if (currentState.add[rowIndex]) {
                                            currentState.add[rowIndex] = null;
                                        }
                                        this.setState({ ...currentState });
                                    }}><i className="fa fa-undo"></i></Button>
                                }

                            </Col>
                        </Row>
                    </td>
                </tr>
            ))
        )
    }
    render() {
        return (
            <div>

                {
                    !this.props.titleless &&
                    <div className='rp-app-table-header'>
                        <span className='rp-app-table-title'>{this.props.title}</span>

                        {
                            this.props.currentUser && this.props.currentUser.isAdmin && this.props.editOptions && this.props.editOptions.length ?
                                this.state.isEditing ?
                                    <Fragment>
                                        <Button title="Save" size="md" color="transparent" className="float-right rp-rb-save-btn" onClick={() => this.toggle()} >
                                            <i className="fa fa-check-square-o"></i>
                                        </Button>
                                        <Button size="md" color="transparent" className="float-right" onClick={() => this.reset()} >
                                            <i className="fa fa-undo"></i>
                                        </Button>
                                        {
                                            this.props.editOptions.length && this.props.editOptions.includes(TABLE_OPTIONS.ADD) && this.state.isEditing &&
                                            <Button size="md" color="transparent" className="float-right" onClick={() => this.add()} >
                                                <i className="fa fa-plus-square-o"></i>
                                            </Button>
                                        }
                                    </Fragment>
                                    :
                                    <Button size="md" color="transparent" className="float-right" onClick={() => this.setState({ isEditing: true })} >
                                        <i className="fa fa-pencil-square-o"></i>
                                    </Button>
                                : null
                        }
                    </div>
                }
                {
                    this.props.addTestCase &&
                    <div>
                        {
                            this.props.fieldAndHeader.map((item, index) =>
                                <Input
                                    type="text"
                                    key={index}
                                    onChange={(e) => this.setState({ addTC: { ...this.state.addTC, [item.field]: e.target.value } })}
                                    placeholder={'Add ' + item.header}
                                    value={this.state.addTC[item.field] ? this.state.addTC[item.field] : item.header}
                                />)
                        }

                    </div>
                }


                <div className={this.props.restrictHeight}>


                    <Table scroll responsive style={{ overflow: 'scroll', }}>
                        {
                            !this.props.headless &&
                            <thead>
                                <tr>
                                    {
                                        this.props.fieldAndHeader.map(item => <th>{item.header}</th>)
                                    }
                                    {
                                        this.state.isEditing &&
                                        <th>Actions</th>
                                    }
                                </tr>
                            </thead>
                        }
                        <tbody>
                            {
                                this.props.addOnTop &&
                                this.addOnTop()
                            }
                            {
                                this.props.data && this.props.data.map((row, rowIndex) => {
                                    return (
                                        <tr>
                                            {
                                                row &&
                                                (
                                                    this.props.fieldAndHeader.map((col, colIndex) =>
                                                        (this.props.editOptions && this.props.editOptions.includes(TABLE_OPTIONS.EDIT) && this.state.isEditing && !this.state.delete[rowIndex] && !col.restrictUpdate
                                                            && !(this.props.restrictRowIndexForUpdate && this.props.restrictRowIndexForUpdate.includes(rowIndex))
                                                        ) ?
                                                            <td>
                                                                <Input
                                                                    className={col.field === 'key' ? 'rp-app-table-key' : ''}
                                                                    type={this.props.exceptionTypeForRowIndex && this.props.exceptionTypeForRowIndex[rowIndex] ? this.props.exceptionTypeForRowIndex[rowIndex] : col.type}
                                                                    key={rowIndex + colIndex}
                                                                    onChange={(e) => this.setState({ edit: { ...this.state.edit, [rowIndex]: { ...row, [col.field]: e.target.value } } })}
                                                                    placeholder={row[col.field]}
                                                                    value={this.state.edit[rowIndex] ? this.state.edit[rowIndex][col.field] : row[col.field]}
                                                                />
                                                            </td> :
                                                            <td className={col.field === 'key' ? 'rp-app-table-key' : ''}>{row[col.field]}</td>)
                                                )
                                            }
                                            {
                                                this.state.isEditing &&
                                                <td style={{ padding: '0.4rem' }}>
                                                    <Row>
                                                        <Col xs="12" md="12" lg="12">
                                                            <Row>
                                                                <Col xs="12" md="12" lg="12">
                                                                    {
                                                                        this.state.edit[rowIndex] && <span style={{ color: 'blue', float: 'left', marginTop: '0.3rem' }}>Edited</span>
                                                                    }
                                                                    {
                                                                        this.state.delete[rowIndex] && this.props.editOptions.includes(TABLE_OPTIONS.DELETE) &&
                                                                        <span style={{ color: 'red', float: 'left', marginTop: '0.3rem' }}>
                                                                            Deleted
                                                            </span>
                                                                    }

                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs="12" md="12" lg="12">
                                                                    {
                                                                        (this.state.edit[rowIndex] || this.state.delete[rowIndex]) ?
                                                                            <Button size="md" color="transparent" className="float-right" onClick={() => {
                                                                                let currentState = this.state;
                                                                                if (currentState.edit[rowIndex]) {
                                                                                    currentState.edit[rowIndex] = null;
                                                                                }
                                                                                if (currentState.delete[rowIndex]) {
                                                                                    currentState.delete[rowIndex] = null;
                                                                                }
                                                                                this.setState({ ...currentState });
                                                                            }}> <i className="fa fa-undo"></i></Button> :
                                                                            this.props.editOptions.includes(TABLE_OPTIONS.DELETE) &&
                                                                            <Button size="md" color="transparent" className="float-right" onClick={() => {
                                                                                let currentState = this.state;
                                                                                if (currentState.edit[rowIndex]) {
                                                                                    currentState.edit[rowIndex] = null;
                                                                                }
                                                                                currentState.delete[rowIndex] = true;
                                                                                this.setState({ ...currentState });
                                                                            }}>
                                                                                <i style={{ color: 'red' }} className="fa fa-trash-o"></i>
                                                                            </Button>
                                                                    }
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>


                                                </td>
                                            }
                                        </tr>
                                    )
                                })
                            }
                            {
                                this.addOnTop()
                            }

                        </tbody>
                    </Table>
                </div>

                {/* <Pagination>
                            <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                            <PaginationItem active>
                                <PaginationLink tag="button">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                            <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                            <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                            <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                        </Pagination> */}

                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    <ModalHeader toggle={() => this.toggle()}>Confirmation</ModalHeader>
                    <ModalBody>
                        Are you sure you want to make the changes?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.props.addTestCase ? this.updateTC() : this.update()}>Ok</Button>{' '}
                        <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div >
        )
    }
}

export default AppTable;