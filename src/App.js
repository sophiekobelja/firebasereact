import React from 'react';
import * as firebase from "firebase";
import BugsList from './components/BugsList';
import Header from './components/Header';
import trim from 'trim';

var config = {
    apiKey: "AIzaSyBe5V4Xj9_D2JAWw-5k6gUeRTRtxfXPCSc",
    authDomain: "my-project-1475361030701.firebaseapp.com",
    databaseURL: "https://my-project-1475361030701.firebaseio.com",
    projectId: "my-project-1475361030701",
    storageBucket: "my-project-1475361030701.appspot.com",
    messagingSenderId: "791150778489"
  };
firebase.initializeApp(config);
class App extends React.Component {
  constructor(props) {

      super(props);
      this.onChange = this.onChange.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
      this.state = { 
        error: null,
        isLoaded: false,
        items: [],
        message: '',
        bugname: ''
      };
      let bugname = "bug_0"
    }

  onKeyup(e){
    if(e.keyCode === 13 ){
      e.preventDefault();
      let bugname = this.state.message; 
      console.log(bugname)
    
      this.setState({
        bugname: trim(bugname),
        message: '',
      });
    }
  }

  onChange(e){
      this.setState({
        message: e.target.value
      });
  }
  

  render() {
    return (
      <div className="container">
       <form>
        <textarea
            className="textarea"
            placeholder="Type a message"
            cols="100"
            onChange = {this.onChange}
            onKeyUp={this.onKeyup}
            value={this.state.message}>
          </textarea>
      </form>
            <div className="columns">
              <div className="column is-3"></div>
              <div className="column is-6">
                <BugsList db={firebase} bugname={this.state.bugname}/>
              </div>
            </div>
        </div>
    )
  }
}
export default App;
