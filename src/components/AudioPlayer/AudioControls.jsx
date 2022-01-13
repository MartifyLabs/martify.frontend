import React from "react";
import { ReactComponent as Play } from "./assets/play.svg";
import { ReactComponent as Pause } from "./assets/pause.svg";
// import { ReactComponent as Next } from "./assets/next.svg";
// import { ReactComponent as Prev } from "./assets/prev.svg";

const AudioControls = ({
  isPlaying,
  onPlayPauseClick,
  onPrevClick,
  onNextClick
}) => (
  <div className="audio-controls">
    {/* <button
      className="audioControlButton"
      type="button"
      className="prev"
      aria-label="Previous"
      onClick={onPrevClick}
    >
      <Prev />
    </button> */}
    {isPlaying ? (
      <button
        className="audioControlButton"
        type="button"
        className="pause"
        onClick={() => onPlayPauseClick(false)}
        aria-label="Pause"
      >
        <Pause />
      </button>
    ) : (
      <button
        className="audioControlButton"
        type="button"
        className="play"
        onClick={() => onPlayPauseClick(true)}
        aria-label="Play"
      >
        <Play />
      </button>
    )}
    {/* <button
      className="audioControlButton"
      type="button"
      className="next"
      aria-label="Next"
      onClick={onNextClick}
    >
      <Next />
    </button> */}
  </div>
);

export default AudioControls;
