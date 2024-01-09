import React from "react";
import Typed from "typed.js";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import compassImage from './images/Compass.svg';

import "./App.scss";

var moment = require("moment");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elapsedTime: 0
    };
  }

  pastPredictions = [];

  video = React.createRef();
  canvas = React.createRef();

  startDate = moment();
  duration = moment.duration(moment().diff(this.startDate));

  // Technobabble strings

  strings1 = [
    "CYBERDYNE SYSTEMS <br> SERIES 800 MODEL 101 <br> VERSION 2.4",
    "ANALYSIS: <br> ************ <br> 234654 453 38 <br> 654334 450 16 <br> 245261 856 26 <br> 453665 766 46 <br> 382856 863 09 <br> 356878 544 04 <br> 664217 985 89",
    "DEGREE ABSOLUTE <br><br> CHECKSUM 538904 <br><br> EXTRAPOLATION <br> LEVEL 230 B54 <br><br> GRID PRECISION <br> MODE 45854 223 <br><br> Z-BUFFER 52903 <br> ACCURACY MODE",
    "CODE: <br> ****** <br> 43H4 <br> 4B56 <br> 87YR <br> GER7 <br> 65F8 <br> 65F8 <br> T2GQ <br> 98FT <br><br> 756X <br> 90GF <br> SY77 <br> 64ER <br> TG77 <br><br> EOFX"
  ];
  strings2 = [
    "DISCONTINUITY <br> CHRONO 543-665 <br><br> ELAPSED TIME <br> MARK " +
    "00:00:00",
    "AUTO SET LINE <br> MODE 5892 TCB",
    "ADDRESS <br> CHECKSUM <br> VERIFIED <br><br> 45 97543 654 <br> 12 98845 766 <br> 28 23368 336 <br> 35 43645 <br> 31 41592"
  ];
  strings3 = [
    "DEFENSE SYSTEMS SET <br> ACTIVE STATUS <br> LEVEL 2347923 MAX",
    "CHECKSUM: 4390 <br><br> TRACKING MODE <br> FULL ISO LEVELS",
    "SEARCH CRITERIA <br> MATCH MODE 5498 <br><br> ALL LEVELS OPERATIVE"
  ];
  strings4 = [
    "SCAN MODE 43984 <br> SIZE ASSESSMENT <br><br> ASSESSMENT COMPLETE <br> DEFENSE SYSTEM SET <br><br> GRID PRECISION",
    "CRITERIA <br> ************ <br> HGHT  626 <br> WGHT  291 <br> NECK  554 <br> SHLD  326 <br> BACK  514 <br> INSM  321 <br> SLEV  062 <br> CHST  619 <br> COLR  180 <br> BICP  213 <br> QUAD  545 <br> THGH  505",
    "FIT PROBABILITY 0.99 <br><br> RESET TO ACQUISITION <br> MODE SPEECH LEVEL 100 <br><br> PRIORITY OVERRIDE"
  ];

  // Typed status options
  options = {
    strings: ["CONNECTING", "DIAGNOSTIC"],
    typeSpeed: 10,
    backSpeed: 0,
    fadeOut: true,
    backDelay: 3000,
    loop: false,
    showCursor: false,
    cursorChar: "█"
  };

  isSamePerson = false;

  detectFromVideoFrame = (model, video) => {
    model.detect(video).then(
      (predictions) => {
        this.showDetections(predictions);
      },
      (error) => {
        console.log("Couldn't start the webcam!");
        console.error(error);
      }
    );

    setTimeout(() => {
      requestAnimationFrame(() => {
        this.detectFromVideoFrame(model, video);
      });
    }, 1000);
  };

  showDetections = predictions => {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "600 24px Arial";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("VISUAL:", x + width, y + height);
      ctx.fillText(prediction.class.toUpperCase(), x + width, y + height + 24);
      ctx.fillText(
        (prediction.score.toFixed(2) * 100) + "% MATCH",
        x + width,
        y + height + 48
      );

      // Keep small history of past predictions
      this.pastPredictions.push(prediction);
      if (this.pastPredictions.length > 3) {
        this.pastPredictions.splice(0, 1);
      }

      /*  Specialized HUD Info */

      // Threat Detection
      if (
        prediction.class === "knife" ||
        prediction.class === "baseball bat" ||
        prediction.class === "scissors" ||
        prediction.class === "gun"
      ) {
        this.typedStatus = new Typed("#typedStatus", this.options);
        this.typedStatus.strings = ["THREAT ASSESSMENT"];
      }

      // Person Detection
      if ((prediction.class === "person") && !this.isSameObject) {
        this.typedStatus = new Typed("#typedStatus", this.options);
        this.typedStatus.strings = ["ANALYSIS"];
        this.typed2.strings = this.strings4;
      }

      if (this.pastPredictions.length >= 3) {
        this.search("person", this.pastPredictions);
      }
    });

    if (predictions.length === 0) {
      this.pastPredictions = [];
      this.isSamePerson = false;
      if (this.typedStatus) {
        this.typedStatus.destroy();
      }
    }
  };

  // Detect if same object has been in frame for at least 3 seconds - clear Status text if so
  search = (key, array) => {
    if (
      array[0].class === key &&
      array[1].class === key &&
      array[2].class === key
    ) {
      if (
        (array[0].bbox[0] + array[1].bbox[0] + array[2].bbox[0]) / 3 >=
        array[0].bbox[0] - 10 &&
        (array[0].bbox[0] + array[1].bbox[0] + array[2].bbox[0]) / 3 <=
        array[0].bbox[0] + 10 &&
        (array[0].bbox[1] + array[1].bbox[1] + array[2].bbox[1]) / 3 >=
        array[0].bbox[1] - 10 &&
        (array[0].bbox[1] + array[1].bbox[1] + array[2].bbox[1]) / 3 <=
        array[0].bbox[1] + 10
      ) {
        this.isSameObject = true;
        this.typedStatus.destroy();
        this.typed2.strings = this.strings2;
      }
    } else {
      this.isSameObject = false;
    }
  };

  componentDidMount() {
    this.typedStatus = new Typed("#typedStatus", this.options);

    // Default HUD info
    this.typed1 = new Typed("#typed1", {
      strings: this.strings1,
      typeSpeed: 0,
      backSpeed: 0,
      showCursor: false,
      fadeOut: true,
      startDelay: 1500,
      backDelay: 3000,
      loop: true,
    });

    this.typed2 = new Typed("#typed2", {
      strings: this.strings2,
      typeSpeed: 0,
      backSpeed: 0,
      showCursor: false,
      fadeOut: true,
      startDelay: 3000,
      backDelay: 3000,
      loop: true,
    });

    this.typed3 = new Typed("#typed3", {
      strings: this.strings3,
      typeSpeed: 0,
      backSpeed: 0,
      showCursor: false,
      fadeOut: true,
      startDelay: 5000,
      backDelay: 3000,
      loop: true,
    });

    this.scaleCanvas();

    window.addEventListener("resize", this.scaleCanvas.bind(this));

    if (navigator.mediaDevices.getUserMedia) {
      console.log("User media:", navigator.mediaDevices.getUserMedia);
      // Load the webcam
      const webcamPromise = navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(
          (stream) => {
            window.stream = stream;
            this.video.current.srcObject = stream;

            console.log('Webcam stream set to the video element');

            // Play background sounds
            // const audioEl = document.getElementsByClassName("audio-element")[0];
            // audioEl.play();

            this.setState({
              systemStatus: "",
              elapsedTime: moment
                .utc(this.duration.asMilliseconds())
                .format("HH:mm:ss"),
            });

            return new Promise((resolve) => {
              this.video.current.onloadedmetadata = () => {
                console.log('Loaded metadata!');
                resolve();
              };
            });
          },
          (error) => {
            console.log("Couldn't start the webcam", error);
            console.error(error);
          }
        );

      const loadModelPromise = cocoSsd.load();

      Promise.all([loadModelPromise, webcamPromise])
        .then((values) => {
          this.detectFromVideoFrame(values[0], this.video.current);
          this.setState({
            elapsedTime: moment
              .utc(this.duration.asMilliseconds())
              .format("HH:mm:ss"),
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  componentWillUnmount() {
    // Clean up typed.js instances
    try {
      if (this.typed1) {
        this.typed1.destroy();
      }
      if (this.typed2) {
        this.typed2.destroy();
      }
      if (this.typed3) {
        this.typed3.destroy();
      }
      if (this.typedStatus) {
        this.typedStatus.destroy();
      }
    } catch (e) { }
    // Remove resize listener
    window.removeEventListener("resize", this.scaleCanvas());
  }

  // Get proper scale for canvas depending on screen size
  scaleCanvas() {
    const container = document.querySelector("#container");
    const canvas = document.querySelector("#canvas");

    let { width, height } = container.getBoundingClientRect();

    const dpr = window.devicePixelRatio;
    const exaggeration = 20;

    width = Math.ceil(width * dpr + exaggeration);
    height = Math.ceil(height * dpr + exaggeration);

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = `${width / dpr}px`;
    canvas.style.height = `${height / dpr}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    this.canvas = canvas;
  }


  render() {
    return (
      <div className="App">
        <div className="scanlines" id="container">
          <div id="typed1" className="typed" />
          <div id="typed2" className="typed" />
          <div id="typed3" className="typed" />
          <div id="typedStatus" className="typed blink" />
          <img className="compass" src={compassImage} alt="Compass" />
          <video
            className="main-video"
            autoPlay
            muted
            ref={this.video}
            width="100%"
            height="100%"
          />
          <canvas ref={(el) => (this.canvas = el)} id="canvas" className="overlay-red" />
          <audio className="audio-element" volume="0.5">
            <source
              src="https://brandonagray.github.io/terminator-vision/audio/t800-sfx.mp3"
              type="audio/mpeg"
            ></source>
          </audio>
        </div>
      </div>
    );
  }
}

export default App;
