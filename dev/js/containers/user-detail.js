import React, {Component} from 'react';
import {connect} from 'react-redux';

/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */

class UserDetail extends Component {
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
                        <span id="userName">{this.props.user.first} {this.props.user.last}</span>
                        <span id="userDescription">Description: {this.props.user.description}</span>
                    </span>
                </div>
                <ul id="messages">
                    <li class="message"></li>
                </ul>
            </div>
        );
    }
}

// "state.activeUser" is set in reducers/index.js
function mapStateToProps(state) {
    return {
        user: state.activeUser
    };
}

export default connect(mapStateToProps)(UserDetail);
