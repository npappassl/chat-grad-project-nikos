import React, {Component} from "react";
import {connect} from "react-redux";
import {sendMessageRequest,loadMessages} from "../actions/messageActions"
import {bindActionCreators} from "redux";
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
        event.preventDefault();
        sendMessageRequest(obj,this.props.loadMessages,this.props.userFrom);
        // this.props.loadMessages();
    }
    render() {
        if(!this.props.userTo){
            return (<div></div>)
        }else{
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
}


function mapStateToProps(state) {
    return {
        userTo: state.activeUser,
        userFrom: state.session
    };
}
function mapDispatchToProps(dispatch) {
    return {
      loadMessages: bindActionCreators(loadMessages, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MessageTextArea);
