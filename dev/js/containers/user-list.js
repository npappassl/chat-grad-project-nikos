import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {selectUser,selectConversation} from "../actions/index";
import {sendUsersRequest, updateUserSeen, sendConversationDetailRequest} from "../actions/usersActions";

class UserList extends Component {
    constructor(props){
        super(props);
        const self = this;
        self.props.sendUsersRequest();
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
    eachUser(user) {
        return (
            <li
                key={user.id}
                onClick={() => this.selectUserAndUpdateSession(user)}
            >
                <img width="32" src={user.avatarUrl} />{user.id}
            </li>
        );
    }
    renderList() {
        if(this.props.users==="loading"){
            return (
                <span>Loading...</span>
            );
        } else if(this.props.users){
            const tempUsers = this.props.users.sort((a, b) => {
                return a.id > b.id;
            })
            return this.props.users.map((user) => {
                if(this.props.userFilter === ""){
                    return this.eachUser(user);
                } else if(user.id.match(this.props.userFilter)){
                    return this.eachUser(user);
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
        users: state.users,
        userFilter: state.searchFilter,
        session: state.session,
        conversations: state.conversations,
        // hasErrored : state.usersHasErrored,
        // isLoading: state.usersIsLoading
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        sendUsersRequest:sendUsersRequest,
        selectConversation: selectConversation,
        sendConversationDetailRequest: sendConversationDetailRequest}, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(UserList);
