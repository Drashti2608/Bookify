import React, { useEffect, useRef, useState } from "react";

const ListenBook = ({
  audioUrl,
  coverUrl,
  bookTitle,
  authorName,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio(audioUrl));
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    audio.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("ended", () => setIsPlaying(false));
      audio.pause();
    };
  }, []);

  const updateProgress = () => {
    const audio = audioRef.current;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleBackward = () => {
    audioRef.current.currentTime -= 10;
  };

  const handleForward = () => {
    audioRef.current.currentTime += 30;
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black-200 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-20 backdrop-blur-lg p-6 rounded-lg max-w-md w-full">
        <button onClick={onClose} className="float-right text-white">
          ×
        </button>
        <div className="mb-4">
          <img
            src={coverUrl}
            alt="Book Cover"
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>
        <div className="text-white text-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: "white" }}>
            {bookTitle}
          </h2>
          <p className="text-sm mt-1">{authorName}</p>
        </div>
        <div className="flex justify-between text-white text-sm mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          className="mb-4 bg-gray-600 rounded-full cursor-pointer"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <button onClick={handleBackward} className="text-white">
            -10s
          </button>
          <button onClick={togglePlayPause} className="text-white text-3xl">
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button onClick={handleForward} className="text-white">
            +30s
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListenBook;
