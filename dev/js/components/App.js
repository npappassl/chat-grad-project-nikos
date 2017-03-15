import React, {Component} from 'react';
import {connect} from 'react-redux';
import UserList from '../containers/user-list';
import UserDetails from '../containers/user-detail';
import MessageTextArea from '../containers/message-text-area';

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            login: false
        };
    }
    isLoggedIn() {
        this.state.login=true;
    }
    renderLogin() {
        return(<a onClick={this.isLoggedIn}>Log In</a>);
    }
    renderNormal() {
        return (
            <div id="layout">
            <div id="UserList">
            <h2>User List</h2>
            <UserList />
            </div>
            <div id="rightVerticalLayout">
            <UserDetails />
            <MessageTextArea />
            </div>
            </div>
        );
    }
    render() {
        // this.isLoggedIn();
        if(!this.state.login){
            return this.renderLogin();
        } else{
            return this.renderNormal();
        }
    }
}
// function mapStateToProps(state) {
//     return {
//         login: true,
//         loginUri:state.loginUri
//     };
// }
export default App;
