$(document).ready(function () {
  let tags = [];

  // Function to add a tag chip
  const addTagChip = (tag) => {
    const chip = $('<div>', {
      class: 'tag-chip',
      html: `${tag} <span class="remove-tag">&times;</span>`,
      'data-tag': tag, // Store the tag value in a data attribute
    });

    chip.find('.remove-tag').on('click', function () {
      removeTagChip(tag, chip);
    });

    $('#tagsList').append(chip);
  };

  // Function to remove a tag chip
  const removeTagChip = (tag, chip) => {
    chip.remove();
    tags = tags.filter((t) => t !== tag);
  };

  // Handle tags input (max 5 tags, press Enter to add)
  $('#tagsInput').on('keydown', function (e) {
    if (e.key === 'Enter' && tags.length < 5) {
      e.preventDefault();
      const tag = $('#tagsInput').text().trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
        addTagChip(tag);
        $('#tagsInput').text('');
      }
    }
  });

  const setMaxDateTime = () => {
    const now = new Date();
    const formattedDateTime = now
      .toLocaleString('sv-SE', { timeZoneName: 'short' })
      .slice(0, 16)
      .replace(' ', 'T');
    $('#tradeDateTime').attr('max', formattedDateTime);
  };

  setMaxDateTime();

  // Convert symbol to uppercase when typing
  $('#symbol').on('input', function () {
    $(this).val($(this).val().toUpperCase());
  });

  // Get trade ID from hidden input field
  const tradeId = $('#tradeId').val();

  // Form validation and submission handling
  $('form.needs-validation').on('submit', function (e) {
    e.preventDefault();
    const form = $(this);

    if (!form[0].checkValidity()) {
      form.addClass('was-validated');
    } else {
      submitTrade(tradeId); // Pass tradeId for editing or creating
    }
  });

  // Submit trade data via AJAX
  const submitTrade = (tradeId = '') => {
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
          return $(this).data('tag').trim();
        })
        .get(),
    };
    const url = tradeId
      ? `/journal/api/trades/${tradeId}`
      : '/journal/api/trades';
    const method = tradeId ? 'PUT' : 'POST';

    $.ajax({
      url: url,
      type: method,
      contentType: 'application/json',
      data: JSON.stringify(tradeData),
      success: function () {
        showToast('Trade saved successfully!', 'success');
        setTimeout(function () {
          window.location.href = '/journal/trades';
        }, 2000);
      },
      error: function (xhr) {
        alert('Error saving trade: ' + xhr.responseJSON.message);
      },
    });
  };

  // Show success or error toast messages
  const showToast = (message, color) => {
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

    setTimeout(function () {
      toastContainer.toast('hide');
    }, 2000);

    toastContainer.on('hidden.bs.toast', function () {
      toastContainer.remove();
    });
  };

  // Load tags on the edit page from the data-tags attribute (only on edit page)
  const loadTags = () => {
    const tagsData = $('#tagsInput').data('tags');
    if (tagsData) {
      const tagsArray = tagsData.split(',').map((tag) => tag.trim());
      tagsArray.forEach((tag) => {
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
          addTagChip(tag);
        }
      });
    }
  };

  // Only load tags if we're on the edit page (tradeId exists)
  if (tradeId) {
    loadTags();
  }
});
