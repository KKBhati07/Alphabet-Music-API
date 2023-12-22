//to render homepage
const home = (req, res) => {
    // uploadFileCloud("log.txt", "my_log.txt")
    return res.render("home");
}

//if user make any other request, then redirect to home
const toHome = (req, res) => {
    if (!req.originalUrl.startsWith("/api")) return res.redirect("/home");
}

const controllers = { home, toHome };

//exporting controllers
export default controllers;