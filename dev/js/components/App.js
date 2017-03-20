import React, {Component} from 'react';
import {connect} from 'react-redux';
import UserList from '../containers/user-list';
import UserDetails from '../containers/user-detail';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import {sendAuthUriRequest, sendSesionRequest} from "../actions/index";

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        const dis = this.props.dispatch;
        sendAuthUriRequest(dis);
        sendSesionRequest(dis);
    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
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
        if(this.props.session){
            return this.renderNormal();
        } else{
            return this.renderLogin();
        }
    }
}
function mapStateToProps(state) {
    return {
        session: state.session,
        loginUri: state.loginUri,
    };
}
export default connect(mapStateToProps)(App);
