import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectUser} from "../actions/index";
import {sendUsersRequest} from "../actions/usersActions";

class Conversations extends Component {
    constructor(props){
        super(props);
        this.props.sendUsersRequest();
    }
    selectUserAndUpdateSession(user){
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
        if(this.props.userList==="loading"){
            return (
                <span>Loading...</span>
            );
        } else if(this.props.users){
            return this.props.users.map((user) => {
                for(let i in this.props.userList){
                    if(user.user === this.props.userList[i].id){
                        return this.eachUser(this.props.userList[i]);
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
        messages: state.messages
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        sendUsersRequest:sendUsersRequest}, dispatch
    );
}

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
