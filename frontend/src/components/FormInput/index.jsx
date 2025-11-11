const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`form-input ${error ? "form-input-error" : ""}`}
    />
    {error && <div className="form-error">{error}</div>}
  </div>
);

export default FormInput;