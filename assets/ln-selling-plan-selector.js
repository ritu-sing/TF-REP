class LnSellingPlan extends HTMLElement {
  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._savePct = parseFloat(this.dataset.savePercent) || 10;
    this._formId = this.dataset.formId;

    this._subOption = this.querySelector('.ln-sp__option--subscribe');
    this._oneOption = this.querySelector('.ln-sp__option--onetime');
    this._radios = this.querySelectorAll('.ln-sp__radio');
    this._compareEl = this.querySelector('[data-compare-price]');
    this._saleEl = this.querySelector('[data-sale-price]');
    this._onetimeEl = this.querySelector('[data-onetime-price]');

    this._radios.forEach(r => r.addEventListener('change', () => this._onRadioChange(r)));

    // Variant change events (Horizon dispatches 'variant:change' on the section)
    const section = document.getElementById('shopify-section-' + this._sectionId);
    if (section) {
      section.addEventListener('variant:change', e => this._onVariantChange(e.detail));
    }
    document.addEventListener('variant:change', e => {
      if (e.target && section && section.contains(e.target)) {
        this._onVariantChange(e.detail);
      }
    });

    this._subOption.classList.add('is-active');
    this._initFromPage();
  }

  _onRadioChange(radio) {
    if (radio.value === 'subscribe') {
      this._subOption.classList.add('is-active');
      this._oneOption.classList.remove('is-active');
      this._attachSellingPlan();
    } else {
      this._oneOption.classList.add('is-active');
      this._subOption.classList.remove('is-active');
      this._detachSellingPlan();
    }
  }

  _getForm() {
    return document.getElementById(this._formId);
  }

  _attachSellingPlan() {
    const form = this._getForm();
    if (!form) return;
    const planId = this._getFirstPlanId();
    if (!planId) return;
    let inp = form.querySelector('input[name="selling_plan"]');
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = 'selling_plan';
      form.appendChild(inp);
    }
    inp.value = planId;
  }

  _detachSellingPlan() {
    const form = this._getForm();
    if (!form) return;
    const inp = form.querySelector('input[name="selling_plan"]');
    if (inp) inp.remove();
  }

  _getFirstPlanId() {
    try {
      const el = document.getElementById('ProductJSON-' + this._sectionId);
      if (el) {
        const data = JSON.parse(el.textContent);
        if (data.selling_plan_groups && data.selling_plan_groups.length > 0) {
          return data.selling_plan_groups[0].selling_plans[0].id;
        }
      }
    } catch (_) {}
    return null;
  }

  _onVariantChange(detail) {
    const price = detail && detail.variant && detail.variant.price;
    if (price != null) this._updatePrices(price);
  }

  _initFromPage() {
    try {
      const el = document.getElementById('ProductJSON-' + this._sectionId);
      if (el) {
        const data = JSON.parse(el.textContent);
        const variant = data.selected_or_first_available_variant || (data.variants && data.variants[0]);
        if (variant && variant.price) this._updatePrices(variant.price);
      }
    } catch (_) {}
  }

  _updatePrices(priceCents) {
    const saleCents = Math.round(priceCents * (1 - this._savePct / 100));
    if (this._compareEl) this._compareEl.textContent = this._fmt(priceCents);
    if (this._saleEl) this._saleEl.textContent = this._fmt(saleCents);
    if (this._onetimeEl) this._onetimeEl.textContent = this._fmt(priceCents);
  }

  _fmt(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

if (!customElements.get('ln-selling-plan')) {
  customElements.define('ln-selling-plan', LnSellingPlan);
}
