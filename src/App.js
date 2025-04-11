import React, { useState, useRef } from 'react';
import { post, get } from 'aws-amplify/api';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [voiceId, setVoiceId] = useState('Joanna');
  const [text, setText] = useState('Hello, how are you today?');

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setAudioError(null);
      setAudioData(null);
      
      console.log("Calling Polly API...");
      // Use post instead of get and include the body
      const restOperation = post({
        apiName: 'pollyApi',
        path: '/polly',
        options: {
          body: {
            voiceId: voiceId,
            text: text
          }
        }
      });
      
      const response = await restOperation.response;
      console.log("API response received:", response.status);
      
      const jsonData = await response.body.json();
      console.log("Response data received");
      
      if (!jsonData.audio) {
        throw new Error("No audio data received from API");
      }
      
      // Store the base64 audio data
      setAudioData(jsonData.audio);
      
      // Let the useEffect handle playing the audio
      
    } catch (error) {
      console.error('Error:', error);
      setAudioError(error.message || "Error playing audio");
    } finally {
      setIsLoading(false);
    }
  };

  // Use an effect to play the audio when audioData changes
  React.useEffect(() => {
    if (audioData) {
      try {
        // Create a Blob from the base64 data
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        
        // Create a URL for the blob
        const audioUrl = URL.createObjectURL(blob);
        
        // Set the audio source and play
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setAudioError(`Error playing audio: \${error.message}`);
          });
        }

        // Add these lines to track play state
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onpause = () => setIsPlaying(false);
      } catch (error) {
        console.error("Error processing audio data:", error);
        setAudioError(`Error processing audio: \${error.message}`);
      }
    }
  }, [audioData]);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='app-title'>Vocalize AI Polly</h1>
        <p className='app-description'>
          A simple web application converting text to natural-sounding speech using Amazon Polly.
        </p>
        {/* Add voice selection dropdown */}
        <div className="controls">
          <div className='voice-control'>
            <label className='control-label'>Amazon Polly voice:</label>
            <select 
            value={voiceId} 
            onChange={(e) => setVoiceId(e.target.value)}
            className="voice-select"
          >
            <option value="Joanna">Joanna (Female)</option>
            <option value="Matthew">Matthew (Male)</option>
            <option value="Nicole">Nicole (Female)</option>
            <option value="Russell">Russell (Male)</option>
          </select>
          </div>
          
          {/* Add text input field */}
          <div className='text-control'>
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to speak"
            className="text-input"
            rows="4"
            >
            </textarea>
          </div>
        </div>
        
        <button 
          onClick={handleClick} 
          disabled={isLoading}
          className="hello-button"
        >
          {isLoading ? 'Loading...' : 'Speak'}
        </button>
        
        {isLoading && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-text">Generating audio...</div>
          </div>
        )}
        
        <audio ref={audioRef} controls style={{ display: audioError ? 'block' : 'none' }} />
        
        {audioError && (
          <div className="error-message">
            {audioError}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;