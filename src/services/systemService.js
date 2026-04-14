import api from '../api/axios';

const systemService = {
    getSettings: () => api.get('/v1/auth/system-settings/'),
    updateSettings: (data) => api.patch('/v1/auth/system-settings/', data),
};

export default systemService;
