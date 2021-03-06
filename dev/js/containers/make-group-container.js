import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import UserList from "./sidebar/user-list";
import DialogueContainer from "./dialogue-container";
import {closeMakeGroupDialogue, sendNewGroupRequest} from "../actions/groupActions";

class MakeGroupDialogue extends Component{
    constructor(props) {
        super(props);
        this.state = {value: "", avatar:"", participants:[]};
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
        this.handleChangeParticipants = this.handleChangeParticipants.bind(this);

        this.renderParticipantCheckBoxesEach = this.renderParticipantCheckBoxesEach.bind(this);

        this.makeNewGroup = this.makeNewGroup.bind(this);
    }
    handleChange(event){
        this.setState({value: event.target.value});
    }
    handleChangeAvatar(event){
        this.setState({avatar: event.target.value});
    }
    handleChangeParticipants(event){
        console.log(event);
        let tempParticipants = [];
        let ulParticipants = event.target.parentNode.parentNode.children;
        for(const index in ulParticipants){
            const li = ulParticipants[index];
            if(li.children) {
                const input = li.getElementsByTagName("input")[0];
                if(input.checked) {
                    tempParticipants.push(input.value);
                }
                console.log("li",input.value, input.checked);
            }
        }
        console.log(tempParticipants);
        this.setState({participants: tempParticipants});
    }
    makeNewGroup(event) {
        console.log(event);
        event.preventDefault();
        this.props.actions.closeMakeGroupDialogue();
        this.props.actions.sendNewGroupRequest(
            this.state.value, this.state.avatar, this.state.participants, this.props.sessionId
        );

    }
    renderParticipantCheckBoxesEach(participant) {
        return (
                <li key={participant.id}>
                    <img width="20px" src={participant.avatarUrl} />
                    <span>{participant.id}</span>
                    <input  type="checkbox" onChange={this.handleChangeParticipants} value={participant.id} />
                </li>
        );
    }
    render() {
        if(!this.props.showHideDialogue) {
            return (
                <div></div>
            );
        } else {
            return(
                <DialogueContainer type="makeGroup" closeDialogue={this.props.actions.closeMakeGroupDialogue}
                    avatar={this.state.avatar} userList={this.props.userList}
                    renderParticipantCheckBoxesEach = {this.renderParticipantCheckBoxesEach}
                    submiting={this.makeNewGroup}
                    eventHandlers={{
                        avatar:this.handleChangeAvatar,
                        value: this.handleChange,
                    }}    />
            );
        }
    }
}
function mapStateToProps(state) {
    return {
        showHideDialogue: state.showHideDialoguesMakeG,
        userList: state.users.users,
        sessionId: state.session._id
    };
}

function mapDispatchToProps(dispatch){
    return {
      actions: bindActionCreators({
          closeMakeGroupDialogue: closeMakeGroupDialogue,
          sendNewGroupRequest: sendNewGroupRequest
      }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MakeGroupDialogue);
