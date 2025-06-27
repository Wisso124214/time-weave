import React from 'react';
import './PopUpNote.css';
import Tooltip from '../tooltip/Tooltip';
import axios from 'axios';
import config from '@src/config/config.js';
import { getUserInfo } from '@src/utils/Utils.js';

const { BACKEND_URL } = config;

export default function PopUpNote({ showPopUp, setShowPopUp, selectedNote, hyphenText, setNotesData }) {
  
  const isLeavingStartTags = false;

  const maxCharacters = 1000;
  const maxVersions = 100;
  const charsToHypenTitle = 13;
  const charsToHypenText = 29;
  const cooldownTime = 300;

  const dataMenu = [
    {
      title: 'Delete note',
      action: async () => {
        if (selectedNote && selectedNote._id) {
          await axios.delete(`${BACKEND_URL}/delete-note/${selectedNote._id}`)
          .then(() => {
            setNotesData(null);
            setShowPopUp(false);
            setIsEditing(false);
          })
          .catch((error) => {
            console.error('Error deleting note:', error);
          });
        }
      }
    }
  ]

  const [isNoteMenuOpen, setIsNoteMenuOpen] = React.useState(false);
  const [lastShortcutTime, setLastShortcutTime] = React.useState(new Date().getTime());
  const [characterCount, setCharacterCount] = React.useState(0);
  const [versionsEditions, setVersionsEditions] = React.useState([{ content: '', date: new Date().toLocaleString() }]);
  const [versionSelected, setVersionSelected] = React.useState(0);    // 0 is the last version and decreases as we go back in time
  const [isEditing, setIsEditing] = React.useState(false);
  const [isTextAreaContentFocused, setIsTextAreaContentFocused] = React.useState(false);
  const [focus, setFocus] = React.useState('content-text-textarea');
  const scrollYContent = React.useRef(0);

  const handleUndo = React.useCallback(() => {
    if (new Date().getTime() - lastShortcutTime < cooldownTime) return; 
    setLastShortcutTime(new Date().getTime());
    console.log('Undoing to version:', versionSelected);
    if (versionSelected < versionsEditions.length - 1) {
      setVersionSelected(prev => prev + 1);
    }
  }, [lastShortcutTime, cooldownTime, versionSelected, versionsEditions]);

  const handleRedo = React.useCallback(() => {
    if (new Date().getTime() - lastShortcutTime < cooldownTime) return;
    setLastShortcutTime(new Date().getTime());
    console.log('Redoing to version:', versionSelected);
    if (versionSelected > 0) {
      setVersionSelected(prev => prev - 1);
    }
  }, [lastShortcutTime, cooldownTime, versionSelected]);

  const handleCloseNote = React.useCallback(async () => {
    setIsNoteMenuOpen(false);
    setShowPopUp(false);
    setIsEditing(false);

    if (selectedNote) {
      if (selectedNote._id) {
        await axios.put(`${BACKEND_URL}/update-note/${selectedNote._id}`, selectedNote)
        .catch((error) => {
          console.error('Error updating note:', error);
        });

      } else if (selectedNote.content) {
        const username = localStorage.getItem('username');
        if (!username) {
          console.error('Username not found in localStorage');
          return;
        }
        
        const infoUser = await getUserInfo(username);

        if (!infoUser || !infoUser.id_user) {
          console.error('User info not found');
          return;
        }

        await axios.post(`${BACKEND_URL}/post-note`, { ...selectedNote, user_id: infoUser.id_user })
        .catch((error) => {
          console.error('Error creating note:', error);
        });
      }
      
      setNotesData(null);
    }
  }, [setShowPopUp, selectedNote, setNotesData]);

  React.useEffect(() => {
    if (selectedNote) {
      setVersionsEditions([{ content: selectedNote.content, date: new Date().toLocaleString() }]);
    }
  }, [selectedNote]);


  React.useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        handleCloseNote();
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        setIsEditing(!isEditing);
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            handleUndo();
            break;
          case 'y':
            handleRedo();
            break;
        }
      }

      if (e.altKey) {
        if (isEditing) {
          e.preventDefault();
          switch (e.key) {
            case 'b':
              handleClickEditButton(e, 'bold');
              break;
            case 'i':
              handleClickEditButton(e, 'italic');
              break;
            case 'u':
              handleClickEditButton(e, 'underscore');
              break;
            case 'o':
              handleClickEditButton(e, 'overline');
              break;
            case 's':
              handleClickEditButton(e, 'strikethrough');
              break;
            default:
              break;
          }
        }
      }
      // Handle Ctrl+Shift+<key>
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && isEditing) {
        e.preventDefault();
        switch (e.key) {
          case 'z':
        handleRedo();
        break;
          // Add more Ctrl+Shift+<key> shortcuts here if needed
          default:
        break;
        }
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditing, isTextAreaContentFocused, handleUndo, handleRedo, handleCloseNote]);


  const updateTextAreaContent = (text) => {
    
    /**
     * Primero actualizar versionsEditions con el texto actual
     * Si el texto es diferente al último texto guardado, añadir una nueva versión
     * Si el texto es igual al último texto guardado, no hacer nada
     * 
     * Reemplazamos el valor del textarea por el nuevo texto (la última versión)
     * Se reinicia versionsSelected y si versionsSelected es mayor que 0, se eliminan las últimas versiones y se añade la nueva
     */

    setVersionsEditions((prevVersions) => {
      const lastVersion = prevVersions[prevVersions.length - 1];
      if (lastVersion && lastVersion.content && lastVersion.content === text) {
        return prevVersions; // No changes, return previous versions
      }
      
      const newVersion = {
        content: text,
        date: new Date().toLocaleString(),
      };

      // If there are more than maxVersions, remove the oldest one
      if (prevVersions.length >= maxVersions) {
        return [...prevVersions.slice(1), newVersion];
      }

      if (versionSelected > 0) {
        // Remove the undone versions and add the new one
        setVersionSelected(0);
        return [
          ...prevVersions.slice(0, prevVersions.length - versionSelected - 1),
          newVersion,
        ];
      }

      return [...prevVersions, newVersion];
    });

    const textAreaContent = document.getElementById('content-text-textarea');
    if (!selectedNote || !textAreaContent) return;

    textAreaContent.value = text;
    setCharacterCount(text.length);
    selectedNote.content = text;
  }

  const handleClickPopUp = (e) => {
    setIsNoteMenuOpen(false);
    e.stopPropagation();

    const editButtons = document.getElementById('edit-text-buttons');
    const editTextButtons = editButtons ? editButtons.querySelectorAll('.edit-text') : [];
    
    if (editTextButtons) {
      if (e.target.classList.contains('content-text') && isEditing) {
        for (let children of editTextButtons) {
          children.classList.remove('disabled');
        }
      } else {
        for (let children of editTextButtons) {
          children.classList.add('disabled');
        }
      }
    }

    const textAreaToFocus = document.getElementById(focus);
    if (textAreaToFocus) {
      textAreaToFocus.focus();
      setFocus('content-text-textarea');
    }
  };

  React.useEffect(() => {
    const textAreaContent = document.getElementById('content-text-textarea');
    if (!selectedNote || !textAreaContent) return;

    const text = versionsEditions.length > 0 ? versionsEditions[versionsEditions.length - 1 - versionSelected].content : selectedNote.content || '';
    textAreaContent.value = text;
    setCharacterCount(text.length);
    selectedNote.content = text;
  }, [versionsEditions, selectedNote, versionSelected]);

  const handleClickEditButton = (e, targetClass) => {
    e?.stopPropagation();

    if (e?.target.classList.contains('disabled') || !isTextAreaContentFocused)
      return;

    const textAreaContent = document.getElementById('content-text-textarea');
    textAreaContent.focus();

    /**
     * - Recorrer el texto en busca de tags que coincidan con el botón pulsado (LIFO)
        * - Si se encuentra un startTag sin un endTag, se deja como está.
        * - Si se encuentra un endTag sin un startTag, se elimina.
     * - Guardar en un arreglo de objetos los tags encontrados y su posición.
     * - Comprobar que el texto seleccionado coincide con un tag.
     * - Si coincide uno de los dos puntos seleccionados dentro de un tag, eliminarlo.
     * - Si no coincide, añadir el tag al texto en las posiciones seleccionadas.
     */

    const extractTags = (text) => {
      let tags = [];

      const regex = new RegExp(`(<${tagName}>|</${tagName}>)`, 'g');
      let match;
      while ((match = regex.exec(text)) !== null) {
        tags.push({
          isStartTag: new RegExp(`(<${tagName}>)`).exec(match[0]) ? true : false,
          position: match.index,
          tag: match[0],
        });
      }
      return tags;
    }

    const pairTags = (tags, lifo = [], result = []) => {
      if (tags.length === 0) {
        if (lifo.length > 0 && isLeavingStartTags) {
          // If there are unmatched start tags, add them to the result
          lifo.forEach(tag => {
            result.unshift({
              start: tag.position,
              end: null, // No end tag for unmatched start tags
            });
          });
        }
        return result;
      }

      /**
       * - Si es un startTag, se añade al lifo
       * - Si es un endTag, se comprueba si hay un startTag en el lifo
       *  - Si hay un startTag, se emparejan y se añaden al resultado
       *  - Si hay más de un startTag, se empareja con el último startTag del lifo
       *  - Si no hay un startTag, se elimina el endTag
       */

      const currentTag = tags.shift();
      if (currentTag.isStartTag) {
        lifo.unshift(currentTag);
      } else {
        const startTagIndex = lifo.findIndex(tag => tag.isStartTag && tag.position < currentTag.position);
        if (startTagIndex !== -1) {
          const startTag = lifo.splice(startTagIndex, 1)[0];
          result.unshift({
            start: startTag.position,
            end: currentTag.position,
          });
        }
      }
      return pairTags(tags, lifo, result);
    }

    const toggleTag = (pairedTags, selection) => {
      const newPairedTags = [...pairedTags];
      let indexSelectionMatchTag = -1;
      let removedTags = [];

      newPairedTags.forEach((tag, index) => {
        if ((tag.start <= selection.start && tag.end >= selection.start) || (tag.start <= selection.end && tag.end >= selection.end)) {
          indexSelectionMatchTag = index;
        }
      });

      let extraSpace = 0;

      // To select minimum one character when the selection is empty
      if (selection.start === selection.end) 
        extraSpace = 1;

      if (indexSelectionMatchTag === -1 && tagName) {
        // If no matching tag is found, create a new one
        newPairedTags.push({
          start: selection.start,
          end: selection.end, 
          // end: selection.end + tagName.length + 2 + extraSpace, 
          isNewTag: true,
        });
      } else {
        // If a matching tag is found, remove it
        removedTags.push(newPairedTags[indexSelectionMatchTag]);
        newPairedTags.splice(indexSelectionMatchTag, 1);
      }

      return [newPairedTags, removedTags];
    }
    
    // Delete the tags from the textContent
    const deleteTagsFromText = (text) => {
      const regex = new RegExp(`(<${tagName}>|</${tagName}>)`);
      let match;

      while ((match = regex.exec(text)) !== null) {
        text = text.slice(0, match.index) + text.slice(match.index + match[0].length);
      }
      return text;
    }

    // Desestructurar pairedTags en un arreglo de objetos que tengan position y tag
    // Ordenar el arreglo de objetos por position
    const deconstructTags = (tags) => (
      !tags || tags.length <= 0 ? [] :
      tags.map(tag => tag ? 
        (
          [{
            position: tag.start,
            tag: `<${tagName}>`,
            isNewTag: tag.isNewTag || false,
            isStartTag: true,
          }, {
            position: tag.end,
            tag: `</${tagName}>`,
            isNewTag: tag.isNewTag || false,
            isStartTag: false,
          }]
        ) : []
      )
      .flat()
      .sort((a, b) => a.position - b.position)
      .filter(tag => tag.position !== null)
    )    
    
    // Add the new tags to the textContent
    const addNewTagsToText = (text, tags, startTag, endTag, removedTags) => {
      // Recorrer el texto y añadir los tags en las posiciones correspondientes (en un for que añada de a un tag por iteración)
        // Se debe tomar en cuenta isNewTag para correr las posiciones y añadir el tag en la posición correcta

      if (text[text.length - 1] !== ' ')
        text += ' '; 

      let newText = '';
      let offset = 0;

      console.log('------------------------------------------------')
      text.split('').forEach((char, index) => {
        const tag = tags.filter(tag => tag.position === index + offset);
        const removedTag = removedTags.filter(tag => tag.position === index + offset);
        
        // const tag = tags.filter(tag => tag.position === index);
        // const removedTag = removedTags.filter(tag => tag.position === index);

        // console.log(`char: ${char}, index: ${index}, offset: ${offset}, tag:`, tag);

        if (removedTag.length > 0) {
          // If there is a removed tag, we need to adjust the offset
          // if (!removedTag[0].isStartTag) {
          //   offset += (endTag.length + startTag.length);
          // }
          // if (removedTag[0].isStartTag) {
          //   offset -= startTag.length;
          // } else {
          //   offset -= endTag.length;
          // }
        }

        let textToAdd = '';
        
        if (tag.length > 0) {
          for (let t of tag) {
            if (!t.tag.includes('undefined')) {
              
              // if (t.isStartTag) {
              //   offset += startTag.length;
              // } else if (!t.isStartTag) {
              //   offset += endTag.length;
              // }
              textToAdd += t.tag;
            }
          }
        }
        
        textToAdd += char;
        newText += textToAdd;
      })
      return newText;
    }

    const tagName = targetClass ? targetClass.split('')[0] : e?.target.classList.value.split('')[0];
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;
    const textContent = textAreaContent.value;

    const selection = {
      start: textAreaContent.selectionStart,
      end: textAreaContent.selectionEnd,
    };

    const tags = extractTags(textContent);
    const pairedTags = pairTags(tags);

    const [updatedTags, removedTag] = toggleTag(pairedTags, selection);
    const textWithoutTags = deleteTagsFromText(textContent);
    const arrTags = deconstructTags(updatedTags);
    const flatRemovedTags = deconstructTags(removedTag);

    let newTextWithTags = addNewTagsToText(textWithoutTags, arrTags, startTag, endTag, flatRemovedTags);

    const checkIfNewTag = arrTags.some(tag => tag.isNewTag);

    updateTextAreaContent(newTextWithTags);

    textAreaContent.selectionStart = selection.start;
    textAreaContent.selectionEnd = selection.end;
    
    if (checkIfNewTag) {
      textAreaContent.selectionStart += startTag.length;
      textAreaContent.selectionEnd += startTag.length;
    } else {
      textAreaContent.selectionStart -= startTag.length;
      textAreaContent.selectionEnd -= startTag.length;
    }
  }

  React.useEffect(() => {
    if (isEditing) {
      document.getElementById(focus).focus();
    }

    const textAreaContent = document.getElementById('content-text-textarea');
    const divContent = document.getElementById('content-text-div');
    if (textAreaContent)
      textAreaContent.scrollTop = scrollYContent.current;

    if (divContent)
    divContent.scrollTop = scrollYContent.current;
  }, [isEditing, focus]);

  React.useEffect(() => {
    setCharacterCount(selectedNote ? selectedNote.content.length : 0);
  }, [selectedNote]);

  React.useEffect(() => {
    const popUpOverlay = document.querySelector('.pop-up-overlay');
    const popUpContent = document.querySelector('.pop-up-content');

    if (popUpContent && popUpOverlay) {
      if (showPopUp && selectedNote) {

        popUpOverlay.classList.add('visible');
        popUpContent.classList.add('visible');
      } else {
        popUpOverlay.classList.remove('visible');
        popUpContent.classList.remove('visible');
      }
    }
  }, [showPopUp, selectedNote]);

  return (
    <div className="pop-up-overlay" onClick={handleCloseNote}>
      <div className="pop-up-content" onClick={handleClickPopUp}>
        { isEditing ? 
          <>
            <textarea 
              id='content-title-textarea'
              className='content-title'
              placeholder='Title of your note...'
              defaultValue={selectedNote?.title}
              maxLength={100}
              onChange={(e)=>{
                selectedNote.title = e.target.value;
              }} 
              />
            <textarea
              id='content-text-textarea'
              className='content-text' 
              placeholder='Write your note here...'
              defaultValue={selectedNote?.content}
              onClick={() => setIsTextAreaContentFocused(true)}
              onChange={(e)=>{
                setCharacterCount(e.target.value.length);
                selectedNote.content = e.target.value;
                updateTextAreaContent(e.target.value);
              }} 
              onScroll={(e) => {
                if (e.target.scrollTop !== scrollYContent.current) {
                  scrollYContent.current = e.target.scrollTop;
                }
              }}
              maxLength={maxCharacters}
              />

            <div id='edit-text-buttons' className='edit-text-buttons'>
              <Tooltip text='Bold (Alt + B)' >
                <svg onClick={handleClickEditButton} className='bold edit-text' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.10505 12C4.70805 12 4.4236 11.912 4.25171 11.736C4.0839 11.5559 4 11.2715 4 10.8827V4.11733C4 3.72033 4.08595 3.43588 4.25784 3.26398C4.43383 3.08799 4.71623 3 5.10505 3C6.42741 3 8.25591 3 9.02852 3C10.1373 3 11.0539 3.98153 11.0539 5.1846C11.0539 6.08501 10.6037 6.81855 9.70327 7.23602C10.8657 7.44851 11.5176 8.62787 11.5176 9.48128C11.5176 10.5125 10.9902 12 9.27734 12C8.77742 12 6.42626 12 5.10505 12ZM8.37891 8.00341H5.8V10.631H8.37891C8.9 10.631 9.6296 10.1211 9.6296 9.29877C9.6296 8.47643 8.9 8.00341 8.37891 8.00341ZM5.8 4.36903V6.69577H8.17969C8.53906 6.69577 9.27734 6.35939 9.27734 5.50002C9.27734 4.64064 8.48047 4.36903 8.17969 4.36903H5.8Z" fill="currentColor"></path></svg>
              </Tooltip>
              <Tooltip text='Italic (Alt + I)' >
                <svg onClick={handleClickEditButton} className='italic edit-text' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.67494 3.50017C5.67494 3.25164 5.87641 3.05017 6.12494 3.05017H10.6249C10.8735 3.05017 11.0749 3.25164 11.0749 3.50017C11.0749 3.7487 10.8735 3.95017 10.6249 3.95017H9.00587L7.2309 11.05H8.87493C9.12345 11.05 9.32493 11.2515 9.32493 11.5C9.32493 11.7486 9.12345 11.95 8.87493 11.95H4.37493C4.1264 11.95 3.92493 11.7486 3.92493 11.5C3.92493 11.2515 4.1264 11.05 4.37493 11.05H5.99397L7.76894 3.95017H6.12494C5.87641 3.95017 5.67494 3.7487 5.67494 3.50017Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip text='Underline (Alt + U)' >
                <svg onClick={handleClickEditButton} className='underscore edit-text' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.00001 2.75C5.00001 2.47386 4.77615 2.25 4.50001 2.25C4.22387 2.25 4.00001 2.47386 4.00001 2.75V8.05C4.00001 9.983 5.56702 11.55 7.50001 11.55C9.43301 11.55 11 9.983 11 8.05V2.75C11 2.47386 10.7762 2.25 10.5 2.25C10.2239 2.25 10 2.47386 10 2.75V8.05C10 9.43071 8.88072 10.55 7.50001 10.55C6.1193 10.55 5.00001 9.43071 5.00001 8.05V2.75ZM3.49998 13.1001C3.27906 13.1001 3.09998 13.2791 3.09998 13.5001C3.09998 13.721 3.27906 13.9001 3.49998 13.9001H11.5C11.7209 13.9001 11.9 13.721 11.9 13.5001C11.9 13.2791 11.7209 13.1001 11.5 13.1001H3.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip text='Strikethrough (Alt + S)' >
                <svg onClick={handleClickEditButton} className='strikethrough edit-text' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.00003 3.25C5.00003 2.97386 4.77617 2.75 4.50003 2.75C4.22389 2.75 4.00003 2.97386 4.00003 3.25V7.10003H2.49998C2.27906 7.10003 2.09998 7.27912 2.09998 7.50003C2.09998 7.72094 2.27906 7.90003 2.49998 7.90003H4.00003V8.55C4.00003 10.483 5.56703 12.05 7.50003 12.05C9.43303 12.05 11 10.483 11 8.55V7.90003H12.5C12.7209 7.90003 12.9 7.72094 12.9 7.50003C12.9 7.27912 12.7209 7.10003 12.5 7.10003H11V3.25C11 2.97386 10.7762 2.75 10.5 2.75C10.2239 2.75 10 2.97386 10 3.25V7.10003H5.00003V3.25ZM5.00003 7.90003V8.55C5.00003 9.93071 6.11932 11.05 7.50003 11.05C8.88074 11.05 10 9.93071 10 8.55V7.90003H5.00003Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip text='Overline (Alt + O)' >
                <svg onClick={handleClickEditButton} className='overline edit-text' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.49985 1.10001C3.27894 1.10001 3.09985 1.27909 3.09985 1.50001C3.09985 1.72092 3.27894 1.90001 3.49985 1.90001H11.4999C11.7208 1.90001 11.8999 1.72092 11.8999 1.50001C11.8999 1.27909 11.7208 1.10001 11.4999 1.10001H3.49985ZM4.99995 4.25001C4.99995 3.97387 4.77609 3.75001 4.49995 3.75001C4.22381 3.75001 3.99995 3.97387 3.99995 4.25001V9.55001C3.99995 11.483 5.56695 13.05 7.49995 13.05C9.43295 13.05 11 11.483 11 9.55001V4.25001C11 3.97387 10.7761 3.75001 10.5 3.75001C10.2238 3.75001 9.99995 3.97387 9.99995 4.25001V9.55001C9.99995 10.9307 8.88066 12.05 7.49995 12.05C6.11924 12.05 4.99995 10.9307 4.99995 9.55001V4.25001Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip text='Undo (Ctrl + Z)' >
                <svg onClick={handleUndo} className='undo' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.85355 2.14645C5.04882 2.34171 5.04882 2.65829 4.85355 2.85355L3.70711 4H9C11.4853 4 13.5 6.01472 13.5 8.5C13.5 10.9853 11.4853 13 9 13H5C4.72386 13 4.5 12.7761 4.5 12.5C4.5 12.2239 4.72386 12 5 12H9C10.933 12 12.5 10.433 12.5 8.5C12.5 6.567 10.933 5 9 5H3.70711L4.85355 6.14645C5.04882 6.34171 5.04882 6.65829 4.85355 6.85355C4.65829 7.04882 4.34171 7.04882 4.14645 6.85355L2.14645 4.85355C1.95118 4.65829 1.95118 4.34171 2.14645 4.14645L4.14645 2.14645C4.34171 1.95118 4.65829 1.95118 4.85355 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip text='Redo (Ctrl + Y)' >
                <svg onClick={handleRedo} className='redo' width="15" height="15" style={{transform: 'scaleX(-1)'}} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.85355 2.14645C5.04882 2.34171 5.04882 2.65829 4.85355 2.85355L3.70711 4H9C11.4853 4 13.5 6.01472 13.5 8.5C13.5 10.9853 11.4853 13 9 13H5C4.72386 13 4.5 12.7761 4.5 12.5C4.5 12.2239 4.72386 12 5 12H9C10.933 12 12.5 10.433 12.5 8.5C12.5 6.567 10.933 5 9 5H3.70711L4.85355 6.14645C5.04882 6.34171 5.04882 6.65829 4.85355 6.85355C4.65829 7.04882 4.34171 7.04882 4.14645 6.85355L2.14645 4.85355C1.95118 4.65829 1.95118 4.34171 2.14645 4.14645L4.14645 2.14645C4.34171 1.95118 4.65829 1.95118 4.85355 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              <Tooltip 
                text='Menu (Ctrl + M)' 
                container_props={{
                  onClick: (e) => {
                    e.stopPropagation();
                    setIsNoteMenuOpen(!isNoteMenuOpen);
                  }
                }}
              >
                <svg className='menus' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Tooltip>
              {isNoteMenuOpen && (
                <div 
                  className='menu'
                  text-color='var(--text-color-light)'
                  style={{
                    '--background-hover': 'black',
                    fontSize: '1rem',
                    fontWeight: '500',
                  }}
                >
                  {dataMenu.map((item, index) => (
                    <div
                      key={index}
                      className='menu-item'
                      onClick={async () => {
                        await item.action();
                        // item.title === 'Log out' && window.location.reload();
                      }}
                    >
                      {item.icon}
                      <span className='menu-title'>{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
          : <>
          <div 
            id='content-title-div'
            className='content-title'
            onDoubleClick={() => {
              setIsEditing(true);
              setFocus('content-title-textarea');
            }}
            dangerouslySetInnerHTML={{ __html: hyphenText(selectedNote?.title, charsToHypenTitle) }} />
          <div 
            id='content-text-div'
            className='content-text'
            onScroll={(e) => {
              if (e.target.scrollTop !== scrollYContent.current) {
                scrollYContent.current = e.target.scrollTop;
              }
            }}
            onDoubleClick={() => {
              setIsEditing(true);
              setFocus('content-text-textarea');
            }} 
            dangerouslySetInnerHTML={{ __html: hyphenText(selectedNote?.content, charsToHypenText).replace(/\n/g, '<br/>').replace(/ {2}/g, '&nbsp; ') }} />
          </>}

        <div className='character-count'>{characterCount} / {maxCharacters}</div>
        <div className='note-details'>
          <span>{selectedNote?.createdAt?.split('T')[0]}</span>
          <span>{selectedNote?.content.length} characters</span>
        </div>

        <svg 
          className='close-button'
          onClick={handleCloseNote} 
          width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>

        <div 
          className='enable-edit-button'
          onClick={() => setIsEditing(!isEditing)} >
          {
            isEditing ? 
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            : <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          }
        </div>
      </div>
    </div>
  );
}