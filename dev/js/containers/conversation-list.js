import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectConversation,selectUser} from "../actions/index";
import {sendUsersRequest,sendConversationsRequest,sendConversationDetailRequest} from "../actions/usersActions";

class Conversations extends Component {
    constructor(props){
        super(props);
        console.log(this.props.session._id);
        this.props.sendConversationsRequest(this.props.session._id);
    }
    selectUserAndUpdateSession(user,conversationId){
        this.props.selectConversation(conversationId);
        this.props.sendConversationDetailRequest(conversationId);
        this.props.selectUser(user);
    }
    eachUser(user,conversationId) {
        return (
            <li
                key={conversationId}
                onClick={() => this.selectUserAndUpdateSession(user, conversationId)}
            >
                <img width="32" src={user.avatarUrl} />{user.id}
            </li>
        );
    }
    renderList() {
        if(this.props.conversations==="loading"){
            return (
                <span>Loading...</span>
            );
        } else if(this.props.conversations){
            const conversationsTemp = this.props.conversations.sort((a,b) => {
                return a.timestamp < b.timestamp;
            })
            return this.props.conversations.map((user) => {
                for(let i in this.props.userList){
                    if(user.participant === this.props.userList[i].id){
                        return this.eachUser(this.props.userList[i],user.id);
                    }
                }
            });
        }
    }

    render() {
        return (
                <ul>
                    {this.renderList()}
                </ul>
        );
    }

}

function mapStateToProps(state) {
    return {
        users: state.session.subscribedTo,
        userList: state.users,
        userFilter: state.searchFilter,
        messages: state.messages,
        session: state.session,
        conversations: state.conversations
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        selectConversation: selectConversation,
        sendUsersRequest:sendUsersRequest,
        sendConversationsRequest:sendConversationsRequest,
        sendConversationDetailRequest:sendConversationDetailRequest, }, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
