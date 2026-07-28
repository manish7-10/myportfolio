/**
 * ==========================================================
 * Professional Image Slider
 * Features:
 * ✔ Autoplay
 * ✔ Infinite Loop
 * ✔ Pause on Hover
 * ✔ Keyboard Navigation
 * ✔ Touch Swipe
 * ✔ Responsive
 * ✔ Page Visibility Support
 * ==========================================================
 */

class ImageSlider {

    constructor(root, options = {}) {

        if (!root) throw new Error("Slider root not found.");

        this.root = root;
        this.track = root.querySelector("[data-slider-track]");
        this.slides = [...this.track.children];

        this.prevBtn = root.querySelector("[data-slider-prev]");
        this.nextBtn = root.querySelector("[data-slider-next]");
        this.dotsContainer = root.querySelector("[data-slider-dots]");

        this.options = {
            loop: true,
            transitionMs: 600,
            autoplay: true,
            autoplaySpeed: 3000,
            pauseOnHover: true,
            keyboard: true,
            swipe: true,
            ...options
        };

        this.current = 0;
        this.slideWidth = 0;
        this.timer = null;
        this.isAnimating = false;

        this.init();
    }

    /* ===========================
       INITIALIZE
    =========================== */

    init() {

        this.track.style.transition =
            `transform ${this.options.transitionMs}ms ease-in-out`;

        this.updateSize();
        this.createDots();
        this.bindEvents();

        this.goTo(0, false);

        if (this.options.autoplay)
            this.startAutoplay();
    }

    /* ===========================
       CREATE DOTS
    =========================== */

    createDots() {

        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = "";

        this.dots = this.slides.map((_, index) => {

            const btn = document.createElement("button");

            btn.className = "slider__dot";

            btn.addEventListener("click", () => this.goTo(index));

            this.dotsContainer.appendChild(btn);

            return btn;

        });

    }

    /* ===========================
       EVENTS
    =========================== */

    bindEvents() {

        this.nextBtn?.addEventListener("click", () => this.next());

        this.prevBtn?.addEventListener("click", () => this.prev());

        window.addEventListener("resize", () => {

            this.updateSize();

            this.goTo(this.current, false);

        });

        /* Keyboard */

        if (this.options.keyboard) {

            this.root.tabIndex = 0;

            this.root.addEventListener("keydown", e => {

                if (e.key === "ArrowRight") this.next();

                if (e.key === "ArrowLeft") this.prev();

            });

        }

        /* Hover */

        if (this.options.pauseOnHover) {

            this.root.addEventListener("mouseenter", () => {

                this.stopAutoplay();

            });

            this.root.addEventListener("mouseleave", () => {

                this.startAutoplay();

            });

        }

        /* Page Visibility */

        document.addEventListener("visibilitychange", () => {

            if (document.hidden)
                this.stopAutoplay();
            else
                this.startAutoplay();

        });

        /* Swipe */

        if (this.options.swipe)
            this.enableSwipe();

    }

    /* ===========================
       SWIPE
    =========================== */

    enableSwipe() {

        let startX = 0;
        let endX = 0;

        this.track.addEventListener("touchstart", e => {

            startX = e.touches[0].clientX;

        }, { passive: true });

        this.track.addEventListener("touchmove", e => {

            endX = e.touches[0].clientX;

        }, { passive: true });

        this.track.addEventListener("touchend", () => {

            let distance = endX - startX;

            if (distance > 70)
                this.prev();
            else if (distance < -70)
                this.next();

            startX = endX = 0;

        });

    }

    /* ===========================
       UPDATE SIZE
    =========================== */

    updateSize() {

        this.slideWidth =
            this.root.querySelector(".slider__window").clientWidth;

    }

    /* ===========================
       MOVE TO SLIDE
    =========================== */

    goTo(index, animate = true) {

        if (this.isAnimating) return;

        if (this.options.loop) {

            if (index < 0)
                index = this.slides.length - 1;

            if (index >= this.slides.length)
                index = 0;

        } else {

            index = Math.max(0,
                Math.min(index, this.slides.length - 1));

        }

        this.current = index;

        this.track.style.transitionDuration =
            animate ? `${this.options.transitionMs}ms` : "0ms";

        this.track.style.transform =
            `translateX(-${this.slideWidth * this.current}px)`;

        if (this.dots) {

            this.dots.forEach((dot, i) => {

                dot.classList.toggle("is-active", i === this.current);

            });

        }

        this.isAnimating = true;

        setTimeout(() => {

            this.isAnimating = false;

        }, this.options.transitionMs);

    }

    /* ===========================
       NEXT
    =========================== */

    next() {

        this.goTo(this.current + 1);

        this.restartAutoplay();

    }

    /* ===========================
       PREVIOUS
    =========================== */

    prev() {

        this.goTo(this.current - 1);

        this.restartAutoplay();

    }

    /* ===========================
       AUTOPLAY
    =========================== */

    startAutoplay() {

        if (!this.options.autoplay) return;

        clearInterval(this.timer);

        this.timer = setInterval(() => {

            this.goTo(this.current + 1);

        }, this.options.autoplaySpeed);

    }

    stopAutoplay() {

        clearInterval(this.timer);

    }

    restartAutoplay() {

        if (!this.options.autoplay) return;

        this.stopAutoplay();

        this.startAutoplay();

    }

    /* ===========================
       DESTROY
    =========================== */

    destroy() {

        this.stopAutoplay();

    }

}