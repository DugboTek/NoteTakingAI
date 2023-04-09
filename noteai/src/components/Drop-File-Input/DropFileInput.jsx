import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import './drop-file-input.css';

import { ImageConfig } from '../../config/imageConfig';
import uploadImg from '../../assets/images/upload.png';
import AudioBufferSlice from 'audiobuffer-slice';
import decodeAudio, { decoders } from 'audio-decode';


const DropFileInput = (props) => {
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [hasFile, setHasFile] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formDataList, setFormDataList] = useState([]);


  const onDrageEnter = () => wrapperRef.current.classList.add('dragover');
  const onDrageLeave = () => wrapperRef.current.classList.remove('dragover');
  const onDrop = () => wrapperRef.current.classList.remove('dragover');

  // Checks if size of file is less than 25MB
      // if (file.size > 25 * 1024 * 1024) {
      //   alert('Please upload an audio file less than 25MB');
      //   console.log('Please upload an audio file less than 25MB');
      //   setHasFile(false); // reset the flag if the file is too big
      //   return;
      // }
  

      const handleFile = async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const updatedList = [...fileList, file];
          setFileList(updatedList);
      
          try {
            const arrayBuffer = await readFile(file);
            const audioBuffer = await decodeAudio(arrayBuffer, file);
      
            // Modified sliceAudioBuffer usage
            const chunks = [];
            sliceAudioBuffer(audioBuffer, 24, async (slicedAudioBuffer) => {
              chunks.push(slicedAudioBuffer);
      
              const chunkArrayBuffers = await Promise.all(chunks.map(audioBufferToArrayBuffer));
      
              let tempFormDataList = [];
      
              for (let i = 0; i < chunkArrayBuffers.length; i++) {
                const chunkArrayBuffer = chunkArrayBuffers[i];
                const fileExtension = file.type.split("/")[1];
                const chunkFile = new File([chunkArrayBuffer], `audio_chunk_${i + 1}.${fileExtension}`, { type: file.type });
      
                console.log(`Chunk ${i + 1} - Type: ${chunkFile.type}, Name: ${chunkFile.name}`);
      
                const data = new FormData();
                data.append('file', chunkFile, `audio_chunk_${i + 1}.${fileExtension}`);
                data.append('model', 'whisper-1');
                tempFormDataList.push(data);
              }
      
              setFormDataList(tempFormDataList);
              props.setFormDataList(tempFormDataList);
            });
      
          } catch (error) {
            console.error('Error processing audio file:', error);
          }
      
          setHasFile(true);
        }
      };
      
      
      
      function base64ToBlob(base64Data, mimeType) {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }
      
      function createChunkFile(chunk, fileExtension, mimeType, i) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(chunk);
          reader.onload = (event) => {
            const chunkDataUrl = event.target.result;
            const chunkBlob = base64ToBlob(chunkDataUrl.split(",")[1], mimeType);
            const chunkFile = new File([chunkBlob], `audio_chunk_${i+1}.${fileExtension}`, { type: mimeType });
            resolve(chunkFile);
          };
          reader.onerror = (error) => {
            reject(error);
          };
        });
      }

      function readFile(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      }
      
      async function decodeAudio(arrayBuffer, file) {
        const fileExtension = file.type.split("/")[1];
        switch (fileExtension) {
          case "mp3":
            await decoders.mp3();
            return decoders.mp3(arrayBuffer);
          case "ogg":
            await decoders.ogg();
            return decoders.ogg(arrayBuffer);
          case "wav":
            await decoders.wav();
            return decoders.wav(arrayBuffer);
          case "flac":
            await decoders.flac();
            return decoders.flac(arrayBuffer);
          case "opus":
            await decoders.opus();
            return decoders.opus(arrayBuffer);
          case "qoa":
            await decoders.qoa();
            return decoders.qoa(arrayBuffer);
          case "m4a":
            await decoders.m4a();
            return decoders.m4a(arrayBuffer);
          default:
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }
      }
      
      
      function sliceAudioBuffer(audioBuffer, chunkSizeInSeconds, callback) {
        const chunkSizeInSamples = chunkSizeInSeconds * audioBuffer.sampleRate;
        
        for (let i = 0; i < audioBuffer.length; i += chunkSizeInSamples) {
          const begin = i;
          const end = Math.min(i + chunkSizeInSamples, audioBuffer.length);
      
          // Check if begin is within bounds of the audio buffer
          if (begin < audioBuffer.length) {
            AudioBufferSlice(audioBuffer, begin, end, (error, slicedAudioBuffer) => {
              if (error) {
                console.error(error);
                return;
              }
              callback(slicedAudioBuffer);
            });
          }
        }
      }
      
      
      
      
      
      async function audioBufferToArrayBuffer(audioBuffer) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          const blob = new Blob([audioBuffer.getChannelData(0).buffer], { type: 'audio/wav' });
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
      }
      
      
  const fileRemove = (index) => {
    const updatedList = [...fileList];
    updatedList.splice(index, 1);
    setFileList(updatedList);
    //props.onFileChange(updatedList);
  };

  return (
    <div>
      <div
        ref={wrapperRef}
        className='drop-file-input'
        onDragEnter={onDrageEnter}
        onDragLeave={onDrageLeave}
        onDrop={onDrop}
      >
        <div className='drop-file-input__label'>
          <img src={uploadImg} alt='upload' />
          <p>Drag & Drop your file here.</p>
        </div>
        <input type='file' accept='audio/*' onChange={handleFile} />
      </div>
      {fileList.length > 0 ? (
        <div className='drop-file-preview'>
          <p className='drop-file-preview__title'>Uploaded</p>
          {fileList.map((item, index) => (
            <div className='drop-file-preview__item' key={index}>
              <img
                src={ImageConfig[item.type.split('/')[1] || ImageConfig['default']]}
                alt='file'
              />
              <div className='drop-file-preview__item__info'>
                <p>{item.name}</p>
                <p>{Math.round(item.size/1024)} KB</p>
              </div>
              <span
                className='drop-file-preview__item__del'
                onClick={() => fileRemove(index)}
              >
                
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/*DropFileInput.propTypes = {
  onFileChange: PropTypes.func.isRequired,
};*/

export default DropFileInput;
