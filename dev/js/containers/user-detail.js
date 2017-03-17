import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sendMessagesRequest} from "../actions/index"
/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class UserDetail extends Component {
    constructor(props){
        super(props);
        sendMessagesRequest(this.props.dispatch);
        setInterval( () =>{
            sendMessagesRequest(this.props.dispatch);
        } , 2000);
    }
    eachMsg(msg,i,classNames) {
        return (
            <li key={i} className={classNames}> {msg.msg} </li>
        );
    }
    renderMessages() {
        console.log("rendered messages");
        if(this.props.messages){
            return this.props.messages.map((msg,i) => {
                console.log(msg.from,this.props.session._id);
                if(msg.from === this.props.session._id &&
                msg.to === this.props.user.id){
                    return this.eachMsg(msg,i,"sent");
                } else if(msg.to === this.props.session._id &&
                msg.from === this.props.user.id){
                    return this.eachMsg(msg,i,"recieved");
                }
            });
        } else {
            return;
        }

    }
    render() {
        const {user} = this.props;
        if (!user) {
            return (<div></div>);
        }
        return (
            <div>
                <div>
                    <span id="userThumbSpan">
                        <img id="userThumb" height="64" src={user.thumbnail} />
                    </span>
                    <span id="userDetailSpan">
                        <span id="userName">{user.id} {user.last}</span>
                        <span id="userDescription">Description: {user.description}</span>
                    </span>
                </div>
                <ul id="messages">
                    {this.renderMessages()}
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
