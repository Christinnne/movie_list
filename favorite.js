const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector("#paginator");
const panelMode = document.querySelector("#panel-mode");

const movies = JSON.parse(localStorage.getItem('myFavorite') || [])
let mode = "card";
let search_list = []
let currentPage = 1
const moviesPerPage = 12;

function getMoviesByPage(page) {
  let data = search_list.length < 1 ? movies : search_list
  let start = (page - 1) * moviesPerPage
  let end = start + moviesPerPage
  return data.slice(start, end)
}

//render favorite movie list
function renderDataPanel(page) {
  switch (mode) {
    case 'card':
      createMovieCard(getMoviesByPage(page))
      break
    case 'list':
      createMovieList(getMoviesByPage(page))
      break
  }
}

function createMovieCard(data) {
  let html = ''
  data.forEach((item) => {
    html += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <div class="card-footer text-muted">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id="${item.id}">more</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
  })
  dataPanel.innerHTML = html
}

function createMovieList(data) {
  let html = ''
  let ul = document.createElement("ul");
  ul.classList = "list-group list-group-flush w-100";
  ul.id = "movie-list";

  data.forEach(item => {
    html += `
    <li class="list-group-item d-flex justify-content-between">
      <h5 class="mb-1">${item.title}</h5>
      <div>
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
          data-id="${item.id}">more</button>
        <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
      </div>
    </li>
    `;
  })
  ul.innerHTML = html;
  dataPanel.innerHTML = "";
  dataPanel.appendChild(ul);
}

//show movie detail info
function showMovieInfo(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  modalTitle.innerText = ''
  modalDate.innerText = ''
  modalDescription.innerText = ''
  modalImage.firstElementChild.src = ''

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const info = response.data.results
      modalTitle.innerText = info.title
      modalDate.innerText = 'released Date:' + info.release_date
      modalDescription.innerText = info.description
      modalImage.firstElementChild.src = POSTER_URL + info.image
    })
    .catch((err) => console.log(err))
}

//remove favorite movie
function removeFavorite(id) {
  if (!movies) return
  let initTotalPage = calculateTotalPage()

  let index = movies.findIndex(item => item.id === id)
  if (index === -1) return
  movies.splice(index, 1)

  if (search_list.length > 0) {
    index = search_list.findIndex(item => item.id === id)
    if (index === -1) return
    search_list.splice(index, 1)
  }

  //If total page change, render paginator again.
  let TotalPage = calculateTotalPage()
  if (currentPage > TotalPage) {
    currentPage--
  }
  if (initTotalPage !== TotalPage) {
    renderPaginator(currentPage)
  }

  renderDataPanel(currentPage)
  localStorage.setItem('myFavorite', JSON.stringify(movies))
}

//search movie
function searchMovie(keyword) {
  if (!movies) return
  search_list = []
  search_list = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (search_list.length < 1) alert("Cannot find movie with keyword : " + keyword)
}

//calculate total page
function calculateTotalPage() {
  let dataAmount = search_list.length < 1 ? movies.length : search_list.length
  return Math.ceil(dataAmount / moviesPerPage)
}

//render paginator
function renderPaginator(currentPage) {
  if (!movies) return
  let totalPage = calculateTotalPage()
  let html = ''

  for (let i = 1; i <= totalPage; i++) {
    html += `
      <li class="page-item ${i === Number(currentPage) ? "active" : ""}"><a type="button" class="btn-primary page-link" data-toggle="button"  data-page=${i} href="#">${i}</a></li>
    `;
  }
  paginator.innerHTML = html;
}

//set event listener to show movie detail info or remove favorite movie
dataPanel.addEventListener('click', (event) => {
  const id = event.target.dataset.id
  if (event.target.matches('.btn-show-movie')) {
    showMovieInfo(id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(id))
  }
})

//set event listener to search movie
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchInput = document.querySelector("#search-input");
  const input = searchInput.value.toLowerCase().trim()
  currentPage = 1

  searchMovie(input)
  renderDataPanel(currentPage)
  renderPaginator(currentPage)
})

//set event listener to switch mode
panelMode.addEventListener('click', (event) => {
  let item = event.target.id
  switch (item) {
    case 'card-mode':
      mode = 'card'
      break
    case 'list-mode':
      mode = 'list'
      break
  }
  renderDataPanel(currentPage)
})

//set event listener to change page
paginator.addEventListener('click', (event) => {
  let target = event.target
  if (target.tagName !== 'A') return

  const activePage = document.querySelector(".page-item.active");
  activePage.classList.remove("active")

  currentPage = target.dataset.page
  target.parentElement.classList.toggle("active")
  renderDataPanel(currentPage)

})

renderDataPanel(currentPage)
renderPaginator(currentPage)


