import React, {Component} from 'react';
import {connect} from 'react-redux';

class MessageTextArea extends Component {
    render() {
        return (
            <div id="messageDiv">
                <form onSubmit="" >
                    <input type="text" id="messageTextArea"></input>
                    <input id="submit-message" type="submit" value="send"></input>
                </form>
            </div>
        );
    }
}

export default (MessageTextArea);
