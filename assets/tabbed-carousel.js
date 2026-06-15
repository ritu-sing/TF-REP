import { Component } from '@theme/component';

/**
 * @typedef {object} Refs
 * @property {HTMLButtonElement[]} tabs
 * @property {HTMLElement[]} panels
 * @property {HTMLElement[]} tracks
 * @property {HTMLButtonElement[]} prevArrows
 * @property {HTMLButtonElement[]} nextArrows
 * @property {HTMLElement[]} progressBars
 * @property {HTMLElement[]} priceDisplays
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
    for (const fn of this.#scrollCleanups) fn();
    this.#scrollCleanups = [];
  }

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

  /** Tab click → switch panel */
  handleTabClick(event) {
    const btn = /** @type {HTMLButtonElement} */ (event.currentTarget ?? event.target);
    const targetIndex = parseInt(btn.dataset.tabIndex ?? '0', 10);
    const { tabs, panels, tracks } = this.refs;
    if (!tabs || !panels) return;

    for (let i = 0; i < tabs.length; i++) {
      const active = i === targetIndex;
      tabs[i].setAttribute('aria-selected', active ? 'true' : 'false');
      tabs[i].classList.toggle('is-active', active);
    }
    for (let i = 0; i < panels.length; i++) {
      panels[i].classList.toggle('is-active', i === targetIndex);
    }
    if (tracks?.[targetIndex]) tracks[targetIndex].scrollLeft = 0;
    this.#updateArrows(targetIndex);
    this.#updateProgress(targetIndex);
  }

  handlePrevClick(event) {
    const i = this.#panelIndex(/** @type {Element} */ (event.currentTarget ?? event.target));
    if (i === -1) return;
    const track = this.refs.tracks?.[i];
    if (!track) return;
    const { w, g } = this.#scrollStep(track);
    track.scrollBy({ left: -(w + g), behavior: 'smooth' });
  }

  handleNextClick(event) {
    const i = this.#panelIndex(/** @type {Element} */ (event.currentTarget ?? event.target));
    if (i === -1) return;
    const track = this.refs.tracks?.[i];
    if (!track) return;
    const { w, g } = this.#scrollStep(track);
    track.scrollBy({ left: w + g, behavior: 'smooth' });
  }

  /** Variant pill click → update active pill, price display, and ADD button variant id */
  handleVariantClick(event) {
    const pill = /** @type {HTMLButtonElement} */ (event.currentTarget ?? event.target);
    const card = pill.closest('.tabbed-carousel__card');
    if (!card) return;

    // Update active pill state
    const pills = card.querySelectorAll('.tabbed-carousel__variant-pill');
    for (const p of pills) p.classList.remove('is-active');
    pill.classList.add('is-active');

    // Update ADD button variant ID
    const addBtn = card.querySelector('.tabbed-carousel__add-btn');
    if (addBtn) {
      addBtn.dataset.variantId = pill.dataset.variantId ?? '';
    }

    // Update price display
    const priceEl = card.querySelector('.tabbed-carousel__card-price');
    if (priceEl) {
      const price = parseInt(pill.dataset.price ?? '0', 10);
      const compare = parseInt(pill.dataset.comparePrice ?? '0', 10);
      const currentEl = priceEl.querySelector('.tabbed-carousel__price-current');
      const compareEl = priceEl.querySelector('.tabbed-carousel__price-compare');

      if (currentEl) {
        currentEl.textContent = this.#formatMoney(price);
      }
      if (compare > price) {
        if (compareEl) {
          compareEl.textContent = this.#formatMoney(compare);
          compareEl.style.display = '';
        } else {
          const s = document.createElement('s');
          s.className = 'tabbed-carousel__price-compare';
          s.textContent = this.#formatMoney(compare);
          priceEl.appendChild(s);
        }
      } else if (compareEl) {
        compareEl.style.display = 'none';
      }
    }
  }

  /** ADD button click → AJAX add to cart */
  async handleAddToCart(event) {
    const btn = /** @type {HTMLButtonElement} */ (event.currentTarget ?? event.target);
    const variantId = btn.dataset.variantId;
    if (!variantId) return;

    btn.classList.add('is-loading');
    const originalText = btn.textContent;
    btn.textContent = '...';

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description ?? 'Add to cart failed');
      }

      btn.classList.remove('is-loading');
      btn.classList.add('is-added');
      btn.textContent = '✓';

      // Refresh cart count
      this.#refreshCart();

      setTimeout(() => {
        btn.classList.remove('is-added');
        btn.textContent = originalText;
      }, 1800);
    } catch {
      btn.classList.remove('is-loading');
      btn.textContent = originalText;
    }
  }

  /** Fetch updated cart and broadcast to Horizon's cart bubble */
  async #refreshCart() {
    try {
      const cart = await fetch('/cart.js', {
        headers: { Accept: 'application/json' },
      }).then((r) => r.json());

      const count = cart.item_count ?? 0;

      // Horizon cart bubble listens for this event
      document.dispatchEvent(
        new CustomEvent('cart:refresh', { bubbles: true, detail: { count } })
      );

      // Also update count badges directly for resilience
      for (const el of document.querySelectorAll('[data-cart-count]')) {
        el.textContent = String(count);
      }
      for (const el of document.querySelectorAll('.cart-count-bubble')) {
        el.textContent = String(count);
        el.toggleAttribute('hidden', count === 0);
      }
    } catch {
      // Cart refresh is non-critical
    }
  }

  #panelIndex(el) {
    const panel = el.closest('[data-panel-index]');
    if (!panel) return -1;
    const idx = panel.getAttribute('data-panel-index');
    return idx !== null ? parseInt(idx, 10) : -1;
  }

  #scrollStep(track) {
    const card = track.querySelector('.tabbed-carousel__card');
    const w = card ? /** @type {HTMLElement} */ (card).offsetWidth : 280;
    const g = parseFloat(getComputedStyle(track).gap) || 20;
    return { w, g };
  }

  #updateArrows(i) {
    const track = this.refs.tracks?.[i];
    const prev = this.refs.prevArrows?.[i];
    const next = this.refs.nextArrows?.[i];
    if (!track) return;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = atStart;
    if (next) next.disabled = atEnd;
  }

  #updateProgress(i) {
    const track = this.refs.tracks?.[i];
    const bar = this.refs.progressBars?.[i];
    if (!track || !bar) return;
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    bar.style.width = ((track.scrollLeft / max) * 100).toFixed(1) + '%';
  }

  /** Format Shopify price (cents) as money string */
  #formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat ?? '${{amount}}');
    }
    return '$' + (cents / 100).toFixed(2);
  }
}

customElements.define('tabbed-carousel', TabbedCarousel);
