import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import DialogueContainer from "./dialogue-container"
import {closeEditUserDialogue, sendUpdateUserDetailsRequest} from "../actions/usersActions"

class EditUserDialogue extends Component{
    constructor(props){
        super(props);
        this.state = {value: "", avatar:""};
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
    }
    componentDidMount() {
        this.setState({
            value:this.props.session._id,
            avatar: this.props.session.avatarUrl
        });
    }
    handleChange(event){
        this.setState({value: event.target.value});
    }
    handleChangeAvatar(event){
        this.setState({avatar: event.target.value});
    }

    render(){
        if(!this.props.showHideDialogue) {
            return (
                <div></div>
            );
        } else{
            return (
                <DialogueContainer type="editUser" closeDialogue={this.props.actions.closeEditUserDialogue}
                    avatar={this.state.avatar} value={this.state.value}
                    eventHandlers={{
                        value:this.handleChange,
                        avatar:this.handleChangeAvatar
                    }} />
                // <div id="editUserDialogue" className="dialogues" >
                //     <span className="closeDialogue" onClick={this.props.actions.closeEditUserDialogue}>x</span>
                //     <form>
                //         <h2 className="DialogueTitle">User Details</h2>
                //         <img className="avatarInDialogue" src={this.state.avatar} />
                //         <input name="groupName" onChange={this.handleChange} value={this.state.value} placeholder="group name"></input>
                //         <input name="avatar" onChange={this.handleChangeAvatar} placeholder="paste an image Url here"></input>
                //         <input className="button" type="submit"></input>
                //     </form>
                // </div>

            );
        }
    }
}

function mapStateToProps(state) {
    return {
        showHideDialogue: state.showHideDialoguesEditU,
        session: state.session
    };
}


function mapDispatchToProps(dispatch){
    return {
      actions: bindActionCreators({
          closeEditUserDialogue: closeEditUserDialogue,
          sendUpdateUserDetailsRequest: sendUpdateUserDetailsRequest
      }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditUserDialogue);
