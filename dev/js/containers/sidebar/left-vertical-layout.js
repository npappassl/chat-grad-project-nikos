import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import SessionDetail from "./session-detail-component";
import UserList from './user-list';
import Conversations from './conversation-list';
import SearchFilterInput from "./searchFilterInput";
import * as groupActions from "../../actions/groupActions";

class LeftVerticalLayout extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div id="UserList">
                <div id="logoDiv">
                    <img id="logo" src="bitmapLogo.png" />
                </div>
                <SessionDetail session={this.props.session} />
                <h2>Conversations</h2>
                <Conversations />
                <h2>User List</h2>
                <SearchFilterInput users={this.props.users} dispatch={myEditUserDispatch}/>
                <UserList givenUlId="UserUserListUl" users={this.props.users} session={this.props.session} />
                <button className="button"
                    onClick={this.props.actions.openMakeGroupDialogue}
                    id="createGroupButton">
                    Create group
                </button>
            </div>
        );
    }
}
function mapStateToProps(state) {
    return {
        users: state.users,
        session: state.session,
    };
}
let myEditUserDispatch;
function mapDispatchToProps(dispatch){
    myEditUserDispatch = dispatch;
    const allActions = {
        openMakeGroupDialogue: groupActions.openMakeGroupDialogue,
    }
    return {
        actions: bindActionCreators(allActions, dispatch)
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(LeftVerticalLayout);
