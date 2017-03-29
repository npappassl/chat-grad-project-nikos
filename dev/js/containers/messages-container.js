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
    eachMsg(msg,i,classNames,sender) {
        console.log(msg);
        return (
            <li key={i} className={classNames}>
                <span className="timestamp">{Math.floor((msg.timestamp%86400000)/(60*60*1000))+":"+Math.floor((msg.timestamp%3600000)/(60*1000))}</span>
                <br />{msg.msg} </li>
        );
    }
    componentDidMount(){
        // document.getElementById('userDetailWrap').scrollTop = 1000000;
    }
    componentWillUpdate(){
        // document.getElementById('userDetailWrap').scrollTop = 1000000;
        // this.props.actions.loadMessages(this.props.session);

    }
    renderMessages() {
        console.log("rendered messages");
        console.log(this.props.messages);
        if(this.props.messages.messages){
            return this.props.messages.messages.map((msg,i) => {
                console.log(msg,i);
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
function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(messageActions, dispatch)
    };
}

export default connect(mapStateToProps)(MessagesContainer);
// export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
