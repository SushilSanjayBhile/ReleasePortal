import axios from 'axios';
export const updateUserNotifications = ({ email, startTime }) => {
    // return new Promise((resolve, reject) => {
    return axios.get(`/users/id/${email}`);
    // });
}