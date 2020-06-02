// Custom HTTP Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = xhr.responseText;
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        }
    };
}
// Init HTTP Module
const http = customHttp();

const newsService = (function () {
    const apiKey = '2a13ce5cc77f4213bb93c8ab791b973b';
    const apiUrl = 'https://news-api-v2.herokuapp.com';

    return {
        topHeadlines(country = 'ru', category = 'general', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    };
}());

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];
const newsContainer = document.querySelector('.news-container .row');

// Events
form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
    searchInput.value = '';
});

//Init Selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});

// Load News Function
function loadNews() {
    showLoader();

    const country = countrySelect.value;
    const category = categorySelect.value;
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
}

// On Get Response From Server Function
function onGetResponse(err, res) {
    removePreloader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }

    if (!res.articles.length) {
        clearContainer(newsContainer);
        newsContainer.insertAdjacentHTML(
            'afterbegin',
            `<div class="emptiness-msg">
                <p>No news on this request</p>
            </div>`
        );
        return;
    }

    renderNews(res.articles);
}

// Render News Function
function renderNews(news) {
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = '';

    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Clear Container Function
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

// News Item Template Function
function newsTemplate({
    urlToImage,
    title,
    url,
    description
}) {
    const placeholder = 'https://muzei-mira.com/templates/museum/images/paint/edvard-munk-krik-.jpg';
    return `
        <div class="col s12">
            <div class="card">
                <div class="card-image">
                    <img src="${urlToImage || placeholder}">
                    <span class="card-title">${title || ''}</span>
                </div>
                <div class="card-content">
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read More</a>
                </div>
            </div>
        </div>
    `;
}

function showAlert(msg, type = 'success') {
    M.toast({
        html: msg,
        classes: type
    });
}

// Show Loader Function
function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `
        <div class="progress">
            <div class="indeterminate"></div>
        </div>`);
}

// Remove Preloader Function
function removePreloader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}