import { useState, useEffect, useRef } from 'react';

const MentionInput = ({ value, onChange, placeholder, styles, onKeyDown }) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <input
      style={styles}
      type="text"
      ref={inputRef}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}  
      placeholder={placeholder}
      className="mention-input"
    />
  );
};

export default MentionInput;