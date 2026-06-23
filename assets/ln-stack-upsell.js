class LnStackUpsell extends HTMLElement {
  connectedCallback() {
    this._tiers = [
      parseInt(this.dataset.tier1) || 1,
      parseInt(this.dataset.tier2) || 2,
      parseInt(this.dataset.tier3) || 3,
      parseInt(this.dataset.tier4) || 4,
    ];
    this._congratsText = this.dataset.congrats || '';

    this._dots = this.querySelectorAll('.ln-stack__step');
    this._lines = this.querySelectorAll('.ln-stack__line');
    this._congratsBanner = this.querySelector('[data-congrats-banner]');
    this._congratsTextEl = this.querySelector('[data-congrats-text]');
    this._carousel = this.querySelector('[data-carousel]');

    // Qty buttons
    this.querySelectorAll('.ln-stack__qty-btn').forEach(btn => {
      btn.addEventListener('click', () => this._changeQty(btn));
    });

    // Add to cart forms
    this.querySelectorAll('.ln-stack__form').forEach(form => {
      form.addEventListener('submit', e => this._handleAdd(e, form));
    });

    // Swatch buttons
    this.querySelectorAll('.ln-stack__swatch').forEach(btn => {
      btn.addEventListener('click', () => this._changeSwatch(btn));
    });

    // Carousel nav
    const prevBtn = this.querySelector('.ln-stack__nav--prev');
    const nextBtn = this.querySelector('.ln-stack__nav--next');
    if (prevBtn && nextBtn && this._carousel) {
      prevBtn.removeAttribute('hidden');
      nextBtn.removeAttribute('hidden');
      prevBtn.addEventListener('click', () => this._scrollCarousel(-1));
      nextBtn.addEventListener('click', () => this._scrollCarousel(1));
    }

    this._fetchCart();
  }

  _changeQty(btn) {
    const wrap = btn.closest('.ln-stack__qty-wrap');
    if (!wrap) return;
    const input = wrap.querySelector('.ln-stack__qty-input');
    if (!input) return;
    const dir = parseInt(btn.dataset.dir) || 0;
    const current = parseInt(input.value) || 1;
    const next = Math.max(1, current + dir);
    input.value = next;
  }

  async _handleAdd(e, form) {
    e.preventDefault();
    const btn = form.querySelector('.ln-stack__add-btn');
    if (btn) btn.setAttribute('aria-busy', 'true');

    const formData = new FormData(form);
    try {
      const resp = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!resp.ok) throw new Error('Add failed');
      // Dispatch cart updated event for bubble/drawer update
      document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
      // Refresh progress bar
      await this._fetchCart();
    } catch (_) {}

    if (btn) btn.removeAttribute('aria-busy');
  }

  _changeSwatch(btn) {
    const card = btn.closest('.ln-stack__card');
    if (!card) return;
    card.querySelectorAll('.ln-stack__swatch').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    // In a real implementation, this would update the variant input
  }

  _scrollCarousel(dir) {
    if (!this._carousel) return;
    const cardWidth = this._carousel.querySelector('.ln-stack__card')?.offsetWidth || 160;
    this._carousel.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
  }

  async _fetchCart() {
    try {
      const resp = await fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!resp.ok) return;
      const cart = await resp.json();
      this._updateProgress(cart.item_count || 0);
    } catch (_) {}
  }

  _updateProgress(qty) {
    const tiers = this._tiers;
    let reached = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (qty >= tiers[i]) reached = i + 1;
    }

    this._dots.forEach((dot, i) => {
      dot.classList.toggle('is-reached', i < reached);
      dot.classList.toggle('is-current', i === reached);
    });

    this._lines.forEach((line, i) => {
      line.classList.toggle('is-filled', i < reached);
    });

    if (reached >= 2 && this._congratsBanner) {
      this._congratsBanner.removeAttribute('hidden');
      if (this._congratsTextEl) this._congratsTextEl.textContent = this._congratsText;
    } else if (this._congratsBanner) {
      this._congratsBanner.setAttribute('hidden', '');
    }
  }
}

if (!customElements.get('ln-stack-upsell')) {
  customElements.define('ln-stack-upsell', LnStackUpsell);
}
