import React, {Component} from "react";
import Badge from "./badge-container";

class UserListItem extends Component {
    constructor(props){
        super(props);
    }
    renderConversationItem(props) {
        let badgeClassCss = "badge"
        if (props.unreadMessagesCount === 0) {
            badgeClassCss = "hidden";
        }

        return (
            <li
                className={this.props.className}
                onClick={() => this.props.selectUserAndUpdateSession(this.props.user,this.props.conversationId)}
            >
                <img width="32" src={this.props.user.avatarUrl} />
                <Badge number={props.unreadMessagesCount} className={badgeClassCss} />
                {this.props.user.name||this.props.user.id}
                 <span
                    className="deleteMessages"
                    onClick={() => this.props.sendDeleteConversationMessagesRequest(this.props.conversationId)}>
                        x</span>
            </li>
        );
    }
    renderUserItem(props) {
        return(
            <li
                className={this.props.className}
                onClick={() => this.props.selectUserAndUpdateSession(this.props.user,this.props.conversationId)}
            >
            <img width="32" src={this.props.user.avatarUrl} />{this.props.user.id}
            </li>
        );
    }
    render() {
        if(this.props.conversationId){
            return this.renderConversationItem(this.props);
        } else {
            return this.renderUserItem(this.props);
        }
    }
}

export default UserListItem;
