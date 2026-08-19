const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sticky Header and hide-on-scroll
const header = document.querySelector(".header, .app-bar");
let lastScrollY = window.scrollY;

if (header) {
    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        header.classList.toggle("sticky", currentScrollY > 50);

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            header.classList.add("hide", "is-hidden");
        } else {
            header.classList.remove("hide", "is-hidden");
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    window.addEventListener("mousemove", (event) => {
        if (event.clientY <= 60) {
            header.classList.remove("hide", "is-hidden");
        }
    }, { passive: true });
}

// Mobile Menu
const menu = document.querySelector(".menu-toggle");
const navbar = document.querySelector(".navbar");
const menuIcon = menu ? menu.querySelector("i") : null;

const closeMenu = () => {
    if (!navbar || !navbar.classList.contains("active")) return;
    navbar.classList.remove("active");
    menu.setAttribute("aria-expanded", "false");
    if (menuIcon) {
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    }
};

if (menu && navbar) {
    menu.addEventListener("click", () => {
        const isActive = navbar.classList.toggle("active");
        menu.setAttribute("aria-expanded", String(isActive));
        if (menuIcon) {
            menuIcon.classList.toggle("fa-bars", !isActive);
            menuIcon.classList.toggle("fa-xmark", isActive);
        }
    });

    // Close the menu after choosing a link, on outside click, or on Escape
    navbar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (!navbar.classList.contains("active")) return;
        if (navbar.contains(event.target) || menu.contains(event.target)) return;
        closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

// Ripple click effect on the primary nav links (Home / Services / About / Contact)
function createNavRipple(event) {
    const link = event.currentTarget;
    const rect = link.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = (event.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (event.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "nav-ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    link.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
}

if (navbar) {
    navbar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", createNavRipple);
    });
}

// Services carousel (auto-scrolling, loops seamlessly)
const carouselWrapper = document.querySelector(".services-carousel");
const carouselGrid = document.querySelector(".services-grid");

if (carouselGrid) {
    const cloneCardsForLoop = () => {
        if (carouselGrid.dataset.looped === "true") return;
        const cards = Array.from(carouselGrid.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.querySelectorAll("a, button").forEach(el => el.setAttribute("tabindex", "-1"));
            carouselGrid.appendChild(clone);
        });
        carouselGrid.dataset.looped = "true";
    };

    cloneCardsForLoop();

    const carouselSpeed = parseFloat(getComputedStyle(carouselGrid.parentElement).getPropertyValue("--carousel-speed")) || 0.08;
    let isPaused = prefersReducedMotion;
    let isVisible = true;
    let lastTimestamp = null;
    let currentTranslate = 0;
    let loopPoint = 0;

    const measureLoopPoint = () => {
        loopPoint = carouselGrid.scrollWidth / 2;
    };
    measureLoopPoint();
    window.addEventListener("resize", measureLoopPoint, { passive: true });

    const wrapTranslate = () => {
        if (!loopPoint) return;
        while (currentTranslate <= -loopPoint) currentTranslate += loopPoint;
        while (currentTranslate > 0) currentTranslate -= loopPoint;
    };

    carouselGrid.style.transform = "translateX(0px)";
    carouselGrid.style.willChange = "transform";

    const animateCarousel = (timestamp) => {
        if (lastTimestamp !== null && !isPaused && isVisible) {
            const elapsed = timestamp - lastTimestamp;
            currentTranslate -= carouselSpeed * elapsed;
            wrapTranslate();
            carouselGrid.style.transform = `translateX(${currentTranslate}px)`;
        }
        lastTimestamp = timestamp;
        requestAnimationFrame(animateCarousel);
    };

    if (!prefersReducedMotion) {
        // Pause on hover (desktop). Listener lives on the stationary wrapper,
        // not the sliding track, so hover detection stays reliable while the
        // track keeps moving underneath the cursor.
        const pauseTarget = carouselWrapper || carouselGrid;
        pauseTarget.addEventListener("mouseenter", () => { isPaused = true; });
        pauseTarget.addEventListener("mouseleave", () => {
            if (!isDragging) isPaused = false;
        });

        // Drag / swipe support so people can browse the cards by hand
        let isDragging = false;
        let dragAxis = null; // "x" once a horizontal drag is confirmed, "y" if it's a vertical scroll
        let dragPointerId = null;
        let startX = 0;
        let startY = 0;
        let startTranslate = 0;

        const endDrag = (event) => {
            if (!isDragging) return;
            isDragging = false;
            dragAxis = null;
            pauseTarget.classList.remove("dragging");
            if (dragPointerId !== null && pauseTarget.hasPointerCapture?.(dragPointerId)) {
                pauseTarget.releasePointerCapture(dragPointerId);
            }
            dragPointerId = null;
            // Resume autoplay right away for touch; for mouse, let the
            // existing hover-pause take over (it releases on mouseleave).
            if (!event || event.pointerType !== "mouse") {
                isPaused = false;
            }
        };

        pauseTarget.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            isDragging = true;
            dragAxis = null;
            dragPointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            startTranslate = currentTranslate;
            isPaused = true;
        });

        pauseTarget.addEventListener("pointermove", (event) => {
            if (!isDragging || event.pointerId !== dragPointerId) return;
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            if (dragAxis === null) {
                if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
                dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
                if (dragAxis === "x") {
                    pauseTarget.classList.add("dragging");
                    pauseTarget.setPointerCapture(dragPointerId);
                } else {
                    // Vertical intent (page scroll) - let the browser handle it
                    isDragging = false;
                    return;
                }
            }

            if (dragAxis !== "x") return;

            event.preventDefault();
            currentTranslate = startTranslate + deltaX;
            wrapTranslate();
            carouselGrid.style.transform = `translateX(${currentTranslate}px)`;
        }, { passive: false });

        pauseTarget.addEventListener("pointerup", endDrag);
        pauseTarget.addEventListener("pointercancel", endDrag);

        document.addEventListener("visibilitychange", () => {
            isVisible = !document.hidden;
        });

        const carouselVisibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { isVisible = entry.isIntersecting; });
        }, { threshold: 0.1 });
        carouselVisibilityObserver.observe(pauseTarget);

        requestAnimationFrame(animateCarousel);
    }
}

// Interactive tilt tracking on service cards
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

if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const hoverCards = document.querySelectorAll(".card-container");
    hoverCards.forEach(card => {
        card.addEventListener("mousemove", updateCardTracker);
        card.addEventListener("mouseleave", resetCardTracker);
    });
}

// Hero 3D entrance animation
const heroSection = document.querySelector(".hero");
if (heroSection) {
    if (prefersReducedMotion) {
        heroSection.classList.add("is-visible");
    } else {
        requestAnimationFrame(() => heroSection.classList.add("is-visible"));
    }
}

// Scroll-triggered fade-up animation
const fadeTargets = document.querySelectorAll(".feature-box,.contact");

if (prefersReducedMotion) {
    fadeTargets.forEach(el => el.classList.add("show"));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -30px 0px" });

    fadeTargets.forEach(el => {
        el.classList.add("fade-up");
        observer.observe(el);
    });
}

// Count-up stats
const statNumbers = document.querySelectorAll(".stat-number");
let statAnimated = false;

const animateStats = () => {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target, 10) || 0;

        if (prefersReducedMotion) {
            stat.textContent = target.toLocaleString("en-US");
            return;
        }

        const duration = 1600;
        const startTime = performance.now();

        const update = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            stat.textContent = current.toLocaleString("en-US");
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                stat.textContent = target.toLocaleString("en-US");
            }
        };

        requestAnimationFrame(update);
    });
};

const statsBlock = document.querySelector(".hero-stats");
if (statsBlock) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statAnimated) {
                animateStats();
                statAnimated = true;
                obs.disconnect();
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsBlock);
}

// Footer Year
const footer = document.querySelector("footer p");

if (footer) {
    footer.innerHTML = `&copy; ${new Date().getFullYear()} RCM Apparel Trading Printing Service. All Rights Reserved.`;
}

/* ============================================================
   MOBILE-ONLY: App-like behaviors
   - Scroll reveal via IntersectionObserver
   - Active tab tracking on the bottom tab bar
   - Swipeable services carousel with snap + dot indicators
   - Pull-to-refresh gesture (visual only)
   ============================================================ */
const isMobilePage = document.body.classList.contains("mobile-page");

if (isMobilePage) {

    /* ---- Scroll reveal ---- */
    const revealTargets = document.querySelectorAll(".reveal");
    if (revealTargets.length) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealTargets.forEach(el => el.classList.add("is-visible"));
        } else {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const delay = parseInt(el.dataset.revealDelay || "0", 10);
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    revealObserver.unobserve(el);
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
            revealTargets.forEach(el => revealObserver.observe(el));
        }
    }

    /* ---- Bottom tab bar: active state on scroll ---- */
    const tabBar = document.querySelector(".tab-bar");
    if (tabBar && "IntersectionObserver" in window) {
        const tabLinks = Array.from(tabBar.querySelectorAll(".tab-item"));
        const tabById = new Map(tabLinks.map(a => [a.dataset.tab, a]));

        const setActiveTab = (id) => {
            tabLinks.forEach(a => a.classList.toggle("is-active", a.dataset.tab === id));
        };

        const tabTargets = tabLinks
            .map(a => document.getElementById(a.dataset.tab))
            .filter(Boolean);

        const tabObserver = new IntersectionObserver((entries) => {
            // Pick the entry closest to the top of the viewport that is intersecting
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible.length) {
                const id = visible[0].target.id;
                if (tabById.has(id)) setActiveTab(id);
            }
        }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
        tabTargets.forEach(t => tabObserver.observe(t));

        // On click, immediately mark the clicked tab active
        tabLinks.forEach(a => {
            a.addEventListener("click", () => setActiveTab(a.dataset.tab));
        });
    }

    /* ---- Services carousel: snap-scroll + dot indicators ---- */
    const carousel = document.querySelector(".services-carousel");
    const carouselGrid = document.querySelector(".services-grid");

    if (carousel && carouselGrid) {
        // Build dot indicator
        const cards = Array.from(carouselGrid.querySelectorAll(".service-card"));
        if (cards.length) {
            const dots = document.createElement("div");
            dots.className = "carousel-dots";
            cards.forEach((_, i) => {
                const d = document.createElement("span");
                d.className = "dot" + (i === 0 ? " is-active" : "");
                d.dataset.index = String(i);
                dots.appendChild(d);
            });
            carousel.insertAdjacentElement("afterend", dots);

            const updateDots = () => {
                const center = carousel.scrollLeft + carousel.clientWidth / 2;
                let bestIdx = 0;
                let bestDist = Infinity;
                cards.forEach((card, i) => {
                    const rect = card.offsetLeft + card.offsetWidth / 2;
                    const dist = Math.abs(rect - center);
                    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
                });
                dots.querySelectorAll(".dot").forEach((d, i) => {
                    d.classList.toggle("is-active", i === bestIdx);
                });
            };

            carousel.addEventListener("scroll", () => {
                window.requestAnimationFrame(updateDots);
            }, { passive: true });

            dots.addEventListener("click", (event) => {
                const dot = event.target.closest(".dot");
                if (!dot) return;
                const idx = parseInt(dot.dataset.index, 10);
                const card = cards[idx];
                if (!card) return;
                const target = card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
                carousel.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion ? "auto" : "smooth" });
            });

            // Pointer drag for explicit swipes (in addition to native snap)
            let dragging = false;
            let dragPointerId = null;
            let startX = 0;
            let startScroll = 0;
            let dragAxis = null;

            const endDrag = (event) => {
                if (!dragging) return;
                dragging = false;
                dragAxis = null;
                carousel.classList.remove("is-dragging");
                if (dragPointerId !== null && carousel.hasPointerCapture?.(dragPointerId)) {
                    carousel.releasePointerCapture(dragPointerId);
                }
                dragPointerId = null;
            };

            carousel.addEventListener("pointerdown", (event) => {
                if (event.pointerType === "mouse" && event.button !== 0) return;
                dragging = true;
                dragAxis = null;
                dragPointerId = event.pointerId;
                startX = event.clientX;
                startScroll = carousel.scrollLeft;
            });

            carousel.addEventListener("pointermove", (event) => {
                if (!dragging || event.pointerId !== dragPointerId) return;
                const dx = event.clientX - startX;
                const dy = event.clientY - (event.clientY - (event.movementY || 0));
                if (dragAxis === null) {
                    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                    dragAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                    if (dragAxis === "x") {
                        carousel.classList.add("is-dragging");
                        try { carousel.setPointerCapture(dragPointerId); } catch (e) { /* ignore */ }
                    } else {
                        // vertical intent = page scroll, let it through
                        dragging = false;
                        return;
                    }
                }
                if (dragAxis !== "x") return;
                event.preventDefault();
                carousel.scrollLeft = startScroll - dx;
            }, { passive: false });

            carousel.addEventListener("pointerup", endDrag);
            carousel.addEventListener("pointercancel", endDrag);
        }
    }

    /* ---- Pull-to-refresh (visual) ---- */
    const ptr = document.querySelector(".ptr-indicator");
    if (ptr && !prefersReducedMotion) {
        let ptrStartY = 0;
        let ptrActive = false;
        let ptrDistance = 0;
        const PTR_TRIGGER = 70;

        window.addEventListener("touchstart", (event) => {
            if (window.scrollY <= 0 && event.touches.length === 1) {
                ptrStartY = event.touches[0].clientY;
                ptrActive = true;
                ptrDistance = 0;
            }
        }, { passive: true });

        window.addEventListener("touchmove", (event) => {
            if (!ptrActive) return;
            const y = event.touches[0].clientY;
            ptrDistance = Math.max(0, y - ptrStartY);
            if (ptrDistance > 0) {
                ptr.classList.add("is-pulling");
                ptr.style.height = `${Math.min(ptrDistance, 90)}px`;
                if (ptrDistance >= PTR_TRIGGER) {
                    ptr.classList.add("is-refreshing");
                } else {
                    ptr.classList.remove("is-refreshing");
                }
            }
        }, { passive: true });

        const endPtr = () => {
            if (!ptrActive) return;
            ptrActive = false;
            if (ptrDistance >= PTR_TRIGGER) {
                // Briefly show the refreshing state, then collapse
                setTimeout(() => {
                    ptr.classList.remove("is-pulling", "is-refreshing");
                    ptr.style.height = "0px";
                }, 900);
            } else {
                ptr.classList.remove("is-pulling", "is-refreshing");
                ptr.style.height = "0px";
            }
            ptrDistance = 0;
        };

        window.addEventListener("touchend", endPtr);
        window.addEventListener("touchcancel", endPtr);
    }
}