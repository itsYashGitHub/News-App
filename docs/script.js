const url = "https://newsdata.io/api/1/latest?q=";
const API_KEY = "API_KEY_HERE";

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");
let curSelectedNav = null;
let allArticles = [];
let usingSampleData = false;

window.addEventListener("load", () => fetchNews("India"));

function reload() {
  window.location.reload();
}

async function fetchNews(query) {
  const messageBox = document.getElementById("api-message");
  try {
    const res = await fetch(`${url}${query}&apikey=${API_KEY}`);
    if (!res.ok) throw new Error("API not working");
    const data = await res.json();
    if (!data.results || data.results.length === 0)
      throw new Error("No results");
    usingSampleData = false;
    messageBox.classList.add("hidden");
    allArticles = data.results;
    bindData(allArticles);
  } catch (error) {
    console.warn("API failed, using sample data", error);
    usingSampleData = true;
    messageBox.classList.remove("hidden");
    allArticles = filterSampleNews(sampleNews, query);
    bindData(allArticles);
  }
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");
  cardsContainer.innerHTML = "";
  articles.forEach((article) => {
    if (!article.image_url) return;
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
  if (articles.length === 0) {
    cardsContainer.innerHTML = "<h3>No matching news found.</h3>";
    return;
  }
}

function filterSampleNews(articles, query) {
  if (!query) return articles;
  query = query.toLowerCase();
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query),
  );
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");
  newsImg.src = article.image_url;
  newsTitle.innerHTML = article.title;
  newsDesc.innerHTML = article.description;
  const date = new Date(article.pubDate).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  newsSource.innerHTML = `${article.source_name} - ${date}`;
  cardClone.firstElementChild.addEventListener("click", () => {
    window.open(article.link, "_blank");
  });
}

function onNavItemClick(id) {
  if (usingSampleData) {
    allArticles = filterSampleNews(sampleNews, id);
    bindData(allArticles);
  } else fetchNews(id);
  const navItem = document.getElementById(id);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = navItem;
  curSelectedNav.classList.add("active");
}

searchButton.addEventListener("click", () => {
  const query = searchText.value.trim();
  if (!query) return;
  curSelectedNav?.classList.remove("active");
  curSelectedNav = null;
  if (usingSampleData) {
    allArticles = filterSampleNews(sampleNews, query);
    bindData(allArticles);
  } else fetchNews(query);
});
