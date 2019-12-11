import axios from 'axios'

// let BASE_URL = "http://huihongcloud.cn:8081"
let BASE_URL = "";
if (window.location.toString().indexOf('39.108.184.47') > -1) {
    //BASE_URL = "http://47.103.66.70:8081";
   BASE_URL = "http://39.108.184.47:8081";
} else {
    BASE_URL = "http://localhost:8081";
}


export const postWithToken = (url, params, success, error) => {
    axios({
        method: "POST",
        url: BASE_URL + url,
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            "token": sessionStorage['token']
        },
        params: params
    }).then(success)
        .catch(error)
}

export const post = (url, params, success, error) => {
    axios({
        method: "POST",
        url: BASE_URL + url,
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
        params: params
    }).then(success)
        .catch(error)
}

export const getWithToken = (url, params, success, error) => {
    axios({
        method: "GET",
        url: BASE_URL + url,
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
        params: params
    }).then(success)
        .catch(error)
}

export const requestWithToken = (url, method, params, success, error) => {
    axios({
        method: method,
        url: BASE_URL + url,
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            "token": sessionStorage['token']
        },
        params: params
    }).then(success)
        .catch(error)
}

export const requestWithoutToken = (url, method, params, success, error) => {
    axios({
        method: method,
        url: BASE_URL + url,
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
        params: params
    }).then(success)
        .catch(error)
}
export const requestWithTokenJson = (url, method, params, success, error) => {
    axios({
        method: method,
        url: BASE_URL + url,
        headers: {
            "token": sessionStorage['token'],
        },
        data: params
    }).then(success)
        .catch(error)
}

export const requestWithoutTokenJson = (url, method, params, success, error) => {
    axios({
        method: method,
        url: BASE_URL + url,
        data: params
    }).then(success)
        .catch(error)
}
export const getBaseUrl = () => {
    let BASE_URL = "";
    if (window.location.toString().indexOf("39.108.184.47") > -1) {
       // BASE_URL = "http://47.103.66.70:8081";
      BASE_URL = "http://39.108.184.47:8081";
    } else {
        BASE_URL = "http://localhost:8081";
    }
    return BASE_URL;
}
