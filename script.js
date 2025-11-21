// ------------------------ 获取元素 ------------------------
const inputEditor = document.getElementById("inputEditor"); // 左侧富文本 div
const outputHtml = document.getElementById("outputHtml");   // 右侧 textarea
const convertBtn = document.getElementById("convertBtn");   // 转换按钮
const copyBtn = document.getElementById("copyBtn");         // 复制按钮

// ------------------------ 点击 Convert ------------------------
convertBtn.addEventListener("click", () => {
    const htmlContent = inputEditor.innerHTML;
    if (!htmlContent.trim()) return alert("Please paste Word content first!");

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // ---------- 1. 清理 Word 粘贴样式 ----------
    cleanWordHTML(doc);

    // ---------- 2. H2/H3 自动编号和样式 ----------
    processH2H3(doc);

    // ---------- 3. 图片占位符替换 ----------
    replaceImages(doc);

    // ---------- 4. 生成目录 TOC ----------
    buildAndInsertTOC(doc);

    // 输出最终干净 HTML
    outputHtml.value = doc.body.innerHTML;
});

// ------------------------ 点击 Copy ------------------------
copyBtn.addEventListener("click", () => {
    outputHtml.select();
    document.execCommand("copy");
    alert("HTML copied to clipboard!");
});

// ------------------------ 清理 Word HTML ------------------------
function cleanWordHTML(doc) {
    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach(el => {
        const tag = el.tagName.toLowerCase();
        if (["h2", "h3", "p", "img"].includes(tag)) {
            el.removeAttribute("class");
            el.removeAttribute("style");
        } else {
            // 非白名单标签 → 保留文本内容
            const text = el.textContent;
            const parent = el.parentNode;
            const textNode = document.createTextNode(text);
            parent.replaceChild(textNode, el);
        }
    });
}

// ------------------------ H2/H3 处理 ------------------------
function processH2H3(doc) {
    const h2s = doc.querySelectorAll("h2");
    h2s.forEach((h2, h2Index) => {
        h2.className = "line-h2";
        h2.id = `part${h2Index + 1}`;

        let h3Index = 1;
        let next = h2.nextElementSibling;
        while (next && next.tagName.toLowerCase() !== "h2") {
            if (next.tagName.toLowerCase() === "h3") {
                next.className = "star-title";
                next.id = `${h2Index + 1}.${h3Index}`;

                const span = doc.createElement("span");
                span.textContent = h3Index;
                const text = next.textContent;
                next.textContent = "";
                next.appendChild(span);
                next.appendChild(document.createTextNode(" " + text));

                h3Index++;
            }
            next = next.nextElementSibling;
        }
    });
}

// ------------------------ 图片替换 ------------------------
function replaceImages(doc) {
    const imgs = doc.querySelectorAll("img");
    imgs.forEach(img => {
        const alt = img.alt || "";
        const wrapper = doc.createElement("p");
        wrapper.className = "text-center amplify-wraper";

        const picture = doc.createElement("picture");
        co
