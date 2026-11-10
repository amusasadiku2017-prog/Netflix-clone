// =================================
// NOVA+ MOVIE DATABASE
// =================================

// Paste your TMDB API key here.

const API_KEY = "PASTE_YOUR_TMDB_API_KEY_HERE";

const BASE = "https://api.themoviedb.org/3";

const IMAGE = "https://image.tmdb.org/t/p/w500";

let currentMovie = null;
let isSignup = false;
let featuredMovie = null;


// =================================
// API CONNECTION
// =================================

async function api(endpoint) {

    if (API_KEY === "PASTE_YOUR_TMDB_API_KEY_HERE") {
        alert("Add your TMDB API key inside script.js first.");
        return null;
    }

    try {

        const response = await fetch(
            BASE + endpoint +
            (endpoint.includes("?") ? "&" : "?") +
            "api_key=" + API_KEY
        );

        if (!response.ok) {
            throw new Error("Movie database error");
        }

        return await response.json();

    } catch(error) {

        console.log(error);

        return null;
    }
}


// =================================
// DISPLAY MOVIE CARDS
// =================================

function displayMovies(movies, container) {

    const box = document.getElementById(container);

    box.innerHTML = "";

    if (!movies || movies.length === 0) {

        box.innerHTML = "<p>No movies found.</p>";

        return;
    }

    movies.forEach(movie => {

        if (!movie.poster_path) return;

        const card = document.createElement("div");

        card.className = "movie-card";

        card.innerHTML = `
            <img
                src="${IMAGE + movie.poster_path}"
                alt="${movie.title || movie.name}"
                loading="lazy"
            >

            <h3>${movie.title || movie.name}</h3>

            <p>⭐ ${movie.vote_average?.toFixed(1) || "N/A"}</p>
        `;

        card.onclick = () => openMovie(movie);

        box.appendChild(card);

    });

}


// =================================
// LOAD HOMEPAGE
// =================================

async function loadHome() {

    const trending = await api("/trending/movie/day");

    if (trending) {

        displayMovies(
            trending.results,
            "trendingMovies"
        );

        featuredMovie = trending.results[0];

        if (featuredMovie) {

            document.getElementById("heroTitle").innerText =
                featuredMovie.title;

            document.getElementById("heroDescription").innerText =
                featuredMovie.overview ||
                "Discover amazing entertainment.";
        }
    }


    const popular = await api("/movie/popular");

    if (popular) {
        displayMovies(popular.results, "popularMovies");
    }


    const action = await api(
        "/discover/movie?with_genres=28"
    );

    if (action) {
        displayMovies(action.results, "actionMovies");
    }


    const nigeria = await api(
        "/discover/movie?with_origin_country=NG"
    );

    if (nigeria) {
        displayMovies(nigeria.results, "nigerianMovies");
    }


    const tv = await api("/tv/popular");

    if (tv) {
        displayMovies(tv.results, "tvMovies");
    }

    displayMyList();
}


// =================================
// SEARCH ANY MOVIE
// =================================

let searchTimer;

function searchMovies() {

    clearTimeout(searchTimer);

    const value =
        document.getElementById("search").value.trim();

    const section =
        document.getElementById("searchSection");

    if (!value) {

        section.style.display = "none";

        return;
    }

    section.style.display = "block";

    document.getElementById("searchHeading").innerText =
        "Results for: " + value;

    searchTimer = setTimeout(async () => {

        const results = await api(
            "/search/multi?query=" +
            encodeURIComponent(value)
        );

        if (results) {

            const filtered = results.results.filter(item =>
                ["movie", "tv"].includes(item.media_type)
            );

            displayMovies(
                filtered,
                "searchResults"
            );
        }

    }, 500);
}


// =================================
// OPEN MOVIE DETAILS
// =================================

async function openMovie(movie) {

    currentMovie = movie;

    const type = movie.media_type || "movie";

    document.getElementById("movieModal").style.display =
        "block";

    document.getElementById("detailTitle").innerText =
        movie.title || movie.name;

    document.getElementById("detailPoster").src =
        IMAGE + movie.poster_path;

    document.getElementById("detailDescription").innerText =
        movie.overview || "No description available.";

    document.getElementById("detailDate").innerText =
        "Release: " +
        (movie.release_date || movie.first_air_date || "Unknown");

    document.getElementById("movieActions").innerHTML = `
        <button onclick="addToList()">❤️ Add to My List</button>
    `;

    document.getElementById("trailerBox").innerHTML =
        "<p>Finding trailer...</p>";

    document.getElementById("providers").innerHTML =
        "<p>Finding available streaming services...</p>";


    const videos = await api(
        "/" + type + "/" + movie.id + "/videos"
    );

    if (videos) {

        const trailer = videos.results.find(video =>
            video.site === "YouTube" &&
            (video.type === "Trailer" || video.type === "Teaser")
        );

        if (trailer) {

            document.getElementById("trailerBox").innerHTML = `
                <iframe
                    src="https://www.youtube-nocookie.com/embed/${trailer.key}"
                    allowfullscreen
                    title="Movie trailer">
                </iframe>
            `;

        } else {

            document.getElementById("trailerBox").innerHTML =
                "<p>No trailer available.</p>";
        }
    }


    // Find licensed viewing providers

    const providers = await api(
        "/" + type + "/" + movie.id + "/watch/providers"
    );

    if (providers) {

        const country = providers.results?.NG ||
                        providers.results?.US;

        if (country) {

            const services = [
                ...(country.flatrate || []),
                ...(country.rent || []),
                ...(country.buy || [])
            ];

            document.getElementById("providers").innerHTML =
                services.length
                ? services.map(service => `
                    <div>
                        <img
                            src="${IMAGE + service.logo_path}"
                            alt="${service.provider_name}">
                        <p>${service.provider_name}</p>
                    </div>
                `).join("")
                : "No streaming providers listed.";

            if (country.link) {

                document.getElementById("providers").innerHTML += `
                    <a href="${country.link}"
                    target="_blank" rel="noopener">
                    View watching options →
                    </a>
                `;
            }

        } else {

            document.getElementById("providers").innerText =
                "No streaming information available for this title.";
        }
    }

}


// =================================
// CLOSE MOVIE DETAILS
// =================================

function closeModal() {

    document.getElementById("movieModal").style.display =
        "none";

}


// =================================
// FEATURED MOVIE
// =================================

function openFeatured() {

    if (featuredMovie) {
        openMovie(featuredMovie);
    } else {
        alert("Movies are still loading.");
    }

}


// =================================
// MY LIST
// =================================

function getList() {

    return JSON.parse(
        localStorage.getItem("novaMyList") || "[]"
    );

}


function addToList() {

    if (!currentMovie) return;

    let list = getList();

    if (list.some(item => item.id === currentMovie.id)) {

        alert("Already in your list!");

        return;
    }

    list.push(currentMovie);

    localStorage.setItem(
        "novaMyList",
        JSON.stringify(list)
    );

    displayMyList();

    alert("Added to My List!");
}


function displayMyList() {

    const list = getList();

    displayMovies(list, "myListMovies");

}


// =================================
// ACCOUNT DEMO
// =================================

function showLogin() {

    document.getElementById("loginModal").style.display =
        "block";

}


function closeLogin() {

    document.getElementById("loginModal").style.display =
        "none";

}


function toggleAccount() {

    isSignup = !isSignup;

    document.getElementById("loginTitle").innerText =
        isSignup ? "Create Account" : "Welcome Back";

    document.getElementById("loginDescription").innerText =
        isSignup ? "Join NOVA+ today." : "Sign in to NOVA+.";

    document.getElementById("accountName").style.display =
        isSignup ? "block" : "none";

    document.getElementById("accountSubmit").innerText =
        isSignup ? "Create Account" : "Sign In";

    document.getElementById("switchAccount").innerHTML =
        isSignup
        ? 'Already registered? <a onclick="toggleAccount()">Sign In</a>'
        : 'New to NOVA+? <a onclick="toggleAccount()">Create Account</a>';

}


function accountAction() {

    const name =
        document.getElementById("accountName").value.trim();

    const email =
        document.getElementById("accountEmail").value.trim();

    if (!email || !email.includes("@")) {

        alert("Enter a valid email address.");

        return;
    }

    if (isSignup && !name) {

        alert("Enter your name.");

        return;
    }

    // Demonstration account only.
    // Real authentication requires a secure backend.

    const account = {
        name: name || email.split("@")[0],
        email: email
    };

    localStorage.setItem(
        "novaAccount",
        JSON.stringify(account)
    );

    updateLogin();

    closeLogin();

    alert("Welcome to NOVA+!");

}


function updateLogin() {

    const account = JSON.parse(
        localStorage.getItem("novaAccount") || "null"
    );

    const button = document.getElementById("loginBtn");

    if (account) {

        button.innerText = "Sign Out";

        button.onclick = logout;

    } else {

        button.innerText = "Sign In";

        button.onclick = showLogin;

    }

}


function logout() {

    localStorage.removeItem("novaAccount");

    updateLogin();

    alert("You have signed out.");

}


// =================================
// PREMIUM PAGE
// =================================

function showPremium() {

    document.getElementById("mainContent").classList.add("hidden");

    document.getElementById("hero").classList.add("hidden");

    document.getElementById("premiumPage").classList.remove("hidden");

}


function home() {

    document.getElementById("mainContent").classList.remove("hidden");

    document.getElementById("hero").classList.remove("hidden");

    document.getElementById("premiumPage").classList.add("hidden");

}


// =================================
// START NOVA+
// =================================

document.getElementById("accountName").style.display = "none";

document.getElementById("searchSection").style.display = "none";

updateLogin();

loadHome();
