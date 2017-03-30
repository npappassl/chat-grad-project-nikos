import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectConversation,selectUser} from "../actions/index";
import {sendConversationsRequest, sendConversationDetailRequest,
    sendReadConversationRequest} from "../actions/usersActions";
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
    eachUser(user,conversationId, unreadMessagesCount) {
        let badgeClassCss = "badge"
        if (unreadMessagesCount === 0) {
            badgeClassCss = "hidden";
        }
        let activeConvCss = "";
        console.log(conversationId,this.props.activeConversation)
        if (conversationId===this.props.activeConversation) {
            activeConvCss = "selected";
        }
        return (
            <li className={activeConvCss}
                key={conversationId}
                onClick={() => this.selectUserAndUpdateSession(user, conversationId)}
            >
                <img width="32" src={user.avatarUrl} />
                <Badge number={unreadMessagesCount} className={badgeClassCss} />
                {user.id}
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

                for (let i in this.props.userList) {
                    if (conversation.participant === this.props.userList[i].id) {
                        return this.eachUser(this.props.userList[i], conversation.id, unreadMessagesCount);
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
        // sendUsersRequest: sendUsersRequest,
        sendConversationsRequest: sendConversationsRequest,
        sendConversationDetailRequest: sendConversationDetailRequest,
        sendReadConversationRequest: sendReadConversationRequest      }, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
