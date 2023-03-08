import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import './drop-file-input.css';

import { ImageConfig } from '../../config/imageConfig';
import uploadImg from '../../assets/images/upload.png';

const DropFileInput = (props) => {
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [hasFile, setHasFile] = useState(false);
  const [formData, setFormData] = useState(null);

  const onDrageEnter = () => wrapperRef.current.classList.add('dragover');
  const onDrageLeave = () => wrapperRef.current.classList.remove('dragover');
  const onDrop = () => wrapperRef.current.classList.remove('dragover');

  const handleFile = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedList = [...fileList, file];
      setFileList(updatedList);
     // props.onFileChange(updatedList);
      const data = new FormData();
      data.append('file', file);
      data.append('model', 'whisper-1');
      setFormData(data);
      console.log('File Uploaded- its me im handling the file');
      props.setFormData(data);

      setHasFile(true); // set the flag to true
      if (file.size > 25 * 1024 * 1024) {
        alert('Please upload an audio file less than 25MB');
        console.log('Please upload an audio file less than 25MB');
        setHasFile(false); // reset the flag if the file is too big
        return;
      }
    }
  };

  const fileRemove = (index) => {
    const updatedList = [...fileList];
    updatedList.splice(index, 1);
    setFileList(updatedList);
    props.onFileChange(updatedList);
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
        {hasFile && props.children(formData)}
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

DropFileInput.propTypes = {
  onFileChange: PropTypes.func.isRequired,
};

export default DropFileInput;
