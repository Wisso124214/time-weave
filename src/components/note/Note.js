import './Note.css';

export default function Note({ data, type, onClick, hyphenText }) {
  const charactersToHyphenate = 12;

  return (
    <div className={`note note-${type}`} onClick={onClick}>
      <div className={`note-title note-title-${type}`}> {data.title ? data.title : `(${data.createdAt.split('T')[0]})`} </div>
      {type !== 'titles' ? (
        <div className={`note-content note-content-${type}`} dangerouslySetInnerHTML={{ __html: hyphenText(data.content, charactersToHyphenate).replace(/\n/g, '<br/>').replace(/ {2}/g, '&nbsp; ') }} />
      ) : null}

      {type === 'titles' ? (
        <div className="note-details">
          <div className={`note-date-${type}`}> {data.updatedAt.split('T')[0]} </div>
          <div className={`note-chars-${type}`}>{data.content.length} characters</div>
        </div>
      ) : null}
    </div>
  );
}