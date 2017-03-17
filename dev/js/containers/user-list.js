import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {selectUser,sendUsersRequest} from '../actions/index';

class UserList extends Component {
    constructor(props){
        super(props);
        const { dispatch } = this.props;
        sendUsersRequest(dispatch);
    }
    eachUser(user,dispatch) {
        return (
            <li
                key={user.id}
                onClick={() => dispatch(selectUser(user))}
            >
                <img width="32" src={user.avatarUrl} />{user.id} {user.last}
            </li>
        );
    }
    renderList() {
        let { dispatch } = this.props
        if(this.props.users){
            return this.props.users.map((user) => {
                return this.eachUser(user,dispatch);
            });
        } else {
            return;
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
        users: state.users
    };
}

// Get actions and pass them as props to to UserList
//      > now UserList has this.props.selectUser
// function matchDispatchToProps(dispatch){
//     return bindActionCreators({
//         selectUser: selectUser,
//         sendUsersRequest: sendUsersRequest}, dispatch
//     );
// }

// We don't want to return the plain UserList (component) anymore, we want to return the smart Container
//      > UserList is now aware of state and actions

export default connect(mapStateToProps)(UserList);
// export default connect(mapStateToProps, matchDispatchToProps)(UserList);
