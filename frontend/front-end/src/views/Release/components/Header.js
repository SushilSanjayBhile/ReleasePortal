import React, { Component } from 'react';
import { Row, Col, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import './Header.scss';
const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { selected: 0 };
    }
    items = [
        { name: 'Summary', path: 'summary' },
        { name: 'Test Case', path: 'testcase' },
        { name: 'Storage' },
        { name: 'Network' },
        { name: 'Management' },
        { name: 'QoS' },
    ]
    render() {
        // eslint-disable-next-line
        const { children, ...attributes } = this.props;

        return (
            <div>
                <Row className='rp-release-header'>
                    {
                        this.items.map((item, id) =>
                            (
                                <Col xs="3" md="2" lg="1" className={id === this.state.selected ? 'rp-rh-selected-item' : 'rp-release-header-item'}
                                    onClick={() => {
                                        this.props.changePage({ page: id })
                                        this.setState({ selected: id })

                                        // item.path && this.props.navigation.navigate('release/' + item.path, { id: this.props.match.params.id })
                                        // && this.props.history.push(`/release/${item.path}/${this.props.match.params.id}`


                                    }}
                                >
                                    {/* <Link to={'/' + item.path + '/' + this.props.match.params.id}>
                                      
                                    </Link> */}
                                    {item.name}
                                </Col>)
                        )
                    }
                </Row>
            </div >
            // </React.Fragment>
        );
    }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default withRouter(Header);