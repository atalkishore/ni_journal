/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
$(document).ready(function () {
  const originalAjax = $.ajax;
  $.ajax = function (options) {
    // Wrap the success callback, if it exists
    if (options.success) {
      const originalSuccess = options.success;
      options.success = function (data, textStatus, jqXHR) {
        try {
          originalSuccess(data, textStatus, jqXHR); // Execute original success
        } catch (error) {
          console.error('Error in success callback:', error);
          // Hide the loader in case of an error
          if (options.defaultLoader !== false) {
            setTimeout(() => {
              myModal.hide();
            }, 500);
          }
          // Rethrow the error for further handling
          // throw error;
        }
      };
    }

    // Pass the modified options to the original $.ajax
    return originalAjax(options);
  };

  $.ajaxSetup({
    beforeSend: function (jqXHR, settings) {
      // Show the modal loader only if disableLoader is not set to true
      if (settings.defaultLoader !== false) {
        myModal.show();
      }
    },
    dataFilter: function (data, type) {
      try {
        // Check if the response is a string and attempt to parse it as JSON
        if (typeof data === 'string') {
          let dataMod = JSON.parse(data); // Attempt to parse the string as JSON
          if (dataMod?.__i) {
            data = JSON.stringify(_dec(dataMod)); // Decrypt the response payload
          }
        }
      } catch (error) {
        console.error('Error handling response:', error);
      }
      return data;
    },
    complete: function (jqXHR, textStatus) {
      if (this.defaultLoader !== false) {
        setTimeout(() => {
          myModal.hide();
        }, 500);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      if (this.defaultLoader !== false) {
        setTimeout(() => {
          myModal.hide();
        }, 500);
      }
    },
  });
});

function redirectToPage(symbol) {
  const uri = encodeURIComponent(symbol);
  console.log(navLink);

  window.location.href = `${navLink.replace('##sym##', uri)}`;
  myModal.show();
}
const element = document
  .querySelectorAll('.data-choices-manual')
  .forEach(function (el) {
    const example = new Choices(el, {
      position: 'bottom',
      placeholder: true,
      placeholdervalue: 'true',
      maxItemCount: 1,
      maxItemText: null,
      itemSelectText: '',
      searchResultLimit: 20,
    });

    el.addEventListener(
      'change',
      function (event) {
        example.hideDropdown();
        example.disable();
        redirectToPage(event.detail.value.toUpperCase());
        console.log(event.detail.value);
      },
      false
    );
  });

$(function () {
  $("[data-bs-toggle='tooltip'],.tooltip-manual").tooltip();
});
$(function () {
  const showAlert = localStorage.getItem('alert') === null;
  $('#notification-alert').toggleClass('d-none', !showAlert);
  $('#notification-alert-close').on('click', function () {
    localStorage.setItem('alert', 'seen');
    $(this).closest('.alert').addClass('d-none');
  });
});

// disable rapid click
const disableRapidClick = (button, time = 3) => {
  button.disabled = true;
  time && setTimeout(() => (button.disabled = false), time * 1000);
};
