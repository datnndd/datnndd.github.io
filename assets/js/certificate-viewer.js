const CERTIFICATE_DIRECTORY = "assets/certificates";
const certificates = {
  "topik-3-korean.pdf": {
    title: "TOPIK 3 Korean Certificate",
    language: "Tiếng Hàn",
  },
  "english-certificate.pdf": {
    title: "English Certificate",
    language: "Tiếng Anh",
  },
};

const params = new URLSearchParams(window.location.search);
const file = params.get("file") || "topik-3-korean.pdf";
const safeFilePattern = /^[a-z0-9][a-z0-9._-]*\.pdf$/i;
const title = document.querySelector("#viewer-title");
const status = document.querySelector("#viewer-status");
const frame = document.querySelector("#pdf-frame");
const downloadLink = document.querySelector("#download-link");

if (!safeFilePattern.test(file)) {
  title.textContent = "Không thể mở chứng chỉ";
  status.textContent = "Tên file không hợp lệ.";
  frame.hidden = true;
} else {
  const certificate = certificates[file] || { title: file.replace(/\.pdf$/i, ""), language: "Chứng chỉ" };
  const pdfUrl = `${CERTIFICATE_DIRECTORY}/${file}`;

  document.title = `${certificate.title} | Nguyễn Doãn Đạt`;
  title.textContent = certificate.title;
  status.textContent = `${certificate.language} · PDF hiển thị toàn trang. Nếu trình duyệt không mở được, dùng nút tải PDF.`;
  frame.src = pdfUrl;
  downloadLink.href = pdfUrl;
  downloadLink.download = file;
}
