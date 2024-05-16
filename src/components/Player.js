import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

const Player = ({
  currentSong,
  isPlaying,
  setIsPlaying,
  audioRef,
  timeUpdateHandler,
  songInfo,
  setSongInfo,
  songs,
  setCurrentSong,
  setSongs,
}) => {
  //useRef
  const playButtonRef = useRef(null);
  const skipBackButtonRef = useRef(null);
  const skipForwardButtonRef = useRef(null);
  //useEffect
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.code === "Space") {
        // Click play/pause button
        playSongHandler();
      } else if (event.code === "ArrowLeft") {
        // Click skip back button
        await skipTrackHandler("skip-back");
      } else if (event.code === "ArrowRight") {
        // Click skip forward button
        await skipTrackHandler("skip-forward");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSong, isPlaying]);
  //event handlers
  const activeLibraryHandler = (prevNext) => {
    const newSongs = songs.map((song) => {
      if (song.id === prevNext.id) {
        return {
          ...song,
          active: true,
        };
      } else {
        return {
          ...song,
          active: false,
        };
      }
    });
    setSongs(newSongs);
  };
  const playSongHandler = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(!isPlaying);
    } else {
      audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };
  const skipTrackHandler = async (direction) => {
    const index = songs.findIndex((song) => song.id === currentSong.id);
    if (direction === "skip-forward") {
      await setCurrentSong(songs[(index + 1) % songs.length]);
      //passing song obj to activeLibraryHandler so it can set active to true and false to other
      activeLibraryHandler(songs[(index + 1) % songs.length]);
    } else if (direction === "skip-back") {
      if (index - 1 === -1) {
        await setCurrentSong(songs[songs.length - 1]);
        activeLibraryHandler(songs[songs.length - 1]);
        if (isPlaying) audioRef.current.play();
        return;
      }
      await setCurrentSong(songs[index - 1]);
      activeLibraryHandler(songs[index - 1]);
    }

    if (isPlaying) audioRef.current.play();
  };

  const getTime = (time) => {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  };

  const onDragHandler = (e) => {
    audioRef.current.currentTime = e.target.value;
    setSongInfo({ ...songInfo, currentTime: e.target.value });
  };

  //styles
  const trackAnimation = {
    transform: `translateX(${songInfo.animationPercentage}%)`,
  };
  const gradientForTrack = {
    background: `linear-gradient(to right, ${currentSong.color[0]},${currentSong.color[1]})`,
  };
  return (
    <div className="player-container">
      <div className="time-control">
        <p>{getTime(songInfo.currentTime)}</p>
        <div style={gradientForTrack} className="track">
          <input
            type="range"
            min={0}
            max={songInfo.duration || 0}
            value={songInfo.currentTime}
            onChange={onDragHandler}
            key={currentSong.id}
          />
          <div style={trackAnimation} className="animate-track"></div>
        </div>

        <p>{songInfo.duration ? getTime(songInfo.duration) : "0:00"}</p>
      </div>
      <div className="play-control">
        <FontAwesomeIcon
          onClick={() => {
            skipTrackHandler("skip-back");
          }}
          className="skip-back"
          icon={faAngleLeft}
          size="2x"
          ref={skipBackButtonRef}
        />
        <FontAwesomeIcon
          onClick={playSongHandler}
          className="play"
          icon={isPlaying ? faPause : faPlay}
          size="2x"
          ref={playButtonRef}
        />
        <FontAwesomeIcon
          onClick={() => {
            skipTrackHandler("skip-forward");
          }}
          className="skip-forward"
          icon={faAngleRight}
          size="2x"
          ref={skipForwardButtonRef}
        />
      </div>
    </div>
  );
};

export default Player;
