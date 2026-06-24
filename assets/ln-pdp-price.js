// Updates price row (sale, compare, badge, per-day) on variant:change
class LnPdpPrice extends HTMLElement {
  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._perdayOption = this.dataset.perdayOption || '';
    this._perdayMap = this._parseMap(this.dataset.perdayMap);

    this._priceEl = this.querySelector('[data-ln-price]');
    this._compareEl = this.querySelector('[data-ln-compare]');
    this._badgeEl = this.querySelector('[data-ln-badge]');
    this._perdayEl = this.querySelector('[data-ln-perday]');

    const section = document.getElementById('shopify-section-' + this._sectionId);
    if (section) {
      section.addEventListener('variant:change', e => this._onVariantChange(e.detail));
    }

    this._initFromPage();
  }

  _parseMap(raw) {
    if (!raw) return {};
    const map = {};
    raw.split(';').forEach(pair => {
      const [val, cost] = pair.split('|');
      if (val && cost) map[val.trim()] = cost.trim();
    });
    return map;
  }

  _onVariantChange(detail) {
    if (!detail || !detail.variant) return;
    const v = detail.variant;

    if (this._priceEl) this._priceEl.innerHTML = this._money(v.price);

    const hasCompare = v.compare_at_price && v.compare_at_price > v.price;
    if (this._compareEl) {
      if (hasCompare) {
        this._compareEl.innerHTML = this._money(v.compare_at_price);
        this._compareEl.style.display = '';
      } else {
        this._compareEl.style.display = 'none';
      }
    }

    if (this._badgeEl) {
      if (hasCompare) {
        const pct = Math.round((v.compare_at_price - v.price) * 100 / v.compare_at_price);
        this._badgeEl.textContent = pct + '% OFF';
        this._badgeEl.style.display = '';
      } else if (this._badgeEl.dataset.lnBadge !== undefined && this._badgeEl.textContent.trim()) {
        // keep fallback badge text as-is
      } else {
        this._badgeEl.style.display = 'none';
      }
    }

    this._updatePerday(detail.variant);
  }

  _updatePerday(variant) {
    if (!this._perdayEl || !this._perdayOption || !variant) return;
    const product = this._getProductData();
    if (!product) return;

    const optIndex = product.options ? product.options.findIndex(o => o === this._perdayOption) : -1;
    if (optIndex < 0) { this._perdayEl.textContent = ''; return; }

    const optionValues = variant.options || [];
    const selectedVal = optionValues[optIndex];
    this._perdayEl.textContent = selectedVal ? (this._perdayMap[selectedVal] || '') : '';
  }

  _initFromPage() {
    const product = this._getProductData();
    if (!product) return;
    const variant = product.selected_or_first_available_variant || (product.variants && product.variants[0]);
    if (variant) this._updatePerday(variant);
  }

  _getProductData() {
    try {
      const el = document.getElementById('ProductJSON-' + this._sectionId);
      return el ? JSON.parse(el.textContent) : null;
    } catch (_) { return null; }
  }

  _money(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

if (!customElements.get('ln-pdp-price')) {
  customElements.define('ln-pdp-price', LnPdpPrice);
}
