/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

$(document).ready(function () {
  $.ajaxSetup({
    beforeSend: function (jqXHR, settings) {
      myModal.show(); // Show the modal loader
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
      setTimeout(() => {
        myModal.hide();
      }, 500);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setTimeout(() => {
        myModal.hide();
      }, 500);
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
