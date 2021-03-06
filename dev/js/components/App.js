import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import LoginScreen from "../containers/login-screen";
import MakeGroupDialogue from "../containers/make-group-container";
import EditUserDialogue from "../containers/edit-user-container";
import EditGroupDialogue from "../containers/edit-group-container";

import LeftVerticalLayout from "../containers/sidebar/left-vertical-layout";
import RightVerticalLayout from "../containers/main/right-vertical-layout";

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
            var ws = new WebSocket(host);
            ws.onmessage = function (event) {
                console.log(event);
                const data = JSON.parse(event.data);
                console.log(data);

                self.requests();
            };
            console.log("connected");
        }

    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
    }
    renderNormal() {
        return (
            <div id="layout">
                <EditGroupDialogue />
                <MakeGroupDialogue />
                <EditUserDialogue />
                <LeftVerticalLayout />
                <RightVerticalLayout />
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
