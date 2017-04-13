import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectConversation,selectUser} from "../../actions/index";
import {sendConversationDetailRequest,
    sendReadConversationRequest, sendDeleteConversationMessagesRequest} from "../../actions/usersActions";
import UserListItem from "./user-list-item";
import Badge from "./badge-container";

class Conversations extends Component {
    constructor(props){
        super(props);
        this.selectUserAndUpdateSession = this.selectUserAndUpdateSession.bind(this);
    }
    selectUserAndUpdateSession(user,conversationId){
        this.props.selectConversation(conversationId);
        this.props.sendReadConversationRequest(conversationId,this.props.session._id);
        this.props.sendConversationDetailRequest(conversationId);
        this.props.selectUser(user);
    }
    eachItem(user,conversationId, unreadMessagesCount) {
        let activeConvCss = "";
        if (conversationId===this.props.activeConversation) {
            activeConvCss = "selected";
        }
        if (!user.group && this.props.userList.onlineUsers.indexOf(user.id) >= 0 ) {
            activeConvCss += " online";
        }

        return (
            <UserListItem key={conversationId} className={activeConvCss} user={user}
                selectUserAndUpdateSession={this.selectUserAndUpdateSession} conversationId={conversationId}
                unreadMessagesCount={unreadMessagesCount} sendDeleteConversationMessagesRequest={this.props.sendDeleteConversationMessagesRequest} />
        );
    }
    countUnreadMessages(convMessages, lastRead, groupBool) {
        let count = 0;
        for (let i in convMessages) {
            const countCondition = convMessages[i].timestamp > lastRead;
            if(countCondition &&
                (convMessages[i].userTo === this.props.session._id ||
                 groupBool)) {
                count++;
            }
        }
        return count;
    }
    renderList() {
        if (this.props.conversations==="loading") {
            return (
                <span>Loading...</span>
            );
        } else if(this.props.conversations) {
            return this.props.conversations.sort((a, b) => {
                return a.timestamp < b.timestamp;
            }).map((conversation) => {
                const unreadMessagesCount = this.countUnreadMessages(
                    conversation.messages, this.props.session.lastRead[conversation.id], conversation.group);
                if(conversation.group) {
                    for(let j in this.props.userList.groups){
                        if(conversation.userAlias === this.props.userList.groups[j].id)
                        return this.eachItem(this.props.userList.groups[j],conversation.id,unreadMessagesCount);
                    }
                } else {
                    for (let i in this.props.userList.users) {
                        if (conversation.participant === this.props.userList.users[i].id) {
                            return this.eachItem(this.props.userList.users[i], conversation.id, unreadMessagesCount);
                        }
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
        conversations: state.conversations,
        activeConversation: state.activeConversation
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        selectConversation: selectConversation,
        sendDeleteConversationMessagesRequest: sendDeleteConversationMessagesRequest,
        sendConversationDetailRequest: sendConversationDetailRequest,
        sendReadConversationRequest: sendReadConversationRequest      }, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
