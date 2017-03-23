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
            console.log("usersList",this.props.userList);
            console.log("users",this.props.users)
            return this.props.users.map((user) => {
                for(let i in this.props.userList){
                    if(user.user === this.props.userList[i].id){
                        return this.eachUser(this.props.userList[i]);
                    }
                }
                // user = this.props.userList._find((us) => {
                //     return us.id === user;
                // })
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
        users: state.session.subscribedTo,
        userList: state.users,
        userFilter: state.searchFilter
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

export default connect(mapStateToProps, matchDispatchToProps)(Conversations);
