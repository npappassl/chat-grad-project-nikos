import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import DialogueContainer from "./dialogue-container";
import {closeEditGroupDialogue, sendEditGroupRequest} from "../actions/groupActions";

class EditGroupDialogue extends Component{
    constructor(props) {
        super(props);
        this.state = {value: "", avatar: ""};
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAvatar = this.handleChangeAvatar.bind(this);

        this.editGroup = this.editGroup.bind(this);
    }
    handleChange(event){
        this.setState({value: event.target.value});
    }
    handleChangeAvatar(event){
        this.setState({avatar: event.target.value});
    }
    editGroup(event) {
        console.log(event);
        event.preventDefault();
        this.props.actions.closeEditGroupDialogue();
        const conversationGroup = this.props.conversations.filter((conversation) => {
            return this.props.activeConversation === conversation.id;
        })[0];
        const userAlias = conversationGroup.userAlias;
        const group = this.props.groups.filter((user) => {
            console.log(user.id,userAlias);
            return user.id === userAlias;
        })[0];
        console.log(group);
        const groupAvatar = group.avatarUrl;
        this.props.actions.sendEditGroupRequest(
            userAlias, this.state.avatar || groupAvatar, this.state.value || group.name
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
                <DialogueContainer type="editGroup" closeDialogue={this.props.actions.closeEditGroupDialogue}
                    avatar={this.state.avatar}
                    submiting={this.editGroup}
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
        showHideDialogue: state.showHideDialoguesEditG,
        conversations: state.conversations,
        groups:state.users.groups,
        activeConversation: state.activeConversation
    };
}
function mapDispatchToProps(dispatch){
    return {
      actions: bindActionCreators({
          closeEditGroupDialogue: closeEditGroupDialogue,
          sendEditGroupRequest: sendEditGroupRequest
      }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditGroupDialogue);
