const audioEncoder = require('audio-encoder');
const resample = require('audio-resampler');
const lamejs = require('lamejs');
const fileSaver = require('file-saver');

const audioRecorder = {
    // Array of recorded audio blobs
    audioBlobs: [],
    // MediaRecorder instance for recording audio
    mediaRecorder: null,
    // MediaStream instance for capturing audio
    streamBeingCaptured: null,

    start: function () {
        // Check if getUserMedia is supported in the browser
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not supported in this browser.'));
        }

        // Get the audio stream from the microphone
        return navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 44100,
            },
        })
        .then((stream) => {
            // Save the reference to the captured stream
            this.streamBeingCaptured = stream;

            // Detect the MIME type
            let mimeType;
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.5')) {
                mimeType = 'audio/mp4;codecs=mp4a.40.5';
            } else {
                // Add more MIME types if necessary or throw an error if none are supported.
                throw new Error('No supported MIME types found for MediaRecorder.');
            }

            // Create a MediaRecorder instance
            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            // Reset the recorded audio blobs
            this.audioBlobs = [];

            // Save the audio data as Blob objects when recording
            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                this.audioBlobs.push(event.data);
            });

            // Start recording
            this.mediaRecorder.start(1000);
        });
    },
    

    stop: async function () {
        return new Promise((resolve, reject) => {
            try {
                // Check if a MediaRecorder instance exists
                if (!this.mediaRecorder) {
                    reject(new Error('No media recorder found.'));
                    return;
                }
    
                // Get the MIME type before stopping the recorder
                const mimeType = this.mediaRecorder.mimeType;
    
                // Stop recording
                this.cancel();
    
                console.log('MIME type:', mimeType);
                this.combineAndEncodeAudioBlobs(mimeType)
                    .then((mp3Blob) => {
                        console.log('Encoded MP3 blob:', mp3Blob);
                        resolve(mp3Blob);
                    })
                    .catch((error) => {
                        console.log('Error in combineAndEncodeAudioBlobs:', error);
                        reject(new Error(`Error in combineAndEncodeAudioBlobs: ${error.message}`));
                    });
            } catch (error) {
                console.log('Error in stop method:', error);
                reject(new Error(`Error in stop method: ${error.message}`));
            }
        });
    },
    
    
    
    
    cancel: function () {
        if (this.mediaRecorder) {
            // Stop the MediaRecorder instance
            this.mediaRecorder.stop();
            // Stop the MediaStream tracks
            this.stopStream();
            // Reset the recording properties
            this.resetRecordingProperties();
        }
    },

    stopStream: function () {
        if (this.streamBeingCaptured) {
            // Stop all tracks in the MediaStream
            this.streamBeingCaptured.getTracks().forEach((track) => {
                track.stop();
            });
        }
    },

    resetRecordingProperties: function () {
        // Reset the MediaRecorder and MediaStream instances
        this.mediaRecorder = null;
        this.streamBeingCaptured = null;
    },

    combineAndEncodeAudioBlobs: async function (mimeType) {
        if (!this.audioBlobs) {
          throw new Error('No audio blobs found.');
        }
        console.log('Audio blobs:', this.audioBlobs);
        const audioBlob = new Blob(this.audioBlobs, { type: mimeType });
        const reader = new FileReader();
        reader.readAsArrayBuffer(audioBlob);
        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            const arrayBuffer = reader.result;
            const audioContext = new AudioContext();
            const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
            // Resample the audio to 44.1 kHz
            resample(
              originalAudioBuffer,
              44100, // Target sample rate
              (resampledAudioBuffer) => {
                if (resampledAudioBuffer) { // Add check here
                  // Encode the resampled audio as MP3
                  const resampledAudio = new Float32Array(
                    resampledAudioBuffer.getChannelData(0)
                  );
      
                  const mp3encoder = new lamejs.Mp3Encoder(
                    1, // number of channels
                    44100, // sample rate
                    128 // bit rate
                  );
      
                  const mp3Data = [];
                  const samples = resampledAudio;
                  const mp3buf = mp3encoder.encodeBuffer(samples);
                  if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                  }
                  const mp3buf_last = mp3encoder.flush();
                  if (mp3buf_last.length > 0) {
                    mp3Data.push(mp3buf_last);
                  }
      
                  const mp3Blob = new Blob(mp3Data, {
                    type: 'audio/mpeg',
                  });
      
                  resolve(mp3Blob);
                } else {
                  reject(new Error('Resampled audio buffer is null or undefined'));
                }
              }
            );
          };
                    
          reader.onerror = (event) => {
            console.log('Error reading audioBlob:', event);
            reject(event);
          };
        });
      },
      
      
};

export { audioRecorder };
