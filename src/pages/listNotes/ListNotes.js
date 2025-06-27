import React from 'react';
import './ListNotes.css';
import Note from '@components/note/Note';
import PopUpNote from '@components/popUpNote/PopUpNote';
import { AppContext } from '@src/AppContext';
import AddNote from '../../components/addNote/AddNote';
import config from '@src/config/config.js';
import axios from 'axios';
import { getUserInfo } from '@src/utils/Utils.js';

const { BACKEND_URL } = config;

export default function ListNotes(children) {

  let consumeContext = React.useContext(AppContext);
  const { setType, type, setLoading } = consumeContext;

  const [showPopUp, setShowPopUp] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState(null);
  const [notesData, setNotesData] = React.useState(null);

  const hyphenText = (text, chars) => {
    let counter = 0;

    return text ? 
      text.split('').map((element) => {
        counter = element === ' ' ? 0 : counter + 1;
        return counter % chars === 0 && counter !== 0 ? element + '-' : element;
      }).join('')
      : '(none)';
  };

  React.useEffect(() => {
    (async () => {
      const username = localStorage.getItem('username');

      if (notesData === null && username) {
        setLoading(true);
        await axios.get(`${BACKEND_URL}/get-notes`)
        .then(async (response) => {
          if (response.data && response.data.length > 0) {
            const infoUser = await getUserInfo(username);

            if (!infoUser || !infoUser.id_user) {
              console.error('User info not found');
              return;
            }

            setNotesData(response.data.filter(note => note.user_id === infoUser.id_user).sort((a, b) => {
              const dateA = new Date(a.updatedAt);
              const dateB = new Date(b.updatedAt);
              return dateB - dateA;
            }));
          } else {
            setNotesData([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching notes:', error);
          setNotesData([]);
        })
        .finally(() => {
          setLoading(false);
        });
      }
    })()
  }, [notesData]);

  React.useEffect(() => {
    const addButton = document.querySelector('.add-note-button-container');

    if (addButton) {
      if (showPopUp) {
        addButton.classList.remove('visible');
      } else {
        addButton.classList.add('visible');
      }
    }
  }, [showPopUp])

  return (
    <>
      <div className={`list-notes list-notes-${type}`}>
        {notesData?.map((note, index) => (
          <Note 
            key={index}
            data={note}
            hyphenText={hyphenText}
            onClick={() => {
              setSelectedNote(note);
              setShowPopUp(true);
            }}
            type={type === 'default' ? 'square' : type} 
            />))}
      </div>
      <PopUpNote showPopUp={showPopUp} setShowPopUp={setShowPopUp} selectedNote={selectedNote} hyphenText={hyphenText} setNotesData={setNotesData} />
      <AddNote setShowPopUp={setShowPopUp} setSelectedNote={setSelectedNote} />
    </>
  );
}