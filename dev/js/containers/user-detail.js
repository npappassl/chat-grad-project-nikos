import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sendMessagesRequest} from "../actions/index"
/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class UserDetail extends Component {
    constructor(props){
        super(props);
    }
    componentWillUpdate(){
        sendMessagesRequest(this.props.dispatch);
    }
    eachMsg(msg) {
        return (
            <li key={msg.msg} className="message"> {msg.msg} </li>
        );
    }
    renderMessages(id) {
        console.log("rendered messages");
        if(this.props.messages){
            return this.props.messages.map((msg) => {
                console.log(msg.from,this.props.session._id);
                if(msg.from === this.props.session._id &&
                    msg.to === this.props.user.id){
                    return this.eachMsg(msg);
                }
            });
        } else {
            return;
        }

    }
    render() {
        if (!this.props.user) {
            return (<div></div>);
        }
        return (
            <div>
                <div>
                    <span id="userThumbSpan">
                        <img id="userThumb" height="64" src={this.props.user.thumbnail} />
                    </span>
                    <span id="userDetailSpan">
                        <span id="userName">{this.props.user.id} {this.props.user.last}</span>
                        <span id="userDescription">Description: {this.props.user.description}</span>
                    </span>
                </div>
                <ul id="messages">
                    {this.renderMessages(this.props.user.id)}
                </ul>
            </div>
        );
    }
}

// "state.activeUser" is set in reducers/index.js
function mapStateToProps(state) {
    return {
        user: state.activeUser,
        messages: state.messages,
        session: state.session
    };
}

export default connect(mapStateToProps)(UserDetail);
