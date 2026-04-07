import api from './api';

export const chatAPI = {
    sendMessage: (content) => api.post('/chat', { message: content }),
};
