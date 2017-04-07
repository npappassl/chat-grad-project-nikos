import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MessagesContainer from '../containers/messages-container';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import MakeGroupDialogue from "../containers/make-group-container";
import EditUserDialogue from "../containers/edit-user-container";
import LeftVerticalLayout from "../containers/left-vertical-layout";

import * as loginActions from "../actions/loginActions";
import * as usersActions from "../actions/usersActions";

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
                <LeftVerticalLayout />
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
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
