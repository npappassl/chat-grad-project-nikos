import React,{Component} from "react";

export default class DialogueContainer extends Component{
    constructor(props) {
        super(props);
    }
    renderEditUser(){
        return (
            <div id="editUserDialogue" className="dialogues" >
                <span className="closeDialogue" onClick={this.props.closeDialogue}>x</span>
                <form onSubmit={this.props.submiting}>
                    <h2 className="DialogueTitle">User Details</h2>
                    <span>{this.props.imgErrorMessage}</span>
                    <img className="avatarInDialogue" src={this.props.avatar} onError={this.props.eventHandlers.handleDeadimgLink} alt="this url seems to be broken :("/>
                    <input name="groupName" onChange={this.props.eventHandlers.value} value={this.props.value} placeholder="group name"></input>
                    <input name="avatar" onChange={this.props.eventHandlers.avatar} placeholder="paste an image Url here"></input>
                    <input className="button" type="submit"></input>
                </form>
            </div>
        );
    }
    renderMakeGroup(){
        return(
        <div id="makeGroupDialogue" className="dialogues" >
            <span className="closeDialogue" onClick={this.props.closeDialogue}>x</span>
            <form onSubmit={this.props.submiting}>
                <h2 className="DialogueTitle">Group Details</h2>
                <img className="avatarInDialogue" src={this.props.avatar} />
                <input name="groupName" onChange={this.props.eventHandlers.value} value={this.props.value} placeholder="group name"></input>
                <input name="avatar" onChange={this.props.eventHandlers.avatar} placeholder="paste an image Url here"></input>
                <h2 className="DialogueTitle">Participants</h2>
                <ul>
                {this.props.userList.map((participant) => {
                    return this.props.renderParticipantCheckBoxesEach(participant);
                })}
                </ul>
                <input id="makeGroupSubmit" className="button" type="submit"></input>
            </form>
        </div>
        );
    }
    renderEditGroup(){
        return(
        <div id="editGroupDialogue" className="dialogues" >
            <span className="closeDialogue" onClick={this.props.closeDialogue}>x</span>
            <form onSubmit={this.props.submiting}>
                <h2 className="DialogueTitle">Group Details</h2>
                <img className="avatarInDialogue" src={this.props.avatar} />
                <input name="groupName" onChange={this.props.eventHandlers.value} value={this.props.value} placeholder="group name"></input>
                <input name="avatar" onChange={this.props.eventHandlers.avatar} placeholder="paste an image Url here"></input>
                <input id="makeGroupSubmit" className="button" type="submit"></input>
            </form>
        </div>
        );
    }

    render(){
        if(this.props.type === "editUser"){
            return this.renderEditUser();
        } else if(this.props.type === "makeGroup"){
            return this.renderMakeGroup();
        } else if(this.props.type === "editGroup") {
            return this.renderEditGroup();
        }
    }
}
