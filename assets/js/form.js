class B2BFormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;

    // Form Fields
    this.fields = {
      name: this.form.querySelector('#contact-name'),
      email: this.form.querySelector('#contact-email'),
      company: this.form.querySelector('#contact-company'),
      phone: this.form.querySelector('#contact-phone'),
      compound: this.form.querySelector('#target-compound'),
      quantity: this.form.querySelector('#sample-quantity'),
      specs: this.form.querySelector('#contact-specs'),
      msds: this.form.querySelector('#contact-msds'),
      honeypot: this.form.querySelector('.honeypot')
    };

    // UI Elements
    this.charCounter = this.form.querySelector('#char-counter-specs');
    this.submitBtn = this.form.querySelector('.b2b-submit');
    this.submitText = this.form.querySelector('#submit-btn-text');
    this.dropdown = this.form.querySelector('#compound-dropdown');
    
    // Tabs
    this.tabQuote = document.getElementById('tab-quote');
    this.tabSample = document.getElementById('tab-sample');
    this.quantityGroup = document.getElementById('sample-quantity-group');

    this.currentMode = 'quote'; // 'quote' or 'sample'

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
      email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true,
        personalDomains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'aol.com', 'live.com'],
        messages: {
          empty: 'Business email is required.',
          invalid: 'Please enter a valid email address.',
          personal: 'Please use your company email.'
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
      phone: {
        regex: /^\+?[0-9\s()-]{8,20}$/,
        required: false,
        messages: {
          invalid: 'Please enter a valid phone number.'
        }
      },
      compound: {
        required: true,
        minLength: 3,
        maxLength: 120,
        messages: {
          empty: 'Product name or C.I. No. is required.',
          invalid: 'Must be between 3 and 120 characters.'
        }
      },
      quantity: {
        required: false, // Will be set dynamically based on mode
        messages: {
          empty: 'Required sample quantity is required.'
        }
      },
      specs: {
        required: true,
        minLength: 20,
        maxLength: 1000,
        messages: {
          empty: 'Specification details are required.',
          invalid: 'Please provide more specific details (20-1000 chars).'
        }
      }
    };

    // Autocomplete Data
    this.products = [
      "Methyl Violet (Basic Violet 1)",
      "Crystal Violet (Basic Violet 3)",
      "Ethyl Violet (Basic Violet 4)",
      "Rhodamine B (Basic Violet 10)",
      "Magenta (Basic Violet 14)",
      "Auramine O (Basic Yellow 2)",
      "Chrysoidine Y (Basic Orange 2)",
      "Bismark Brown (Basic Brown 1)",
      "Malachite Green (Basic Green 4)",
      "Brilliant Green (Basic Green 1)",
      "Victoria Blue B (Basic Blue 26)",
      "Victoria Blue R (Basic Blue 11)",
      "Victoria Pure Blue BO (Basic Blue 7)",
      "Methylene Blue (Basic Blue 9)",
      "Acid Yellow 36",
      "Acid Orange 7",
      "Solvent Red 119",
      "Solvent Blue 35"
    ];

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.updateTabState();
  }

  attachEventListeners() {
    // Real-time formatting & char counting
    this.fields.email.addEventListener('input', (e) => {
      e.target.value = e.target.value.toLowerCase();
    });

    this.fields.phone.addEventListener('input', (e) => {
      // Basic auto-formatting (remove invalid chars)
      e.target.value = e.target.value.replace(/[^\+0-9\s()-]/g, '');
    });

    this.fields.specs.addEventListener('input', () => this.updateCharCounter());

    // Blur Validation
    Object.keys(this.fields).forEach(key => {
      if (this.fields[key] && key !== 'honeypot' && key !== 'msds') {
        this.fields[key].addEventListener('blur', () => this.validateField(key));
        this.fields[key].addEventListener('input', () => this.clearError(key));
      }
    });

    // Autocomplete
    this.fields.compound.addEventListener('input', () => this.handleAutocomplete());
    document.addEventListener('click', (e) => {
      if (e.target !== this.fields.compound && e.target !== this.dropdown) {
        this.dropdown.style.display = 'none';
      }
    });

    // Tabs
    if (this.tabQuote && this.tabSample) {
      this.tabQuote.addEventListener('click', () => this.switchMode('quote'));
      this.tabSample.addEventListener('click', () => this.switchMode('sample'));
    }

    // Form Submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.updateTabState();
  }

  updateTabState() {
    if (this.currentMode === 'quote') {
      this.tabQuote?.classList.add('is-active');
      this.tabSample?.classList.remove('is-active');
      this.quantityGroup.style.display = 'none';
      this.rules.quantity.required = false;
      this.fields.quantity.required = false;
      this.submitText.textContent = "Initiate Bulk Sales Quote Request";
    } else {
      this.tabQuote?.classList.remove('is-active');
      this.tabSample?.classList.add('is-active');
      this.quantityGroup.style.display = 'block';
      this.rules.quantity.required = true;
      this.fields.quantity.required = true;
      this.submitText.textContent = "Request Technical Sample";
    }
  }

  updateCharCounter() {
    const len = this.fields.specs.value.length;
    this.charCounter.textContent = `${len} / 1000`;
    if (len > 1000) {
      this.charCounter.style.color = 'var(--color-error, #dc2626)';
    } else {
      this.charCounter.style.color = 'inherit';
    }
  }

  handleAutocomplete() {
    const val = this.fields.compound.value.toLowerCase();
    this.dropdown.innerHTML = '';
    
    if (!val) {
      this.dropdown.style.display = 'none';
      return;
    }

    const matches = this.products.filter(p => p.toLowerCase().includes(val));
    
    if (matches.length > 0) {
      this.dropdown.style.display = 'block';
      matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        // Highlight match
        const regex = new RegExp(`(${val})`, 'gi');
        div.innerHTML = match.replace(regex, '<strong>$1</strong>');
        div.addEventListener('click', () => {
          this.fields.compound.value = match;
          this.dropdown.style.display = 'none';
          this.validateField('compound');
        });
        this.dropdown.appendChild(div);
      });
    } else {
      this.dropdown.style.display = 'none';
    }
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
      return true; // Optional field is empty, valid
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

    // 1. Check honeypot
    if (this.fields.honeypot && this.fields.honeypot.value) {
      // Silently reject
      console.warn('Bot detected.');
      return;
    }

    // 2. Validate all fields
    let isValid = true;
    Object.keys(this.rules).forEach(key => {
      // Only validate quantity if it's required in the current mode
      if (key === 'quantity' && !this.rules.quantity.required) return;
      
      if (!this.validateField(key)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // 3. Update button state
    this.submitBtn.disabled = true;
    const originalText = this.submitText.textContent;
    this.submitText.textContent = "Sending...";

    // 4. API call
    try {
      const formData = new FormData(this.form);
      const dataObj = Object.fromEntries(formData.entries());

      // If 'sample_quantity' is empty and not required, we can still pass it, 
      // the backend will handle it correctly based on whether it is a sample tab or not.

      const response = await fetch(this.form.action, {
        method: this.form.method || 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj)
      });

      if (response.ok) {
        // Success state
        this.submitBtn.classList.add('submit-success');
        this.submitText.textContent = "✓ Request Submitted";
        
        // Reset form after a delay
        setTimeout(() => {
          this.form.reset();
          this.submitBtn.disabled = false;
          this.submitBtn.classList.remove('submit-success');
          this.submitText.textContent = originalText;
          this.updateCharCounter();
          this.clearAllErrors();
        }, 4000);
      } else {
        const errData = await response.json();
        console.error("API Error:", errData);
        throw new Error(errData.error || "Submission failed");
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      this.submitText.textContent = "Error. Please try again.";
      this.submitBtn.disabled = false;
      
      setTimeout(() => {
        if (!this.submitBtn.disabled) return; // Prevent overwriting if already submitted again
        this.submitText.textContent = originalText;
      }, 3000);
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
  // If multiple forms exist, initialize all
  const forms = document.querySelectorAll('form[id="b2b-form"]');
  forms.forEach(form => {
    new B2BFormValidator(form.id);
  });
});
