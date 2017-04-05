import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import UserList from '../containers/user-list';
import Conversations from '../containers/conversation-list';
import MessagesContainer from '../containers/messages-container';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import SearchFilterInput from "../containers/searchFilterInput";
import MakeGroupDialogue from "../containers/make-group-container";
import EditUserDialogue from "../containers/edit-user-container";

import SessionDetail from "../containers/session-detail-component"

import * as loginActions from "../actions/loginActions";
import * as usersActions from "../actions/usersActions";
import * as groupActions from "../actions/groupActions"

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        const self = this;
        const host = location.origin.replace(/^http/, 'ws');
        self.props.actions.sendSessionRequest();
        self.props.actions.sendAuthUriRequest();
        self.connectWS = connectWS;
        self.requests = requests;
        self.connectWS();

        function requests() {
            if (self.props.activeConversation) {
                self.props.actions.loadConversationDetail(self.props.activeConversation);
            }
            if (self.props.session._id) {
                self.props.actions.sendConversationsRequest(self.props.session._id);
                self.props.actions.sendSessionRequest(true);
            }
            self.props.actions.sendUsersRequest();
        }
        function connectWS() {
            console.log("trying to connect");
            // if(self.props.session){
                var ws = new WebSocket(host);
                ws.onmessage = function (event) {
                    console.log(event);
                    const data = JSON.parse(event.data);
                    self.requests();
                };
                console.log("connected");
            // } else {
                // console.log("will try again in 2");
                // setTimeout(self.connectWS, 2000);
            // }
        }

    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
    }
    renderNormal() {
        return (
            <div id="layout">
                <MakeGroupDialogue />
                <EditUserDialogue />
                <div id="UserList">
                    <div id="logoDiv">
                        <img id="logo" src="bitmapLogo.png" />
                    </div>
                    <hr />
                    <SessionDetail session={this.props.session} />
                    <h2>Conversations</h2>
                    <Conversations />
                    <h2>User List</h2>
                    <SearchFilterInput />
                    <UserList />
                    <button className="button" onClick={this.props.actions.openMakeGroupDialogue} id="createGroupButton">Create group</button>
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
        activeConversation: state.activeConversation,
    };
}
function mapDispatchToProps(dispatch){
    const allActions = {
        sendSessionRequest:loginActions.sendSessionRequest,
        sendAuthUriRequest:loginActions.sendAuthUriRequest,
        sendUsersRequest: usersActions.sendUsersRequest,
        loadConversationDetail: usersActions.sendConversationDetailRequest,
        sendConversationsRequest: usersActions.sendConversationsRequest,
        openMakeGroupDialogue: groupActions.openMakeGroupDialogue,
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
