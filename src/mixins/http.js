const BASE_URL = 'http://localhost:1338/inaff/api/';

function handleResponse (res) {
    if (true === res.success) {
        return res.data;
    } else {
        throw new Error(res.data)
    }
}

export const http = {
    methods: {
        get: (url) => fetch(BASE_URL + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => handleResponse(res)),

        post: (url, data) => fetch(BASE_URL + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json()).then(res => handleResponse(res)),

        delete: (url) => fetch(BASE_URL + url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => handleResponse(res)),
    }
};