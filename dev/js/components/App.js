import React, {Component} from 'react';
import {connect} from 'react-redux';
import UserList from '../containers/user-list';
import UserDetails from '../containers/user-detail';
import MessageTextArea from '../containers/message-text-area';

require('../../scss/style.scss');
var self;
class App extends Component {
    renderLogin() {
        return(<a href={this.props.loginUri}>Log In</a>);
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
        if(!this.props.login){
            return this.renderLogin();
        } else{
            return this.renderNormal();
        }
    }
}
function mapStateToProps(state, ownProps) {
    return {
        login: state.login,
        loginUri: state.loginUri
    };
}
export default connect(mapStateToProps)(App);
