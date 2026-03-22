function ProfileFieldError({ error }) {
  return error ? <p className="profile-field-error">{error}</p> : null;
}

export function ProfileTextInputSection({
  title,
  isEditing,
  inputClassName,
  name,
  value,
  onChange,
  displayValue,
  error,
  type = "text",
}) {
  return (
    <div className="profile-section">
      <h2>{title}</h2>
      {isEditing ? (
        <input
          className={inputClassName}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
      ) : (
        <p>{displayValue}</p>
      )}
      {isEditing ? <ProfileFieldError error={error} /> : null}
    </div>
  );
}

export function ProfileTextAreaSection({
  title,
  isEditing,
  inputClassName,
  name,
  value,
  onChange,
  displayValue,
  error,
  rows = 5,
}) {
  return (
    <div className="profile-section">
      <h2>{title}</h2>
      {isEditing ? (
        <textarea
          className={inputClassName}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
        />
      ) : (
        <p>{displayValue}</p>
      )}
      {isEditing ? <ProfileFieldError error={error} /> : null}
    </div>
  );
}

export function ProfileLinkSection({
  title,
  isEditing,
  inputClassName,
  name,
  value,
  onChange,
  href,
  linkLabel,
  emptyText,
  error,
}) {
  return (
    <div className="profile-section">
      <h2>{title}</h2>
      {isEditing ? (
        <input
          className={inputClassName}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
        />
      ) : href ? (
        <a className="profile-link" href={href} target="_blank" rel="noreferrer">
          {linkLabel}
        </a>
      ) : (
        <p>{emptyText}</p>
      )}
      {isEditing ? <ProfileFieldError error={error} /> : null}
    </div>
  );
}

export function ProfileArraySection({
  title,
  fieldName,
  isEditing,
  items,
  displayItems,
  inputClassName,
  placeholder,
  helperText,
  addLabel,
  error,
  onItemChange,
  onAddItem,
  onRemoveItem,
}) {
  const disableRemove = items.length === 1 && !String(items[0] || "").trim();

  return (
    <div className="profile-section">
      <h2>{title}</h2>
      {isEditing ? (
        <div className="profile-array-editor">
          <p className="profile-helper-copy">{helperText}</p>
          {items.map((item, index) => (
            <div key={`${fieldName}-${index}`} className="profile-array-row">
              <input
                className={inputClassName}
                type="text"
                value={item}
                onChange={(event) => onItemChange(index, event.target.value)}
                placeholder={placeholder}
              />
              <button
                type="button"
                className="profile-inline-button profile-inline-button-muted"
                onClick={() => onRemoveItem(index)}
                disabled={disableRemove}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="profile-inline-button"
            onClick={onAddItem}
          >
            {addLabel}
          </button>
          <ProfileFieldError error={error} />
        </div>
      ) : (
        <ul>
          {displayItems.map((item, index) => (
            <li key={`${fieldName}-display-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
