const copyUrlToClipboard = (button) => {
  navigator.clipboard.writeText(button.id);
  button.innerText = "copied";
};
