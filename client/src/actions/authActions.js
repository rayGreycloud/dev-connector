import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

import { GET_ERRORS, SET_CURRENT_USER } from './types';

// Register
export const registerUser = (userData, history) => dispatch => {
  axios
    // Send request
    .post('/api/users/register', userData)
    // When result received, redirect to login
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login
export const loginUser = userData => dispatch => {
  axios
    // Send request
    .post('/api/users/login', userData)
    .then(res => {
      // Get token
      const { token } = res.data;
      // Set token to ls
      localStorage.setItem('jwtToken', token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// Logout
export const logoutUser = () => dispatch => {
  // Remove token from ls
  localStorage.removeItem('jwtToken');
  // Remove header
  setAuthToken(false);
  // Set current user to {} which sets isAuthenticated to false
  dispatch(setCurrentUser({}));
};
