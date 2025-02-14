document.addEventListener('DOMContentLoaded', function() {
  // Select all accordion items
  var acc = document.querySelectorAll('.accordion');

// Iterate to add event listeners
  acc.forEach(item => {
    item.addEventListener('click', function () {
      // When it's clicked, loop through all the items
      acc.forEach(el => {
        // Close any open items
        if (el.classList.contains('active')) {
          closeAcc(el);
          // If it's the one that was clicked and it's closed, open it
        } else if (el === item) {
          openAcc(el);
        }
      });
    });
  });

  function closeAcc (el) {
    el.classList.remove('active');
    el.nextElementSibling.style.maxHeight = null;
  };

  function openAcc (el) {
    el.classList.add('active');
    el.nextElementSibling.style.maxHeight = el.nextElementSibling.scrollHeight + 'px';
  }
});