const copyUrlToClipboard = (button) => {
  //store the url in the button's id to access it.
  navigator.clipboard.writeText(button.id);
  button.innerText = "Copied!";
  button.classList.add('copiedBtn');
  setTimeout(()=>{
    button.innerText = "Copy URL";
    button.classList.remove('copiedBtn');
  }, 2000)
};
