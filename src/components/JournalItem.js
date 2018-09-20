import React, { Component } from "react";
import moment from "moment";
import { Divider, Grid, Popup } from "semantic-ui-react";

//
// this component is the individual journal item entered in by the user
//
export default class JournalItem extends Component {
  constructor(props) {
    super(props);

  }

  /// renders the component of the console view
  render() {
    const projectCell = (
      <div className="chunkTitle">{this.props.projectName}</div>
    );
    const taskCell = <div className="chunkTitle">{this.props.taskName}</div>;
    const chunkCell = <div className="chunkText">{this.props.description}</div>;
    const popupContent = (
      <div>
        <div>
          <i>{this.props.projectName}</i>
        </div>
        <div>
          <b>{this.props.taskName} </b>
        </div>
        <div>
          {this.props.taskSummary}
        </div>

        <Divider />
        <div>
          <span className="date">
            {this.props.position}
          </span>
        </div>
      </div>
    );

    return (
      <Grid.Row>
        <Grid.Column width={2}>
          <Popup
            trigger={projectCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Popup
            trigger={taskCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={12}>
          <Popup
            trigger={chunkCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
      </Grid.Row>
    );
  }
}
