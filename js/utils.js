// message center display
const MESSAGE_TIMEOUT = 5000;
let displayTimer = null;

function displayMessage(target, message, displayTime) {
  const messageCenter = document.getElementById(target);
  messageCenter.innerHTML = message;
  messageCenter.classList.remove("hidden");

  // check if timer is already active to ensure message displays for full timeout
  if (displayTimer != null) {
    clearTimeout(displayTimer);
    displayTimer = null;
  } 
  
  displayTimer = setTimeout(function () {
      messageCenter.classList.add("hidden");
    }, displayTime ? displayTime : MESSAGE_TIMEOUT);
}

function adjustTextBoxHeight(textElement) {
  const minHeight = textElement.scrollHeight;
  const outerHeight = parseInt(window.getComputedStyle(textElement).height, 10);
  const heightDiff = outerHeight - minHeight;

  textElement.style.height = 0;
  textElement.style.height = Math.max(minHeight, textElement.scrollHeight + heightDiff) + 'px';

}