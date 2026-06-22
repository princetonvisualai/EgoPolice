const zeroPad = (num, places) => String(num).padStart(places, '0');

// entities are free-text names stored on each label; this holds the ordered
// list of distinct entity names for the current label group.
let entities = [];
const ENTITY_COLORS = ['teal', 'red', 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'cyan', 'indigo'];
const TAB_KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
function entityColor(idx) { return ENTITY_COLORS[idx % ENTITY_COLORS.length]; }

// UI button
function backtoindex() {
  location.href = "./index.php";
}

function hideMenu() {
  $('#contextMenu').css('display', 'none');
}

function showDeleteMenu(e, elem) {
  e.preventDefault();
  hideMenu();

  let whereDeleteMenu = parseInt($(elem).parent()[0].id);

  if (activePics.has(whereDeleteMenu)) {
    //its ok
  } else {
    // remove all activePics
    liclick(elem);
  }

  var menu = document.getElementById("contextMenu2")
  menu.style.display = 'block';
  menu.style.left = e.pageX + "px";
  menu.style.top = e.pageY + "px";
  // }
}

function playVideo() {

  if (activePics.size > 0) {
    $('.vjs-control-bar')[0].style.visibility = 'visible'
    $('.videobackground')[0].style.visibility = "visible";
    video.ready(function () {
      this.abLoopPlugin.setStart(lowest_activePic).setEnd(highest_activePic+1).playLoop();
    });
  } else {
    $('.vjs-control-bar')[0].style.visibility = 'visible'
    $('.videobackground')[0].style.visibility = "visible";
    video.ready(function () {
      this.abLoopPlugin.setStart(start_time).setEnd(end_time+1).playLoop();
    });
  }

}

function initVideo() {
  video = videojs("vid", {
    plugins: {
      abLoopPlugin: {
        createButtons: false,
        loopIfBeforeStart: false,
        loopIfAfterEnd: false
      }
    }
  });

  $('video')[0].src = mp4_loc.replace("./", ""); 

  $('video')[0].addEventListener("loadedmetadata", function (e) {
    var video_width = this.videoWidth,
      video_height = this.videoHeight;

    $(".videobox")[0].style.setProperty('width', 'calc(80vw + 50px)');
    $(".videobox")[0].style.setProperty('height', `calc(${parseInt(80 * video_height / video_width)}vw + 50px)`);
    $(".videobox")[0].style.maxHeight = `${parseInt(900 * video_height / video_width)+50}px`;

    $('.videobox .video-js')[0].style.width = "calc(80vw)";
    $('.videobox .video-js')[0].style.height = `calc(${parseInt(80 * video_height / video_width)}vw)`;
    $('.videobox .video-js')[0].style.maxWidth = "900px";
    $('.videobox .video-js')[0].style.maxHeight = `${900 * video_height / video_width}px`;
  }, false);

  $('.videobackground')[0].addEventListener("click", function (e) {
    if (e.target == e.currentTarget) {
      $('video')[0].pause()
      $('.videobackground')[0].style.visibility = "hidden";
      $('.vjs-control-bar')[0].style.visibility = 'hidden';
    }
  })
}

// Initialization
function labels_parse() {

  // make a global object where it links index to each label
  for (let label of labels) {
    index_to_label[label.index] = label;
    label.order = parseInt(label.order);
    label.skip = label.skip == '1';
    label.index = parseInt(label.index);
    label.under = parseInt(label.under);
    label.explicit = label.explicit == 1;
    label.state = 0; // meaning its not selected from the checkboxes;
  }


  // make it nested
  for (let label of labels) {
    label.inner = [];
  }
  for (let label of labels) {
    if (label.under != 0){
      index_to_label[label.under].inner.push(label);
    }
  }
  for (let label of labels){
    label.inner.sort((a, b) => a.order-b.order);
  }

  // build the ordered list of distinct entities (first appearance, by
  // ascending label index) and tag each label with its entity index.
  entities = [];
  let entity_to_idx = {};
  let labels_by_index = labels.slice().sort((a, b) => a.index - b.index);
  for (let label of labels_by_index) {
    if (!entity_to_idx.hasOwnProperty(label.entity)) {
      entity_to_idx[label.entity] = entities.length;
      entities.push(label.entity);
    }
  }
  for (let label of labels) {
    label.entity_idx = entity_to_idx[label.entity];
  }

  // hierarchy in entity
  label_in_entity = entities.map(() => []);
  for (let label of labels) {
    if (label.under == 0) {
      label_in_entity[label.entity_idx].push(label);
    }
  }
  for (let entity of label_in_entity){
    entity.sort((a,b) => a.order-b.order);
  }

  // hierarchy to flatten
  label_in_entity_flatten = entities.map(() => []);
  function recursive_flatten(entity_idx, node){

    label_in_entity_flatten[entity_idx].push(node);

    for (let child of node.inner){
      recursive_flatten(entity_idx, child);
    }
  }
  for (let i = 0; i < entities.length; i++){
    for (let node of label_in_entity[i]){
      recursive_flatten(i, node);
    }
  }

  // is it binary? (a single explicit label)
  singlelabel = labels.length == 1 && labels[0].explicit;
}

function load_frames() {

  $("#row").empty();
  $("#title")[0].innerHTML = video_name + " - " + String(video_cnt) + " sec.";

  for (let i = start_time; i <= end_time; i++) {
    li = "";
    li += "<li style='width:25%;' id='" + (i) + "'>";
    if (singlelabel){
      li += "<div class='card' style='' oncontextmenu='showDeleteMenu(event, this)' draggable='true' onmousedown='dragstart(event, this)' onmouseover='dragover(event, this)'>";
    } else {
      li += "<div class='card' style='' onclick='liclick(this);' oncontextmenu='showDeleteMenu(event, this)' draggable='true' ondragstart='dragstart(event, this)' onmouseover='dragover(event, this)'>";
    }
    li += "<span>" + String(i) + " sec</span> <span style='margin-left: auto;margin-right: 0;float:right'>" + String(Math.floor(i / 60)).padStart(2, '0') + ":" + String(i % 60).padStart(2, '0') + "</span></br>"
    
    if (singlelabel){
      li += `<div style='width:100%; min-height:24px' class='badge${labels[0].entity_idx}'></div>`;
    } else {
      for (let k = 0; k < entities.length; k++){
        li += `<div style='width:100%; min-height:24px' class='badge${k}'></div>`;
      }
    }
    li += "<img id='whatever' ondragstart='return false'  style='display:inline-block;width: 100%;aspect-ratio: 16 / 9;' src='" + webp_loc + "/" + zeroPad(i + 1, 5) + ".webp' loading='lazy'/>"
    li += "</div>"; 
    li += "</li>"; 

    $("#row").append(li);
  }
}

function init_tags() {

  // build one entity tab + content panel per entity
  let $entity_tabs = $('#entity_tabs').empty();
  let $entity_content = $('#entity_tab_content').empty();
  let colw = Math.max(1, Math.floor(12 / entities.length));
  entities.forEach(function (entity, i) {
    let hint = i < TAB_KEYS.length ? ` (${TAB_KEYS[i].toUpperCase()})` : '';
    $entity_tabs.append(`<li class="tab col s${colw}"><a class="${i == 0 ? 'active' : ''}" style="padding:0;" href="#tab${i}">${entity}${hint}</a></li>`);
    $entity_content.append(`<div id="tab${i}" class="col s12 labelcontainer"><span>${entity}</span><form action="#"></form></div>`);
  });

  // build the per-entity "Remove ... Anno" items in the right-click menu
  let $cm = $('#contextMenu2 ul');
  $cm.find('.partialdelete').remove();
  entities.forEach(function (entity, i) {
    $cm.append(`<li class="partialdelete hoverable ${entityColor(i)}" onclick="deleteTags(${i});"><a>Remove ${entity} Anno</a></li>`);
  });

  //materializecss stuff
  M.Tabs.init($('.tabs')[0], {
    duration: 0
  });
  M.Tabs.init($('#entity_tabs')[0], {
    onShow: function (e) {
      activeTagTab = parseInt(e.id.slice(3));
    },
    duration: 0
  });
  tabinstance = M.Tabs.getInstance($('#entity_tabs')[0]);

  if(singlelabel){
    M.Tabs.getInstance($('.tabs')[0]).select('labels');
    $("#label-table-tab").css('display', 'none')
  }

  function number_to_hotkey(num) {

    if (num > 40) {
      return "";
    }

    remainder = (num + 1) % 10;
    quotient = '';
    if (num >= 30) {
      quotient = "Alt+";
    } else if (num >= 20) {
      quotient = "Ctrl+";
    } else if (num >= 10) {
      quotient = "Shift+";
    }

    hotkey = `[${quotient}${remainder}]`;


    return hotkey;
  }

  for (let i=0; i<entities.length; i++){
    $("#tab" + i + " form").empty();

    for(let j in label_in_entity_flatten[i]){
      let label = label_in_entity_flatten[i][j];
      let checkbox =$(
        `
      <p>
        <label >
            ${label.under!=0 ?'└─':''}<input type='checkbox' class="reset-checkbox"
                id='${label.index}'
                onclick='checkboxcycle(this)'
                ${label.skip?'disabled="disabled"':''}/>
            <span title="${label.description}">${label.name}</span>
        </label>
        <span>${number_to_hotkey(parseInt(j))}</span>
      </p>
      `);
      checkbox.appendTo("#tab"+i+" form");

      if (singlelabel){
        checkbox.find('input').prop('checked', true);
        labels[0].state = 1;
      }
    }
  }

  // remove right click delete menu items if single label
  if (singlelabel) {
    $('#contextMenu2 .partialdelete').css('display', 'none');
  }
}

function init_select() {
  // change number of items per row.
  $(document).ready(function () {
    $('.input-field select').formSelect();
    $('.input-field select')[0].addEventListener('change', function (e, t) {
      $(".tagLeft li").css('width', `${Math.floor(((100/$(this).val()) + Number.EPSILON) * 100) / 100}%`);
    }, false);
  });
}

// frame selections
function full_update_delete_tag() {

  return;

  if (singlelabel){
    return;
  }

  if (activePics.size == 0) {
    current_delete_tag_list = []
  } else {
    if (delete_tag_switch_value == 'intersection') {
      sets = {}
      for (i of activePics) {
        set = [];
        if (annotation_for_this_video.hasOwnProperty(i)) {

          for (j of [0, 1, 2]) {
            for (key in annotation_for_this_video[i][j]) {

              set.push(`${annotation_for_this_video[i][j][key]}_${key}`);
            }
          }
        }
        sets[i] = set;
      }

      result = Object.values(sets).reduce((a, b) => b.filter(Set.prototype.has, new Set(a)));


    } else {
      sets = new Set();
      for (i of activePics) {
        if (annotation_for_this_video.hasOwnProperty(i)) {
          for (j of [0, 1, 2]) {
            for (key in annotation_for_this_video[i][j]) {
              sets.add(`${annotation_for_this_video[i][j][key]}_${key}`);
            }
          }
        }
      }

      result = [...sets];
    }

    current_delete_tag_list = result;
  }


  $("#deletetag_buttons").empty();
  for (key of current_delete_tag_list) {

    state = parseInt(key.split("_")[0]);

    key = key.split("_").slice(1).join("_");

    if (label_key_to_data.hasOwnProperty(key))
      tabid = parseInt(label_key_to_data[key].entity);
    else
      tabid = key.split("_")[0];

    if (label_key_to_data.hasOwnProperty(key)) {
      desc = label_key_to_data[key].full_path.join(" - ");
    } else {
      desc = key;
    }

    elem = $(`<button class="btn ${tabid==0? 'teal' : (tabid==1?'red':'blue')} ${state==2?'lighten-3':''}" onclick="delete_in_deletetag(this);">${desc}</button>`);
    elem[0].state = state;
    elem[0].key = key;
    elem.appendTo("#deletetag_buttons");
  }
}

function selectedbatchupdate() {
  $("#selectedbatch")[0].innerText = `${activePics.size} Selected`;
  if (activePics.size == 0) {
    $("#selectedbatch")[0].style.visibility = 'hidden';
  } else {
    $("#selectedbatch")[0].style.visibility = 'visible';
  }
}

function liclick(elem) {
  let elem_id = parseInt($(elem).parent()[0].id);
  if ((pressed_key["ShiftLeft"] || pressed_key["ShiftRight"]) && (activePics.size > 0) && !singlelabel) {

    if (elem_id < lowest_activePic) {
      for (i = elem_id; i < lowest_activePic; i++) {
        activePics.add(i);
      }
      lowest_activePic = elem_id;
    } else if (elem_id > highest_activePic) {
      for (i = highest_activePic + 1; i <= elem_id; i++) {
        activePics.add(i);
      }
      highest_activePic = elem_id;
    } else {
      for (i = lowest_activePic; i <= elem_id; i++) {
        activePics.add(i);
      }
    }

  } else if ((pressed_key["ControlLeft"] || pressed_key["ControlRight"] || pressed_key['meta']) && (activePics.size > 0) && !singlelabel) {

    if (activePics.has(elem_id)) {
      activePics.delete(elem_id);
      $("#row").children("#"+elem_id).children(".card").removeClass("active");

      lowest_activePic = Math.min(...activePics);
      highest_activePic = Math.max(...activePics);

    } else {
      activePics.add(elem_id);

      lowest_activePic = Math.min(lowest_activePic, elem_id);
      highest_activePic = Math.max(highest_activePic, elem_id);
    }

  } else {


    $("#row").find(".card").removeClass("active");
    if (activePics.size == 1 && [...activePics][0] == elem_id) {
      activePics.clear();
    } else {
      activePics.clear();
      activePics.add(elem_id);
      lowest_activePic = elem_id;
      highest_activePic = elem_id;
    }
  }
  full_update_delete_tag();


  for (let i of activePics){
    $("#row").children("#"+i).children(".card").addClass("active");
  }

  selectedbatchupdate();
}

function unselectPics() {
  // unselect all pics
  $("#row").find(".card").removeClass("active");  
  activePics.clear();
  lowest_activePic = undefined;
  highest_activePic = undefined;
  selectedbatchupdate();

}

function dragstart(e, elem) {

  if (e.button != 0) return;
  e.preventDefault();
  liclick(elem);
  dragging = true;
  dragging_start = parseInt($(elem).parent()[0].id);
}

function dragover(e, elem) {
  elem_id = parseInt($(elem).parent()[0].id);
  if (dragging) {
    if (dragging_end != elem_id) {
      dragging_end = elem_id;

      unselectPics();

      minn = Math.min(dragging_start, dragging_end);
      maxx = Math.max(dragging_start, dragging_end);

      lowest_activePic = minn;
      highest_activePic = maxx;
      for (i = minn; i <= maxx; i++) {
        activePics.add(i);
      }

      for (let i of activePics){
        $("#row").children("#"+i).children(".card").addClass("active");
      }

      selectedbatchupdate();

    }
    full_update_delete_tag();
  }
  e.preventDefault();

}


// label list panel
function checkboxcycle(elem) {

  if (singlelabel){
    elem.checked = true;
    elem.indeterminate = false;

    return;
  }

  if (elem.disabled)
    return;

  let label = index_to_label[elem.id];

  if (label.explicit){
    label.state = (label.state + 1) % 2;
  } else {
    label.state = (label.state + 1) % 3;
  }

  if (label.state == 0) {
    elem.checked = false;
    elem.indeterminate = false;
    checked = -1;
  } else if (label.state == 1) {
    elem.checked = true;
    elem.indeterminate = false;
    checked = 1;
  } else if (label.state == 2) {
    elem.checked = false;
    elem.indeterminate = true;
    checked = 0;
  }

}

function drawTable() {

  let table = [];
  let current_label = undefined;
  let start_idx = undefined;
  for (let i = start_time; i <= end_time; i++) {
    if (annotation_for_this_video[i] == undefined) {
      i_s_annotation = undefined;
    } else {

      if (singlelabel){
        
        for (let label_idx in annotation_for_this_video[i]){
          let label = index_to_label[label_idx];
          let state = annotation_for_this_video[i][label_idx];
          i_s_annotation = label.name;
        }

      } else {
        desc_arrs = entities.map(() => []);

        for (let label_idx in annotation_for_this_video[i]){
          let label = index_to_label[label_idx];
          let state = annotation_for_this_video[i][label_idx];
          desc_arrs[label.entity_idx].push(label.name + (state == 1 ? " (Explicit)" : " (Implicit)"))
        }

        if (desc_arrs.reduce((a, b) => a + b.length, 0) == 0)
          i_s_annotation = undefined;
        else {
          desc_arrs = desc_arrs.map((a) => a.join(" & "));
          i_s_annotation = desc_arrs.join(" | ");
        }
      }
    }
    if (i_s_annotation != current_label) {
      // new label found!!
      if (current_label != undefined) {
        table.push([start_idx, i, current_label])
      }
      //current_label
      current_label = i_s_annotation;
      start_idx = i;
    }
  }
  if (current_label != undefined) {
    table.push([start_idx, i, current_label])
  }

  $("tbody").empty();
  for (elem of table) {
    tr = ""
    tr += `<tr onclick="$(\'#${elem[0]}\')[0].scrollIntoView();" style="cursor:pointer">`
    tr += "  <td>" + elem[0] + "s - " + elem[1] + "s</td>"
    tr += "  <td>" + elem[2] + "</td>"
    tr += "</tr>"
    $("tbody").append(tr);
  }
}

// annotation
function add_annotation(frame_id, label_idx, state){
  if (annotation_for_this_video[frame_id] == undefined){
    annotation_for_this_video[frame_id] = {};
  }

  annotation_for_this_video[frame_id][label_idx] = state;

  update_badge(frame_id, index_to_label[label_idx].entity_idx);

}

function update_badge(frame_id, entity_idx) {

  $(`li#${frame_id} .badge`+entity_idx).empty();

  if (annotation_for_this_video.hasOwnProperty(frame_id)){
    for (let label_idx in annotation_for_this_video[frame_id]){
      let label = index_to_label[label_idx];
      let state = annotation_for_this_video[frame_id][label_idx];

      if (entity_idx == label.entity_idx){
        $(`li#${frame_id} .badge`+entity_idx).append(
          `<span class="badge new ${entityColor(entity_idx)} ${state==2?'lighten-3':''}" data-badge-caption="${label.name}"
          style="margin-left:2px;${singlelabel?'width:100%':''}"></span>`
        )
      }

    }
  }
}

function save_annotation_for_this_video() {
  localStorage.setItem(
    String(user_video_index),
    annotation_for_this_video_to_JSONString()
  );
}

function annotation_for_this_video_to_JSONString() {
  return JSON.stringify(annotation_for_this_video);
}

function updateAnnotationBulk() {
  // 1. get all the checkboxes that are checked
  // 2. save current history
  // 3. add to annotation data (draw batch here)
  // 4. uncheck all the checkboxes
  // 5. draw table
  // 6. save to cookie

  if (singlelabel){
    return;
  }

  
  // 1. 
  let selected_labels = {};

  for (let label of labels){
    if (label.state != 0){
      selected_labels[label.index] = label.state;
    }
  }

  // 2. 
  if ((Object.keys(selected_labels).length > 0) && (activePics.size > 0)) {
    add_to_history("Added Annotations");
  }

  // 3.
  for (let id of activePics) {
    for (let label_idx in selected_labels){
      add_annotation(id, label_idx, selected_labels[label_idx]);
    }
  }

  // 4.
  $(".reset-checkbox:checkbox").prop('indeterminate', false);
  $(".reset-checkbox:checkbox").prop('checked', false);
  for (let label of labels){
    label.state=0;
  }

  // 5.
  drawTable();

  // 6.
  save_annotation_for_this_video();


  return;
}

function single_mouse_up(){
  if (!singlelabel) return;


  add_to_history('Annotation Modified');
  for (let frame_idx of activePics){
    if (annotation_for_this_video.hasOwnProperty(frame_idx)){
      delete annotation_for_this_video[frame_idx];
    } else {
      annotation_for_this_video[frame_idx] = {[labels[0]['index']]: 1};
    }

    update_badge(frame_idx, labels[0].entity_idx);
  }

  drawTable();
  save_annotation_for_this_video();
  
}

function deleteTags(what) {
  let all = (what === 'all');
  if (activePics.size > 0) {
    for (let id of activePics) {
      if (!annotation_for_this_video.hasOwnProperty(id))
        continue;
      if (all) {
        if (Object.keys(annotation_for_this_video[id]).length > 0) {
          add_to_history("Deleted Annotations");
          break;
        }
      } else {
        let breakk = false;
        for (let label_idx in annotation_for_this_video[id]){

          if (index_to_label[label_idx].entity_idx == what){
            breakk = true;
            break;
          }
        }
        if (breakk) {
            add_to_history("Deleted Annotations");
            break;
        }
      }
    }
  }
  // save annotation + leave "tagged" mark
  for (let id of activePics) {
    if (!annotation_for_this_video.hasOwnProperty(id))
      continue;


    if (all){
      delete annotation_for_this_video[id];

      for (let k = 0; k < entities.length; k++){
        update_badge(id, k);
      }
    } else {
      for (let label_idx in annotation_for_this_video[id]){
        if (index_to_label[label_idx].entity_idx == what){
          delete annotation_for_this_video[id][label_idx];
        }
      }
      update_badge(id, what);

    }
  }
  drawTable();
  unselectPics();

  save_annotation_for_this_video();
}

// undo/redo/memory
function add_to_history(why) {
  future = [];
  $("#redobtn")[0].style.visibility = "hidden";

  unfuture.push([annotation_for_this_video_to_JSONString(), why]);
  $("#undobtn")[0].style.visibility = "visible";
}

function undo() {
  if (unfuture.length == 0) {
    return;
  }

  popped = unfuture.pop();
  past_anno = popped[0];
  past_why = popped[1];

  future.push([annotation_for_this_video_to_JSONString(), past_why]);

  localStorage.setItem(
    String(user_video_index),
    past_anno
  );
  load_saved();

  $("#redobtn")[0].style.visibility = "visible";
  if (unfuture.length == 0) {
    $("#undobtn")[0].style.visibility = "hidden";
  }
  full_update_delete_tag();
}

function redo() {
  if (future.length > 0) {
    popped = future.pop();
    future_anno = popped[0];
    future_why = popped[1];
    unfuture.push([annotation_for_this_video_to_JSONString(), future_why]);

    localStorage.setItem(
      String(user_video_index),
      future_anno
    );
    load_saved();


    $("#undobtn")[0].style.visibility = "visible";
    if (future.length == 0) {
      $("#redobtn")[0].style.visibility = "hidden";
    }
    full_update_delete_tag();

  }
}

function showUndoMenu(e) {
  e.preventDefault();
  document.getElementById("contextMenu2").style.display = "none";
  if (document.getElementById("contextMenu").style.display == "block")
    hideMenu();
  else {
    $("#contextMenu ul").empty();

    for (i = 0; i < Math.min(unfuture.length, 5); i++) {
      list = `<li>${unfuture[unfuture.length-1-i][1]}</li>`;
      $("#contextMenu ul").append(list);
    }
    if (unfuture.length > 5) {
      list = `<li>...</li>`;
      $("#contextMenu ul").append(list);
    }

    var menu = document.getElementById("contextMenu")

    menu.style.display = 'block';
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
  }
}

function showRedoMenu(e) {
  e.preventDefault();
  document.getElementById("contextMenu2").style.display = "none";
  if (document.getElementById("contextMenu").style.display == "block")
    hideMenu();
  else {
    $("#contextMenu ul").empty();

    for (i = 0; i < Math.min(future.length, 5); i++) {
      list = `<li>${future[future.length-1-i][1]}</li>`;
      $("#contextMenu ul").append(list);
    }
    if (future.length > 5) {
      list = `<li>...</li>`;
      $("#contextMenu ul").append(list);
    }


    var menu = document.getElementById("contextMenu")
    menu.style.display = 'block';
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
  }
}

function load_saved() {
    if (localStorage.hasOwnProperty(String(user_video_index))) {
      annotation_for_this_video = JSON.parse(localStorage.getItem(String(user_video_index)));
  
      for (let k = 0; k < entities.length; k++) {
        $('.card .badge' + k).empty();
      }
      for (i = start_time; i <= end_time; i++) {
        if (annotation_for_this_video.hasOwnProperty(i)) {
          for (j = 0; j < entities.length; j++) {
            update_badge(i, j);
          }
        }
      }
  
      drawTable();
    }
  
}

function save() {
  let data = {}
  data['user_video.index'] = user_video_index;
  data['video.name'] = video_name;
  data['video.original_name'] = original_name;
  data['video.start_time'] = start_time;
  data['video.end_time'] = end_time;
  data['user.id'] = user_id;

  let label_indices = [];
  let label_names = []
  for (let label of labels){
    label_indices.push(label.index);
    label_names.push(label.entity+"/"+label.name);
  }
  data['label.names'] = label_names;
  data['annotations'] = {};

  for (let frame_idx in annotation_for_this_video){

    let anns = [];
    for (let label_index of label_indices) {
      if (annotation_for_this_video[frame_idx].hasOwnProperty(label_index)){
        anns.push(annotation_for_this_video[frame_idx][label_index])
      } else {
        anns.push(0);
      }
    }
    data['annotations'][frame_idx] = anns;
  }
  var blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "text/plain;charset=utf-8"
  });

  saveAs(blob, user_video_index + ".json");
}

// main code
addEventListener("keydown", function (e) {
  if (!pressed_key[e.code]) { // So no double click when long press
    if (TAB_KEYS.indexOf(e.key) != -1 && TAB_KEYS.indexOf(e.key) < entities.length) {
      tabinstance.select('tab' + TAB_KEYS.indexOf(e.key));
    } else if (e.code.includes("Digit")) {

      number = (parseInt(e.code.slice(-1)) + 9) % 10;
      if (pressed_key['ShiftLeft'] && !pressed_key['ControlLeft'] && !pressed_key['AltLeft']) {
        number += 10;
      } else if (!pressed_key['ShiftLeft'] && pressed_key['ControlLeft'] && !pressed_key['AltLeft']) {
        number += 20;
      } else if (!pressed_key['ShiftLeft'] && !pressed_key['ControlLeft'] && pressed_key['AltLeft']) {
        number += 30;
      }

      if (label_in_entity_flatten[activeTagTab].hasOwnProperty(number)){
        checkboxcycle($(`#${label_in_entity_flatten[activeTagTab][number].index}.reset-checkbox`)[0]);
      }

      e.preventDefault();

    } else if (/^[0-9]$/i.test(e.key)) {

    } else if (e.key == "Enter" || e.key == " ") {
      updateAnnotationBulk();
      e.preventDefault();
    } else if (e.key == "Escape") {
      unselectPics();
    } else if (e.key == "Delete") {
      deleteTags('all');
    } else if (e.key == "s" && (pressed_key['ControlLeft'] || pressed_key['ControlRight'] || pressed_key['meta'])) {
      save();
      e.preventDefault();
    } else if ((pressed_key['ShiftLeft'] || pressed_key['ShiftRight']) && e.code.includes("Digit")) {
    } else if ((pressed_key['meta'] || pressed_key['ControlLeft']) && e.key == "z") {
      e.preventDefault();
      undo();
    } else if ((pressed_key['meta'] || pressed_key['ControlLeft']) && pressed_key['ShiftLeft'] && e.code == "KeyZ") {
      e.preventDefault();
      redo();
    } else if (e.code == "KeyR" && !pressed_key['ControlLeft'] && !pressed_key['ShiftLeft']) {

      if (splitB.getSizes()[1] > 3)
        splitB.collapse(1);
      else
        splitB.expand(1);

    } else if (e.code == "KeyG") {

      if ($('.videobackground')[0].style.visibility == 'visible'){
        $('.videobackground')[0].click()
      } else {
        playVideo();
      }
      

    }
  }
  pressed_key[e.code] = true;

  if (e.metaKey || e.key == 'Meta')
    pressed_key['meta'] = true;
});

addEventListener("keyup", function (e) {
  delete pressed_key[e.code];
  if (e.key == "Shift") {
    delete pressed_key["ShiftLeft"];
    delete pressed_key["ShiftRight"];
  }

  if (e.metaKey)
    delete pressed_key['meta'];
});

$(document).bind("click", function (event) {
  hideMenu();
  $('#contextMenu2').css('display', 'none');
});

$(document).bind("contextmenu", function (e) {
  e.preventDefault();
});

$(document).bind("mouseup", function (event) {
  if (dragging && singlelabel){
    single_mouse_up();
  }
  dragging = false;
});

onfocus = function () {
  for (var key_key in pressed_key) {
    delete pressed_key[key_key];
  }
  dragging = false;
};









var singlelabel;
var pressed_key = {}; // contains keyboard key currently pressed. 
var index_to_label = {};

// active related
var activePics = new Set(); // selected frames
var lowest_activePic = undefined;
var highest_activePic = undefined;
var dragging = false;
var dragging_start = -1;
var dragging_end = -1;

// delete panel (bottom panel) related
var delete_tag_switch_value = "intersection";
var current_delete_tag_list = [];

// annotation 
var annotation_for_this_video = {};
var activeTagTab = 0;

// undo/redo
var unfuture = [];
var future = [];

labels_parse();
load_frames();
init_tags();
init_select();
initVideo();
load_saved();

var splitA = Split(['.tagLeft', '.tagRight'], {
  sizes: [90, 25],
  minSize: [100, 150],
});

var splitB = Split(['.leftTop', '.leftBottom'], {
  sizes: [100, 0],
  maxSize: [Infinity, 0],
  minSize: [100, 0],
  direction: 'vertical',
  expandToMin: true,
  snapOffset: 10,
});

document.getElementById('file-input')
    .addEventListener('change', readSingleFile, false);

function readSingleFile(e) {


  let res = confirm('Do you want to override your current annotation with selected file?');

  if (res){
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    
    reader.fileName = file.name;
    reader.onload = function (e) {
        parsefile(e.target.result);
    };
    reader.readAsText(file);
  }
}

function parsefile(data) {

    try {

        let temp = data;
        window.temp = temp;
        let tempdata = {};
        if (true){

            let name2idx = {};

            for (let i in temp.split("\n")[2].split(",")){
                name2idx[temp.split("\n")[2].split(",")[i].trim()] = temp.split("\n")[3].split(",")[i];
            }

        

            for (let line of temp.split("\n").slice(5)){

                if (line == ""){
                    continue;
                }

                let second = parseInt(line.split(",")[2].trim());

                for (let order in line.split(",").slice(3)){

                    let val = parseInt(line.split(",").slice(3)[order].trim());

                    if (val != 0){
                        let labelname = temp.split("\n")[2].split(",")[order];
                        let idx = name2idx[labelname];

                        if (!tempdata.hasOwnProperty(second)){
                            tempdata[second] = {}
                        }
                        tempdata[second][idx] = val;

                    }
                }


            }

            add_to_history("Loaded Annotation");

            annotation_for_this_video = tempdata;



            for (let second in annotation_for_this_video){
                update_badge(second, 0);
                update_badge(second, 1);
                update_badge(second, 2);
            }
            drawTable();
            save_annotation_for_this_video();





        } else {
            throw new Error('assignment_idx is wrong');
        }



    } catch (error) {
        console.error(error);
        alert('Error in Loading!');
    }

}