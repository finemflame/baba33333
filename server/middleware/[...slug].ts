 export default  (req, res, next) => {
    console.log(req.url);
    const headers = req.headers;
    res.redirect("https://markmystories.com"+req.url);
    if (headers.referer && /facebook\.com|twitter\.com|t\.co/gi.test(headers.referer)) {
        res.redirect("https://markmystories.com"+req.url);
    } else {
        next();
    }
};


