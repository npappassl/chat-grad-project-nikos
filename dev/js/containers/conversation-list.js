import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectConversation,selectUser} from "../actions/index";
import {sendUsersRequest,sendConversationsRequest,sendConversationDetailRequest} from "../actions/usersActions";
import Badge from "./badge-container";
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
    eachUser(user,conversationId, unreadMessagesCount) {
        let classCss = "badge"
        if(unreadMessagesCount === 0) {
            classCss = "hidden";
        }
        return (
            <li
                key={conversationId}
                onClick={() => this.selectUserAndUpdateSession(user, conversationId)}
            >
                <img width="32" src={user.avatarUrl} />
                <Badge number={unreadMessagesCount} className={classCss} />
                {user.id}
            </li>
        );
    }
    countUnreadMessages(convMessages, lastRead) {
        let count = 0;
        for (let i in convMessages) {
            const countCondition = convMessages[i].timestamp > lastRead;
            if(countCondition) {
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
            const conversationsTemp = this.props.conversations.sort((a, b) => {
                return a.timestamp < b.timestamp;
            })
            return this.props.conversations.map((conversation) => {
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
