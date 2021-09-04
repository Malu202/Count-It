self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    if (event.request.method === 'POST' &&
        url.pathname === '/Count-It/share-target') {
        console.log("Sw checkt was.")
        serveShareTarget(event);
        // event.respondWith((async () => {
        //     const formData = await event.request.formData();
        //     const link = formData.get('link') || '';
        //     // const responseUrl = await saveBookmark(link);
        //     serveShareTarget(event);
        //     // return Response.redirect(responseUrl, 303);
        //     return;
        // })());
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
            await nextMessage('share-ready');
            console.log("received share-ready")

            const client = await self.clients.get(event.resultingClientId);
            const data = await dataPromise;
            // const file = data.get('json');
            const file = data.get('file');
            client.postMessage({ file, action: 'load-image' });
        })(),
    );
}