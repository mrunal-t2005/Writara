/**
 * Multi-Format Document Exporter for Writara
 * Supports Markdown, Plain Text, HTML, DOCX (Word XML), and Print-to-PDF.
 */

export function downloadMarkdown(content: string, filename: string = 'document.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
}

export function downloadPlainText(content: string, filename: string = 'document.txt') {
  // Strip markdown formatting for pure plain text
  const plain = content
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`);
}

export function downloadHtml(title: string, content: string, filename: string = 'document.html') {
  const htmlBody = markdownToSimpleHtml(content);
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.7;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 24px;
    }
    h1, h2, h3 { color: #0f172a; font-weight: 700; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
    h2 { font-size: 1.5em; margin-top: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    h3 { font-size: 1.2em; margin-top: 24px; }
    blockquote {
      border-left: 4px solid #8b5cf6;
      margin: 20px 0;
      padding: 12px 20px;
      background: #f8fafc;
      color: #475569;
      font-style: italic;
    }
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: monospace;
    }
    ul, ol { padding-left: 24px; margin: 16px 0; }
    li { margin-bottom: 8px; }
    .brand-footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { margin: 20mm; max-width: none; color: #000; }
      .brand-footer { color: #555; }
    }
  </style>
</head>
<body>
  ${htmlBody}
  <div class="brand-footer">
    Generated with <strong>Writara</strong> — AI-Powered Content Operating System
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.html') ? filename : `${filename}.html`);
}

export function downloadDocx(title: string, content: string, filename: string = 'document.doc') {
  // Microsoft Word HTML format (officially recognized and opens flawlessly in Word/LibreOffice)
  const body = markdownToSimpleHtml(content);
  const docxContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.5; color: #222; }
    h1 { font-size: 20pt; color: #1e1b4b; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 15pt; color: #312e81; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; }
    h3 { font-size: 12pt; color: #4338ca; font-weight: bold; margin-top: 12pt; }
    p { margin-bottom: 8pt; }
    blockquote { border-left: 3pt solid #6366f1; padding-left: 10pt; color: #555; font-style: italic; }
    ul { margin-bottom: 8pt; }
    li { margin-bottom: 4pt; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;

  const blob = new Blob(['\ufeff' + docxContent], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.doc') || filename.endsWith('.docx') ? filename : `${filename}.doc`);
}

export function printDocument(title: string, content: string) {
  const htmlBody = markdownToSimpleHtml(content);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print this document.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${escapeXml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #111; padding: 40px; }
    h1 { font-size: 24pt; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { font-size: 16pt; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    h3 { font-size: 13pt; margin-top: 20px; }
    p { margin-bottom: 12px; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 15px; margin: 15px 0; color: #444; font-style: italic; }
    ul, ol { padding-left: 20px; }
    li { margin-bottom: 6px; }
    .footer { margin-top: 50px; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; }
  </style>
</head>
<body>
  ${htmlBody}
  <div class="footer">
    Exported via Writara AI Content Platform • ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function markdownToSimpleHtml(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('> ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
    } else if (line.startsWith('* ') || line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      const itemText = line.replace(/^([*-]|\d+\.)\s+/, '');
      htmlLines.push(`<li>${formatInline(itemText)}</li>`);
    } else if (line === '---' || line === '***') {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push('<hr />');
    } else {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) {
    htmlLines.push('</ul>');
  }

  return htmlLines.join('\n');
}

function formatInline(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}
