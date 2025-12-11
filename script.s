document.getElementById("convertBtn").addEventListener("click", () => {
    const input = document.getElementById("inputEditor").innerHTML;

    let cleaned = cleanHTML(input);

    // Step 自动识别
    cleaned = convertSteps(cleaned);

    // Word 列表修复（方案 A）
    cleaned = fixWordLists(cleaned);

    document.getElementById("outputEditor").textContent = cleaned;
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const output = document.getElementById("outputEditor").textContent;
    navigator.clipboard.writeText(output).then(() => {
        alert("Copied!");
    });
});


// =========================
// 核心：基础 HTML 清理
// =========================
function cleanHTML(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    // 移除 Word/GDoc 垃圾属性
    div.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            if (
                name.startsWith("style") ||
                name.startsWith("class") ||
                name.startsWith("align") ||
                name.startsWith("width") ||
                name.startsWith("height") ||
                name.startsWith("cellpadding") ||
                name.startsWith("cellspacing") ||
                name.startsWith("border")
            ) {
                el.removeAttribute(attr.name);
            }
        });
    });

    // 保留的标签
    const allowedTags = ["P", "B", "STRONG", "UL", "LI", "H2", "H3", "IMG"];
    div.querySelectorAll("*").forEach(el => {
        if (!allowedTags.includes(el.tagName)) {
            if (el.tagName === "SPAN") {
                el.replaceWith(...el.childNodes);
            } else {
                el.replaceWith(...el.childNodes);
            }
        }
    });

    // 清理注释，包括 Word 的条件注释
    div.innerHTML = div.innerHTML.replace(/<!--[\s\S]*?-->/g, "");

    return div.innerHTML;
}



// =========================
// Step 自动识别
// =========================
function convertSteps(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("p").forEach(p => {
        let text = p.textContent.trim();

        const match = text.match(/^Step\s+(\d+):\s*(.*)/i);
        if (match) {
            let num = match[1];
            let content = match[2];

            p.className = "step";
            p.innerHTML = `<b><span>Step ${num}.</span></b> ${content}`;
        }
    });

    return div.innerHTML;
}



// =========================
// ★ 新增：Word 列表修复模块（方案 A）
// =========================
function fixWordLists(html) {
    let div = document.createElement("div");
    div.innerHTML = html;

    let paragraphs = [...div.querySelectorAll("p")];
    let listBuffer = [];
    let fixedHTML = "";

    function flushList() {
        if (listBuffer.length > 0) {
            fixedHTML += `<ul class="no_disc has_disc list-paddingleft-2">`;
            listBuffer.forEach(item => {
                fixedHTML += `<li>${item}</li>`;
            });
            fixedHTML += `</ul>`;
            listBuffer = [];
        }
    }

    paragraphs.forEach(p => {
        let raw = p.innerHTML.trim();

        // 如果含有 Word 的列表痕迹（l + nbsp 结构）
        let isWordList = raw.match(/^l(&nbsp;|\s)+/i);

        if (isWordList) {
            let clean = raw.replace(/^l(&nbsp;|\s)+/i, "").trim();
            listBuffer.push(clean);
        } else {
            // 遇到非列表段 → 把之前的列表输出
            flushList();
            fixedHTML += `<p>${raw}</p>`;
        }
    });

    // 文档末尾如有列表 → 输出
    flushList();

    return fixedHTML;
}
