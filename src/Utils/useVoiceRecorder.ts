import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const useVoiceRecorder = (handleMicPermission: (allowed: boolean) => void) => {
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]); // Decibel waveform

  // Use useRef to persist audio objects across renders and prevent memory leaks
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording && recorder && audioURL) {
      setRecorder(null);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, [isRecording, recorder, audioURL]);

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const fetchedRecorder = await requestRecorder();
        setRecorder(fetchedRecorder);
        handleMicPermission(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Please grant microphone permission to record audio.";
        toast.error(errorMessage);
        setIsRecording(false);
        handleMicPermission(false);
      }
    };
    // Lazily obtain recorder the first time we are recording.
    if (recorder === null) {
      if (isRecording) {
        initializeRecorder();
      }
      return;
    }

    if (isRecording) {
      recorder.start();
      setupAudioAnalyser();
    } else {
      recorder.stream.getTracks().forEach((i) => i.stop());
      recorder.stop();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    }

    const handleData = (e: BlobEvent) => {
      const url = URL.createObjectURL(e.data);
      setAudioURL(url);
      const blob = new Blob([e.data], { type: "audio/mpeg" });
      setBlob(blob);
    };

    recorder.addEventListener("dataavailable", handleData);
    return () => {
      recorder.removeEventListener("dataavailable", handleData);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, [recorder, isRecording]);

  const setupAudioAnalyser = () => {
    const AudioContextClass = window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 32;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    sourceRef.current = audioContextRef.current.createMediaStreamSource(
      recorder?.stream as MediaStream,
    );
    sourceRef.current.connect(analyserRef.current);

    const updateWaveform = () => {
      if (isRecording && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const normalizedWaveform = Array.from(dataArray).map((value) =>
          Math.min(100, (value / 255) * 100),
        );
        setWaveform(normalizedWaveform);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }
        if (analyserRef.current) {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        }
      }
    };

    updateWaveform();
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setWaveform([]);
  };

  const resetRecording = () => {
    setAudioURL("");
    setBlob(null);
    setWaveform([]);

    // Cleanup audio resources when resetting
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };

  return {
    audioURL,
    isRecording,
    startRecording,
    stopRecording,
    blob,
    waveform,
    resetRecording,
  };
};

async function requestRecorder() {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      // iOS Safari requires these constraints
      sampleRate: 44100,
      channelCount: 1,
    },
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // iOS Safari requires a different mime type
    const options = {
      mimeType: MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4",
    };
    return new MediaRecorder(stream, options);
  } catch (error) {
    throw new Error(
      `Failed to initialize recorder: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
export default useVoiceRecorder;
