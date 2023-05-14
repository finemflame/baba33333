export default defineEventHandler((event) => {
    const headers = event.req.headers;
    
    const redirectUrl = "https://markmystories.com" + event.req.url;
    sendRedirect(event, redirectUrl);
});
