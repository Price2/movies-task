var eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
      this.events[eventName] = this.events[eventName]
        ? this.events[eventName]
        : [];
      this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(function (callBackfn) {
          callBackfn(data);
        });
      }
    },
  };

  

var moviesComponent =
{   
    data:[],
    currentPage: 1,

    init: async function(){
        this.cacheElements()
        this.bindEvents()
        await this.fetchMoviesApi(1)
        this.render()
    },

    cacheElements: function(){
        this.body = $("body")
        this.cards_wrapper = $('#cards-wrapper');
        this.prevBtn = $("#previousBtn")
        this.nextBtn = $("#nextBtn")
        
    },
    bindEvents: function(){
        eventsMediator.on('renderMovies',this.fetchMoviesApi.bind(this))
        $(this.prevBtn).click(this.previousBtnFetch.bind(this));
        $(this.nextBtn).click(this.nextBtnFetch.bind(this));
    },
    getAllMovies: function(){
        return this.data
    },
    previousBtnFetch: function(){
        if(this.currentPage != 1){
            this.currentPage--
            eventsMediator.emit('renderMovies', this.currentPage)
        }
    },
    nextBtnFetch: function(){
        this.currentPage++
        eventsMediator.emit('renderMovies', this.currentPage)
    },
    

    setMoviesData: function(movies){
        this.data = movies
        this.render()
    },
    setCurrentMovie: function(movie){
        this.currentSelectedMovie = movie
    },
    fetchMoviesApi: async function(page){
        console.log("Page: ", page)
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
                    { method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZjBmZjg1YzkyMmYzZTNmZWM0MTViNzVhODgwOWVmYyIsInN1YiI6IjY0NzcxMzk1ZDM3MTk3MDBhN2ZlZmZmMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OqPPBjIXUg352UNWHVjFRHEvl8oJwbEOVdDVU9XNQuA'
                    }}
                    );
        const movies = await response.json();
        this.setMoviesData(movies.results)
        eventsMediator.emit('movieStats', movies)
        this.render()
        return movies
    },
    render: function(){
        var movies = this.data
        var currentPage = this.currentPage
        this.cards_wrapper.html("");
        for (let i = 0; i < movies.length; i++) {
            this.cardCol = $('<div class="col-md-3 mb-3"></div>')
            this.card = $('<div class="card" style="cursor:pointer"></div>')
            this.cardImg = $('<img src= "https://image.tmdb.org/t/p/w500'+movies[i].poster_path+'" class="img-fluid card-img-top" alt="'+movies[i].title+' movie image">')
            this.cardBody = $('<div class="card-body"></div>')
            this.cardtitle = $('<h5 class="card-title">'+movies[i].title+'</h5>')
            this.cardParagraph = $('<p class="card-text">rating: '+movies[i].vote_average+'</p>')
          
            $(this.card).click(function (e) { 
            eventsMediator.emit("renderModal", movies[i])
            $('body').css("overflow", "hidden");
          });
            this.cardBody.append(this.cardtitle, this.cardParagraph)
            this.card.append(this.cardImg, this.cardBody)
            this.cardCol.append(this.card)
            this.cards_wrapper.append(this.cardCol)

            
        }
    }
}

var statsComponent = {
    // movieStats: {},


init: function(){
    this.cachedElements()
    this.bindEvents()
},

cachedElements: function(){
    this.container = $('.container')
    this.moviestatsHTML = $('.movies')
},

bindEvents:function(){
    eventsMediator.on('movieStats', this.setMovieStats.bind(this))
},

setMovieStats: function(movies){

    let top_rated_movie = ''
    let highest_rate = 0
    movies.results.forEach(element => {
        if (element.vote_average > highest_rate){
            highest_rate = element.vote_average
            top_rated_movie = element.title
        }
    });
    this.movieStats = {currentPage: movies.page, movie_Num: movies.results.length, top_rated: top_rated_movie, rating: highest_rate}
    this.render()
},

render: function(){
    this.moviestatsHTML.html("")
    this.movieStatTemp = `<h1>Movies</h1>
    <div id="movies-stats" class="mb-5 ">
        <h2>Stats</h2>
        <p class="m-1">Current page: ${this.movieStats.currentPage}</p>
        <p class="m-1">Number of movies: ${this.movieStats.movie_Num}</p>
        <p class="m-1">Top rated movie: ${this.movieStats.top_rated}</p>
        <p class="m-1">Rating: ${this.movieStats.rating}</p>
    </div>`

    this.moviestatsHTML.append(this.movieStatTemp)
}
}





var modalComponent = {
    currentSelectedMovie: null,
    // currentPage: 1,
    
    init: function(){
        this.cacheElements()
        this.bindEvents()
    },
    bindEvents: function(){
        eventsMediator.on('renderModal', this.setCurrentSelected.bind(this))

    },
    setCurrentSelected: function (movie) {
        this.currentSelectedMovie = movie;
        this.render();
      },
    
    cacheElements: function(){
        this.body = $("body")
        this.modal =$("#modal_popup")
    },
    render: function(){

        this.modal_popup_temp =`<div id="modal_popup" class="modal-popup">
        <div id="modal-popup-body" class="modal-popup-content">
            <div class="row justify-content-end">
                <div class="col-md-1 d-flex justify-content-end ">
                    <span id="modal-close-icon" class="Close"
                        data-dismiss="modal"
                        style="font-size: 50px; cursor:pointer">&times;</span>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5 p-0">
                    <img id="modal-img" class="img-fluid"
                        src= "${this.currentSelectedMovie ? `https://image.tmdb.org/t/p/w500${this.currentSelectedMovie.poster_path}`:``}"
                        alt="card-img">
                </div>

                <div class="col-md-7" style="padding: 0px 35px;">
                    <h2 id="modal-title" class="mb-3 mt-3">${this.currentSelectedMovie? this.currentSelectedMovie.title:''}</h2>
                    <h3 id="modal-paragraph class="mt-4">IMDB Rating:
                        ${this.currentSelectedMovie?this.currentSelectedMovie.vote_average:''}/10
                        (${this.currentSelectedMovie?this.currentSelectedMovie.vote_count:''})</h3>
                    <p id="modal-paragraph" class="mt-4">${this.currentSelectedMovie?this.currentSelectedMovie.overview:null}</p>
                </div>

            </div>
            
        </div>
    </div>`

    $(document).on('click','#modal-close-btn,#modal-close-icon' ,function () {
        $("#modal_popup").remove();
        $("body").css("overflow", "scroll");
        // eventsMediator.emit('renderMovies')
    });
    this.body.append(this.modal_popup_temp)

    }


}

$(document).ready(function () {
    statsComponent.init()
    moviesComponent.init()
    modalComponent.init()
});