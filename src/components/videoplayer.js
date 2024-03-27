import React, { useRef, useEffect, useState } from 'react';
import flv from 'flv.js';

const VideoPlayer = ({ url, width, height }) => {
  const videoRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [lastFrameUrl, setLastFrameUrl] = useState(null);

  useEffect(() => {
    const flvPlayer = flv.createPlayer({
      type: 'flv',
      url: url,
      enableWorker: true,
      isLive: true,
      stashInitialSize: 1024,
      lazyLoad: true,
      lazyLoadMaxDuration: 3,
      lazyLoadRecoverDuration: 30,
      seekType: 'range',
      seekParamStart: 'start',
      seekParamEnd: 'end',
    });

    flvPlayer.attachMediaElement(videoRef.current);
    flvPlayer.load();

    const onBuffering = () => {
      setIsBuffering(true);
    };

    const onCanPlay = () => {
      setIsBuffering(false);
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setLastFrameUrl(canvas.toDataURL());
    };

    videoRef.current.addEventListener('waiting', onBuffering);
    videoRef.current.addEventListener('canplay', onCanPlay);

    return () => {
      flvPlayer.destroy();
      videoRef.current.removeEventListener('waiting', onBuffering);
      videoRef.current.removeEventListener('canplay', onCanPlay);
    };
  }, [url]);

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      {isBuffering && lastFrameUrl && (
        <img
          src={lastFrameUrl}
          alt="Last Frame"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}
      <video
        ref={videoRef}
        controls
        width={width}
        height={height}
        autoPlay
        muted
        style={{ display: 'block', width: '100%', height: '100%', visibility: isBuffering ? 'hidden' : 'visible' }}
      />
    </div>
  );
};

export default VideoPlayer;
