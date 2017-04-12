import React,{Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {openEditUserDialogue} from "../../actions/usersActions";

class SessionDetail extends Component{
    constructor(props) {
        super(props);
    }
    showButton(event){
        if(event.target.id === "sessionUser"){
            event.target.children[1].children[0].style.display = "inline-block";
        }
    }
    render() {
        return (
            <span id="sessionUser" onClick={this.showButton}>
                <img id="sessionAvatar" src={this.props.session.avatarUrl} />
                {this.props.session._id}
                <a onClick={this.props.actions.openEditUserDialogue}><img id="cogButtonUser" src="cog64.png" /></a>
            </span>
        );
    }
}


function mapDispatchToProps(dispatch){
    return {
      actions: bindActionCreators({
          openEditUserDialogue: openEditUserDialogue
      }, dispatch)
    };
}

export default connect(null,mapDispatchToProps)(SessionDetail);
