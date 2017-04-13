import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {selectUser,selectConversation} from "../../actions/index";
import {updateUserSeen, sendConversationDetailRequest} from "../../actions/usersActions";
import UserListItem from "./user-list-item";

class UserList extends Component {
    constructor(props){
        super(props);
        this.selectUserAndUpdateSession = this.selectUserAndUpdateSession.bind(this);
    }
    selectUserAndUpdateSession(user){
        for( let i in this.props.conversations) {
            if(this.props.conversations[i].participant === user.id) {
                this.props.selectConversation(this.props.conversations[i].id);
                this.props.sendConversationDetailRequest(this.props.conversations[i].id);
                this.props.selectUser(user);
                return;
            }
        }
        this.props.selectConversation(null);
        this.props.selectUser(user);
    }

    getClassName(user) {
        if (this.props.users.onlineUsers.indexOf(user.id) >= 0 ) {
            return "online";
        } else {
            return "";
        }
    }

    eachUser(user) {
        const userClass = this.getClassName(user);
        return (
            <UserListItem
                key={user.id} className={userClass} user={user} conversationId={null}
                selectUserAndUpdateSession={this.selectUserAndUpdateSession} />
        );
    }
    renderPlaceHolder() {
        return (
            <span>Loading...</span>
        );
    }
    renderNormal() {
        return this.props.users.users.map((user) => {
            if(this.props.userFilter === ""){
                return this.eachUser(user);
            } else if(user.id.match(this.props.userFilter)){
                return this.eachUser(user);
            }
        });
    }
    renderList() {
        if(this.props.users==="loading"){
            return this.renderPlaceHolder();
        } else if(this.props.users.users){
            return this.renderNormal();
        }
    }

    render() {
        return (
            <ul id={this.props.givenUlId}>
                {this.renderList()}
            </ul>
        );
    }

}

function mapStateToProps(state) {
    return {
        userFilter: state.searchFilter,
        conversations: state.conversations
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        selectConversation: selectConversation,
        sendConversationDetailRequest: sendConversationDetailRequest}, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(UserList);
