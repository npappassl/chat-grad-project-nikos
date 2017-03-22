import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import UserList from '../containers/user-list';
import MessagesContainer from '../containers/messages-container';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import SearchFilterInput from "../containers/searchFilterInput";
import * as loginActions from "../actions/loginActions";
import * as messageActions from "../actions/messageActions";
import * as usersActions from "../actions/usersActions";

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        // const dis = this.props.dispatch;
        this.props.actions.sendSesionRequest();
        this.props.actions.sendAuthUriRequest();
    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
    }
    componentDidUpdate(){
        console.log("updated");
        if(this.props.serverTransactionTS.needToUpdate && this.props.session) {
            console.log("fetching everything");
            this.props.actions.loadMessages(this.props.session);
            this.props.actions.sendUsersRequest();
        }
    }
    renderNormal() {
        return (
            <div id="layout">
                <div id="UserList">
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
        serverTransactionTS: state.serverTransactionTS
    };
}
function mapDispatchToProps(dispatch){
    const allActions = {
        sendSesionRequest:loginActions.sendSesionRequest,
        sendAuthUriRequest:loginActions.sendAuthUriRequest,
        sendUsersRequest: usersActions.sendUsersRequest,
        loadMessages :messageActions.loadMessages
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
