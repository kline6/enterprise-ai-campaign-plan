const dialog = document.querySelector("#consultation-dialog");
const openButtons = document.querySelectorAll("[data-open-consultation]");
const closeButtons = document.querySelectorAll("[data-close-consultation]");
const form = document.querySelector("#consultation-form");
const summaryPanel = document.querySelector("#summary-panel");
const summaryField = document.querySelector("#consultation-summary");
const copyButton = document.querySelector("#copy-summary");
const copyStatus = document.querySelector("#copy-status");
let returnFocusTarget = null;

const openDialog = (button) => {
  if (!(dialog instanceof HTMLDialogElement)) return;
  returnFocusTarget = button;
  dialog.showModal();
  dialog.querySelector("input")?.focus();
};

const closeDialog = () => {
  if (!(dialog instanceof HTMLDialogElement)) return;
  dialog.close();
  returnFocusTarget?.focus();
};

openButtons.forEach((button) => {
  button.addEventListener("click", () => openDialog(button));
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeDialog);
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const summary = [
    "企业AI诊断需求",
    `企业：${data.get("company")}`,
    `联系人：${data.get("contact")}`,
    `企业人数：${data.get("size")}`,
    `优先方向：${data.get("area")}`,
    `具体问题：${data.get("problem")}`,
  ].join("\n");

  summaryField.value = summary;
  form.hidden = true;
  summaryPanel.hidden = false;
  copyStatus.textContent = "";
  summaryField.focus();
});

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(summaryField.value);
    copyStatus.textContent = "摘要已复制，请发送给您的对接顾问。";
  } catch {
    summaryField.select();
    copyStatus.textContent = "请手动复制已选中的摘要。";
  }
});

dialog?.addEventListener("close", () => {
  form.hidden = false;
  summaryPanel.hidden = true;
  copyStatus.textContent = "";
});
