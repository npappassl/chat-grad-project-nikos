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
import * as messageActions from "../actions/messageActions";
import * as usersActions from "../actions/usersActions";

require('../../scss/style.scss');
class App extends Component {
    constructor(props){
        super(props);
        // const dis = this.props.dispatch;
        this.props.actions.sendSessionRequest();
        this.props.actions.sendAuthUriRequest();
        setInterval( () =>{
            if(this.props.session && this.props.session._id )
            this.props.actions.sendServerTransactionRequest();
        } , 4000);
    }
    renderLogin() {
        return (<LoginScreen loginUri={this.props.loginUri} />);
    }
    componentWillUpdate(){
        console.log("updated");
        if(this.props.serverTransactionTS.needToUpdate && this.props.session) {
            // this.setState({serverTransactionTS:{needToUpdate:false, timestamp:this.props.serverTransactionTS.timestamp}})
            if(this.props.session._id){
                this.setState({serverTransactionTS:{needToUpdate:false}});
                console.log("fetching everything");
                // this.props.actions.sendServerTransactionRequest();
                if(this.props.activeConversation){
                    // this.props.actions.loadConversationDetail(this.props.activeConversation);
                }
                // this.props.actions.sendUsersRequest();
                this.props.actions.sendSessionRequest(true);
            }
        }
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
        serverTransactionTS: state.serverTransactionTS,
        activeConversation: state.activeConversation
    };
}
function mapDispatchToProps(dispatch){
    const allActions = {
        sendSessionRequest:loginActions.sendSessionRequest,
        sendAuthUriRequest:loginActions.sendAuthUriRequest,
        sendServerTransactionRequest: loginActions.sendServerTransactionRequest,
        sendUsersRequest: usersActions.sendUsersRequest,
        loadConversationDetail: usersActions.sendConversationDetailRequest,
        loadMessages :messageActions.loadMessages
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
