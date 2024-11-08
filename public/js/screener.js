$(document).ready(function () {
    //global declerations
    let $allScreenerPanel = $("#all_screener_panel");
    let $selectedScreenerPanel = $("#selected_screener_panel");
    let $Search = $("#sc-submit");
    let $scSelectPanel = $("#sc-select-panel");
    let $scTogglePanel = $("#sc-toggle-select-panel");
    // helper functions

    // events
    //screenersSelected

    function renderSelectedScreenerPanel() {
        let html = screenersSelected.map(screener => {
            let find = screeners.find(x => x.name.key === screener.n);
            let dropdownOperator = '';
            if (find) {
                find.disabled = true;
                let availableFreq = find.frequency.filter(x => !find.disabledFreq || !find.disabledFreq.includes(x));
                if (find.frequency) {
                    let temp1 = `<option value='-' disabled>Timeline</option>
<option value='${screener.tl}' selected>${screener.tl}</option>`;
                    temp1 += availableFreq.map(frequency => `
                <option value='${frequency}'>${frequency}</option>
            `).join(' ');
                    dropdownOperator += `<label><div><select data-old='${screener.tl}'  class="browser-default sc-freq-select"  style="width: auto">${temp1}</select></div></label>`
                }
                if (find.operator) {
                    let temp2 = find.operator.map(operator => `
                <option value='${operator}' ${operator === screener.op ? 'selected' : ''}>${operator}</option>
            `).join(' ');
                    dropdownOperator += `<label><div><select  class="browser-default sc-operator-select"  style="width: auto"><option value='-' disabled>Operator</option>${temp2}</select></div></label>`
                }

            }

            let sentence = `<label>${screener.display}</label>`;
            let input = "";
            if (screener.ot === 1) {
                sentence += `${dropdownOperator}`;
                input = `<input type="number" class="browser-default sc-input-v1" value="${screener.v1}" style="width: 60px" min="${find.valid_range[0]}" max="${find.valid_range[1]}" required />`;
                if (screener.op === 'BETWEEN') {
                    input += `
                         <p class="range-field">
                             AND
                         </p>
                        <input type="number" class="browser-default sc-input-v2"  value="${screener.v2}" style="width: 60px" min="${find.valid_range[0]}" max="${find.valid_range[1]}"  />`;

                }
            } else if (screener.ot === 2) {
                sentence = `<label>Trading </label>${dropdownOperator}` + sentence;
            }

            return `
                    <div class="flex align-v-center screener-item " data-screener="${screener.n}" data-tl="${screener.tl}">
                    <p><i class="fa fa-trash red-text cursor-pointer"></i></p>
                        ${sentence}
                        ${input}
                    </div>
                    <div class="divider"></div>
                `;
        });

        $selectedScreenerPanel.html(html);
        if (screenersSelected.length <= 0) {
            $Search.prop("disabled", true);
        } else {
            $Search.prop("disabled", false);
        }
    }

    function renderAllScreenerPanel() {
        let html = screeners.map(screener => {
            let availableFreq = screener.frequency?.filter(x => !screener.disabledFreq || !screener.disabledFreq.includes(x));
            if (screener.frequency.length>0 && availableFreq.length === 0)
                return false;
            let btns = `<a data-screener="${screener.name.key}" class="text-danger ms-1"><i class="fa fa-add"></i></a>`;
            return `
       <li data-screener="${screener.name.key}" class="collection-item sc-add-event cursor-pointer">${screener.name.display} 
           ${btns}
       </li>
        `
        });

        $allScreenerPanel.html(html);
    }

    renderSelectedScreenerPanel();
    renderAllScreenerPanel();

// screeners
    $allScreenerPanel.on("click", ".sc-add-event", function () {
        let key = $(this).data("screener");
        let find = screeners.find(x => x.name.key === key);
        let availableFreq = find.frequency.filter(x => !find.disabledFreq || !find.disabledFreq.includes(x));
        if (find && availableFreq.length > 0) {
            let ot = find.operator_type;
            screenersSelected.push({
                "n": find.name.key,
                "display": find.name.display,
                "ot": ot,
                "tl": availableFreq[0],
                "op": ot !== 3 ? find.operator[0] : "",
                "v1": ot !== 1 ? "" : find.valid_range[0]
            })
            // find.disabled = true;
            if (!find.disabledFreq) find.disabledFreq = [];
            find.disabledFreq.push(availableFreq[0]);
        }
        renderSelectedScreenerPanel();
        renderAllScreenerPanel();
    });

    $selectedScreenerPanel.on("change", ".sc-operator-select", function () {
        let val = $(this).find("option:selected").val();
        let screenerName = $(this).parents("div.screener-item").data("screener");
        let tl = $(this).parents("div.screener-item").data("tl");

        let find1 = screenersSelected.find(x => x.n === screenerName && x.tl === tl);
        let find2 = screeners.find(x => x.name.key === screenerName);
        if (find1 && find2) {
            find1.op = val;
            if (val === "BETWEEN") {
                find1.v2 = find2.valid_range[1]
            }
            renderSelectedScreenerPanel()
        }

    });
    $selectedScreenerPanel.on("change", ".sc-freq-select", function () {
        let val = $(this).find("option:selected").val();
        let oldValue = $(this).attr('data-old');
        $(this).attr('data-old', val);
        let screenerName = $(this).parents("div.screener-item").data("screener");

        let find1 = screenersSelected.find(x => x.n === screenerName && x.tl === oldValue);
        let find2 = screeners.find(x => x.name.key === screenerName);
        if (find1 && find2) {
            find1.tl = val;
            find2.disabledFreq = find2.disabledFreq.filter(item => item !== oldValue)
            find2.disabledFreq.push(val);
            renderSelectedScreenerPanel()
        }

    });
    $selectedScreenerPanel.on("change", ".sc-input-v1", function () {
        let val = $(this).val();
        let screenerName = $(this).parents("div.screener-item").data("screener");
        let tl = $(this).parents("div.screener-item").data("tl");

        let find1 = screenersSelected.find(x => x.n === screenerName && x.tl === tl);
        if (find1) {
            find1.v1 = val;
            renderSelectedScreenerPanel()
        }
        $(this).focus();
    });
    $selectedScreenerPanel.on("change", ".sc-input-v2", function () {
        let val = $(this).val();
        let screenerName = $(this).parents("div.screener-item").data("screener");
        let tl = $(this).parents("div.screener-item").data("tl");

        let find1 = screenersSelected.find(x => x.n === screenerName && x.tl === tl);
        if (find1) {
            find1.v2 = val;
            renderSelectedScreenerPanel()
        }
        $(this).focus();
    });

    $selectedScreenerPanel.on("click", ".sc-trash", function () {
        let screenerName = $(this).parents("div.screener-item").data("screener");
        let tl = $(this).parents("div.screener-item").data("tl");

        screenersSelected = screenersSelected.filter(x => !(x.n === screenerName && x.tl === tl));
        let screenersFind = screeners.find(x => x.name.key === screenerName);
        if (screenersFind) {
            screenersFind.disabledFreq = screenersFind.disabledFreq.filter(item => item !== tl)
        }
        renderSelectedScreenerPanel();
        renderAllScreenerPanel();

    });

    $Search.click(function () {
        let newScreenersSelected = screenersSelected.map(x => ({
            n: x.n,
            ot: x.ot,
            op: x.op,
            tl: x.tl,
            v1: x.v1,
            v2: x.v2,
        }))
        let encoded = encodeURI(JSON.stringify(newScreenersSelected));
        window.location.href = `/screener/search?data=` + encoded;
    });

    $scTogglePanel.click(function () {
        $scSelectPanel.toggleClass("d-none");
        $(this).toggleClass("d-none");
    })
});
