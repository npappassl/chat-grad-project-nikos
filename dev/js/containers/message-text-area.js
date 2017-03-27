import React, {Component} from "react";
import {connect} from "react-redux";
import {sendMessageRequest,loadMessages} from "../actions/messageActions";
import {sendServerTransactionRequest} from "../actions/loginActions";
import {bindActionCreators} from "redux";

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
        event.preventDefault();
        const obj = {
            conversationId: this.props.activeConversation,
            userTo: this.props.userTo.id,
            userFrom: this.props.userFrom._id,
            msg : this.state.value
        };
        this.setState({value: ""});
        this.props.actions.sendMessageRequest(obj);
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
        userFrom: state.session,
        activeConversation: state.activeConversation
    };
}
function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators({
          loadMessages: loadMessages,
          sendServerTransactionRequest: sendServerTransactionRequest,
          sendMessageRequest: sendMessageRequest
      }, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MessageTextArea);
