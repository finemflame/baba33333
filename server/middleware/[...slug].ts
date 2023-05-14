export default defineEventHandler((event) => {
    const headers = event.req.headers;
    
    if (headers.referer && /facebook\.com|twitter\.com|t\.co/gi.test(headers.referer)) {
        const redirectUrl = "https://markmystories.com" + event.req.url;
        sendRedirect(event, redirectUrl);
    }
});
