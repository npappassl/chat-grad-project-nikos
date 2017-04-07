import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {bindActionCreators} from 'redux';
import UserDetailSpan from "./user-detail-span.js"
import MessageDetail from "./message-detail-container";
import {openEditGroupDialogue} from "../actions/groupActions"
/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class MessagesContainer extends Component {
    constructor(props){
        super(props);
        this.props.actions.openEditGroupDialogue
    }
    eachMsg(msg,i,classNames,sender) {
        console.log(msg);
        return (
            <MessageDetail key={i} msg={msg} className={classNames} />
        );
    }
    renderMessages() {
        console.log("rendered messages");
        if(this.props.messages.messages && this.props.activeConversation){
            return this.props.messages.messages.map((msg,i) => {
                if (msg.userFrom === this.props.session._id) {
                    return this.eachMsg(msg,i,"sent");
                } else if (msg.userFrom === this.props.user.id || this.props.user.group) {
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
                    <UserDetailSpan user={user} openEditGroupDialogue={this.props.actions.openEditGroupDialogue} />
                </div>
                <ul id="messages">
                    <ReactCSSTransitionGroup
                    transitionName="example"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}
                    transitionAppearTimeout={500}
                    transitionLeave={false}
                    transitionEnter={false}
                    transitionAppear={true}>
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
      actions: bindActionCreators({
          openEditGroupDialogue: openEditGroupDialogue
      }, dispatch)
    };
}

export default connect(mapStateToProps)(MessagesContainer);
// export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
