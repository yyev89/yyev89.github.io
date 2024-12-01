function loadTranslations() {
    const url = window.location.href;

    var params = new URLSearchParams(window.location.search);

    var location = params.get('location');
    if(!location || location != 'it'){
        location = 'ua';
    }

    fetch('/trans/'+location+'.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('file not found');
            }
            return response.json();
        })
        .then(data => {
            applyTranslations(data); 
   
        })
        .catch(error => {
            console.error('Error:', error);
        });


    // change links
    if (params.toString()) {
    document.querySelectorAll('a:not(.external)').forEach(link => {
        const currentHref = link.href;
        const url = new URL(currentHref);

        const hash = url.hash;
        url.hash = '';
        params.forEach((value, key) => url.searchParams.set(key, value));
        url.hash = hash;

        link.href = url.toString();
        });
    }

    //add class active in change local button
    const element = document.querySelector('.translate-switch a[attr-trans="'+location+'"]');

    if (element) {
        element.classList.add('active');
    }

    //check device first visit local
    if (!localStorage.getItem('local')) {

        const userLocale = navigator.language || navigator.userLanguage;

        if (userLocale.startsWith('it') &&  location == 'ua') {
             localStorage.setItem('local', 1);
            const currentUrl = window.location.href;
            const url = new URL(currentUrl);

            url.searchParams.set('location', 'it'); 

            window.location.href = url.toString();
        }else{
             localStorage.setItem('local', 1);
        }
    }
}


function applyTranslations(translations) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            if (el.tagName.toLowerCase() === 'img') {
                el.setAttribute('alt', translations[key]);
            } else {
                el.innerHTML = translations[key];
            }
        } else {
            console.warn(`Key '${key}' not found in JSON translations`);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.translate-switch a').forEach(element => {
        element.addEventListener('click', function (event) {
        
            event.preventDefault();
            const attrTrans = this.getAttribute('attr-trans');
            const href = this.getAttribute('href');

            if(href && href != '#'){
                localStorage.setItem('local', attrTrans);
                 window.location.href = href;
            }
        });
    });
});
