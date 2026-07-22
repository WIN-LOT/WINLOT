// ===== STORAGE =====
const inputBox = document.getElementById("inputNumbers");

window.onload = () => {
    const saved = localStorage.getItem("winwai_numbers");
    if(saved){
        inputBox.value = saved;
        const presets = ["ชุดหาม", "ชุดเบิ้ลหน้า", "ชุดเบิ้ลหลัง", "เลขพี่น้อง", "ชุดประหาร"];
        if(presets.includes(saved)) {
            const presetTypeMap = {
                "ชุดหาม": "ham",
                "ชุดเบิ้ลหน้า": "doubleFront",
                "ชุดเบิ้ลหลัง": "doubleBack",
                "เลขพี่น้อง": "sibling",
                "ชุดประหาร": "prahan"
            };
            selectPreset(presetTypeMap[saved]);
        } else if(!saved.includes("ชุด")) {
            calculate();
        } else {
            const labelMap = {
                "012n9": "ชุด 012 (ไม่มี 9)", "012": "ชุด 012", "012n49": "ชุด 012 (ไม่มี 4,9)",
                "013": "ชุด 013", "014": "ชุด 014", "023": "ชุด 023", "024": "ชุด 024",
                "034": "ชุด 034", "123": "ชุด 123"
            };
            let foundType = null;
            for (const [type, label] of Object.entries(labelMap)) {
                if (saved === label) {
                    foundType = type;
                    break;
                }
            }
            if (foundType) {
                selectSpecial(foundType);
            }
        }
    }

    const dark = localStorage.getItem("darkmode");
    if(dark === "1"){
        document.body.classList.add("dark");
    }
};

function autoCalculate() {
    localStorage.setItem("winwai_numbers", inputBox.value);
    
    const text = inputBox.value.trim();
    const presets = ["ชุดหาม", "ชุดเบิ้ลหน้า", "ชุดเบิ้ลหลัง", "เลขพี่น้อง", "ชุดประหาร"];
    
    if(!text) {
        clearOutputBoxes();
        return;
    }
    
    if(presets.includes(text) || text.includes("ชุด 01")) {
        return;
    }
    
    calculate();
}

// ===== UTIL =====
function unique(arr){
    return [...new Set(arr)];
}

function showToast(msg = "คัดลอกแล้ว") {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function toggleDark(){
    document.body.classList.toggle("dark");
    localStorage.setItem("darkmode", document.body.classList.contains("dark") ? "1" : "0");
}

function copySingleLine(encodedText, setLabel) {
    const text = decodeURIComponent(encodedText);
    navigator.clipboard.writeText(text);
    showToast(`คัดลอกชุดเลข ${setLabel} แล้ว`);
}

function copyBox(id){
    const containerBox = document.getElementById(id);
    const items = containerBox.querySelectorAll('.set-numbers-box');
    
    if(items.length === 0 && !containerBox.innerText.trim()) {
        showToast("ไม่มีข้อมูลให้คัดลอก");
        return;
    }

    let textToCopy = "";
    if(items.length > 0) {
        items.forEach(item => {
            if(item.innerText.trim()) {
                textToCopy += item.innerText.trim() + "\n";
            }
        });
    } else {
        textToCopy = containerBox.innerText;
    }

    navigator.clipboard.writeText(textToCopy.trim());
    showToast("คัดลอกผลลัพธ์ทั้งหมดแล้ว");
}

function clearOutputBoxes() {
    const boxes = ["special3", "normal2", "double2", "normal3", "ham3", "all3"];
    boxes.forEach(id => {
        document.getElementById(id).innerHTML = "";
        const count = document.querySelector(`[data-count="${id}"]`);
        if(count) count.innerText = "0 ชุด";
    });
}

function resetAll(){
    inputBox.value = "";
    clearOutputBoxes();
    
    showAllBoxes();
    const cardSpecial = document.getElementById("card_special3");
    cardSpecial.classList.remove("expanded-box");
    cardSpecial.classList.add("hidden-box"); 
    
    localStorage.removeItem("winwai_numbers");
    showToast("ล้างข้อมูลเรียบร้อย");
}

function hideOtherBoxes() {
    document.getElementById("card_normal2").classList.add("hidden-box");
    document.getElementById("card_double2").classList.add("hidden-box");
    document.getElementById("card_normal3").classList.add("hidden-box");
    document.getElementById("card_ham3").classList.add("hidden-box");
    document.getElementById("card_all3").classList.add("hidden-box");
}

function showAllBoxes() {
    const normalBoxes = ["card_normal2", "card_double2", "card_normal3", "card_ham3", "card_all3"];
    normalBoxes.forEach(id => {
        const box = document.getElementById(id);
        box.classList.remove("hidden-box");
        box.classList.remove("expanded-box");
    });
}

// ===== POPUP MODAL CONTROL =====
function openSpecial(){
    showMainMenu(); 
    document.getElementById("specialModal").classList.add("show");
}

function closeSpecial(){
    document.getElementById("specialModal").classList.remove("show");
}

function showSubSpecialMenu() {
    document.getElementById("modalMenuMain").style.display = "none";
    document.getElementById("modalMenuSub").style.display = "block";
}

function showMainMenu() {
    document.getElementById("modalMenuSub").style.display = "none";
    document.getElementById("modalMenuMain").style.display = "block";
}

// ===== PRESET GENERATOR =====
function selectPreset(presetType) {
    const presetLabelMap = {
        "ham": "ชุดหาม",
        "doubleFront": "ชุดเบิ้ลหน้า",
        "doubleBack": "ชุดเบิ้ลหลัง",
        "sibling": "เลขพี่น้อง",
        "prahan": "ชุดประหาร"
    };
    
    const label = presetLabelMap[presetType];
    inputBox.value = label;
    localStorage.setItem("winwai_numbers", label);
    closeSpecial();

    hideOtherBoxes();
    const cardSpecial = document.getElementById("card_special3");
    cardSpecial.classList.remove("hidden-box");
    cardSpecial.classList.add("expanded-box");

    document.getElementById("special_title").innerText = `💎 ${label}`;

    let resultArr = [];
    if (presetType === "ham") {
        for (let a = 0; a <= 9; a++) {
            for (let b = 0; b <= 9; b++) {
                if (a !== b) resultArr.push(`${a}${b}${a}`);
            }
        }
    } else if (presetType === "doubleFront") {
        for (let a = 0; a <= 9; a++) {
            for (let b = 0; b <= 9; b++) {
                if (a !== b) resultArr.push(`${a}${a}${b}`);
            }
        }
    } else if (presetType === "doubleBack") {
        for (let a = 0; a <= 9; a++) {
            for (let b = 0; b <= 9; b++) {
                if (a !== b) resultArr.push(`${a}${b}${b}`);
            }
        }
    } else if (presetType === "sibling") {
        resultArr = ["01","09","10","12","21","23","32","34","43","45","54","56","65","67","76","78","87","89","90","98"];
    } else if (presetType === "prahan") {
        let prahanSet = new Set();
        for (let a = 0; a <= 9; a++) {
            for (let b = 0; b <= 9; b++) {
                if (a !== b) {
                    prahanSet.add(`${a}${b}${a}`);
                    prahanSet.add(`${a}${a}${b}`);
                    prahanSet.add(`${a}${b}${b}`);
                }
            }
        }
        resultArr = Array.from(prahanSet).sort();
    }

    document.getElementById("special3").innerHTML = `<div style="padding:10px; font-size:18px; line-height:2; font-weight:400; word-spacing:4px;">${resultArr.join(" ")}</div>`;
    document.querySelector(`[data-count="special3"]`).innerText = resultArr.length + " ชุด";

    document.getElementById("normal2").innerHTML = "";
    document.getElementById("double2").innerHTML = "";
    document.getElementById("normal3").innerHTML = "";
    document.getElementById("ham3").innerHTML = "";
    document.getElementById("all3").innerHTML = "";

    document.querySelectorAll("[data-count]").forEach(c => {
        if(c.getAttribute("data-count") !== "special3") c.innerText = "0 ชุด";
    });

    showToast(`โหลด ${label} สำเร็จ`);
}

function getSpecialResult(type) {
    switch(type) {
        case "012": return ["012","013","014","015","017","019","023","024","025","027","029","034","035","037","039","045","047","049","057","059","079","123","124","125","127","129","134","135","137","139","145","147","149","157","159","179","234","235","237","239","245","247","249","257","259","279","345","347","349","357","359","379","457","459","479","579"];
        case "012n9": return ["012","013","014","015","016","017","018","023","024","026","025","027","028","034","035","036","037","038","045","047","048","056","057","058","076","086","123","124","126","127","128","134","136","135","137","138","146","147","148","156","157","158","176","178","234","235","236","237","238","246","247","248","256","257","258","276","278","346","345","347","348","356","357","358","368","376","378","456","457","458","468","476","478","576","578","586","678","769","869"];
        case "012n49": return ["012","013","015","016","017","018","023","025","026","027","028","035","036","037","038","056","057","058","067","068","078","123","125","126","127","128","135","136","137","138","156","157","158","167","168","178","235","236","237","238","256","257","258","267","268","278","356","357","358","367","368","378","567","568","578","678"];
        case "013": return ["013","014","016","017","018","019","034","036","037","038","039","046","047","048","049","067","068","069","078","079","089","134","136","137","138","139","146","147","148","149","167","168","169","178","179","189","346","347","348","349","367","368","369","378","379","389","467","468","469","478","479","489","678","679","689","789"];
        case "014": return ["014","015","016","017","018","019","045","046","047","048","049","056","057","058","059","067","068","069","078","079","089","145","146","147","148","149","156","157","158","159","167","168","169","178","179","189","456","457","458","459","467","468","469","478","479","489","567","568","569","578","579","589","678","679","689","789"];
        case "023": return ["023","024","025","026","028","029","034","035","036","038","039","045","046","048","049","056","058","059","068","069","089","234","235","236","238","239","245","246","248","249","256","258","259","268","269","289","345","346","348","349","356","358","359","368","369","389","456","458","459","468","469","489","568","569","589","689"];
        case "024": return ["024","025","026","027","028","029","045","046","047","048","049","056","057","058","059","067","068","069","078","079","089","245","246","247","248","249","256","257","258","259","267","268","269","278","279","289","456","457","458","459","467","468","469","478","479","489","567","568","569","578","579","589","678","679","689","789"];
        case "034": return ["034","035","036","037","038","039","045","046","047","048","049","056","057","058","059","067","068","069","078","079","089","345","346","347","348","349","356","357","358","359","367","368","369","378","379","389","456","457","458","459","467","468","469","478","479","489","567","568","569","578","579","589","678","679","689","789"];
        case "123": return ["123","124","125","127","128","129","134","135","137","138","139","145","147","148","149","157","158","159","178","179","189","234","235","237","238","239","245","247","248","249","257","258","259","278","279","289","345","347","348","349","357","358","359","378","379","389","457","458","459","478","479","489","578","579","589","789"];
    }
    return [];
}

function selectSpecial(type) {
    const labelMap = {
        "012n9": "ชุด 012 (ไม่มี 9)", "012": "ชุด 012", "012n49": "ชุด 012 (ไม่มี 4,9)",
        "013": "ชุด 013", "014": "ชุด 014", "023": "ชุด 023", "024": "ชุด 024",
        "034": "ชุด 034", "123": "ชุด 123"
    };
    
    const label = labelMap[type];
    inputBox.value = label;
    localStorage.setItem("winwai_numbers", label);
    closeSpecial();

    hideOtherBoxes();
    const cardSpecial = document.getElementById("card_special3");
    cardSpecial.classList.remove("hidden-box");
    cardSpecial.classList.add("expanded-box");

    document.getElementById("special_title").innerText = `💎 3 ตัวชุดพิเศษ: ${label}`;

    const special3 = getSpecialResult(type);
    document.getElementById("special3").innerHTML = `<div style="padding:10px; font-size:18px; line-height:2; font-weight:400; word-spacing:4px;">${special3.join(" ")}</div>`;
    document.querySelector(`[data-count="special3"]`).innerText = special3.length + " ชุด";
    
    document.getElementById("normal2").innerHTML = "";
    document.getElementById("double2").innerHTML = "";
    document.getElementById("normal3").innerHTML = "";
    document.getElementById("ham3").innerHTML = "";
    document.getElementById("all3").innerHTML = "";

    document.querySelectorAll("[data-count]").forEach(c => {
        if(c.getAttribute("data-count") !== "special3") c.innerText = "0 ชุด";
    });

    showToast(`โหลด ${label} สำเร็จ`);
}

// ===== WINNING LOGIC =====
function get2Normal(digits){
    const result = [];
    for(let i = 0; i < digits.length; i++){
        for(let j = i + 1; j < digits.length; j++){
            result.push(digits[i] + digits[j]);
        }
    }
    return result;
}

function get2Double(digits){
    const result = [...get2Normal(digits)];
    digits.forEach(n => { result.push(n + n); });
    return result;
}

// ค้นหา 3 ตัวตรงแบบไม่ซ้ำหลัก
function get3Normal(digits){
    const result = [];
    for(let i = 0; i < digits.length; i++){
        for(let j = i + 1; j < digits.length; j++){
            for(let k = j + 1; k < digits.length; k++){
                result.push(digits[i] + digits[j] + digits[k]);
            }
        }
    }
    return result;
}

// 3 ตัวรวมหาม (รวม 3 ตัวตรง + หาม)
function get3Ham(digits){
    const result = [];

    // 3 ตัวตรง
    if (digits.length >= 3) {
        result.push(...get3Normal(digits));
    }

    // หาม
    for(let i = 0; i < digits.length; i++){
        for(let j = i + 1; j < digits.length; j++){
            result.push(digits[i] + digits[i] + digits[j]); // AAB
            result.push(digits[i] + digits[j] + digits[j]); // ABB
        }
    }

    return [...new Set(result)].sort();
}

// 3 ตัวรวมตองรวมหาม
function get3All(digits){
    const result = [...get3Ham(digits)];

    // ตอง
    digits.forEach(n=>{
        result.push(n+n+n);
    });

    return [...new Set(result)].sort();
}

function buildSetHtml(labelName, itemsArray) {
    if(itemsArray.length === 0) return "";
    const rawText = itemsArray.join(" ");
    const encoded = encodeURIComponent(rawText);
    return `
        <div class="set-row-item">
            <div class="set-row-header">
                <span class="set-label">📌 ชุดเลข: ${labelName} <span class="set-count">(${itemsArray.length} ชุด)</span></span>
                <button class="btn-copy-mini" onclick="copySingleLine('${encoded}', '${labelName}')">คัดลอกชุดนี้</button>
            </div>
            <span class="set-numbers-box">${rawText}</span>
        </div>
    `;
}

// ===== CORE CALCULATE FUNCTION =====
function calculate(){
    let text = inputBox.value.trim();
    if(!text) return;

    showAllBoxes();
    const cardSpecial = document.getElementById("card_special3");
    cardSpecial.classList.remove("expanded-box");
    cardSpecial.classList.add("hidden-box");

    let lines = text.split("\n");

    let html_normal2 = ""; let count_normal2 = 0;
    let html_double2 = ""; let count_double2 = 0;
    let html_normal3 = ""; let count_normal3 = 0;
    let html_ham3 = "";    let count_ham3 = 0;
    let html_all3 = "";    let count_all3 = 0;

    lines.forEach(line => {
        let cleanLine = line.replace(/\D/g, "");
        if(!cleanLine) return; 

        let digits = unique(cleanLine.split("")); 
        if(digits.length < 2) return;

        let res_n2 = get2Normal(digits);
        let res_d2 = get2Double(digits);
        let res_n3 = digits.length >= 3 ? get3Normal(digits) : [];
        let res_h3 = get3Ham(digits);
        let res_a3 = get3All(digits);

        count_normal2 += res_n2.length;
        count_double2 += res_d2.length;
        count_normal3 += res_n3.length;
        count_ham3 += res_h3.length;
        count_all3 += res_a3.length;

        html_normal2 += buildSetHtml(cleanLine, res_n2);
        html_double2 += buildSetHtml(cleanLine, res_d2);
        html_normal3 += buildSetHtml(cleanLine, res_n3);
        html_ham3 += buildSetHtml(cleanLine, res_h3);
        html_all3 += buildSetHtml(cleanLine, res_a3);
    });

    document.getElementById("special3").innerHTML = "";
    document.querySelector(`[data-count="special3"]`).innerText = "0 ชุด";

    document.getElementById("normal2").innerHTML = html_normal2 || "<div style='padding:15px;color:#999;'>ไม่มีข้อมูล</div>";
    document.querySelector(`[data-count="normal2"]`).innerText = count_normal2 + " ชุด";

    document.getElementById("double2").innerHTML = html_double2 || "<div style='padding:15px;color:#999;'>ไม่มีข้อมูล</div>";
    document.querySelector(`[data-count="double2"]`).innerText = count_double2 + " ชุด";

    document.getElementById("normal3").innerHTML = html_normal3 || "<div style='padding:15px;color:#999;'>ไม่มีข้อมูล</div>";
    document.querySelector(`[data-count="normal3"]`).innerText = count_normal3 + " ชุด";

    document.getElementById("ham3").innerHTML = html_ham3 || "<div style='padding:15px;color:#999;'>ไม่มีข้อมูล</div>";
    document.querySelector(`[data-count="ham3"]`).innerText = count_ham3 + " ชุด";

    document.getElementById("all3").innerHTML = html_all3 || "<div style='padding:15px;color:#999;'>ไม่มีข้อมูล</div>";
    document.querySelector(`[data-count="all3"]`).innerText = count_all3 + " ชุด";
}
