import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {bindActionCreators} from 'redux';
import MessageDetail from "./message-detail-container";
/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class MessagesContainer extends Component {
    constructor(props){
        super(props);
    }
    eachMsg(msg,i,classNames,sender) {
        console.log(msg);
        return (
            <MessageDetail key={i} msg={msg} className={classNames} />
            // <li key={i} className={classNames}>
            //     <span className="timestamp">{this.getTime(msg)}</span>
            //     <br />{msg.msg}
            // </li>
        );
    }
    renderMessages() {
        console.log("rendered messages");
        if(this.props.messages.messages && this.props.activeConversation){
            return this.props.messages.messages.map((msg,i) => {
                if (msg.userFrom === this.props.session._id) {
                    return this.eachMsg(msg,i,"sent");
                } else if (msg.userFrom === this.props.user.id) {
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
            return (<div id="userDetailWrap"></div>);
        }
        return (
            <div id="userDetailWrap">
                <div>
                    <span id="userDetailSpan">
                        <span id="userThumbSpan">
                            <img id="userThumb" height="64" src={user.avatarUrl} />
                        </span>
                        <span id="userName">
                            <span >{user.id} {user.last}</span>
                            <span id="userDescription">Description: {user.description}</span>
                        </span>
                    </span>
                </div>
                <ul id="messages">
                    <ReactCSSTransitionGroup
                    transitionName="example"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                        {this.renderMessages()}
                    </ReactCSSTransitionGroup>
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
        session: state.session,
        activeConversation: state.activeConversation
    };
}
function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(messageActions, dispatch)
    };
}

export default connect(mapStateToProps)(MessagesContainer);
// export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
