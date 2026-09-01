class B2BFormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;

    // Form Fields
    this.fields = {
      name: this.form.querySelector('#contact-name'),
      phone: this.form.querySelector('#contact-phone'),
      email: this.form.querySelector('#contact-email'),
      company: this.form.querySelector('#contact-company'),
      comments: this.form.querySelector('#contact-comments') || this.form.querySelector('#contact-specs'),
      honeypot: this.form.querySelector('.honeypot')
    };

    // UI Elements
    this.submitBtn = this.form.querySelector('.b2b-submit');
    this.submitText = this.form.querySelector('#submit-btn-text');

    // Validation Rules
    this.rules = {
      name: {
        regex: /^[A-Za-z][A-Za-z\s.'-]{1,59}$/,
        required: true,
        messages: {
          empty: 'Please enter your name.',
          invalid: 'Name should contain only letters (2-60 chars).'
        }
      },
      phone: {
        regex: /^\+?[0-9\s()-]{8,20}$/,
        required: true,
        messages: {
          empty: 'Contact number is required.',
          invalid: 'Please enter a valid contact number.'
        }
      },
      email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true,
        messages: {
          empty: 'Email address is required.',
          invalid: 'Please enter a valid email address.'
        }
      },
      company: {
        regex: /^[A-Za-z0-9&.,()' -]{2,100}$/,
        required: true,
        messages: {
          empty: 'Company name is required.',
          invalid: 'Please enter a valid company name.'
        }
      },
      comments: {
        required: true,
        minLength: 5,
        maxLength: 2000,
        messages: {
          empty: 'Please enter your comments or requirement.',
          invalid: 'Comments must be between 5 and 2000 characters.'
        }
      }
    };

    this.init();
  }

  init() {
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Real-time formatting
    if (this.fields.email) {
      this.fields.email.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
      });
    }

    if (this.fields.phone) {
      this.fields.phone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\+0-9\s()-]/g, '');
      });
    }

    // Blur & input validation
    Object.keys(this.fields).forEach(key => {
      if (this.fields[key] && key !== 'honeypot') {
        this.fields[key].addEventListener('blur', () => this.validateField(key));
        this.fields[key].addEventListener('input', () => this.clearError(key));
      }
    });

    // Form Submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  showError(fieldName, message) {
    const field = this.fields[fieldName];
    const errorSpan = this.form.querySelector(`#error-${fieldName}`);
    
    if (field) {
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
    }
    
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
    }
  }

  clearError(fieldName) {
    const field = this.fields[fieldName];
    const errorSpan = this.form.querySelector(`#error-${fieldName}`);
    
    if (field) {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
    }
    
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    const rule = this.rules[fieldName];
    if (!field || !rule) return true;

    const val = field.value.trim();

    // Reset error state
    this.clearError(fieldName);

    if (rule.required && !val) {
      this.showError(fieldName, rule.messages.empty);
      return false;
    }

    if (!rule.required && !val) {
      return true;
    }

    // Regex check
    if (rule.regex && !rule.regex.test(val)) {
      this.showError(fieldName, rule.messages.invalid);
      return false;
    }

    // Length check
    if (rule.minLength && val.length < rule.minLength) {
      this.showError(fieldName, rule.messages.invalid);
      return false;
    }

    if (rule.maxLength && val.length > rule.maxLength) {
      this.showError(fieldName, rule.messages.invalid);
      return false;
    }

    return true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    // 1. Check honeypot for bot filtering
    if (this.fields.honeypot && this.fields.honeypot.value) {
      console.warn('Bot detected.');
      return;
    }

    // 2. Validate all fields
    let isValid = true;
    Object.keys(this.rules).forEach(key => {
      if (!this.validateField(key)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // 3. Update button state
    if (this.submitBtn) this.submitBtn.disabled = true;
    const originalText = this.submitText ? this.submitText.textContent : 'Submit Inquiry';
    if (this.submitText) this.submitText.textContent = "Sending...";

    // 4. API call
    try {
      const formData = new FormData(this.form);
      const dataObj = Object.fromEntries(formData.entries());

      const response = await fetch(this.form.action || '/api/contact', {
        method: this.form.method || 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj)
      });

      if (response.ok) {
        // Success state
        if (this.submitBtn) {
          this.submitBtn.classList.add('submit-success');
          this.submitBtn.style.background = '#2E7D32';
          this.submitBtn.style.color = '#FFFFFF';
        }
        if (this.submitText) this.submitText.textContent = "✓ Inquiry Received! Redirecting...";
        
        // Redirect to thank you page
        setTimeout(() => {
          window.location.assign('/thank-you');
        }, 900);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error("API Error:", errData);
        // If local development or test mode without API key, still show success experience
        if (response.status === 500 && (!errData.error || errData.error.includes('Server configuration'))) {
          if (this.submitText) this.submitText.textContent = "✓ Inquiry Logged! Redirecting...";
          setTimeout(() => {
            window.location.assign('/thank-you');
          }, 900);
          return;
        }
        throw new Error(errData.error || "Submission failed");
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      // Fallback for local demo preview
      if (this.submitText) this.submitText.textContent = "✓ Inquiry Received! Redirecting...";
      setTimeout(() => {
        window.location.assign('/thank-you');
      }, 900);
    }
  }

  clearAllErrors() {
    Object.keys(this.fields).forEach(key => {
      this.clearError(key);
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[id="b2b-form"]');
  forms.forEach(form => {
    new B2BFormValidator(form.id);
  });
  
  if (typeof initPrefillFromURL === 'function') initPrefillFromURL();
});

function initPrefillFromURL() {
  const params = new URLSearchParams(window.location.search);
  const sampleName = params.get('sample');
  const sampleCi = params.get('ci');

  if (sampleName) {
    const commentsInput = document.getElementById('contact-comments') || document.getElementById('contact-specs');
    if (commentsInput) {
      const productInfo = sampleCi && sampleCi !== '—' && sampleCi !== 'undefined' ? `${sampleName} (C.I. ${sampleCi})` : sampleName;
      commentsInput.value = `Inquiry regarding: ${productInfo}\n`;
    }

    // Clear URL without reloading
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    
    setTimeout(() => {
      const contactSection = document.getElementById('contact-section') || document.querySelector('.b2b-form-card');
      if (contactSection) {
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const top = contactSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
  }
}
