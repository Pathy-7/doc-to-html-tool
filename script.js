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
// 绑定按钮事件
// ==========================
document.getElementById("convertBtn").addEventListener("click", () => {
    let input = document.getElementById("inputEditor").innerHTML;

    let cleaned = cleanHTML(input);
    cleaned = convertSteps(cleaned);

    // Word 粘贴过滤器已清除垃圾列表格式 → 此处转换简单可靠
    cleaned = convertSimpleLists(cleaned);

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
// Step N: 自动识别
// ==========================
function convertSteps(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("p").forEach(p => {
        let text = p.textContent.trim();
        let m = text.match(/^Step\s+(\d+):\s*(.*)/i);

        if (m) {
            p.className = "step";
            p.innerHTML = `<b><span>Step ${m[1]}.</span></b> ${m[2]}`;
        }
    });

    return div.innerHTML;
}


// ==========================
// 简单列表转换（因为粘贴过滤器保证非常干净）
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
