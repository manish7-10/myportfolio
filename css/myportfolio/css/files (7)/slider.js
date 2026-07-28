/**
 * ImageSlider - a small dependency-free slider library.
 *
 * Usage:
 *   new ImageSlider(rootEl, { loop: true, transitionMs: 500 });
 *
 * Expected markup inside rootEl:
 *   [data-slider-track]  -> flex container holding .slider__slide children
 *   [data-slider-prev]   -> previous button (optional)
 *   [data-slider-next]   -> next button (optional)
 *   [data-slider-dots]   -> container where dot indicators are injected (optional)
 */
class ImageSlider {
  constructor(root, options = {}) {
    if (!root) throw new Error('ImageSlider: root element not found');

    this.root = root;
    this.track = root.querySelector('[data-slider-track]');
    this.slides = Array.from(this.track.children);
    this.prevBtn = root.querySelector('[data-slider-prev]');
    this.nextBtn = root.querySelector('[data-slider-next]');
    this.dotsContainer = root.querySelector('[data-slider-dots]');

    this.options = {
      loop: true,
      transitionMs: 400,
      autoplayMs: 0, // 0 = disabled
      ...options
    };

    this.index = 0;
    this.slideCount = this.slides.length;
    this.isAnimating = false;
    this.autoplayTimer = null;

    this._onKeydown = this._onKeydown.bind(this);
    this._onResize = this._onResize.bind(this);

    this._init();
  }

  _init() {
    this.track.style.transitionDuration = `${this.options.transitionMs}ms`;
    this.track.style.transitionTimingFunction = 'ease';

    this._buildDots();
    this._bindEvents();
    this._updateSize();
    this._goTo(0, false);

    if (this.options.autoplayMs > 0) this._startAutoplay();
  }

  _buildDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.dots = this.slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this._goTo(i));
      this.dotsContainer.appendChild(dot);
      return dot;
    });
  }

  _bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    this.root.addEventListener('keydown', this._onKeydown);
    this.root.setAttribute('tabindex', '0');

    window.addEventListener('resize', this._onResize);

    // Touch / drag support
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const onDown = (x) => {
      dragging = true;
      startX = x;
      currentX = x;
      this.track.style.transitionDuration = '0ms';
    };
    const onMove = (x) => {
      if (!dragging) return;
      currentX = x;
      const delta = currentX - startX;
      const base = -this.index * this.slideWidth;
      this.track.style.transform = `translateX(${base + delta}px)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      this.track.style.transitionDuration = `${this.options.transitionMs}ms`;
      const delta = currentX - startX;
      const threshold = this.slideWidth * 0.15;
      if (delta > threshold) this.prev();
      else if (delta < -threshold) this.next();
      else this._goTo(this.index);
    };

    this.track.addEventListener('mousedown', (e) => onDown(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);

    this.track.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
    this.track.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
    this.track.addEventListener('touchend', onUp);
  }

  _onKeydown(e) {
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  _onResize() {
    this._updateSize();
    this._goTo(this.index, false);
  }

  _updateSize() {
    this.slideWidth = this.root.querySelector('.slider__window').clientWidth;
  }

  _goTo(i, animate = true) {
    if (this.options.loop) {
      this.index = (i + this.slideCount) % this.slideCount;
    } else {
      this.index = Math.max(0, Math.min(i, this.slideCount - 1));
    }

    this.track.style.transitionDuration = animate ? `${this.options.transitionMs}ms` : '0ms';
    this.track.style.transform = `translateX(${-this.index * this.slideWidth}px)`;

    if (this.dots) {
      this.dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === this.index));
    }

    if (!this.options.loop) {
      if (this.prevBtn) this.prevBtn.disabled = this.index === 0;
      if (this.nextBtn) this.nextBtn.disabled = this.index === this.slideCount - 1;
    }
  }

  next() {
    this._goTo(this.index + 1);
    this._resetAutoplay();
  }

  prev() {
    this._goTo(this.index - 1);
    this._resetAutoplay();
  }

  goToSlide(i) {
    this._goTo(i);
    this._resetAutoplay();
  }

  _startAutoplay() {
    this.autoplayTimer = setInterval(() => this.next(), this.options.autoplayMs);
  }

  _resetAutoplay() {
    if (!this.options.autoplayMs) return;
    clearInterval(this.autoplayTimer);
    this._startAutoplay();
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    clearInterval(this.autoplayTimer);
  }
}
