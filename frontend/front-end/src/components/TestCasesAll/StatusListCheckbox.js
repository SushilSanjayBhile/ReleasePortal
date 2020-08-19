import React from 'react'

export const StatusListCheckBox = props => {
    return (
      
      <>
        <input style={{ marginLeft: '1rem' }} key={props.id} onClick={props.handleCheckChildElementStatusFilter} type="checkbox" checked={props.isChecked} value={props.value} /> {props.value}
      </>
    )
}

export default StatusListCheckBox;