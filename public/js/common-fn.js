function redirectToPage(symbol) {
    const uri = encodeURIComponent(symbol)
    console.log(navLink)

    window.location.href = `${navLink.replace("##sym##", uri)}`;
    myModal.show();
}
const element = document.querySelectorAll(".data-choices-manual").forEach(
    function (el) {
        const example = new Choices(el, {
            "position": "bottom",
            "placeholder": true,
            "placeholdervalue": "true",
            "maxItemCount": 1,
            "maxItemText": null,
            "itemSelectText": "",
            "searchResultLimit": 20
        });

        el.addEventListener(
            'change',
            function (event) {
                example.hideDropdown();
                example.disable();
                redirectToPage(event.detail.value.toUpperCase());
                console.log(event.detail.value);
            },
            false,
        );
    }
);

$(function () {
    $("[data-bs-toggle='tooltip'],.tooltip-manual").tooltip();
});
$(function () {
    const showAlert = localStorage.getItem("alert") === null;
    $("#notification-alert").toggleClass("d-none", !showAlert)
    $("#notification-alert-close").on("click", function () {
        localStorage.setItem("alert", "seen");
        $(this).closest(".alert").addClass("d-none")
    });
})

// disable rapid click
const disableRapidClick = (button, time = 3) => {
    button.disabled = true;
    time && setTimeout(() => button.disabled = false, time * 1000);
};

$(document).ready(function () {
    // Function to update visibility based on checkbox state
    function updateVisibility() {
        if (!$('#oc-perlot-toggle').is(':checked')) {
            // If checked, show 'oc_disp_inlot' and hide 'oc_disp_inQty'
            $('.oc_disp_inlot').show(); // Show oc_disp_inlot
            $('.oc_disp_inQty').hide(); // Hide oc_disp_inQty
        } else {
            // If unchecked, hide 'oc_disp_inlot' and show 'oc_disp_inQty'
            $('.oc_disp_inlot').hide(); // Hide oc_disp_inlot
            $('.oc_disp_inQty').show(); // Show oc_disp_inQty
        }
    }

    // Initial visibility setup
    updateVisibility();

    // Event listener for checkbox toggle
    $('#oc-perlot-toggle').change(updateVisibility);
});