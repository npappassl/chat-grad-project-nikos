import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import UserList from '../containers/user-list';
import Conversations from '../containers/conversation-list';
import MessagesContainer from '../containers/messages-container';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import SearchFilterInput from "../containers/searchFilterInput";
import * as loginActions from "../actions/loginActions";
import * as usersActions from "../actions/usersActions";

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        const self = this;
        self.props.actions.sendSessionRequest();
        self.props.actions.sendAuthUriRequest();
        var host = location.origin.replace(/^http/, 'ws');
        var ws = new WebSocket(host);
        ws.onmessage = function (event) {
            console.log(event);
            const data = JSON.parse(event.data);
            if (self.props.activeConversation) {
                self.props.actions.loadConversationDetail(self.props.activeConversation);
            }
            if (self.props.session._id) {
                self.props.actions.sendConversationsRequest(self.props.session._id);
            }
            self.props.actions.sendUsersRequest();
            self.props.actions.sendSessionRequest(true);
            //
            // var li = document.createElement('li');
            // li.innerHTML = JSON.parse(event.data);
            // document.querySelector('#pings').appendChild(li);
        };
    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
    }
    renderNormal() {
        return (
            <div id="layout">
                <div id="UserList">
                    <h2>Conversations</h2>
                    <Conversations />
                    <hr />
                    <SearchFilterInput />
                    <h2>User List</h2>
                    <UserList />
                </div>
                <div id="rightVerticalLayout">
                    <MessagesContainer />
                    <MessageTextArea />
                </div>
            </div>
        );
    }
    render() {
        if(this.props.session) {
            if(this.props.session._id) {
                return this.renderNormal();
            } else if(this.props.session === "loading") {
                return (<span id="appPlaceholder">Loading...</span>);
            }
        }
        return this.renderLogin();
    }
}
function mapStateToProps(state) {
    return {
        session: state.session,
        loginUri: state.loginUri,
        activeConversation: state.activeConversation
    };
}
function mapDispatchToProps(dispatch){
    const allActions = {
        sendSessionRequest:loginActions.sendSessionRequest,
        sendAuthUriRequest:loginActions.sendAuthUriRequest,
        sendUsersRequest: usersActions.sendUsersRequest,
        loadConversationDetail: usersActions.sendConversationDetailRequest,
        sendConversationsRequest: usersActions.sendConversationsRequest
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
