import React from "react";
import {connect} from "react-redux";
import UserList from "./user-list"

class TypeaheadDiv extends React.Component {
    constructor(props){
        super(props);
    }
    eachUser(user){
        if(!user.id.match(this.props.filter)){
            return;
        }
        return (
            <li key={user.id}><img height="18" src={user.avatarUrl} />{user.id}</li>
        );
    }
    render(){
        if(!this.props.show){
            return (<div></div>);
        }
        return(
            <UserList givenUlId="typeaheadUl" users={this.props.users} session={this.props.session} />
        );
    }
}
function mapStateToProps(state) {
    return {
        users: state.users,
    };
}
export default connect(mapStateToProps)(TypeaheadDiv);
