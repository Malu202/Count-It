var CACHE = 'cache-and-update';

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    if (event.request.method === 'POST' &&
        url.pathname === '/Count-It/share-target') {
        console.log("Sw checkt was.")
        serveShareTarget(event);
    } else {
        event.respondWith(fromCache(event.request));
        event.waitUntil(update(event.request));
    }
});

function serveShareTarget(event) {
    const dataPromise = event.request.formData();

    // Redirect so the user can refresh the page without resending data.
    console.log("jetzt kommt der redirect");
    event.respondWith(Response.redirect('/Count-It/?share-target'));

    event.waitUntil(
        (async function () {
            // The page sends this message to tell the service worker it's ready to receive the file.
            //await nextMessage('share-ready');
            //console.log("received share-ready")

            const client = await self.clients.get(event.resultingClientId);
            const data = await dataPromise;
            console.log("sw:")
            console.log(data)
            const file = data.get('json');
            client.postMessage({ file, action: 'load-image' });
        })(),
    );
}


self.addEventListener('install', function (evt) {
    console.log('The service worker is being installed.');
    evt.waitUntil(precache());
});


function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            './chart.ios.min.js',
            './history.js',
            './index.html',
            './index.js',
            './menu.js',
            './person.js',
            './round.js',
            './statistics.js',
            './styles.css'
        ]);
    });
}
function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}
function update(request) {
    return caches.open(CACHE).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response);
        });
    });
}