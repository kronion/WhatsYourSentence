function flash(element) {
  element.show(function() {
    $(this).fadeTo(500, 1);
  });
  setTimeout(function() {
    element.fadeTo(500, 0, function() {
      $(this).hide();
    });
  }, 5000);
}

$('#updateSentence').submit(function(e) {
  e.preventDefault();
  var $form = $(this),
      sentence = $form.find('input[name="sentence"]').val(),
      url = $form.attr('action');
  $('#sentence').text(sentence);
  $.post(url, { sentence: sentence })
    .done(function() {
      flash($('#success'));
    })
    .fail(function() {
      flash($('#failure'));
    });
});
