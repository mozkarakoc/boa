import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import BIconComposer from '../BIconComposer';

let Remove = (props) => {
  return (
    <SvgIcon {...props} >
      <path d="M19 13H5v-2h14v2z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </SvgIcon>
  );
};

Remove.defaultProps = {
  viewBox: '0 0 24 24'
};

export default BIconComposer(Remove);
