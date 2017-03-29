import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class MessagesContainer extends Component {
    constructor(props){
        super(props);

        // console.log(allActions);
        // this.props.actions.loadMessages(this.props.session);
    }
    getTime(msg) {
        const hours = Math.floor((msg.timestamp%86400000)/(60*60*1000));
        const mins = Math.floor((msg.timestamp%3600000)/(60*1000));
        const placeholderZeroH = hours<10?"0":"";
        const placeholderZeroM = mins<10?"0":"";
        return placeholderZeroH + hours + ":"+ placeholderZeroM + mins;
    }
    eachMsg(msg,i,classNames,sender) {
        console.log(msg);
        return (
            <li key={i} className={classNames}>
                <span className="timestamp">{this.getTime(msg)}</span>
                <br />{msg.msg} </li>
        );
    }
    renderMessages() {
        console.log("rendered messages");
        if(this.props.messages.messages){
            this.props.messages.messages.sort((a, b) => {
                    return a.timestamp > b.timestamp
            })
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
function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(messageActions, dispatch)
    };
}

export default connect(mapStateToProps)(MessagesContainer);
// export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
