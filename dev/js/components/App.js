import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import UserList from '../containers/user-list';
import MessagesContainer from '../containers/user-detail';
import MessageTextArea from '../containers/message-text-area';
import LoginScreen from "../containers/login-screen";
import * as loginActions from "../actions/loginActions";

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
    renderNormal() {
        return (
            <div id="layout">
                <div id="UserList">
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
        if(this.props.session){
            if(this.props.session._id){
                return this.renderNormal();
            }
        }
        return this.renderLogin();
    }
}
function mapStateToProps(state) {
    return {
        session: state.session,
        loginUri: state.loginUri,
    };
}
function mapDispatchToProps(dispatch){
    // return{
    //     getUri: () => {return bindActionCreators(loginActions.sendAuthUriRequest,dispatch)}
    // }
    return {
        actions: bindActionCreators(loginActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
