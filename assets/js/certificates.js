const CERTIFICATE_DIRECTORY = "assets/certificates";
const GITHUB_REPOSITORY = "datnndd/datnndd.github.io";

const certificateMetadata = [
  {
    file: "topik-3-korean.pdf",
    title: "TOPIK 3 Korean Certificate",
    language: "Tiếng Hàn",
    level: "TOPIK 3",
    issuer: "TOPIK",
    status: "available",
  },
  {
    file: "english-certificate.pdf",
    title: "English Certificate",
    language: "Tiếng Anh",
    level: "Updating",
    issuer: "Pending PDF",
    status: "pending",
  },
];

const certificateList = document.querySelector("#certificate-list");
const year = document.querySelector("#year");
year.textContent = new Date().getFullYear();

async function loadCertificates() {
  const discoveredFiles = await discoverPdfFiles();
  const certificates = mergeMetadata(discoveredFiles);
  renderCertificates(certificates);
}

async function discoverPdfFiles() {
  if (isLocalPreview()) {
    return certificateMetadata
      .filter((certificate) => certificate.status === "available")
      .map((certificate) => ({ file: certificate.file, url: `${CERTIFICATE_DIRECTORY}/${certificate.file}` }));
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPOSITORY}/contents/${CERTIFICATE_DIRECTORY}`;

  try {
    const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const items = await response.json();
    return items
      .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".pdf"))
      .map((item) => ({ file: item.name, url: `${CERTIFICATE_DIRECTORY}/${item.name}` }));
  } catch (error) {
    return certificateMetadata
      .filter((certificate) => certificate.status === "available")
      .map((certificate) => ({ file: certificate.file, url: `${CERTIFICATE_DIRECTORY}/${certificate.file}` }));
  }
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

function mergeMetadata(files) {
  const availableCertificates = files.map((fileInfo) => {
    const metadata = certificateMetadata.find((item) => item.file === fileInfo.file) || {};

    return {
      title: metadata.title || titleFromFileName(fileInfo.file),
      language: metadata.language || "Chứng chỉ",
      level: metadata.level || "PDF",
      issuer: metadata.issuer || "Uploaded certificate",
      file: fileInfo.file,
      url: fileInfo.url || `${CERTIFICATE_DIRECTORY}/${fileInfo.file}`,
      status: "available",
    };
  });

  const placeholders = certificateMetadata.filter(
    (certificate) => certificate.status === "pending" && !availableCertificates.some((item) => item.file === certificate.file),
  );

  return [...availableCertificates, ...placeholders];
}

function titleFromFileName(fileName) {
  return fileName
    .replace(/\.pdf$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function renderCertificates(certificates) {
  certificateList.innerHTML = "";

  if (!certificates.length) {
    certificateList.innerHTML = '<article class="card">Chưa có chứng chỉ. Thêm PDF vào assets/certificates.</article>';
    return;
  }

  for (const certificate of certificates) {
    const article = document.createElement("article");
    article.className = "card";

    if (certificate.status === "pending") {
      article.innerHTML = `
        <p class="card-kicker">${escapeHtml(certificate.language)}</p>
        <h3>${escapeHtml(certificate.title)}</h3>
        <p>${escapeHtml(certificate.issuer)}</p>
        <div class="certificate-meta">
          <span>${escapeHtml(certificate.level)}</span>
          <span>PDF sắp thêm</span>
        </div>
        <div class="hero-actions">
          <span class="button ghost" aria-disabled="true">Đang cập nhật</span>
        </div>
      `;
      certificateList.append(article);
      continue;
    }

    const viewerUrl = `certificate.html?file=${encodeURIComponent(certificate.file)}`;
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(certificate.language)}</p>
      <h3>${escapeHtml(certificate.title)}</h3>
      <p>${escapeHtml(certificate.issuer)}</p>
      <div class="certificate-meta">
        <span>${escapeHtml(certificate.level)}</span>
        <span>PDF</span>
      </div>
      <div class="hero-actions">
        <a class="button primary" href="${viewerUrl}" target="_blank" rel="noopener">Mở trang PDF</a>
        <a class="button ghost" href="${encodeURI(certificate.url)}" download>Tải xuống</a>
      </div>
    `;
    certificateList.append(article);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadCertificates();
