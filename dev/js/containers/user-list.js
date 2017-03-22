import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {selectUser} from "../actions/index";
import {sendUsersRequest, updateUserSeen} from "../actions/usersActions";

class UserList extends Component {
    constructor(props){
        super(props);
        this.props.sendUsersRequest();
    }
    selectUserAndUpdateSession(user){
        this.props.selectUser(user);
        const request = new Request("/api/user/subscribe/"+this.props.session._id +
                "/" + user.id, {
            method: 'PUT',
            credentials: 'include'
        });
        fetch(request);

    }
    eachUser(user) {
        return (
            <li
                key={user.id}
                onClick={() => this.selectUserAndUpdateSession(user)}
            >
                <img width="32" src={user.avatarUrl} />{user.id} {user.last}
            </li>
        );
    }
    renderList() {
        if(this.props.users==="loading"){
            return (
                <span>Loading...</span>
            );
        } else if(this.props.users){
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

// Get apps state and pass it as props to UserList
//      > whenever state changes, the UserList will automatically re-render
function mapStateToProps(state) {
    return {
        users: state.users,
        userFilter: state.searchFilter,
        session: state.session
        // hasErrored : state.usersHasErrored,
        // isLoading: state.usersIsLoading
    };
}

// Get actions and pass them as props to to UserList
//      > now UserList has this.props.selectUser
function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser,
        sendUsersRequest:sendUsersRequest}, dispatch
    );
}

// We don't want to return the plain UserList (component) anymore, we want to return the smart Container
//      > UserList is now aware of state and actions

export default connect(mapStateToProps, matchDispatchToProps)(UserList);
