import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import SessionDetail from "../containers/session-detail-component";
import UserList from '../containers/user-list';
import Conversations from '../containers/conversation-list';
import SearchFilterInput from "../containers/searchFilterInput";
import * as groupActions from "../actions/groupActions";

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
                <SearchFilterInput dispatch={myEditUserDispatch}/>
                <UserList />
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
