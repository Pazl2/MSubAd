const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3000;
const app = express();


// Папка со статикой (картинки, css, js, и т.д.)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "main_img"))); 
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
// Устанавливаем EJS как шаблонизатор
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // папка для шаблонов


// Главная
app.get("/", (req, res) => {
  res.render("main");
});

// Маршруты
const pageMapping = {
  catalog: "catalog.html",
  about: "about.ejs",
  tickets: "tickets.ejs",
  account: "account.ejs",
};

Object.entries(pageMapping).forEach(([route, file]) => {
  app.get(`/${route}`, (req, res) => {
    res.render(file); // рендерим .ejs файлы
  });
});

// 404
app.use((req, res) => {
  res.status(404).send("404 — Страница не найдена");
});

// Запуск


app.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});