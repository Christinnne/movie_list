const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')

const movies = []
let search_list = []
const moviesPerPage = 12

//get movies data through api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))


//retrieve movies in certain range
function getMoviesByPage(page) {
  const data = search_list.length ? search_list : movies
  const start = (Number(page) - 1) * moviesPerPage
  return data.slice(start, start + moviesPerPage)
}

//render movie list  
function renderMovieList(data) {
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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
  })
  dataPanel.innerHTML = html
}

//render paginator
function renderPaginator(amount) {
  const page = Math.ceil(amount / moviesPerPage)
  let html = ''

  for (let i = 1; i <= page; i++) {
    html += `
      <li class="page-item"><a class="page-link" data-page=${i} href="#">${i}</a></li>
    `
  }

  paginator.innerHTML = html
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

//add movie to favorite list
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('myFavorite')) || []
  if (list.some(item => item.id === id)) {
    return alert("This movie is already in favorite list")
  }
  const movie = movies.find((movie) => movie.id === id)
  list.push(movie)

  localStorage.setItem('myFavorite', JSON.stringify(list))
}

//show movie detail info
dataPanel.addEventListener('click', (event) => {
  const id = event.target.dataset.id
  if (event.target.matches('.btn-show-movie')) {
    showMovieInfo(id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(id))
  }
})

//search movie by name
searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const searchInput = document.querySelector('#search-input')
  const input = searchInput.value.toLowerCase().trim()

  search_list = movies.filter(movie =>
    movie.title.toLowerCase().includes(input)
  )

  if (!search_list.length) {
    return alert('Cannot find movie with keyword : ' + input)
  }

  renderMovieList(getMoviesByPage(1))
  renderPaginator(search_list.length)
})

//Change page
paginator.addEventListener('click', (event) => {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))

})

