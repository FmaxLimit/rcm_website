// Sticky Header
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    header.classList.toggle("sticky", window.scrollY > 50);

});

// Mobile Menu
const menu = document.querySelector(".menu-toggle");
const navbar = document.querySelector(".navbar");

menu.addEventListener("click", () => {

    navbar.classList.toggle("active");

});

function updateCardTracker(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", x);
    card.style.setProperty("--mouse-y", y);
}

function resetCardTracker(event) {
    const card = event.currentTarget;
    card.style.setProperty("--mouse-x", 50);
    card.style.setProperty("--mouse-y", 50);
}

const hoverCards = document.querySelectorAll(".card-container");
hoverCards.forEach(card => {
    card.addEventListener("mousemove", updateCardTracker);
    card.addEventListener("mouseleave", resetCardTracker);
});

// Scroll Animation
const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

});

document.querySelectorAll(".service-card,.feature-box,.contact,.hero-content,.hero-image")
.forEach(el=>{

    el.classList.add("fade-up");

    observer.observe(el);

});

// Footer Year
const footer=document.querySelector("footer p");

if(footer){

    footer.innerHTML=`© ${new Date().getFullYear()} RCM Apparel Trading Printing Service. All Rights Reserved.`;

}