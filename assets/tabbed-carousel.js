import { Component } from '@theme/component';

/**
 * @typedef {object} Refs
 * @property {HTMLButtonElement[]} tabs - Tab buttons
 * @property {HTMLElement[]} panels - Tab panels
 * @property {HTMLElement[]} tracks - Carousel track elements
 * @property {HTMLButtonElement[]} prevArrows - Previous arrow buttons
 * @property {HTMLButtonElement[]} nextArrows - Next arrow buttons
 * @property {HTMLElement[]} progressBars - Progress bar fill elements
 */

/**
 * Tabbed Carousel custom element.
 * Handles tab switching, carousel scrolling, progress indication, and arrow states.
 *
 * @extends {Component<Refs>}
 */
class TabbedCarousel extends Component {
  /** @type {Array<() => void>} */
  #scrollCleanups = [];

  connectedCallback() {
    super.connectedCallback();

    const { tracks } = this.refs;
    if (!tracks || tracks.length === 0) return;

    for (let i = 0; i < tracks.length; i++) {
      this.#initTrack(i);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    for (const cleanup of this.#scrollCleanups) {
      cleanup();
    }
    this.#scrollCleanups = [];
  }

  /**
   * Initialises scroll listener and initial arrow/progress state for one track.
   * @param {number} i - Panel index
   */
  #initTrack(i) {
    const track = this.refs.tracks[i];
    if (!track) return;

    const handler = () => {
      requestAnimationFrame(() => {
        this.#updateArrows(i);
        this.#updateProgress(i);
      });
    };

    track.addEventListener('scroll', handler, { passive: true });
    this.#scrollCleanups.push(() => track.removeEventListener('scroll', handler));

    this.#updateArrows(i);
    this.#updateProgress(i);
  }

  /**
   * Handles tab button click. Switches the active tab and panel.
   * @param {MouseEvent} event
   */
  handleTabClick(event) {
    const btn = /** @type {HTMLButtonElement} */ (event.target);
    const indexStr = btn.dataset.tabIndex;
    if (indexStr === undefined) return;

    const targetIndex = parseInt(indexStr, 10);
    const { tabs, panels, tracks } = this.refs;

    if (!tabs || !panels) return;

    for (let i = 0; i < tabs.length; i++) {
      const isActive = i === targetIndex;
      tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabs[i].classList.toggle('is-active', isActive);
    }

    for (let i = 0; i < panels.length; i++) {
      panels[i].classList.toggle('is-active', i === targetIndex);
    }

    if (tracks && tracks[targetIndex]) {
      tracks[targetIndex].scrollLeft = 0;
    }

    this.#updateArrows(targetIndex);
    this.#updateProgress(targetIndex);
  }

  /**
   * Handles previous arrow click.
   * @param {MouseEvent} event
   */
  handlePrevClick(event) {
    const btn = /** @type {HTMLButtonElement} */ (event.target);
    const panelIndex = this.#getPanelIndex(btn);
    if (panelIndex === -1) return;

    const track = this.refs.tracks?.[panelIndex];
    if (!track) return;

    const { cardWidth, gap } = this.#getScrollAmount(track);
    track.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
  }

  /**
   * Handles next arrow click.
   * @param {MouseEvent} event
   */
  handleNextClick(event) {
    const btn = /** @type {HTMLButtonElement} */ (event.target);
    const panelIndex = this.#getPanelIndex(btn);
    if (panelIndex === -1) return;

    const track = this.refs.tracks?.[panelIndex];
    if (!track) return;

    const { cardWidth, gap } = this.#getScrollAmount(track);
    track.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
  }

  /**
   * Gets the panel index from a button's closest panel ancestor.
   * @param {Element} el
   * @returns {number}
   */
  #getPanelIndex(el) {
    const panel = el.closest('[data-panel-index]');
    if (!panel) return -1;
    const idx = panel.getAttribute('data-panel-index');
    return idx !== null ? parseInt(idx, 10) : -1;
  }

  /**
   * Measures card width and gap from the track for scroll-by calculation.
   * @param {HTMLElement} track
   * @returns {{ cardWidth: number, gap: number }}
   */
  #getScrollAmount(track) {
    const card = track.querySelector('.tabbed-carousel__card');
    const cardWidth = card ? /** @type {HTMLElement} */ (card).offsetWidth : 280;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return { cardWidth, gap };
  }

  /**
   * Updates prev/next arrow disabled state for a given panel index.
   * @param {number} i
   */
  #updateArrows(i) {
    const track = this.refs.tracks?.[i];
    const prevArrow = this.refs.prevArrows?.[i];
    const nextArrow = this.refs.nextArrows?.[i];

    if (!track) return;

    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;

    if (prevArrow) prevArrow.disabled = atStart;
    if (nextArrow) nextArrow.disabled = atEnd;
  }

  /**
   * Updates progress bar width as a percentage for a given panel index.
   * @param {number} i
   */
  #updateProgress(i) {
    const track = this.refs.tracks?.[i];
    const bar = this.refs.progressBars?.[i];

    if (!track || !bar) return;

    const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
    const ratio = track.scrollLeft / maxScroll;
    bar.style.width = (ratio * 100).toFixed(1) + '%';
  }
}

customElements.define('tabbed-carousel', TabbedCarousel);
