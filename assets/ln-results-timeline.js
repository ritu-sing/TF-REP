import { Component } from '@theme/component';

class LnTimeline extends Component {
  connectedCallback() {
    super.connectedCallback();
    this._initTrack();
  }

  _initTrack() {
    if (!this.refs.track) return;
    // Track is available via ref="track" on the .ln-timeline__track element.
    // Mobile layout is a pure CSS vertical stack — no carousel scrolling required.
  }

  /**
   * Scroll the track forward by one item width (mobile carousel utility).
   * No-op if the mobile layout is a vertical stack.
   */
  next() {
    const track = this.refs.track;
    if (!track) return;
    const item = track.querySelector('.ln-timeline__item');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({ left: item.offsetWidth + gap, behavior: 'smooth' });
  }

  /**
   * Scroll the track backward by one item width (mobile carousel utility).
   * No-op if the mobile layout is a vertical stack.
   */
  prev() {
    const track = this.refs.track;
    if (!track) return;
    const item = track.querySelector('.ln-timeline__item');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({ left: -(item.offsetWidth + gap), behavior: 'smooth' });
  }
}

customElements.define('ln-timeline', LnTimeline);
