const tagsInput = document.getElementById('tagsInput');
const tagsList = document.getElementById('tagsList');
let tags = [];

tagsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && tags.length < 5) {
    e.preventDefault();
    const tag = tagsInput.textContent.trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.innerHTML = `${tag} <span class="remove-tag">&times;</span>`;

      chip.querySelector('.remove-tag').addEventListener('click', () => {
        tagsList.removeChild(chip);
        tags = tags.filter((t) => t !== tag);
      });
      tagsList.appendChild(chip);
      tagsInput.textContent = '';
    }
  }
});

const tradeDateTimeInput = document.getElementById('tradeDateTime');
function setMaxDateTime() {
  const now = new Date();
  const formattedDateTime = now.toISOString().slice(0, 16);
  tradeDateTimeInput.setAttribute('max', formattedDateTime);
}
document.addEventListener('DOMContentLoaded', setMaxDateTime);

const symbolInput = document.getElementById('symbol');
symbolInput.addEventListener('input', (event) => {
  symbolInput.value = symbolInput.value.toUpperCase();
});

(function () {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          submitTrade();
        }
        form.classList.add('was-validated');
      },
      false
    );
  });
})();

function submitTrade() {
  const tradeData = {
    tradeDate: $('#tradeDateTime').val(),
    instrument: $('#instrument').val(),
    symbol: $('#symbol').val(),
    quantity: parseFloat($('#quantity').val()),
    position: $('#position').val(),
    entryPrice: parseFloat($('#entryPrice').val()),
    targetPrice: parseFloat($('#targetPrice').val() || 0),
    stopLoss: parseFloat($('#stopLoss').val() || 0),
    strategy: $('#strategies').val(),
    account: $('#account').val(),
    transactionCost: parseFloat($('#transactionCost').val() || 0),
    tradeNotes: $('#tradeNotes').val(),
    tags: $('#tagsList .tag-chip')
      .map(function () {
        return $(this).text().trim();
      })
      .get(),
  };
  $.ajax({
    url: '/journal/api/trades',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(tradeData),
    success: function (response) {
      showToast('Trade added successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/journal/trades';
      }, 2000);
    },
    error: function (xhr) {
      alert('Error adding trade: ' + xhr.responseJSON.message);
    },
  });
}

function showToast(message, color) {
  const toastHtml = `<div class="toast align-items-center text-bg-${color} border-0" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; z-index: 1055;">
    <div class="d-flex">
      <div class="toast-body">
        <span class="fas fa-check-circle text-white me-2"></span>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>`;

  const toastContainer = $(toastHtml);
  $('body').append(toastContainer);
  const toast = new bootstrap.Toast(toastContainer[0]);
  toast.show();

  setTimeout(() => {
    toastContainer.toast('hide');
  }, 2000);

  toastContainer.on('hidden.bs.toast', function () {
    toastContainer.remove();
  });
}

function loadStrategies() {
  $.ajax({
    url: '/journal/api/strategy',
    type: 'GET',
    success: function (strategies) {
      const strategiesDropdown = $('#strategies');
      strategies?.data.forEach((strategy) => {
        const option = `<option value="${strategy.name}">${strategy.name}</option>`;
        strategiesDropdown.append(option);
      });
    },
    error: function (xhr) {
      alert('Failed to load strategies: ' + xhr.responseText);
    },
  });
}

// Call the loadStrategies function when the page is loaded
$(document).ready(function () {
  loadStrategies();
});
