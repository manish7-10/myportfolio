/**
 * ===========================================
 * Professional Image Slider with Auto-Play
 * ===========================================
 */

class ImageSlider {
    constructor(root, options = {}) {
        this.root = typeof root === 'string' ? document.querySelector(root) : root;
        if (!this.root) return;

        this.track = this.root.querySelector("[data-slider-track]") || this.root.querySelector(".slider__track");
        if (!this.track) return;

        this.slides = Array.from(this.track.children);
        this.prevBtn = this.root.querySelector("[data-slider-prev]") || this.root.querySelector(".slider__arrow--prev");
        this.nextBtn = this.root.querySelector("[data-slider-next]") || this.root.querySelector(".slider__arrow--next");
        
        this.dotsContainer = this.root.querySelector("[data-slider-dots]") || 
                            this.root.querySelector(".slider__dots");

        this.options = {
            autoplay: true,
            autoplaySpeed: 3000,
            transitionMs: 500,
            loop: true,
            pauseOnHover: true,
            keyboard: true,
            swipe: true,
            ...options
        };

        this.current = 0;
        this.timer = null;
        this.width = 0;
        this.dots = [];

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        this.createDots();

        // Ensure calculation runs after full DOM layout rendering
        window.addEventListener("load", () => this.updateSlider());
        
        requestAnimationFrame(() => {
            this.updateSlider();
            if (this.options.autoplay) {
                this.start();
            }
        });

        this.bindEvents();
    }

    createDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = "";

        this.dots = this.slides.map((_, index) => {
            const dot = document.createElement("button");
            dot.className = "slider__dot";
            dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
            
            if (index === 0) dot.classList.add("is-active", "active");

            dot.addEventListener("click", () => {
                this.goTo(index);
                this.restart();
            });

            this.dotsContainer.appendChild(dot);
            return dot;
        });
    }

    updateSlider() {
        const sliderWindow = this.root.querySelector(".slider__window") || this.root;
        this.width = sliderWindow.getBoundingClientRect().width;

        if (this.width === 0) return;

        this.slides.forEach(slide => {
            slide.style.width = `${this.width}px`;
            slide.style.minWidth = `${this.width}px`;
        });

        this.goTo(this.current, false);
    }

    goTo(index, animate = true) {
        if (index < 0) {
            index = this.options.loop ? this.slides.length - 1 : 0;
        } else if (index >= this.slides.length) {
            index = this.options.loop ? 0 : this.slides.length - 1;
        }

        this.current = index;

        this.track.style.transition = animate
            ? `transform ${this.options.transitionMs}ms cubic-bezier(0.25, 1, 0.5, 1)`
            : "none";

        this.track.style.transform = `translateX(-${this.current * this.width}px)`;

        if (this.dots.length) {
            this.dots.forEach((dot, i) => {
                const isActive = i === this.current;
                dot.classList.toggle("is-active", isActive);
                dot.classList.toggle("active", isActive);
            });
        }
    }

    next() {
        this.goTo(this.current + 1);
    }

    prev() {
        this.goTo(this.current - 1);
    }

    start() {
        if (!this.options.autoplay || this.timer) return;
        this.timer = setInterval(() => {
            this.next();
        }, this.options.autoplaySpeed);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    restart() {
        this.stop();
        this.start();
    }

    bindEvents() {
        window.addEventListener("resize", () => this.updateSlider());

        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", () => {
                this.prev();
                this.restart();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => {
                this.next();
                this.restart();
            });
        }

        if (this.options.keyboard) {
            document.addEventListener("keydown", (e) => {
                const rect = this.root.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

                if (isVisible) {
                    if (e.key === "ArrowLeft") {
                        this.prev();
                        this.restart();
                    }
                    if (e.key === "ArrowRight") {
                        this.next();
                        this.restart();
                    }
                }
            });
        }

        if (this.options.pauseOnHover) {
            this.root.addEventListener("mouseenter", () => this.stop());
            this.root.addEventListener("mouseleave", () => this.start());
        }

        if (this.options.swipe) {
            this.enableSwipe();
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) this.stop();
            else this.start();
        });
    }

    enableSwipe() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stop();
        }, { passive: true });

        this.track.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener("touchend", () => {
            if (!isDragging) return;
            const distance = currentX - startX;

            if (Math.abs(distance) > 50 && currentX !== 0) {
                if (distance < 0) this.next();
                else this.prev();
                this.restart();
            } else {
                this.start();
            }

            isDragging = false;
            startX = 0;
            currentX = 0;
        });
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-slider]").forEach(slider => {
        new ImageSlider(slider, {
            autoplay: true,
            autoplaySpeed: 3000,
            pauseOnHover: true
        });
    });
});