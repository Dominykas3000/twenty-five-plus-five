import { useEffect, useState, useRef } from "react";
import AlarmSound from "./assets/AlarmSound.mp3";
import "./App.css";
import { DisplayState } from "./helper";
import TimeSetter from "./components/TimeSetter";
import Display from "./components/Display";

const defaultBreakTime = 5 * 60;
const defaultSessionTime = 25 * 60;
const min = 60;
const max = 60 * 60;
const interval = 60;

function App() {
  const [breakTime, setBreakTime] = useState(defaultBreakTime);
  const timerRef = useRef<number | null>(null);
  const [sessionTime, setSessionTime] = useState(defaultSessionTime);
  const [displayState, setDisplayState] = useState<DisplayState>({
    time: sessionTime,
    timeType: "Session",
    timerRunning: false,
  });

  useEffect(() => {
    if (!displayState.timerRunning) return;

    const timerID = window.setInterval(() => {
      setDisplayState((prev) => ({
        ...prev,
        time: prev.time > 0 ? prev.time - 1 : 0, // Ensure it doesn't go negative
      }));
    }, 1000);

    return () => window.clearInterval(timerID);
  }, [displayState.timerRunning, displayState.time]); // Added `displayState.time`

  useEffect(() => {
    if (displayState.time === 0) {
      const audio = document.getElementById("beep") as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch((err) => console.log(err)); // Ensure it plays
      }
    }
  }, [displayState.time]);

  useEffect(() => {
    if (displayState.time === 0) {
      // Play the beep sound
      const audio = document.getElementById("beep") as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch((err) => console.log(err)); // Ensure it plays
      }

      // Switch between session and break
      setDisplayState((prev) => ({
        timeType: prev.timeType === "Session" ? "Break" : "Session",
        time: prev.timeType === "Session" ? breakTime : sessionTime, // Switch the time
        timerRunning: true, // Ensure it keeps running
      }));
    }
  }, [displayState.time, breakTime, sessionTime]);

  const reset = () => {
    setBreakTime(300); // 5 minutes
    setSessionTime(1500); // 25 minutes
    setDisplayState({
      time: 1500,
      timeType: "Session",
      timerRunning: false,
    });

    clearInterval(timerRef.current ?? undefined);
    timerRef.current = null;

    const audio = document.getElementById("beep") as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const startStop = () => {
    setDisplayState((prev) => ({
      ...prev,
      timerRunning: !prev.timerRunning,
    }));
  };

  const changeBreakTime = (time: number) => {
    if (displayState.timerRunning || time < min || time > max) return;
    setBreakTime(time);
  };

  const changeSessionTime = (time: number) => {
    if (displayState.timerRunning || time < min || time > max) return;
    setSessionTime(time);
    setDisplayState((prev) => ({
      ...prev,
      time: time,
    }));
  };

  const decrementDisplay = () => {
    setDisplayState((prev) => {
      if (prev.time > 0) {
        return { ...prev, time: prev.time - 1 };
      }

      // Switch between session and break at 00:00
      return {
        timeType: prev.timeType === "Session" ? "Break" : "Session",
        time: prev.timeType === "Session" ? breakTime : sessionTime,
        timerRunning: true, // Ensure the timer keeps running
      };
    });
  };

  return (
    <div className="clock">
      <div className="setters">
        <div className="break">
          <h4 id="break-label">Break Length</h4>
          <TimeSetter
            time={breakTime}
            setTime={changeBreakTime}
            min={min}
            max={max}
            interval={interval}
            type="break"
          />
        </div>
        <div className="session">
          <h4 id="session-label">Session Length</h4>
          <TimeSetter
            time={sessionTime}
            setTime={changeSessionTime}
            min={min}
            max={max}
            interval={interval}
            type="session"
          />
        </div>
      </div>
      <Display
        displayState={displayState}
        reset={reset}
        startStop={startStop}
      />
      <audio id="beep" src={AlarmSound} />
    </div>
  );
}

export default App;
