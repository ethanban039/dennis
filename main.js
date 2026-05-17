// ═══════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(i => {
        const b = i.querySelector('.faq-item__question');
        const a = i.querySelector('.faq-item__answer');
        b.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = null;
      });

      // Open clicked if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ═══════════════════════════════════════════
// FORM HANDLING
// ═══════════════════════════════════════════
function validateForm(form) {
  let valid = true;
  const fields = form.querySelectorAll('[required]');

  fields.forEach(field => {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');

    const emptyTextField = field.type !== 'checkbox' && !field.value.trim();
    const uncheckedRequiredBox = field.type === 'checkbox' && !field.checked;

    if (emptyTextField || uncheckedRequiredBox) {
      field.classList.add('invalid');
      field.setAttribute('aria-invalid', 'true');
      valid = false;
    }
  });

  return valid;
}

async function submitForm(form, successEl) {
  if (!validateForm(form)) return;

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.classList.add('btn--loading');
  btn.textContent = 'Sending...';

  const data = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead');
      }
      form.hidden = true;
      successEl.hidden = false;
    } else {
      throw new Error('Server error');
    }
  } catch {
    btn.classList.remove('btn--loading');
    btn.textContent = originalText;
    alert('Something went wrong. Please try again.');
  }
}

function initForms() {
  const pairs = [
    { form: document.getElementById('hero-form'), success: document.getElementById('hero-success') },
    { form: document.getElementById('bottom-form'), success: document.getElementById('bottom-success') },
  ];

  pairs.forEach(({ form, success }) => {
    if (!form) return;

    // Clear invalid on input
    form.querySelectorAll('[required]').forEach(field => {
      const clearInvalid = () => {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
      };
      field.addEventListener('input', clearInvalid);
      field.addEventListener('change', clearInvalid);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      submitForm(form, success);
    });
  });
}

// ═══════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════
function initReveal() {
  const targets = document.querySelectorAll(
    '.step, .benefit-card, .testimonial-card, .gallery__item, .faq-item, .section-title, .section-subtitle, .section-eyebrow'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings within same parent
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 4) el.classList.add(`reveal--delay-${idx}`);
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initFAQ();
  initForms();
  initReveal();
});
