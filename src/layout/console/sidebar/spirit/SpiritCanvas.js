import React, { Component } from "react";
import { DimensionController } from "../../../../controllers/DimensionController";

/**
 * the 2d html canvas react component class that ios user by the spirit
 */
export default class SpiritCanvas extends Component {
  /**
   * builds the canvas from properties
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.render3d = props.render3d;
    this.height = props.height;
    this.width = props.width;
    this.flameRating = 0;
  }

  /**
   * should render in 3d?
   */
  componentDidMount() {
    this.canvasEl = this.getCanvasEl();
    if (this.render3D === "true") {
      // TODO implement unity3d models and scene into this element
    } else {
      this.updateTorchieImage(this.flameRating);
    }
  }

  /**
   * update the properties
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    this.updateTorchieImage(this.flameRating);
  };

  /**
   * updates the torchie image on the screen
   * @param flameString
   */
  updateTorchieImage(flameRating) {
    let spiritImage = "",
      height = DimensionController.getSpiritCanvasHeight(),
      width = DimensionController.getSpiritCanvasWidth();

    if (flameRating >= 0) {
      spiritImage = "./assets/images/spirit.png";
    } else if (flameRating < 0) {
      spiritImage = "./assets/images/painSpirit.png";
    }

    let image = new Image();
    image.onload = () => {
      let canvas = this.getCanvasEl();
      if (canvas) {
        this.getCanvasEl()
          .getContext("2d")
          .drawImage(image, 0, 0, width, height);
      }
    };
    image.src = spiritImage;
  }

  /**
   * gets the htm canvase element
   * @returns {HTMLElement} - the dom from the viewport
   */
  getCanvasEl() {
    return document.getElementById("SpiritCanvas");
  }

  /**
   * renders the component on the screen
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <canvas
        id="SpiritCanvas"
        height={DimensionController.getSpiritCanvasHeight()}
        width={DimensionController.getSpiritCanvasWidth()}
      />
    );
  }
}
