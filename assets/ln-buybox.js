import { Component } from '@theme/component';

/**
 * Gallery web component for the ln-buybox PDP section.
 * Manages thumbnail strip → hero image swap, pagination dots, and prev/next navigation.
 */
class LnBuyboxGallery extends Component {
  /** @type {number} */
  currentIndex = 0;

  connectedCallback() {
    super.connectedCallback();
    this.goTo(0);
  }

  /**
   * Navigate to the slide at the given index with wrap-around.
   * Updates mainImage src/srcset, activates the matching thumb and dot.
   *
   * @param {number} index - Target slide index (will wrap-around).
   */
  goTo(index) {
    const thumbs = /** @type {NodeListOf<HTMLImageElement>} */ (
      this.querySelectorAll('.ln-buybox__thumb')
    );
    const dots = this.querySelectorAll('.ln-buybox__dot');
    const total = thumbs.length;

    if (total === 0) return;

    // Wrap-around clamping
    index = ((index % total) + total) % total;
    this.currentIndex = index;

    const activeThumb = thumbs[index];
    const mainImage = /** @type {HTMLImageElement | undefined} */ (this.refs.mainImage);

    if (activeThumb && mainImage) {
      const src = activeThumb.dataset.src;
      const srcset = activeThumb.dataset.srcset;
      if (src) {
        mainImage.src = src;
        if (srcset) mainImage.srcset = srcset;
        mainImage.alt = activeThumb.alt;
      }
    }

    for (const thumb of thumbs) {
      thumb.classList.remove('is-active');
    }
    for (const dot of dots) {
      dot.classList.remove('is-active');
    }

    if (thumbs[index]) thumbs[index].classList.add('is-active');
    if (dots[index]) dots[index].classList.add('is-active');
  }

  /**
   * Navigate to the previous slide.
   * @param {Event} _event
   */
  handlePrev(_event) {
    this.goTo(this.currentIndex - 1);
  }

  /**
   * Navigate to the next slide.
   * @param {Event} _event
   */
  handleNext(_event) {
    this.goTo(this.currentIndex + 1);
  }

  /**
   * Navigate to the slide corresponding to the clicked thumbnail.
   * Reads data-index from the element that received the on:click event.
   *
   * @param {Event} event
   */
  handleThumbClick(event) {
    const thumb = /** @type {HTMLElement} */ (event.target);
    const index = parseInt(thumb.dataset.index ?? '', 10);
    if (!isNaN(index)) this.goTo(index);
  }
}

customElements.define('ln-buybox-gallery', LnBuyboxGallery);
