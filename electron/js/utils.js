// message center display
const MESSAGE_TIMEOUT = 5000;

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
