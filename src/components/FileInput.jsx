import { FILE_INPUT_ID } from '../constants';

function FileInput({ onFileChange }) {
  return (
    <input
      id={FILE_INPUT_ID}
      type="file"
      accept="image/*"
      className="file-input"
      onChange={onFileChange}
    />
  );
}

export default FileInput;
