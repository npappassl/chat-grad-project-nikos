import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectConversation,selectUser} from "../actions/index";
import {sendConversationsRequest, sendConversationDetailRequest,
    sendReadConversationRequest, sendDeleteConversationMessagesRequest} from "../actions/usersActions";
import Badge from "./badge-container";
class Conversations extends Component {
    constructor(props){
        super(props);
        console.log(this.props.session._id);
        this.props.sendConversationsRequest(this.props.session._id);
    }
    selectUserAndUpdateSession(user,conversationId){
        this.props.selectConversation(conversationId);
        this.props.sendReadConversationRequest(conversationId,this.props.session._id);
        this.props.sendConversationDetailRequest(conversationId);
        this.props.selectUser(user);
    }
    eachUser(user,conversationId, unreadMessagesCount, group) {
        let userId;
        if(user) {
            userId = user.id;
        } else {
            userId = group;
        }
        let badgeClassCss = "badge"
        if (unreadMessagesCount === 0) {
            badgeClassCss = "hidden";
        }
        let activeConvCss = "";
        if (conversationId===this.props.activeConversation) {
            activeConvCss = "selected";
        }

        if (user && this.props.userList.onlineUsers.indexOf(userId) >= 0 ) {
            activeConvCss += " online";
        }
        if(user)
        return (
            <li className={activeConvCss}
                key={conversationId}
                onClick={() => this.selectUserAndUpdateSession(user, conversationId)}
            >
                <img width="32" src={user.avatarUrl} />
                <Badge number={unreadMessagesCount} className={badgeClassCss} />
                {userId}
                <span className="deleteMessages" onClick={()=> this.props.sendDeleteConversationMessagesRequest(conversationId)}>x</span>
            </li>
        );
    }
    eachGroup(group,conversationId,unreadMessagesCount) {
        const activeConvCss = "";
        const badgeClassCss = "hidden";
        return (
            <li className={activeConvCss}
                key={conversationId}
                onClick={() => this.selectUserAndUpdateSession(group, conversationId)}
            >
                <img width="32" src={group.avatarUrl} />
                <Badge number={unreadMessagesCount} className={badgeClassCss} />
                {group.id}
                <span className="deleteMessages" onClick={()=> this.props.sendDeleteConversationMessagesRequest(conversationId)}>x</span>
            </li>
        );
    }
    countUnreadMessages(convMessages, lastRead) {
        let count = 0;
        for (let i in convMessages) {
            const countCondition = convMessages[i].timestamp > lastRead;
            if(countCondition && convMessages[i].userTo === this.props.session._id) {
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
                const unreadMessagesCount = this.countUnreadMessages(conversation.messages, this.props.session.lastRead[conversation.id])
                if(conversation.group) {
                    for(let j in this.props.userList.groups){
                        if(conversation.userAlias === this.props.userList.groups[j].id)
                        return this.eachGroup(this.props.userList.groups[j],conversation.id,unreadMessagesCount);
                    }
                } else {
                    for (let i in this.props.userList.users) {
                        if (conversation.participant === this.props.userList.users[i].id) {
                            return this.eachUser(this.props.userList.users[i], conversation.id, unreadMessagesCount);
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
        sendConversationsRequest: sendConversationsRequest,
        sendConversationDetailRequest: sendConversationDetailRequest,
        sendReadConversationRequest: sendReadConversationRequest      }, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
