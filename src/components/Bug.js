// Message.js

import React, {Component} from 'react';

class Bug extends Component {

  render(){
    return (
      <div>
        {this.props.bug_name}
      </div>
    )
  }
}
export default Bug