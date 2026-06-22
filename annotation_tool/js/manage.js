function generateRandom(){
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 16; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
     }
  
  $('#password').val(result);
  M.updateTextFields();
}

function leftselect(elem){
  $(".user_btn").removeClass('teal');
  load(elem.id);
}

function load(id){

  $(`#${id}.user_btn`).addClass('teal');

  $('.overview').css('display', 'none');
  current_annotator = id;
  $('#password').val("");
  M.updateTextFields();

  $('input#changeId').val(id);
  
  getnote();
  getassignment();
  $('#manage_individual').css('display', 'block');
}

function ChangeId(){
  let newid = $('input#changeId').val();

  if (newid.length == 0){
    alert('ID should not be empty');
  } else if (! /^[a-zA-Z0-9]+$/.test(newid)){
    alert('ID should be alphanumeric');

  }
  else {
    $.post("id_change.php",
         {
            id: current_annotator,
            newid: newid
          },
         function(data, status){
             if (status == "success"){

               if (data == '1'){
                alert("ID Changed");
               } else {
                alert(data);
               }
             } else{
               alert("Data: " + data + "\nStatus: " + status);
             }
         });
  }

}

function passwordSave(){
  password = $('#password').val();
  
  if (password.length == 0){
    $('.helper-textid').text('Password cannot be empty');
  } else {
     $.post("password_change.php",
          {
             id: current_annotator,
             password: password
           },
          function(data, status){
              if (status == "success"){
                alert("Password Changed");
              } else{
                alert("Data: " + data + "\nStatus: " + status);
              }
          });
  }
}

function newaccount(){
    $.post("account_add.php",
  {},
  function(data, status){
      if (status == "success"){
        document.location.reload()
      } else{
        alert("Data: " + data + "\nStatus: " + status);
      }
  });
}

function deleteaccount(){
      if (confirm('Are you sure you want to delete account '+current_annotator+'?')) {
        $.post(
          "account_remove.php",
          {id:current_annotator},
          function(data, status){
            // alert("Data: " + data + "\nStatus: " + status);
            if (status == "success"){
              document.location.reload();
            } else{
              alert("Data: " + data + "\nStatus: " + status);
            }
          }
        );
    }
}

function getnote(){
    $.post(
      "note_get.php",
      {id:current_annotator},
      function(data, status){
        if (status == "success"){
          $('#textarea1').val(data);
          M.updateTextFields();
          M.textareaAutoResize($('#textarea1'));
        } else{
          alert("Data: " + data + "\nStatus: " + status);
        }
      }
    );
}

function updatenote() {
    $.post(
      "note_add.php",
      {id:current_annotator,
      note: $('textarea').val()
      },
      function(data, status){
        if (status == "success"){
          alert('updated!');
        } else{
          alert("Data: " + data + "\nStatus: " + status);
        }
      }
    );
}

var assignment_data;

function getassignment() {
    $.post(
      "assignment_get.php",
      {id:current_annotator
      },
      function(data, status){
        if (status == "success"){

          $("#manage_individual_partial select").val('');


          assignment_data = JSON.parse(data);

          let assignment_dict = Object();

          for (let item of assignment_data.assignment){
            assignment_dict[item.name] = item.label_group_idx;
          }
          assignment_data.assignment = assignment_dict;

          manage_individual("partial");
          manage_individual("original");
                       
          
        } else{
          alert("Data: " + data + "\nStatus: " + status);
        }
      }
    );
}

function save_assignment() {
  assigned = [];

  for (let videoid in assignment_data.assignment){
    if (assignment_data.assignment[videoid] != ''){
        assigned.push({"video_id": videoid_to_index[videoid], 
        'label_index': parseInt(assignment_data.assignment[videoid])});
    }
  }

  $.post(
    "assignment_change.php",
    {setting:'remove',
    data:[{id:userid_to_index[current_annotator],
     assign_query: assigned}]
    },
    function(data, status){
      alert(data);
    }
  );
}

function overview(){
  $(".user_btn").removeClass('teal');
  
  
  $('.overview').css('display', 'none');
  $('#manage_video').css('display', 'block');
}

function show_bulkupload(){
  $('.alertbackground')[0].style.visibility = "visible";
  $('.alertinner')[0].style.display = "none";
  $('#alertmain')[0].style.display = "block";
}

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
      return;
  }
  var reader = new FileReader();
  
  reader.fileName = file.name;
  reader.onload = function (e) {
      parsefile(e.target.result, e.target.fileName);
  };
  reader.readAsText(file);
}

function isASCII(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

function isAlphaNumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

function parsefile(contents, fileName) {

  if (isASCII(contents)){
    let lines = contents.split(/\n/);
    let final = {};
    final['videos'] = [];
    for (let line of lines){
      try{
        line = line.trim();
  
        if (line.length == 0){
          continue;
        }
  
        let elems = line.split(",");
  
        if (elems.length != 3 && elems.length != 4) {
          alert('Format is wrong: '+line)
          return
        }
        if (isNaN(elems[1].trim()) || isNaN(elems[2].trim())){
          alert('Not a number found for seconds: '+line);
          return
        }
  
        let vid = elems[0];
        let start = parseInt(elems[1].trim());
        let end = parseInt(elems[2].trim());

  
        let newid = "";
        if (elems.length == 3){
          newid = `${vid}_${start}_${end}`;
        } else {
          newid = elems[3].trim();
        }
  
        final['videos'].push({
          vid: vid,
          start: start,
          end: end,
          newid: newid
        });

      } catch(e) {

        alert(e);
        return;

      }
    }


    $('.alertinner')[0].style.display = "none";

    $('#alertsub div').empty();
    $('#alertsub div').append(`<p> Adding ${final['videos'].length} videos.</p>`);
    for (let line of final['videos']){
      $('#alertsub div').append(`<p>${line['vid']}, ${line['start']}, ${line['end']}, ${line['newid']}</p>`);
    }
    $('#alertsub')[0].style.display = "block";

    window.partialvideoupload = final;

  } else {
    alert('The files are not in ASCII, Seems like not text file...?');
  }
}

function submitpartialvideos(){
  $('.loading').removeClass('hidden');
  $.ajax({
    type: "POST",
    url: 'partial_add.php',
    data: window.partialvideoupload,
    success: function(data){
      alert(data );
      $('.loading').addClass('hidden');
      $('.alertbackground')[0].style.visibility = "hidden";
      window.location.reload();
    },
  });
}

function remove_partial_video(index){
  $('.loading').removeClass('hidden');
  $.ajax({
    type: "POST",
    url: 'partial_remove.php',
    data: {index: index},
    success: function(data){
      alert( data );
      $('.loading').addClass('hidden');
      $('.alertbackground')[0].style.visibility = "hidden";
      window.location.reload();
    },
  });
};

function manage_labels(){
  $(".user_btn").removeClass('teal');
  $('.overview').css('display', 'none');
  $('#manage_label').css('display', 'block');
};

function previewlabel(){

  let labels = [];
  let index_cnt = 0;
  let error = "";
  let entities = [];
  let current_entity = null;
  let start_of_entity = true;

  let text = $('#labeltextarea').val();

  for (let raw of text.split("\n")){
    let line = raw.trim();

    if (line.length == 0)
      continue;

    // "# Entity Name" starts a new entity section
    if (line[0] == '#'){
      current_entity = line.slice(1).trim();
      start_of_entity = true;

      if (current_entity.length == 0){
        error += "Empty entity name in header line.\n";
      } else if (entities.includes(current_entity)){
        error += "Duplicate entity: " + current_entity + "\n";
      } else {
        entities.push(current_entity);
      }
      continue;
    }

    if (current_entity == null){
      error += "Label line before any '# entity' header: " + line + "\n";
      continue;
    }

    let line_split = line.split(",");

    if (line_split.length < 2 || line_split.length > 4){
      error += "Invalid number of commas: " + line + "\n";
      continue;
    }

    let label = {
      'under': -1,
      'name': '',
      'description': '',
      'index': index_cnt,
      'order': index_cnt,
      'entity': current_entity,
      'skip': false,
      'explicit': false
    }

    if (line_split[0].slice(0,2) == "--"){
      if (start_of_entity)
        error += 'First label of an entity cannot start with --: ' + line + "\n";

      label['under'] = index_cnt - 1;
      label['name'] = line_split[0].slice(2).trim();
    } else {
      label['name'] = line_split[0].trim();
    }

    label['description'] = line_split[1].trim();
    label['skip'] = (line_split.length > 2 ? line_split[2].trim() == '1' : false);
    label['explicit'] = (line_split.length > 3 ? line_split[3].trim() == '1' : false);

    labels.push(label);

    index_cnt += 1;
    start_of_entity = false;
  }

  if (labels.length == 0)
    error += 'No labels found.';

  if (error.length != 0){
    alert(error);
    return;
  }

  // show the preview dialog and build one tab per entity
  $('.alertinner').css('display', 'none');
  $('#alertlabelpreview').css('display', 'block');
  $('.alertbackground').css('visibility', 'visible');

  let $tabs = $('#preview_tabs').empty();
  let $content = $('#preview_tab_content').empty();
  let colw = Math.max(1, Math.floor(12 / entities.length));

  entities.forEach(function(entity, i){
    let tabid = 'previewtab' + i;
    $tabs.append(
      `<li class="tab col s${colw}"><a class="${i == 0 ? 'active' : ''}" style="padding:0;" href="#${tabid}">${entity}</a></li>`
    );
    $content.append(
      `<div id="${tabid}" class="col s12 labelcontainer"><span style='margin: 5px 0 5px 0;'>${entity}</span><form action="#"></form></div>`
    );
  });

  for (let label of labels){
    let i = entities.indexOf(label.entity);
    let checkbox =
      `
        <p>
        <label >
            ${label['under'] != -1 ? '└─' : ''}<input type='checkbox' class="reset-checkbox"
                id='${label['index']}'
                onclick='checkboxcycle(this, ${label['explicit']})'
                ${label['skip'] ? 'disabled="disabled"' : ''}/>
            <span title="${label['description']}">${label['name']}</span>
        </label>
      </p>
      `;
    $('#previewtab' + i + ' form').append(checkbox);
  }

  M.Tabs.init($('#preview_tabs')[0], {duration: 0});

  window.newlabels = labels;
}

function submitlabels(){
  
  if ($("input#labelgroupname").val().length==0){
    alert('Label Group name is empty!');
  } else if (!isASCII($("input#labelgroupname").val())){
    alert('Use ASCII Name')
  } else if ($("input#labelgroupname").val().includes(",")){
    alert('title should not have comma');
  } 
  else {
    $.ajax({
      type: "POST",
      url: 'label_add.php',
      data: {'data': window.newlabels, 'name': $("input#labelgroupname").val().trim()},
      success: function(data){
        alert(data);
        window.location.reload();
      },
    });
  }
  
}

function checkboxcycle(elem, explicit) {
  if (elem.disabled)
    return;
  if (elem.state == undefined) {
    elem.state = 0;
  }
  if (explicit){
    elem.state = (elem.state + 1) % 2;
  } else {
    elem.state = (elem.state + 1) % 3;
  }

  if (elem.state == 0) {
    elem.checked = false;
    elem.indeterminate = false;
  } else if (elem.state == 1) {
    elem.checked = true;
    elem.indeterminate = false;
  } else if (elem.state == 2) {
    elem.checked = false;
    elem.indeterminate = true;
  }

}

function togglelabel(elem){
  $(elem).children(".inner").toggleClass('hidden');
}

function remove_label_group(group_index){
  $('.loading').removeClass('hidden');
  $.ajax({
    type: "POST",
    url: 'label_remove.php',
    data: {group_index: group_index},
    success: function(data){
      alert( data );
      $('.loading').addClass('hidden');
      window.location.reload();
    },
  });

}

function save_assignment_bulk(){
  $('.alertbackground')[0].style.visibility = "visible";
  $('.alertinner')[0].style.display = "none";
  $('#alertassignment')[0].style.display = "block";
}


function save_bulk_assignment_template(){
  let templatetext = '';

  for (let video of videos){
    templatetext += `${users[0].id},${video.name},${label_groups[0].group_index}\n`;
  }

  var blob = new Blob([templatetext], {
    type: "text/plain;charset=utf-8"
  });

  saveAs(blob, "template.txt");
}

function save_current_annotation(){
  $.post(
    "assignment_get_all.php",
    {},
    function(data, status){
      data = JSON.parse(data);
      
      let templatetext = "";
      for (let datum of data){
        templatetext += `${datum.id},${datum.name},${datum.label_group_idx}\n`;
      }
      var blob = new Blob([templatetext], {
        type: "text/plain;charset=utf-8"
      });
    
      saveAs(blob, "backup.txt");
    }
  );

}

function manage_partial(){

  // pagination of manage_video_partial_select (Manage Videos -> Partial tab)
  var page = parseInt($('#manage_video_partial_select').val());
  
  $('div#manage_video_partial').empty();

  for (let i = page*100; i < page*100+100 && i < videos_partial.length; i++){
    let value = videos_partial[i];
    $('div#manage_video_partial').append(
      `<div class="row videocheckbox" id="${value['name']}">
      <span>${value['index']}. ${value['name']} (${value['original_name']}_${value['start_time']}_${value['end_time']}) (${value['second']} seconds long)</span>
      <a href="./video_play.php?videoId=${value['name']}" target="_blank">Play</a>
    </div>`
    );
  }
}

function manage_original(){

  // look manage_partial
  var page = parseInt($('#manage_video_original_select').val());
  
  $('div#manage_video_original').empty();

  for (let i = page*100; i < page*100+100 && i < videos_original.length; i++){
    let value = videos_original[i];
    $('div#manage_video_original').append(
      `<div class="row videocheckbox" id="${value['name']}">
      <span>${value['index']}. ${value['name']} (${value['second']} seconds long)</span>
      <a href="./video_play.php?videoId=${value['name']}" target="_blank">Play</a>
    </div>`
    );
  }
}

function manage_individual(tab){
  var page = parseInt($(`#manage_individual_${tab}_select`).val());
  $(`div#manage_individual_${tab}`).empty();

  let options = "";

  for (let label of label_groups){
    options = options +  `<option value="${label['group_index']}">${label['name']}</option>`
  }

  let whichvideo = tab == 'original' ? videos_original : videos_partial;

  for (let i = page*100; i < page*100+100 && i < whichvideo.length; i++){
    let value = whichvideo[i];
    $(`div#manage_individual_${tab}`).append(
      `
      <div class="row videocheckbox" id="${value['name']}">
        <div class="">
            <select class='col s1' style='width:100px;display:block;height:1.5rem;' onchange="assignment_data.assignment[this.parentElement.parentElement.id] = this.value ;">
              <option value="" selected>--</option>
              ${options}
            </select>
            <span>${value['name']} (${value['second']} seconds long)</span>
            <a href="./video_play.php?videoId=${value['name']}" target="_blank">Play</a>
        </div>
      </div>
      `
    );
  }

  let data = assignment_data;

  for (let name in data.assignment){
    $(`#manage_individual [id='${name}'] select`).val(data.assignment[name]);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.sidenav');
  var options = {"inDuration": 0, 
                 "outDuration":0,
                 'preventScrolling': false
                };
  
  var instances = M.Sidenav.init(elems, options);
});

$(document).ready(function(){
  $('.fixed-action-btn').floatingActionButton();
});

$(document).ready(function(){
  $('.tabs:not(#preview_tabs)').tabs();
});

$('.alertbackground')[0].addEventListener("click", function (e) {
  if (e.target == e.currentTarget) {
    $('.alertbackground')[0].style.visibility = "hidden";
  }

  



});

var current_annotator = "";

document.getElementById('upload-partial-input')
    .addEventListener('change', readSingleFile, false);

    


function readSingleFileAssignmnet(e, setting) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();

    reader.fileName = file.name;
    reader.onload = function (e) {
        parsefileAssignment(e.target.result, e.target.fileName, setting);
    };
    reader.readAsText(file);
}

function parsefileAssignment(contents, fileName, setting) {

  let people = new Set();
  let cnt = 0;
  for (let line of contents.split("\n")){
    line = line.trim();
    if (line.length==0){
      continue;
    }

    if (line.split(",").length != 3){
      alert('This line is wrong: '+line);
      return
    }
    people.add(line.split(",")[0]);
    cnt += 1;
  }

  if (cnt > 300){
    alert('You cannot change more than 300 at once.');
    return;
  }

  let data = [];

  for (let peop of people) {
    data[userid_to_index[peop]] = [];
  }

  for (let line of contents.split("\n")){
    line = line.trim();
    if (line.length==0){
      continue;
    }

    let peop = line.split(",")[0];

    data[userid_to_index[peop]].push({"video_id": videoid_to_index[line.split(",")[1].trim()], 'label_index': parseInt(line.split(",")[2].trim())});
  }

  let data_final = [];
  for (let peop of people){
    data_final.push({id:userid_to_index[peop], assign_query: data[userid_to_index[peop]]});
  }


  $.post(
    "assignment_change.php",
    {setting:setting,
    data:data_final},
    function(data, status){
      alert(data);
    }
  );
  

}

document.getElementById('upload-assignment-remove')
.addEventListener('change', x => readSingleFileAssignmnet(x, 'remove'), false);

document.getElementById('upload-assignment-leave')
    .addEventListener('change', x => readSingleFileAssignmnet(x, 'leave'), false);



var videoid_to_index = {};
var videoindex_to_id = {};
for (let video of videos){
  videoid_to_index[video.name] = parseInt(video.index);
  videoindex_to_id[parseInt(video.index)] = video.name;
}

var userid_to_index = {}
for (let user of users){
  userid_to_index[user.id] = parseInt(user.index);
}

var labelgroupindex_to_id = {};
for (let label_group of label_groups){
  labelgroupindex_to_id[parseInt(label_group.group_index)] = label_group.name;
}

manage_partial();
manage_original();