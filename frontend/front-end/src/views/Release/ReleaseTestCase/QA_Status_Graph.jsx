import React, { Component } from 'react';

import ReleaseTestCase from './ReleaseTestCase';
import GUIReleaseTestCase from './GUIReleaseTestCase';

export default class QA_Status_Graph extends Component{
    render(){
        return(
            <div>
                <ReleaseTestCase />
                <GUIReleaseTestCase />
            </div>
        )
    }
}