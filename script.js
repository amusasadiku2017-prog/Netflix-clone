const movies = [
    {
        title: "Squid Game",
        category: "trending",
        image: "photo-1489599849927-2ee91cede3ba"
    },
    {
        title: "Wednesday",
        category: "trending",
        image: "photo-1518709268805-4e9042af9f23"
    },
    {
        title: "Stranger Things",
        category: "trending",
        image: "photo-1500530855697-b586d89ba3ee"
    },
    {
        title: "The Witcher",
        category: "trending",
        image: "photo-1519608487953-e999c86e7455"
    },
    {
        title: "Money Heist",
        category: "trending",
        image: "photo-1519608487953-e999c86e7455"
    },
    {
        title: "Black Panther",
        category: "popular",
        image: "photo-1536440136628-849c177e76a1"
    },
    {
        title: "Inception",
        category: "popular",
        image: "photo-1440404653325-ab127d49abc1"
    },
    {
        title: "Interstellar",
        category: "popular",
        image: "photo-1451187580459-43490279c0fa"
    },
    {
        title: "The Batman",
        category: "popular",
        image: "photo-1519608487953-e999c86e7455"
    },
    {
        title: "Mission Impossible",
        category: "action",
        image: "photo-1500534623283-312aade485b7"
    },
    {
        title: "Dark City",
        category: "action",
        image: "photo-1519608487953-e999c86e7455"
    }
];

let myList = [];

function displayMovies() {

    const sections = {
        trending: "trendingMovies",
        popular: "popularMovies",
        action: "actionMovies"
    };

    Object.values(sections).forEach(id => {
        document.getElementById(id).innerHTML = "";
    });

    movies.forEach(movie => {

        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="https://images.unsplash.com/${movie.image}?w=500"
            alt="${movie.title}">

            <h3>${movie.title}</h3>
            <p>Movie • NOVA+ Original</p>
        `;

        card.onclick = () => {
            showMessage("Selected: " + movie.title);
        };

        document.getElementById(
            sections[movie.category]
        ).appendChild(card);

    });

    displayMyList();
}

function showMessage(text) {
    const message = document.getElementById("message");

    message.textContent = text;
    message.style.display = "block";

    setTimeout(() => {
        message.style.display = "none";
    }, 2500);
}

function playMovie() {
    showMessage("Your movie is ready to explore!");
}

function addFeatured() {
    showMessage("Featured movie added to your list!");
}

function displayMyList() {

    const container = document.getElementById("myListMovies");

    container.innerHTML = "";

    myList.forEach(movie => {
        container.innerHTML += `
            <div class="movie-card">
                <img src="https://images.unsplash.com/${movie.image}?w=500">
                <h3>${movie.title}</h3>
            </div>
        `;
    });

}

document.getElementById("search").addEventListener("input", function() {

    const searchValue = this.value.toLowerCase();

    document.querySelectorAll(".movie-card").forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();

        card.style.display = title.includes(searchValue) ? "block" : "none";
    });

});

displayMovies();
