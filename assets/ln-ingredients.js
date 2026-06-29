import { Component } from '@theme/component';

class LnIngredientsSection extends Component {
  connectedCallback() {
    super.connectedCallback();
    this._initTabs();
    this._initCarousels();
  }

  _initTabs() {
    const tabs = Array.from(this.querySelectorAll('.ln-ingredients__tab'));
    if (tabs.length === 0) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        tabs.forEach((t) => {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        this.querySelectorAll('.ln-ingredients__panel').forEach((panel) => {
          const isActive = panel.dataset.panel === tabIndex;
          panel.classList.toggle('is-active', isActive);
          if (isActive) {
            panel.removeAttribute('hidden');
            // Re-init carousel arrows for newly visible panel
            this._syncArrows(panel);
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  _initCarousels() {
    this.querySelectorAll('.ln-ingredients__panel').forEach((panel) => {
      this._bindCarousel(panel);
    });
  }

  _bindCarousel(panel) {
    const track = panel.querySelector('[data-track]');
    const prev = panel.querySelector('.ln-ingredients__arrow--prev');
    const next = panel.querySelector('.ln-ingredients__arrow--next');
    if (!track) return;

    this._syncArrows(panel);

    track.addEventListener('scroll', () => this._syncArrows(panel), { passive: true });

    if (prev) {
      prev.addEventListener('click', () => this._scroll(track, -1, panel));
    }
    if (next) {
      next.addEventListener('click', () => this._scroll(track, 1, panel));
    }
  }

  _scroll(track, direction, panel) {
    const card = track.querySelector('.ln-ingredients__card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    const amount = card.offsetWidth + gap;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
    setTimeout(() => this._syncArrows(panel), 320);
  }

  _syncArrows(panel) {
    const track = panel.querySelector('[data-track]');
    const prev = panel.querySelector('.ln-ingredients__arrow--prev');
    const next = panel.querySelector('.ln-ingredients__arrow--next');
    if (!track || !prev || !next) return;

    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

    prev.style.opacity = atStart ? '0.35' : '1';
    prev.style.pointerEvents = atStart ? 'none' : 'auto';
    next.style.opacity = atEnd ? '0.35' : '1';
    next.style.pointerEvents = atEnd ? 'none' : 'auto';
  }
}

customElements.define('ln-ingredients-section', LnIngredientsSection);
