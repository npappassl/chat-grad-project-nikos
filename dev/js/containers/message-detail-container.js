import React,{Component} from "react";
import {connect} from 'react-redux';

class MessageDetail extends Component{
    constructor(props) {
        super(props);
    }
    getTime(msg) {
        const hours = Math.floor((msg.timestamp%86400000)/(60*60*1000));
        const mins = Math.floor((msg.timestamp%3600000)/(60*1000));
        const placeholderZeroH = hours<10?"0":"";
        const placeholderZeroM = mins<10?"0":"";
        let time, newMins;
        const timeDiff = Math.floor((Date.now() - msg.timestamp)/(1000*60));
        if (timeDiff === 0) {
            time = "less than one minute ago";
        } else if (timeDiff < 60) {
            time = timeDiff + " minutes ago";
        } else if(timeDiff < 60*24) {
            time = placeholderZeroH + hours + ":"+ placeholderZeroM + mins;
        } else {
            let d = new Date(msg.timestamp);
            time = d.toLocaleString("en-GB");
        }
        return time;
    }
    render(){
        return (
            <li className={this.props.className}>
                <span className="timestamp">{this.getTime(this.props.msg)}</span>
                <br /><span className="messageText">{this.props.msg.msg}</span>
            </li>
        );
    }
}

export default MessageDetail;
