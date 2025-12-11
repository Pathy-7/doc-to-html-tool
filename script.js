// ==========================
// 粘贴过滤器：阻止浏览器粘贴原格式
// ==========================
document.getElementById("inputEditor").addEventListener("paste", function (e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
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
        [...el.attributes].forEach(attr => {
            if (!["src"].includes(attr.name.toLowerCase())) {
                el.removeAttribute(attr.name);
            }
        });
        if (el.tagName === "SPAN") el.replaceWith(...el.childNodes);
    });

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
        const src = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";
        const newHTML = `
<p class="text-center amplify-wraper">
  <picture>
    <source type="image/webp" srcset="${src.replace(/\.\w+$/, ".webp")}">
    <img loading="lazy" src="${src}" alt="${alt}">
  </picture>
</p>
`;
        img.outerHTML = newHTML;
    });

    return div.innerHTML;
}

// ==========================
// H2/H3 转换 + 自动 ID
// ==========================
function convertH2H3(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    const h2s = div.querySelectorAll("h2");
    h2s.forEach((h2, i) => {
        h2.className = "line-h2";
        h2.id = "part" + (i + 1);
    });

    const h3s = div.querySelectorAll("h3");
    h3s.forEach(h3 => {
        const prevH2 = h3.previousElementSibling ? [...h3.previousElementSibling.parentNode.children].reverse().find(el => el.tagName === "H2") : null;
        if (!prevH2) return;

        const h2Index = parseInt(prevH2.id.replace("part", ""), 10);
        const siblingsH3 = [...prevH2.parentNode.querySelectorAll("h3")].filter(e => e.compareDocumentPosition(h3) & Node.DOCUMENT_POSITION_FOLLOWING);
        const h3Index = siblingsH3.length + 1;

        h3.className = "star-title";
        h3.id = `${h2Index}.${h3Index}`;
        h3.innerHTML = `<span>${h3Index}</span>${h3.textContent}`;
    });

    return div.innerHTML;
}

// ==========================
// TOC 生成（放在第一个 H2 前面）
// ==========================
function generateTOC(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    const tocDiv = document.createElement("div");
    tocDiv.className = "collapse active";
    tocDiv.innerHTML = `
<h4 class="collapse-title">Table of Contents</h4>
<div class="collapse-content" style="display:block;"></div>
`;

    const tocContent = tocDiv.querySelector(".collapse-content");
    const h2s = div.querySelectorAll("h2");

    h2s.forEach((h2, i) => {
        tocContent.innerHTML += `<p class="collapse-p"><b>Part ${i+1}:</b><a href="#${h2.id}"> ${h2.textContent}</a></p>`;
    });

    const firstH2 = div.querySelector("h2");
    if (firstH2) firstH2.before(tocDiv);

    return div.innerHTML;
}
