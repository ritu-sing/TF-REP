import { Component } from '@theme/component';

/**
 * Upsell block web component.
 * Handles async add-to-cart for the upsell product card.
 *
 * @typedef {object} Refs
 * @property {HTMLButtonElement} addBtn - The add to cart submit button.
 * @property {HTMLElement} feedbackText - Visually hidden status span for screen readers.
 *
 * @extends {Component<Refs>}
 */
class UpsellBlockComponent extends Component {
  /** @type {string} */
  #originalButtonText = '';

  connectedCallback() {
    super.connectedCallback();
    if (this.refs.addBtn) {
      this.#originalButtonText = this.refs.addBtn.textContent.trim();
    }
  }

  /**
   * Handles the add-to-cart button click.
   * Prevents default form submission and adds the upsell variant via fetch.
   *
   * @param {Event} event - The click event from the submit button.
   */
  async handleAdd(event) {
    event.preventDefault();

    const variantId = this.dataset.variantId;
    if (!variantId) return;

    const btn = this.refs.addBtn;
    if (!btn) return;

    btn.setAttribute('aria-busy', 'true');
    btn.textContent = 'Adding...';

    try {
      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: [{ id: Number(variantId), quantity: 1 }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || `Cart add failed: ${response.status}`);
      }

      btn.textContent = '✓ Added';

      // Dispatch cart:update so the cart icon bubble increments.
      // Uses source 'product-form-component' so cart-icon.js adds to the existing count.
      this.dispatchEvent(
        new CustomEvent('cart:update', {
          bubbles: true,
          detail: {
            data: {
              itemCount: 1,
              source: 'product-form-component',
            },
          },
        })
      );

      if (this.refs.feedbackText) {
        this.refs.feedbackText.textContent = 'Product added to cart.';
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      btn.removeAttribute('aria-busy');
      btn.textContent = this.#originalButtonText;

      if (this.refs.feedbackText) {
        this.refs.feedbackText.textContent = '';
      }
    } catch (_error) {
      btn.removeAttribute('aria-busy');
      btn.textContent = 'Error — try again';
    }
  }
}

if (!customElements.get('upsell-block-component')) {
  customElements.define('upsell-block-component', UpsellBlockComponent);
}
