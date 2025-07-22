const DEFAULT_FROM_TOKEN = 'SWTH';
const DEFAULT_TO_TOKEN = 'ETH';
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';
const PRICE_API_URL = 'https://interview.switcheo.com/prices.json';

class TokenExchangeCalculator {
  constructor() {
    this.tokens = [];
    this.prices = {};
    this.selectedFromToken = DEFAULT_FROM_TOKEN;
    this.selectedToToken = DEFAULT_TO_TOKEN;
    this.isLoading = false;
    this.isSubmitting = false;

    this.initializeElements();
    this.bindEvents();
    this.loadData();
  }

  initializeElements() {
    this.$form = $('#exchange-form');
    this.$fromAmountInput = $('#from-amount');
    this.$toAmountInput = $('#to-amount');
    this.$confirmBtn = $('#confirm-swap-btn');

    this.$fromTokenSelector = $('#from-token-selector');
    this.$toTokenSelector = $('#to-token-selector');
    this.$fromTokenIcon = $('#from-token-icon');
    this.$fromTokenSymbol = $('#from-token-symbol');
    this.$toTokenIcon = $('#to-token-icon');
    this.$toTokenSymbol = $('#to-token-symbol');

    this.$fromBalance = $('#from-balance');
    this.$toBalance = $('#to-balance');

    this.$exchangeRate = $('#exchange-rate');
    this.$priceImpact = $('#price-impact');
    this.$networkFee = $('#network-fee');

    this.$swapDirectionBtn = $('#swap-direction-btn');
    this.$fromMaxBtn = $('#from-max-btn');

    this.$tokenModal = $('#token-modal');
    this.$tokenSearch = $('#token-search');
    this.$tokenList = $('#token-list');
    this.$closeModalBtn = $('#close-modal');

    this.currentModalTarget = null;
  }

  bindEvents() {
    this.$form.on('submit', (e) => this.handleFormSubmit(e));

    this.$fromAmountInput.on('input', () => this.handleAmountChange());
    this.$fromAmountInput.on('blur', () => this.validateInput());

    this.$fromTokenSelector.on('click', () => this.openTokenModal('from'));
    this.$toTokenSelector.on('click', () => this.openTokenModal('to'));

    this.$swapDirectionBtn.on('click', () => this.swapTokens());

    this.$fromMaxBtn.on('click', () => this.setMaxAmount());

    this.$closeModalBtn.on('click', () => this.closeTokenModal());
    this.$tokenModal.on('click', (e) => {
      if (e.target === this.$tokenModal[0]) this.closeTokenModal();
    });

    this.$tokenSearch.on('input', () => this.filterTokens());

    $(document).on('keydown', (e) => {
      if (e.key === 'Escape') this.closeTokenModal();
    });

    this.initializeJQueryEffects();
  }

  initializeJQueryEffects() {
    this.$fromTokenSelector.add(this.$toTokenSelector).hover(
      function () {
        $(this).addClass('hover-effect').css({
          'transform': 'translateY(-2px)',
          'box-shadow': '0 4px 12px rgba(102, 126, 234, 0.2)'
        });
      },
      function () {
        $(this).removeClass('hover-effect').css({
          'transform': 'translateY(0)',
          'box-shadow': 'none'
        });
      }
    );

    this.$fromAmountInput.focus(function () {
      $(this).parent().addClass('focused');
    }).blur(function () {
      $(this).parent().removeClass('focused');
    });

    this.$swapDirectionBtn.hover(
      function () {
        $(this).animate({
          'transform': 'scale(1.1) rotate(180deg)'
        }, 200);
      },
      function () {
        $(this).animate({
          'transform': 'scale(1) rotate(0deg)'
        }, 200);
      }
    );

    this.$fromMaxBtn.hover(
      function () {
        $(this).addClass('pulse-effect');
      },
      function () {
        $(this).removeClass('pulse-effect');
      }
    );
  }

  // Load pricing of token data from the API; showing on the UI and calculate the exchange
  async loadData() {
    try {
      this.setLoading(true);

      await this.delay(800);

      const pricesResponse = await fetch(PRICE_API_URL);
      if (!pricesResponse.ok) {
        throw new Error('Failed to load price data');
      }
      const pricesData = await pricesResponse.json();

      this.prices = {};
      this.tokens = [];

      pricesData.forEach(item => {
        if (item.currency && item.price) {
          this.prices[item.currency] = parseFloat(item.price);
          this.tokens.push({
            symbol: item.currency,
            name: this.getTokenName(item.currency),
            price: parseFloat(item.price),
            icon: `${TOKEN_ICON_BASE_URL}${item.currency}.svg`
          });
        }
      });

      this.tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

      this.updateUI();
      this.calculateExchange();

    } catch (error) {
      this.showToast('error', 'Failed to load token data. Please try again later.');
      console.error('Error loading data:', error);
    } finally {
      this.setLoading(false);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTokenName(symbol) {
    const tokenNames = {
      'SWTH': 'Switcheo Token',
      'ETH': 'Ethereum',
      'BTC': 'Bitcoin',
      'USDC': 'USD Coin',
      'USDT': 'Tether',
      'DAI': 'Dai',
      'UNI': 'Uniswap',
      'LINK': 'Chainlink',
      'AAVE': 'Aave',
      'COMP': 'Compound'
    };

    return tokenNames[symbol] || symbol;
  }

  setLoading(loading) {
    this.isLoading = loading;
    const $elements = this.$form.add(this.$fromAmountInput).add(this.$toAmountInput);

    if (loading) {
      $elements.addClass('loading');
      this.$confirmBtn.prop('disabled', true);
    } else {
      $elements.removeClass('loading');
      this.$confirmBtn.prop('disabled', false);
    }
  }

  setSubmitting(submitting) {
    this.isSubmitting = submitting;

    if (submitting) {
      this.$confirmBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
      this.$confirmBtn.prop('disabled', true);
      this.$form.addClass('loading');
    } else {
      this.validateForm();
      this.$form.removeClass('loading');
    }
  }

  updateUI() {
    this.updateTokenDisplay('from');
    this.updateTokenDisplay('to');

    this.$fromBalance.text(this.formatNumber(this.getRandomBalance()));
    this.$toBalance.text(this.formatNumber(this.getRandomBalance()));
  }

  updateTokenDisplay(type) {
    const token = type === 'from' ? this.selectedFromToken : this.selectedToToken;
    const $icon = type === 'from' ? this.$fromTokenIcon : this.$toTokenIcon;
    const $symbol = type === 'from' ? this.$fromTokenSymbol : this.$toTokenSymbol;

    $icon.attr('src', `${TOKEN_ICON_BASE_URL}${token}.svg`);
    $icon.attr('alt', token);
    $symbol.text(token);
  }

  // Calculate the exchange rate, price impact, and network fee and show on UI
  calculateExchange() {
    const fromAmount = parseFloat(this.$fromAmountInput.val()) || 0;
    const fromPrice = this.prices[this.selectedFromToken] || 0;
    const toPrice = this.prices[this.selectedToToken] || 0;

    if (fromPrice && toPrice && fromAmount > 0) {
      const toAmount = (fromAmount * fromPrice) / toPrice;
      this.$toAmountInput.val(this.formatNumber(toAmount));

      const rate = fromPrice / toPrice;
      this.$exchangeRate.text(`1 ${this.selectedFromToken} = ${this.formatNumber(rate)} ${this.selectedToToken}`);

      const impact = this.calculatePriceImpact(fromAmount);
      this.$priceImpact.text(`${impact.toFixed(2)}%`);
      this.updatePriceImpactClass(impact);

      const fee = this.calculateNetworkFee();
      this.$networkFee.text(`${this.formatNumber(fee)} ${this.selectedFromToken}`);

      this.validateForm();
    } else {
      this.$toAmountInput.val('');
      this.$exchangeRate.text(`1 ${this.selectedFromToken} = 0.000000 ${this.selectedToToken}`);
      this.$priceImpact.text('0.00%');
      this.$networkFee.text('0.00');
    }
  }

  // Calculate the price impact based on the amount
  calculatePriceImpact(amount) {
    const baseImpact = 0.1;
    const volumeFactor = Math.min(amount / 1000, 1);
    return baseImpact + (volumeFactor * 0.5);
  }

  // Calculate the network fee just the fake number between 0.001 and 0.011
  calculateNetworkFee() {
    return Math.random() * 0.01 + 0.001;
  }

  // Update the price impact class to style to element based on the impact level
  updatePriceImpactClass(impact) {
    this.$priceImpact.removeClass('impact-low impact-medium impact-high');
    if (impact < 0.5) {
      this.$priceImpact.addClass('impact-low');
    } else if (impact < 2.0) {
      this.$priceImpact.addClass('impact-medium');
    } else {
      this.$priceImpact.addClass('impact-high');
    }
  }

  // Handle the amount change event
  handleAmountChange() {
    this.calculateExchange();
    this.$fromAmountInput.closest('.token-input-wrapper').removeClass('input-error');
  }

  // Validate the input
  validateInput() {
    const value = parseFloat(this.$fromAmountInput.val());
    const balance = parseFloat(this.$fromBalance.text());
    const $wrapper = this.$fromAmountInput.closest('.token-input-wrapper');
    let isValid = true;

    if (value < 0) {
      this.showToast('error', 'Amount cannot be negative');
      $wrapper.addClass('input-error');
      isValid = false;
    } else if (value > balance) {
      this.showToast('error', 'Insufficient balance');
      $wrapper.addClass('input-error');
      isValid = false;
    } else {
      $wrapper.removeClass('input-error');
    }

    return isValid;
  }

  validateForm() {
    const fromAmount = parseFloat(this.$fromAmountInput.val()) || 0;
    const toAmount = parseFloat(this.$toAmountInput.val()) || 0;

    const isValid = fromAmount > 0 && toAmount > 0 && this.validateInput();

    this.$confirmBtn.prop('disabled', !isValid || this.isSubmitting);

    if (isValid && !this.isSubmitting) {
      this.$confirmBtn.html('<i class="fas fa-exchange-alt"></i> CONFIRM SWAP');
    } else if (this.isSubmitting) {
      this.$confirmBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
    } else {
      this.$confirmBtn.html('<i class="fas fa-lock"></i> CONFIRM SWAP');
    }

    return isValid;
  }

  swapTokens() {
    const temp = this.selectedFromToken;
    this.selectedFromToken = this.selectedToToken;
    this.selectedToToken = temp;

    // Swap amounts
    const tempAmount = this.$fromAmountInput.val();
    this.$fromAmountInput.val(this.$toAmountInput.val());
    this.$toAmountInput.val(tempAmount);

    this.updateUI();
    this.calculateExchange();
  }

  setMaxAmount() {
    const balance = parseFloat(this.$fromBalance.text());
    this.$fromAmountInput.val(this.formatNumber(balance));
    this.calculateExchange();
  }

  openTokenModal(target) {
    this.currentModalTarget = target;
    this.$tokenModal.addClass('show').fadeIn(300);
    this.renderTokenList();
    this.$tokenSearch.val('').focus();
  }

  closeTokenModal() {
    this.$tokenModal.removeClass('show').fadeOut(300);
    this.currentModalTarget = null;
  }

  renderTokenList() {
    this.$tokenList.empty();

    if (this.tokens.length === 0) {
      this.$tokenList.append('<div class="token-item no-tokens">No tokens found</div>');
      return;
    }

    const selectedSymbol = this.currentModalTarget === 'from'
      ? this.selectedFromToken
      : this.selectedToToken;

    this.tokens.forEach(token => {
      const isSelected = token.symbol === selectedSymbol;
      const $tokenElement = $(`
        <div class="token-item${isSelected ? ' selected' : ''}">
          <img src="${token.icon}" alt="${token.symbol}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNlOWVjZWYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTJMMTIgOEwxNiAxMk0xMiA4VjE0IiBzdHJva2U9IiM2NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
          <div class="token-item-info">
            <div class="token-item-symbol">${token.symbol}</div>
            <div class="token-item-name">${token.name}</div>
          </div>
          <div class="token-item-price">$${this.formatNumber(token.price)}</div>
        </div>
      `);

      $tokenElement.on('click', () => this.selectToken(token.symbol));
      this.$tokenList.append($tokenElement);
    });
  }

  selectToken(symbol) {
    if (this.currentModalTarget === 'from') {
      this.selectedFromToken = symbol;
    } else {
      this.selectedToToken = symbol;
    }

    this.updateUI();
    this.calculateExchange();
    this.closeTokenModal();
  }

  filterTokens() {
    const searchTerm = this.$tokenSearch.val().toLowerCase();
    let visibleCount = 0;

    this.$tokenList.find('.token-item').not('.no-tokens').each(function () {
      const $item = $(this);
      const symbol = $item.find('.token-item-symbol').text().toLowerCase();
      const name = $item.find('.token-item-name').text().toLowerCase();

      if (symbol.includes(searchTerm) || name.includes(searchTerm)) {
        $item.fadeIn(200);
        visibleCount++;
      } else {
        $item.fadeOut(200);
      }
    });

    if (visibleCount === 0) {
      if (this.$tokenList.find('.no-tokens').length === 0) {
        this.$tokenList.append('<div class="token-item no-tokens">No tokens found</div>');
      }
    } else {
      this.$tokenList.find('.no-tokens').remove();
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    // mock error
    if (Math.random() < 0.5) {
      this.showToast('error', 'Swap failed. Please try again.');
      return;
    }

    this.setSubmitting(true);
    this.showToast('info', 'Processing swap...');

    try {
      // 2-4 seconds
      const delayTime = Math.random() * 2000 + 2000;
      await this.delay(delayTime);

      this.showToast('success', 'Swap completed successfully!');

      this.$fromAmountInput.val('');
      this.$toAmountInput.val('');
      this.calculateExchange();

    } catch (error) {
      this.showToast('error', 'Swap failed. Please try again.');
      console.error('Swap error:', error);
    } finally {
      this.setSubmitting(false);
    }
  }

  showToast(type, message) {
    $('.toast-notification').remove();
    let icon = '<i class="fas fa-check-circle"></i>';
    let toastClass = 'toast-success';
    if (type === 'error') {
      toastClass = 'toast-error';
      icon = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'warning') {
      toastClass = 'toast-warning';
      icon = '<i class="fas fa-exclamation-triangle"></i>';
    } else if (type === 'info') {
      toastClass = 'toast-info';
      icon = '<i class="fas fa-info-circle"></i>';
    }
    const $toast = $(`
      <div class="toast-notification ${toastClass}">
        ${icon}
        <span>${message}</span>
      </div>
    `);
    $('body').append($toast);
    $toast.animate({ opacity: 1 }, 300);
    setTimeout(() => {
      $toast.animate({ opacity: 0 }, 300, function () { $(this).remove(); });
    }, 3000);
  }

  formatNumber(num) {
    if (num === 0) return '0.00';
    if (num < 0.000001) return num.toExponential(2);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }

  getRandomBalance() {
    return Math.random() * 1000 + 10;
  }
}

// Initialize the application when DOM is loaded
$(document).ready(() => {
  new TokenExchangeCalculator();
}); 