import React, {Component} from "react";
import {connect} from "react-redux";
import {sendMessageRequest} from "../actions/messageActions"
// import {sendMessageRequest} from "../actions/index";
class MessageTextArea extends Component {
    constructor(props){
        super(props);
        this.state = {value: ""};
        this.handleChange = this.handleChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

    }
    handleChange(event){
        this.setState({value: event.target.value});
    }
    sendMessage(event){
        const obj = {
            userTo: this.props.userTo.id,
            userFrom: this.props.userFrom._id,
            msg : this.state.value
        };
        this.setState({value: ""});
        sendMessageRequest(obj);
        event.preventDefault();
    }
    render() {
        return (
            <div id="messageDiv">
                <form onSubmit={this.sendMessage} >
                    <input type="text" id="messageTextArea" value={this.state.value} onChange={this.handleChange} autoFocus></input>
                    <input id="submit-message" type="submit" value="send"></input>
                </form>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        userTo: state.activeUser,
        userFrom: state.session
    };
}

export default connect(mapStateToProps)(MessageTextArea);
