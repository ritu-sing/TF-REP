// Updates the selected value shown in each variant group legend when a variant changes.
(function () {
  function updateLegends(pickerEl) {
    const fieldsets = pickerEl.querySelectorAll('.ln-vp__group');
    fieldsets.forEach(fieldset => {
      const checked = fieldset.querySelector('input[type="radio"]:checked');
      const valEl = fieldset.querySelector('.ln-vp__selected-val');
      if (checked && valEl) valEl.textContent = ' ' + checked.value;

      fieldset.querySelectorAll('.ln-vp__label').forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        if (!input) return;
        if (input.checked) {
          label.classList.add('is-selected');
        } else {
          label.classList.remove('is-selected');
        }
      });
    });
  }

  document.querySelectorAll('.ln-vp').forEach(picker => {
    picker.addEventListener('change', () => updateLegends(picker));

    const sectionEl = picker.closest('[id^="shopify-section-"]');
    if (sectionEl) {
      sectionEl.addEventListener('variant:change', () => updateLegends(picker));
    }

    updateLegends(picker);
  });
})();
