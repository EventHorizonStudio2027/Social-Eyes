/* Selfie-first local photo preview and opt-in approximate palette suggestions. No uploads. */
(() => {
  'use strict';
  const camera = document.getElementById('selfie-camera');
  const upload = document.getElementById('selfie-upload');
  const preview = document.getElementById('selfie-preview');
  const image = document.getElementById('selfie-preview-image');
  const placeholder = document.getElementById('selfie-placeholder');
  const feedback = document.getElementById('selfie-feedback');
  const discard = document.getElementById('selfie-discard');
  const manual = document.getElementById('selfie-manual');
  const suggest = document.getElementById('selfie-suggest');
  const cameraLabel = document.querySelector('label[for="selfie-camera"]');
  const uploadLabel = document.querySelector('label[for="selfie-upload"]');
  if (!camera || !upload || !preview || !image || !placeholder || !feedback || !discard || !manual || !suggest) return;
  let objectUrl = null;
  let selectionId = 0;
  let isSampling = false;
  const keyboardFilePicker = (label, input) => {
    if (!label) return;
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
  };
  keyboardFilePicker(cameraLabel, camera);
  keyboardFilePicker(uploadLabel, upload);
  const reset = () => {
    selectionId += 1;
    image.onload = null;
    image.onerror = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    image.removeAttribute('src');
    image.alt = 'Your selected selfie, shown privately on this device';
    feedback.removeAttribute('data-state');
    preview.hidden = true;
    placeholder.hidden = false;
    camera.value = '';
    upload.value = '';
    suggest.disabled = true;
  };
  const select = event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) {
      reset();
      feedback.textContent = 'Choose a JPEG, PNG, or WebP photo under 8 MB.';
      return;
    }
    reset();
    objectUrl = URL.createObjectURL(file);
    const activeSelection = selectionId;
    image.onload = () => {
      if (!objectUrl || activeSelection !== selectionId) return;
      if (image.naturalWidth < 128 || image.naturalHeight < 128) {
        reset();
        feedback.textContent = 'This photo is too small. Choose a portrait at least 128 × 128 pixels.';
        return;
      }
      preview.hidden = false;
      suggest.disabled = false;
      placeholder.hidden = true;
      feedback.dataset.state = 'ready';
      feedback.textContent = image.naturalWidth > image.naturalHeight * 1.5
        ? 'Wide photo detected. The center will be cropped for suggestions; use a centered portrait for better results.'
        : 'Photo ready. You can suggest colors or build your avatar manually.';
    };
    image.onerror = () => {
      if (activeSelection !== selectionId) return;
      reset();
      feedback.textContent = 'This image could not be opened. Please choose another photo.';
    };
    image.src = objectUrl;
  };
  suggest.addEventListener('click', () => {
    if (isSampling || !objectUrl || !image.complete || !image.naturalWidth || !window.SocialEyesPhotoPalette || !window.SocialEyesApplyPhotoSuggestions) return;
    let canvas = null;
    isSampling = true;
    try {
      suggest.disabled = true;
      canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw Error('Canvas unavailable');
      const width = image.naturalWidth, height = image.naturalHeight;
      const square = Math.min(width, height);
      ctx.drawImage(image, (width - square) / 2, (height - square) / 2, square, square, 0, 0, 128, 128);
      const pixels = ctx.getImageData(0, 0, 128, 128);
      const proposal = window.SocialEyesPhotoPalette.suggest(pixels.data, 128, 128);
      if (!window.SocialEyesApplyPhotoSuggestions(proposal)) throw Error('Avatar editor unavailable');
      feedback.dataset.state = 'applied';
      feedback.textContent = 'Two editable colors applied. Review your avatar below; use Undo to reverse these suggestions.';
      document.getElementById('manual-avatar-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      feedback.dataset.state = 'error';
      feedback.textContent = 'Could not sample colors. Your avatar is unchanged; try brighter lighting or customize manually.';
    } finally {
      if (canvas) { canvas.width = 0; canvas.height = 0; }
      isSampling = false;
      suggest.disabled = !objectUrl;
    }
  });
  camera.addEventListener('change', select);
  upload.addEventListener('change', select);
  discard.addEventListener('click', () => { reset(); feedback.textContent = 'Photo removed from the preview.'; });
  manual.addEventListener('click', () => document.getElementById('manual-avatar-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') reset();
  });
  window.addEventListener('pagehide', reset);
})();
