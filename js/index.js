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

  

var moviesModel =
{   
    currentSelectedMovie: null,
    data:[],


    init: function(){

    },
    getAllMovies: function(){
        return this.data
    },
    getCurrentSelectedMovie: function() {
        return this.currentSelectedMovie
    },
    setMoviesData: function(movies){
        this.data = movies
    },
    setCurrentMovie: function(movie){
        this.currentSelectedMovie = movie
    }
}


var moviesController = {
    init: async function(){
        await this.fetchMoviesApi()
        currentSelectedCardView.init()
        movieCardsView.init()
    },

    getAllMovies: function(){
       return moviesModel.getAllMovies()
    },

    getCurrentSelectedMovie: function(){
        return moviesModel.getCurrentSelectedMovie()
    },

    fetchMoviesApi: async function(){

        const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
                    { method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZjBmZjg1YzkyMmYzZTNmZWM0MTViNzVhODgwOWVmYyIsInN1YiI6IjY0NzcxMzk1ZDM3MTk3MDBhN2ZlZmZmMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OqPPBjIXUg352UNWHVjFRHEvl8oJwbEOVdDVU9XNQuA'
                    }}
                    );
        const movies = await response.json();
        moviesModel.setMoviesData(movies.results)
        eventsMediator.emit('renderMovies')
        return movies
    },

    setMoviesData: function(movies){
        moviesModel.setMoviesData(movies)
    },
    setCurrentMovie: function(movie) {
        moviesModel.setCurrentMovie(movie)
        eventsMediator.emit('renderMovies.onClick')
    }
}



var movieCardsView = {

    init: function(){
        this.body = $("body")
        this.cards_wrapper = $('#cards-wrapper');
        eventsMediator.on('renderMovies', function(){ movieCardsView.render()})
        this.render()
    },
    render: function(){
  
        var movies = moviesController.getAllMovies()
        this.cards_wrapper.html("");
        for (let i = 0; i < movies.length; i++) {
            this.cardCol = $('<div class="col-md-3 mb-3"></div>')
            this.card = $('<div class="card" style="cursor:pointer"></div>')
            this.cardImg = $('<img src= "https://image.tmdb.org/t/p/w500'+movies[i].poster_path+'" class="img-fluid card-img-top" alt="'+movies[i].title+' movie image">')
            this.cardBody = $('<div class="card-body"></div>')
            this.cardtitle = $('<h5 class="card-title">'+movies[i].title+'</h5>')
            this.cardParagraph = $('<p class="card-text">rating: '+movies[i].vote_average+'</p>')
          
            $(this.card).click(function (e) { 
            moviesController.setCurrentMovie(movies[i])
            movieCardsView.body.css("overflow", "hidden");
          });
            this.cardBody.append(this.cardtitle, this.cardParagraph)
            this.card.append(this.cardImg, this.cardBody)
            this.cardCol.append(this.card)
            this.cards_wrapper.append(this.cardCol)

            
        }
    }

}


var currentSelectedCardView = {

    init: function(){
        this.body = $('body')
        eventsMediator.on('renderMovies.onClick', function(){ currentSelectedCardView.render()})
    },
    render: function(){
        
        var currentMovie = moviesModel.getCurrentSelectedMovie()
    
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
                        src='https://image.tmdb.org/t/p/w500${currentMovie.poster_path}'
                        alt="card-img">
                </div>

                <div class="col-md-7" style="padding: 0px 35px;">
                    <h2 id="modal-title" class="mb-3 mt-3">${currentMovie.title}</h2>
                    <h3 id="modal-paragraph class="mt-4">IMDB Rating:
                        ${currentMovie.vote_average}/10
                        (${currentMovie.vote_count})</h3>
                    <p id="modal-paragraph" class="mt-4">${currentMovie.overview}</p>
                </div>

            </div>
            
        </div>
    </div>`

    $(document).on('click','#modal-close-btn,#modal-close-icon' ,function () {
        $("#modal_popup").remove();
        currentSelectedCardView.body.css("overflow", "scroll");
        eventsMediator.emit('renderMovies')
    });
    this.body.append(this.modal_popup_temp)

    }


}

$(document).ready(function () {
    moviesController.init()
});