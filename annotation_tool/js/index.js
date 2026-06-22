const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

var stringToColour = function (str) {
  var hash = cyrb53(str);
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

function onReviewButton(elem) {
    localStorage.setItem(elem.innerHTML + "clicked", true);

    window.location.href = "./review.php?id=" + elem.parentElement.parentElement.id;
}

function onButton(elem) {
    localStorage.setItem(elem.parentElement.parentElement.id + "clicked", true);
    localStorage.setItem("latest_click", elem.parentElement.parentElement.id);
    window.location.href = "./label.php?id=" + elem.parentElement.parentElement.id;

}

var skipped_cnt = [];
var annotated_cnt = [];

videos.forEach(function(element){
    if (localStorage.hasOwnProperty(element.user_video_index + "clicked")) {
      if (localStorage.hasOwnProperty(element.user_video_index)) {
        annotated_cnt.push(element.user_video_index);
        thingy = "✔ ";
        
      } else {
        skipped_cnt.push(element.user_video_index);
        thingy = "- ";
      } 
    } else {
      thingy = "❌ ";
    }
    $('#'+element.user_video_index+" .videostatus").text(thingy);
});

$("#annotate_cnt").text(annotated_cnt.length);
$("#skipped_cnt").text(skipped_cnt.length);

if (localStorage.hasOwnProperty("latest_click")) {
  if ($("[id='" + localStorage.getItem("latest_click") + "']").length > 0){
    $("[id='" + localStorage.getItem("latest_click") + "']")[0].scrollIntoView();
  }
  
}

$('.colorbar').each(function (i, colorbar) {

  colorbar.style['background-color'] = stringToColour('color'+String(Math.floor(parseInt(
    $(colorbar.parentElement).find('.number').text()
  )/10)));
});
