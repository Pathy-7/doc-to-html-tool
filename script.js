// ==========================
// 粘贴过滤器：阻止浏览器粘贴原格式
// ==========================
document.getElementById("inputEditor").addEventListener("paste", function (e) {
    e.preventDefault();

    // 获取纯文本（不带 Word 样式）
    const text = e.clipboardData.getData("text/plain");

    // 把换行转换成 <p>
    const html = text
        .split(/\n+/)
        .map(line => line.trim() ? `<p>${line}</p>` : "")
        .join("");

    document.execCommand("insertHTML", false, html);
});

// ==========================
// 按钮事件绑定
// ==========================
document.getElementById("convertBtn").addEventListener("click", () => {
    let input = document.getElementById("inputEditor").innerHTML;

    let cleaned = cleanHTML(input);
    cleaned = convertSteps(cleaned);
    cleaned = convertSimpleLists(cleaned);
    cleaned = convertImages(cleaned);
    cleaned = convertH2H3(cleaned);
    cleaned = generateTOC(cleaned);

    document.getElementById("outputEditor").textContent = cleaned;
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const output = document.getElementById("outputEditor").textContent;
    navigator.clipboard.writeText(output);
    alert("Copied!");
});

// ==========================
// 基础净化：移除 Word 样式 + span + 注释
// ==========================
function cleanHTML(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("*").forEach(el => {
        // 删除 Word / GDoc 样式
        [...el.attributes].forEach(attr => {
            if (!["src"].includes(attr.name.toLowerCase())) {
                el.removeAttribute(attr.name);
            }
        });

        // 清除 span
        if (el.tagName === "SPAN") el.replaceWith(...el.childNodes);
    });

    // 删除 Word 注释
    div.innerHTML = div.innerHTML.replace(/<!--[\s\S]*?-->/g, "");

    return div.innerHTML;
}

// ==========================
// Step N 段落转换
// ==========================
function convertSteps(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    const paragraphs = div.querySelectorAll("p");
    const stepRegex = /^Step\s+(\d+)\s*:\s*(.*)$/i;

    paragraphs.forEach(p => {
        const text = p.innerText.trim();
        const match = text.match(stepRegex);
        if (!match) return;

        const stepNumber = match[1];
        const restText = match[2];

        const newHTML =
            `<p class="step"><b><span>Step ${stepNumber}.</span></b> ${restText}</p>`;

        p.outerHTML = newHTML;
    });

    return div.innerHTML;
}

// ==========================
// 序号列表转换
// ==========================
function convertSimpleLists(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    let paragraphs = [...div.querySelectorAll("p")];
    let list = [];
    let finalHTML = "";

    const flush = () => {
        if (list.length === 0) return;
        finalHTML += `<ul class="no_disc has_disc list-paddingleft-2">`;
        list.forEach(item => finalHTML += `<li>${item}</li>`);
        finalHTML += `</ul>`;
        list = [];
    };

    paragraphs.forEach(p => {
        let t = p.textContent.trim();

        // 检测 “- xxx” 或 “• xxx”
        if (/^[-•]\s+/.test(t)) {
            list.push(t.replace(/^[-•]\s+/, ""));
        } else {
            flush();
            finalHTML += `<p>${t}</p>`;
        }
    });

    flush();
    return finalHTML;
}

// ==========================
// 图片占位转换
// ==========================
function convertImages(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("img").forEach(img => {
        // 用你提供的占位结构替换，src/alt 保留
        const src = i
