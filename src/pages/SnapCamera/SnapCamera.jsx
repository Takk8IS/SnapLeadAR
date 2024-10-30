// /SnapLeadAR/src/pages/SnapCamera/SnapCamera.jsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";
import LeadCaptureForm from "../../components/LeadCaptureForm/LeadCaptureForm";
import "./SnapCamera.css";

const SnapCamera = () => {
  const [showForm, setShowForm] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdditionalControls, setShowAdditionalControls] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [recordedVideo, setRecordedVideo] = useState(null);

  const videoRef = useRef(null);
  const cameraSelectRef = useRef(null);
  const lensSelectRef = useRef(null);
  const timerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sessionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const getUrlParameter = useCallback((name) => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
  }, []);

  const getLensId = useCallback(() => {
    return getUrlParameter("snaplead_id");
  }, [getUrlParameter]);

  const startRecording = () => {
    // Encontra o canvas dentro do container de vídeo
    const canvas = videoRef.current.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    try {
      // Configura o stream com a resolução atual do canvas
      const stream = canvas.captureStream(30);

      // Tenta usar codec de alta qualidade
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideo({ url, blob });
      };

      setIsRecording(true);
      setTimeLeft(30);
      mediaRecorderRef.current.start(1000); // Coleta dados a cada segundo

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowAdditionalControls(true);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRecordPress = () => {
    if (!isRecording) {
      startRecording();
    }
  };

  const handleRecordRelease = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleDownload = () => {
    if (recordedVideo) {
      const a = document.createElement("a");
      a.href = recordedVideo.url;
      a.download = `snaplead-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    if (recordedVideo && navigator.share) {
      try {
        const file = new File([recordedVideo.blob], "snaplead-recording.webm", {
          type: "video/webm",
        });

        await navigator.share({
          title: "SnapLead AR Recording",
          text: "Check out my SnapLead AR recording!",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const toggleCamera = async () => {
    setIsFrontCamera((prev) => !prev);
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = newStream;

      if (sessionRef.current) {
        const source = createMediaStreamSource(newStream);
        await sessionRef.current.setSource(source);
        await sessionRef.current.play();
      }
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  useEffect(() => {
    const initializeCamera = async () => {
      if (showForm) return;

      const lensId = getLensId();
      if (!lensId) {
        console.log("No lens ID provided");
        if (videoRef.current) {
          videoRef.current.style.display = "none";
        }
        return;
      }

      try {
        const cameraKit = await bootstrapCameraKit({
          apiToken: process.env.REACT_APP_API_TOKEN,
        });

        sessionRef.current = await cameraKit.createSession();

        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: isFrontCamera ? "user" : "environment",
            frameRate: { ideal: 30 },
          },
        };

        mediaStreamRef.current =
          await navigator.mediaDevices.getUserMedia(constraints);
        const source = createMediaStreamSource(mediaStreamRef.current);
        await sessionRef.current.setSource(source);

        const container = videoRef.current;
        if (container) {
          container.innerHTML = "";
          container.appendChild(sessionRef.current.output.live);
        }

        const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
          process.env.REACT_APP_LENS_GROUP_ID,
        ]);

        const selectedLens = lenses.find((lens) => lens.id === lensId);
        if (selectedLens) {
          await sessionRef.current.applyLens(selectedLens);
          await sessionRef.current.play();
        }
      } catch (error) {
        console.error("Error initializing camera:", error);
        cleanup();
      }
    };

    initializeCamera();

    return cleanup;
  }, [getLensId, showForm, isFrontCamera]);

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.pause();
      sessionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
  };

  const renderCameraControls = () => {
    if (showForm) return null;

    return (
      <>
        {isRecording && (
          <div className="timer-container">
            <div className={`timer ${timeLeft <= 5 ? "animate" : ""}`}>
              {timeLeft}
            </div>
          </div>
        )}

        <div className="camera-controls">
          {showAdditionalControls ? (
            <>
              <button className="camera-button" onClick={toggleCamera}>
                <span className="material-symbols-rounded">
                  {isFrontCamera ? "camera_rear" : "camera_front"}
                </span>
              </button>
              <button
                className="record-button"
                onClick={() => {
                  setShowAdditionalControls(false);
                  setRecordedVideo(null);
                }}
              >
                <span className="material-symbols-rounded">
                  fiber_manual_record
                </span>
              </button>
              <button className="download-button" onClick={handleDownload}>
                <span className="material-symbols-rounded">download</span>
              </button>
              <button className="share-button" onClick={handleShare}>
                <span className="material-symbols-rounded">share</span>
              </button>
            </>
          ) : (
            <button
              className={`record-button ${isRecording ? "recording" : ""}`}
              onMouseDown={handleRecordPress}
              onMouseUp={handleRecordRelease}
              onTouchStart={handleRecordPress}
              onTouchEnd={handleRecordRelease}
            >
              <span className="material-symbols-rounded">
                fiber_manual_record
              </span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="container">
      {showForm ? (
        <LeadCaptureForm onFormSubmit={handleFormSubmit} />
      ) : (
        <div className="video-container">
          <div ref={videoRef} />
          {renderCameraControls()}
        </div>
      )}
    </div>
  );
};

export default SnapCamera;
