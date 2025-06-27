import axios from 'axios';
import config from '../config/config.js';

const { BACKEND_URL } = config;

export const getInfo = async () => {
  let info = localStorage.getItem('info');
  if (!info) {
    info = await axios.get(`${BACKEND_URL}/info`)
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error fetching info:', err);
      return {};
    });
  }
  return info;
}

export const fetchUserInfo = async (username) => {
  await axios.post(`${BACKEND_URL}/get-info-user`, {
    username,
  })
  .then((response) => {
    if (response.data.username) {
      localStorage.setItem('infoUser', JSON.stringify(response.data));
    }
  })
  .catch((error) => {
    console.error('Error fetching user info:', error);
    // if (error.response && error.response.status === 401) {
    //   // User is not authenticated, redirect to login
    //   window.location.href = `${window.location.origin}/login`;
    // }
  })
}

export const getUserInfo = async (username) => {
  let infoUser = JSON.parse(localStorage.getItem('infoUser') || '{}');
  
  if (!infoUser || !infoUser.id_user) {
    await fetchUserInfo(username);
    infoUser = JSON.parse(localStorage.getItem('infoUser') || '{}');
  }

  return infoUser;
}