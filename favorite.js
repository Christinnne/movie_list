const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const movies = JSON.parse(localStorage.getItem('myFavorite') || [])

//render favorite movie list
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

function removeFavorite(id) {
  if (!movies) return
  const index = movies.findIndex(item => item.id === id)
  if (index === -1) return

  movies.splice(index, 1)
  renderMovieList(movies)

  localStorage.setItem('myFavorite', JSON.stringify(movies))
}

//set event listener to show movie detail info
dataPanel.addEventListener('click', (event) => {
  const id = event.target.dataset.id
  if (event.target.matches('.btn-show-movie')) {
    showMovieInfo(id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(id))
  }
})


renderMovieList(movies)


